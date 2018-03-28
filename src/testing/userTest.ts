import { Overrider } from '@jwmb/pixelmagic/lib/utility/overrider';
import { PhaseRunner } from '../phasing/phaseRunner';
import { LoginLogic, LoggedInResultOK } from '../screens/login/loginLogic';
import { StateLog, ISyncTrigOptions } from '../toRemove/stateLog';
import { TriggerActionData, TriggerManager, TriggerTimeType } from '../triggerManager';
import { CognitionMattersApp, CognitionMattersPageType } from '../app';
import { GameState } from '../gameState';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { TrainingPlan } from '../trainingPlan/TrainingPlan';
import { PlanetBundler } from '../trainingPlan/PlanetBundler';
import { TestStatistics } from '../toRemove/testStatistics';
import { EndOfDayLogItem, LeaveTestLogItem } from '../toRemove/logItem';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { TestUserBehavior } from './testUser';
import { GameDefinition } from '../trainingPlan/gameDefinition';
import { TimeMachine } from '../utils/timeMachine';

export class StartExerciseTriggerAction { // TODO implement ITriggerActivatable interface
    static modifyState(data: TriggerActionData): any {
        // TODO: "insert" exercise into map (the constructor with showPage below won't be called when running automated test)
    }
    constructor(id: string, properties: any = {}, closeCallBack: Function = null) {
        const tp = TrainingPlan.create();
        const games = tp.getDefinedGames();
        let foundDefinition = games.find(_ => _.id === properties.id);
        if (foundDefinition === null) {
            foundDefinition = games.find(_ => PlanetBundler.getGameIdFromPlanetId(_.id) === properties.id);
        }
        if (foundDefinition !== null) {
            const copy = <GameDefinition>ObjectUtils.merge({}, foundDefinition, true);
            ObjectUtils.merge(copy, properties);
            App.instance.showPage(CognitionMattersPageType.PAGE_EXERCISE, copy);
        } else {
            // Logger.warn("Triggered game not found: " + properties.id);
        }
    }
}

export class AsyncHelper {
    static waitForCondition(fConditionToResolve: () => boolean, checkInterval: number): Promise<void> {
        return new Promise<void>((res, rej) => {
            if (fConditionToResolve()) {
                res();
            } else {
                const intervalId = window.setInterval(() => {
                    if (fConditionToResolve()) {
                        res();
                        window.clearInterval(intervalId);
                    }
                }, checkInterval);
            }
        });
    }
    static runFuncUntil(func: () => Promise<any>, funcConditionToResolve: (any) => boolean,
        checkInterval: number): Promise<any> {
        return new Promise<any>((res, rej) => {
            func().then(r => {
                if (funcConditionToResolve(r)) {
                    res(r);
                } else {
                    let isWaiting = false;
                    const intervalId = window.setInterval(() => {
                        if (isWaiting) {
                            return;
                        }
                        isWaiting = true;
                        func().then(r2 => {
                            if (funcConditionToResolve(r2)) {
                                window.clearInterval(intervalId);
                                res(r2);
                            }
                            isWaiting = false;
                        });
                    }, checkInterval);
                }
            });
        });
    }
}
enum StopReason {
    OneDoneStop,
    OneDoneContinue,
    AllDone,
    TimeUp,
    Cancelled
}
enum AfterPhaseDone {
    NextPhase,
    Menu
}
export enum TestingSyncMode {
    AccountSpecified,
    NoSync,
    EndOfDay
}
export class FullUserTest {
    checkTimeLimits = true;
    syncMode: TestingSyncMode = TestingSyncMode.EndOfDay;
    account = '';
    deleteServer = false;
    userBehavior: TestUserBehavior = null;
    startTimeOffset = 0;
    triggers: any[] = [];
    maxNumDays = 40;

    // private tpr: ConcreteTrainingPlan; //TrainingPlanRunnerBase;
    private phaseRunner: PhaseRunner;
    // get dont_use_phaseRunner() { return this.phaseRunner; } //warning, only for ugly hacks

    static dbgRun(account: string) {
        // PixelMagic.Testing.FullUserTest.dbgRun("testwm") //yunapuko
        const tmp = new FullUserTest(<FullUserTest><any>{
            account: account, deleteServer: true,
            syncMode: TestingSyncMode.EndOfDay,
            checkTimeLimits: true, userBehavior: null, startTimeOffset: - 24 * 60 * 60 * 1000
        });
    }
    //
    constructor(settings: FullUserTest) {
        Overrider.override(this, settings);
        TimeMachine._apply();
        TimeMachine.config({
            timestamp: TimeMachine.originalNow() + this.startTimeOffset,
            keepTime: false,
            tick: true
        });

        if (this.userBehavior == null) {
            this.userBehavior = new TestUserBehavior();
        }
        if (this.account) {
            if (this.deleteServer && this.account.indexOf('test') !== 0) {
                LoginLogic.deleteLocalUserResetServer(this.account).then(null, null).then(_ => this.login(this.account));
            } else {
                this.login(this.account);
            }
        } else {
            if (StateLog.instance) {
                this.run();
            } else {
                throw Error('No user logged in, can\'t run test');
            }
        }
    }
    private _cancelling = false;
    stop() {
        this._cancelling = true;
    }
    private login(accountUsername: string) {
        LoginLogic.login(accountUsername)
            .then(result => {
                if (ObjectUtils.isOfType(result, LoggedInResultOK)) {
                    this.run();
                } else {
                    throw Error('Some login problem');
                }
            }).catch(err => {
                throw Error(err.message + '\n' + JSON.stringify(err));
            });
    }

    private triggeredExercises: TriggerActionData[] = [];
    private setGlobalStuff(isStarting: boolean) {
        if (isStarting) {
            // window.console.log = () => { };
            // ConsoleLogItemAppender.logToSandbox = false;

            StartExerciseTriggerAction.modifyState = (data: TriggerActionData) => {
                this.triggeredExercises.push(data);
            };
            TriggerManager.instance.actionsOnlyModifyData = true;
            this.triggers.forEach(_ => TriggerManager.instance.addTrigger(_));

            // Settings.isTestAccount = false; //can't have isTestAccount, this changes how planets are completed/unlocked
            if (App && App.instance && (<CognitionMattersApp>App.instance).idleTimeout) {
                (<CognitionMattersApp>App.instance).idleTimeout = 0;
            }
            // Debug to make exercise triggers happen on day 1:
            // GameState.getCurrentTrainingPlan().triggers.filter(_ => _.actionData.type
            // == "StartExerciseTriggerAction").forEach(_ => _.criteriaValues[0].value = 1);

            switch (this.syncMode) {
                case TestingSyncMode.NoSync:
                    StateLog.instance.trigSyncOn = (logItem) =>
                        <ISyncTrigOptions>{ performSync: false, pushState: logItem.isOfType(LeaveTestLogItem) };
                    break;
                case TestingSyncMode.EndOfDay:
                    StateLog.instance.trigSyncOn = (logItem, list) =>
                        <ISyncTrigOptions>{
                            performSync: logItem.isOfType(EndOfDayLogItem),
                            pushState: logItem.isOfType(EndOfDayLogItem) || logItem.isOfType(LeaveTestLogItem)
                        };
                    break;
            }
        }
    }

    private run() {
        this.setGlobalStuff(true);

        this.userBehavior.initPostLogin();

        const startTime = Date.now();
        Logger.info('Start time: ' + new Date().toISOString());
        this.asyncRunPlanets().then((r: StopReason) => {
            if (r === StopReason.Cancelled) {
                App.instance.showPage(CognitionMattersPageType.PAGE_MAP, GameState.getCurrentTrainingPlanData());
            } else {
                this.userBehavior.reachedEndOfTraining();
                Logger.info('Training (' + GameState.getTrainingDay() + ' days) finished at time '
                    + new Date().toISOString() + ' ' + ((Date.now() - startTime) / 1000 / 60) + ' minutes');
            }
        });
    }

    private asyncRunPlanets(): Promise<StopReason> {
        return new Promise<StopReason>((res, rej) => {
            AsyncHelper.runFuncUntil(this.asyncRunPlanet.bind(this), (r: StopReason) => {
                if (r === StopReason.TimeUp) {
                    this.userBehavior.reachedEndOfDay();
                    if (this.maxNumDays > 0 && GameState.getTrainingDay() >= this.maxNumDays) {
                        r = StopReason.Cancelled;
                    } else {
                        LoginLogic.handleTrainingDay();
                        GameState.trainingTimeStartTime = Date.now(); // TODO: shouldn't this be handled in handleTrainingDay()?
                    }
                }
                return r === StopReason.AllDone || r === StopReason.Cancelled; // (<string>r) == "Last"; // || (<string>r) == "TimeUp";
            }, 550).then((r: StopReason) => res(r));
        });
    }

    private asyncRunPlanet(): Promise<StopReason> {
        return new Promise<StopReason>((res, rej) => {
            if (this._cancelling || this.checkEndTrigger(TriggerTimeType.MAP)) {
                // TODO: verify that triggered tests are part of this list!
                // TriggerManager.instance.activateList(TriggerManager.instance.checkTriggers(TriggerTimeType.MAP), () => null);
                res(StopReason.Cancelled);

            } else {
                const tp = TrainingPlan.create(null, null, TriggerTimeType.MAP);
                const planets = PlanetBundler.getPlanets(true, tp);

                planets.filter(_ => _.wasJustUnlocked).forEach(_ => _.unlockedTimestamp = Date.now());
                let possiblePlanets = planets.filter(p => p.isUnlocked && !p.isCompleted); // p.noOfMedals < 3);
                // Fake exercises that have been triggered (e.g. math tests) to appear on menu:
                let madeVisibleOnMenu = possiblePlanets.filter(p => !p.visibleOnMenu)
                    .filter(p => this.triggeredExercises.find(tx => tx.properties.id === p.nextGame.id) != null);
                // remove those that have already been run
                if (madeVisibleOnMenu.length) {
                    madeVisibleOnMenu = madeVisibleOnMenu.filter(p => GameState.exerciseStats.getGameStats(p.nextGame.id).numRuns === 0);
                    madeVisibleOnMenu.forEach(p => p.nextGame.invisible = false);
                }
                possiblePlanets = possiblePlanets.filter(p => p.visibleOnMenu);

                if (possiblePlanets.length === 0) {
                    TestStatistics.instance.logEvent(new EndOfDayLogItem({ training_day: GameState.getTrainingDay() }));
                    AsyncHelper.waitForCondition(() => !StateLog.instance.isSyncing, 100).then(() => res(StopReason.AllDone));
                } else {
                    // Always do triggered exercises first:
                    const planet = madeVisibleOnMenu.length ? madeVisibleOnMenu[0] : this.userBehavior.selectPlanet(possiblePlanets);
                    // Logger.info("Enter planet " + planet.nextGame.id + " / " + planet.nextGame.title);
                    this.phaseRunner = new PhaseRunner(planet.nextGame);
                    PlanetBundler.setCurrentPlanet(planet.nextGame.id);
                    // this.asyncRunNextPhase().then((r: StopReason) => {
                    this.asyncRunPhasesUntilCanExit().then((r: StopReason) => {
                        TriggerManager.instance.activateList(TriggerManager.instance.checkTriggers(TriggerTimeType.POST_RACE), () => null);

                        this.phaseRunner.exitTest();

                        let timeUp = false;
                        if (r !== StopReason.Cancelled) {
                            if (this.checkEndTrigger(TriggerTimeType.LEAVE_TEST)) {
                                r = StopReason.Cancelled;
                                // if (false && planet.data.id == "Alternatives" && GameState.getMedalCount(planet.data.id) == 2) { //math
                                //    r = StopReason.Cancelled;
                            } else if (this.checkTimeLimits) {
                                timeUp = GameState.checkIfTimeIsUp(0);
                                if (timeUp) {
                                    if (this.checkEndTrigger(TriggerTimeType.END_OF_DAY)) {
                                        r = StopReason.Cancelled;
                                    }
                                    // TriggerManager.instance.activateList(TriggerManager.instance.checkTriggers(
                                    // TriggerTimeType.END_OF_DAY), () => null);

                                    Logger.info('Time up / end of day ' + GameState.getTrainingDay()
                                        + '! Minutes elapsed: ' + ((Date.now() - GameState.trainingTimeStartTime) / 1000 / 60)
                                        + ' ' + new Date().toISOString());
                                    TestStatistics.instance.logEvent(new EndOfDayLogItem({ training_day: GameState.getTrainingDay() }));
                                }
                            }
                        }
                        AsyncHelper.waitForCondition(() => !StateLog.instance.isSyncing, 100).then(() =>
                            res(timeUp ? StopReason.TimeUp : r)); // StopReason.OneDone
                    });
                }
            }
        });
    }

    private checkEndTrigger(type: TriggerTimeType): boolean {
        const triggers = TriggerManager.instance.checkTriggers(type);
        const tCopy = [].concat(triggers);
        TriggerManager.instance.activateList(triggers, () => null);
        // TriggerManager.instance.activateList(TriggerManager.instance.checkTriggers(TriggerTimeType.LEAVE_TEST),
        // () => null); //this.leaveTest()
        return tCopy.find(_ => _.id === 'GoMainMenu') != null;
    }

    // Since GUIDE phases directly proceed to TEST phases:
    private asyncRunPhasesUntilCanExit(): Promise<StopReason> {
        return new Promise<StopReason>((res, rej) => {
            AsyncHelper.runFuncUntil(this.asyncRunNextPhase.bind(this), (r: StopReason) => {
                // if last phase was GUIDE, proceed to next phase directly
                return this._lastPhaseData.phase !== 'GUIDE' && !this._cancelling && r !== StopReason.OneDoneContinue;
                // return r == StopReason.AllDone;
            }, 10)
                .then(() => res(this._cancelling ? StopReason.Cancelled : StopReason.OneDoneStop));
            // "Done" (<string>r).indexOf("Last")
        });
    }
    private asyncRunNextPhase(): Promise<StopReason> {
        return new Promise<StopReason>((res, rej) => {
            if (!this.phaseRunner.moveNextValidPhase()) {
                res(StopReason.AllDone);
            } else {
                this.runPhase(this.phaseRunner).then(r => {
                    AsyncHelper.waitForCondition(() => !StateLog.instance.isSyncing, 100).then(() =>
                        res(r === AfterPhaseDone.NextPhase ? StopReason.OneDoneContinue : StopReason.OneDoneStop));
                    // StopReason.OneDoneStop));
                });
            }
        });
    }
    private _lastPhaseData: any;
    private runPhase(pr: PhaseRunner): Promise<AfterPhaseDone> {
        return new Promise<AfterPhaseDone>((res, rej) => {
            const phaseData: any = pr.getCurrentData();
            this._lastPhaseData = phaseData;
            if (phaseData.type === 'Dialog') {
                res(AfterPhaseDone.NextPhase);
            } else {
                // Logger.info("Enter phase " + phaseData.type);
                pr.create().then(phaseX => {
                    phaseX.registerStartPhase();
                    this.userBehavior.startPhase(phaseX);
                    const tmpstarttime = Date.now();
                    let numProblems = 0;
                    let numIncorrect = 0;
                    while (true) {
                        if (this._cancelling) {
                            break;
                        }
                        const stim = phaseX.getNextProblem();
                        if (!stim) { // Phase ended
                            //// for debugging:
                            // if (phaseX.endCriteriaManager.checkIfPhaseEnd()) {
                            //    phaseX.endCriteriaManager.getEndPercentage();
                            // }
                            break;
                        }
                        const probViewClass = phaseX.getProblemViewClass(stim.type);
                        if (!probViewClass) {
                            Logger.info('No problem view defined: ' + stim.type);
                            break;
                        }
                        numProblems++;
                        const tmptotaltime = Date.now() - tmpstarttime;
                        if (numProblems >= 50 || tmptotaltime > 20 * 60 * 1000) {
                            Logger.info('EndCriteria problem? Done ' + numProblems + ' problems in '
                                + tmptotaltime + ' minutes - force complete phase');
                            // force set to complete
                            TestStatistics.instance.runStats.won = true;
                            break;
                        }
                        // Logger.info("New problem");
                        phaseX.registerShowProblem();
                        this.userBehavior.startProblem(stim);

                        this.userBehavior.reply();
                        if (!phaseX.getAnswerLogItem().correct) {
                            // Logger.info("Answered incorrectly: " + phaseX.getAnswerLogItem().answer
                            // + " / " + phaseX.solution.getProposedSolution().join(","));
                            numIncorrect++;
                        }
                        // Logger.info("Answered correctly: " + phaseX.getAnswerLogItem().correct);
                    }
                    Logger.info('Exit phase ' + phaseData.type + ' (' + pr.id + '), '
                        + numIncorrect + '/' + numProblems + ' problems failed (accuracy '
                        + (TestStatistics.instance.noOfCorrectTotal / TestStatistics.instance.noOfResponses).toPrecision(2) + ')'
                        + ' ' + Math.round(TestStatistics.instance.runStats.trainingTime / 1000) + 's');
                    pr.exitPhase(false);

                    // TODO: really ugly...
                    // if next phase is Dialog, go directly to it..
                    if ((<any>pr).phaseIndex + 1 < (<any>pr).data.phases.length) {
                        const nextPhaseData = (<any>pr).data.phases[(<any>pr).phaseIndex + 1];
                        if (nextPhaseData.type === 'Dialog') {
                            res(AfterPhaseDone.NextPhase);
                            return;
                        }
                    }
                    res(phaseData.phase === 'GUIDE' ? AfterPhaseDone.NextPhase : AfterPhaseDone.Menu);
                });
            }
        });
    }
}
