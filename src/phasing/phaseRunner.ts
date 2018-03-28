import { MetaphorManager } from '../metaphors/metaphorManager';
import { GameDefinition } from '../trainingPlan/gameDefinition';
import { GameState } from '../gameState';
import { TestStatistics } from '../toRemove/testStatistics';
import { NewPhaseLogItem, PhaseEndLogItem, LeaveTestLogItem } from '../toRemove/logItem';
import { PhaseXBase } from './phase';
import { PlanetBundler } from '../trainingPlan/PlanetBundler';
import { EndType } from './endCriteriaEndType';
import { RNGSeederTrialInLevel, RNGseed } from '@jwmb/pixelmagic/lib/utility/random';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { ExerciseStats } from '../dataStructs';
import { Reflection, PhaseReflection } from './phaseReflection';
// import { ExViewWM } from '../../cmcontent/games/wm/viewWM';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';

export class PhaseRunner {
    static isRunning = false;

    private data: any;
    private phaseIndex = -1;
    currentPhase: PhaseXBase;
    id: string;

    // private fakeTest: TempTestScreenReplacement; //TODO: should not be needed - TestStatistics should be given data, not ask for it

    static fakeMassagePhaseData(phaseData: any): any {
        if (phaseData.type === 'Dialog') { // TODO: should be handled like a normal phase?
            return phaseData;
        }
        let phaseInfo = Reflection.LookUp.getPhaseInfo(phaseData.type);
        if (!phaseInfo) {
            phaseInfo = Reflection.LookUp.getPhaseInfo(phaseData.type.replace('Phase', 'PhaseX'));
            if (!phaseInfo) {
                return null;
            }
        }
        phaseData = ObjectUtils.merge({}, phaseData, true, false);
        phaseData.class = ObjectUtils.getClassNameFromConstructor(phaseInfo.class_);

        if (!phaseData.views) {
            phaseData.views = {};
        }
        const viewClasses = MetaphorManager.instance.getPhaseViewClassesResolver().getClasses(phaseInfo.class_);
        if (!phaseData.views.problem) {
            phaseData.views.problem = viewClasses.problem;
        }
        if (!phaseData.views.phase) {
            phaseData.views.phase = viewClasses.phase;
        }
        if (!phaseData.views.problemProps) {
            phaseData.views.problemProps = {};
        }

        if (!phaseData.responseAnalyzer) {
            phaseData.responseAnalyzer = {};
        }
        if (!phaseData.problemFactory) {
            phaseData.problemFactory = {};
        }
        let stimType = phaseData.stimuliType;
        delete phaseData.stimuliType;

        // Special property routing:
        const toView = ['showDialogBetween'];
        toView.forEach(_ => {
            if (phaseData[_] !== undefined) {
                if (typeof phaseData.views.phase === 'function') {
                    phaseData.views.phase = { _class: phaseData.views.phase };
                }
                phaseData.views.phase[_] = phaseData[_];
                delete phaseData[_];
            }
        });

        const probGenData = phaseData.problemGeneratorData;
        if (phaseData.problemGeneratorData) {
            delete phaseData.problemGeneratorData;

            const pprops = probGenData.problemProps;
            if (probGenData.problemProps) {
                if (probGenData.problemProps.stimuliType) {
                    stimType = probGenData.problemProps.stimuliType;
                }
                // Always copy full problemProps to view (maybe we should be selective):
                phaseData.views.problemProps = ObjectUtils.merge({}, pprops, true, false);
                // "correctBeforeNext": true, "hintCorrect": true, "useDoneButton": true, "errorHiliteType": "SHOW_CORRECT"
                // toView = ["hintCorrect", "useDoneButton", "errorHiliteType"];
                // toView.forEach(_ => {
                //    if (phaseData[_] != undefined) {
                //        if (typeof phaseData.views.phase == "function") {
                //            phaseData.views.phase = { _class: phaseData.views.phase };
                //        }
                //        phaseData.views.phase[_] = phaseData[_];
                //        delete phaseData[_];
                //    }
                // });

                // Manual propagation of problemProps to correct object below:
                if (pprops.useDoneButton) {
                    phaseData.responseAnalyzer.waitForDoneSignal = pprops.useDoneButton;
                }

                if (pprops.correctBeforeNext !== undefined) {
                    // phaseData.responseAnalyzer.allowMultipleErrors = !pprops.correctBeforeNext;
                    delete pprops.correctBeforeNext;
                }
                if (pprops.errorCountBeforeContinue) {
                    phaseData.responseAnalyzer.allowedNumErrors = pprops.errorCountBeforeContinue;
                    delete pprops.errorCountBeforeContinue;
                }

                if (Object.keys(pprops).length) {
                    const toFactory = ['gridWidth', 'gridHeight', 'gridDepth', 'removeLevels'];
                    Object.keys(pprops).forEach(_ => {
                        if (toFactory.indexOf(_) >= 0) {
                            phaseData.problemFactory[_] = pprops[_];
                        }
                    });
                }
            }

            const probs = probGenData.problems;
            if (probs && probs.length > 0) {
                // TODO: maybe defer handling of predefined problems to PhaseX (so we can switch problem types between items)?
                // But then we can't set problem list as part of problemFactory, because it must change between problems?
                //  hm, that's only because problem parsing is part of problemFactory... Should be separated
                const problemTypes = probs.map(_ => _.type).distinct();
                const factories = (problemTypes.map(_ => {
                    const info = Reflection.LookUp.getProblemInfoByType(_);
                    return info && info.problemFactory ? info.problemFactory._class : null;
                })).distinct();
                if (factories.length !== 1) {
                    throw Error(factories.length > 1 ? 'More than 1 problem type in same phase' : 'No problem factories for phase');
                }
                stimType = <string>problemTypes[0];
                phaseData.problemFactory.problems = probs;
            }
            if (probGenData.problemFile) {
                phaseData.problemFactory.problemFile = probGenData.problemFile;
            }
        }
        if (stimType) {
            const pinfo = PhaseReflection.problemTypeToInfo(stimType);
            if (!phaseData.problemFactory._class) {
                if (!pinfo) {
                    return null;
                }
                phaseData.responseAnalyzer = ObjectUtils.merge(pinfo.responseAnalyzer, phaseData.responseAnalyzer, true, true);
                phaseData.problemFactory = ObjectUtils.merge(pinfo.problemFactory, phaseData.problemFactory, true, true);
            }
            if (pinfo && pinfo._class) {
                phaseData.views.problem = pinfo._class;
            }
        }
        // We can only use PhaseXBase when we have a valid problemFactory / problem
        if (!phaseData.problemFactory._class && !phaseData.views.problem) {
            return null;
        }

        // // TODO: it's typeless
        // // Special handling:
        // phaseData = (<any>phaseInfo.class_).massagePhaseData(phaseData, probGenData, stimType);

        phaseData.rngMgr = {
            seeder: RNGSeederTrialInLevel,
            rng: RNGseed
        };
        // Convert all constructor functions to class names:
        PhaseReflection.recConstructorToClassName(phaseData);
        return phaseData;
    }

    constructor(id: GameDefinition | string) { // , logStartNewExercise: boolean = true
        PhaseRunner.isRunning = true;
        if (typeof (id) === 'string') {
            this.id = id;
            const planets = PlanetBundler.getPlanets();
            const found = planets.find(_ => _.nextGame.id === this.id).nextGame;
             // planets.map(_ => _.data).filter(_ => _.id == this.id);

            if (!found) { // .length == 0
                // console.log(data);
                // console.log(tpr);
                throw Error('No tests with id ' + id);
            }
            this.data = found; // [0];
        } else {
            this.data = id;
            this.id = id.id;
        }

        if (GameState.trainingSettings && GameState.trainingSettings.trainingPlanOverrides
            && GameState.trainingSettings.trainingPlanOverrides.testData) {
            // example: "trainingPlanOverrides":{"testData":[{"id":"WM_grid#\\d+","phases":[{"lvlMgr":{"phaseChange":{"change":-0.8}}}]}]}
            // GameState.trainingSettings.trainingPlanOverrides.testData[id];
            let foundOverride = (<any[]>GameState.trainingSettings.trainingPlanOverrides.testData)
                .find(_ => new RegExp(_.id).test(this.id));
            if (foundOverride) {
                foundOverride = ObjectUtils.merge({}, foundOverride);
                delete foundOverride.id;
                if (foundOverride.phases) {
                    if (!this.data.phases) {
                        this.data.phases = [];
                    }
                    foundOverride.phases.forEach((v, i) => {
                        if (this.data.phases.length <= i) {
                            this.data.phases.push([]);
                        }
                        ObjectUtils.merge(this.data.phases[i], v);
                    });
                    delete foundOverride.phases;
                }
                ObjectUtils.merge(this.data, foundOverride);
            }
        }

        // this.fakeTest = <TempTestScreenReplacement>{ id: this.id, currentPhase: { endCriteriaManager: null } };
        TestStatistics.instance.startNewExercise(this); // this.fakeTest);

        // TODO: not this class' responsibility
        // TODO: we actually mean planet here, not game/exercise, right?
        if (ExerciseStats.instance.getGameStats(this.id).numRuns > 0) { // skip to last phase if already played this
            this.phaseIndex = this.data.phases.length - 2;
        }
    }

    moveNextValidPhase(): boolean {
        do {
            this.phaseIndex++;
            let phaseData = this.getCurrentData();
            if (phaseData) {
                try {
                    phaseData = PhaseRunner.fakeMassagePhaseData(phaseData);
                } catch (err) {
                    phaseData = PhaseRunner.fakeMassagePhaseData(phaseData);
                    console.log();
                }
                if (!phaseData) {
                    Logger.warn('Couldn\'t convert phaseData for ' + this.id);
                    continue;
                }
                if (phaseData.type === 'Dialog') { // TODO: shouldn't need special handling?
                    return true;
                }
                if (phaseData.views.phase) {
                    return true;
                }
            }
        } while (this.phaseIndex < this.data.phases.length);
        return false;
    }
    // moveNext(): boolean {
    //    this.phaseIndex++;
    //    return this.phaseIndex < this.data.phases.length;
    // }
    getCurrentData(): any {
        return this.phaseIndex < this.data.phases.length ? this.data.phases[this.phaseIndex] : null;
    }
    create(phaseData?: any): Promise<PhaseXBase> {
        return new Promise<PhaseXBase>((res, rej) => {
            if (this.currentPhase) {
                throw Error('create new phase before old was exited');
                // this.currentPhase.dispose();
            }
            if (!phaseData) {
                phaseData = this.getCurrentData();
            }
            if (!phaseData) {
                res(null);
            } else {
                phaseData = PhaseRunner.fakeMassagePhaseData(phaseData);
                if (phaseData.type === 'Dialog') {
                    // if (this.currentPhase) {
                    //    if (this.currentPhase.currentProblem) {
                    //        this.currentPhase.currentProblem.hide();
                    //    }
                    // }
                    // new DialogGeneric(phaseData);
                    Logger.warn('Shouldn\'t get here (PhaseRunner)');
                    res(null);
                } else {
                    // this.currentPhase = PhaseXBase.createPhase(phaseData);
                    PhaseXBase.createPhase(phaseData).then(ph => {
                        this.currentPhase = ph;
                        // TestStatistics.instance.startPhase(this.currentPhase); // <TempPhaseBaseReplacement><any>this.currentPhase);
                        TestStatistics.instance.logEvent(new NewPhaseLogItem(
                            { exercise: this.id, sequence: this.phaseIndex, phase_type: phaseData.phaseType }));
                        // TestStatistics.instance.logEvent(NewPhaseLogItem.create(<NewPhaseLogItem>{
                            // exercise: this.id, sequence: this.phaseIndex, phase_type: phaseData.phaseType }));
                        //// Fake stuff:
                        // this.fakeTest.currentPhase = <TempPhaseBaseReplacement><any>this.currentPhase;
                        // this.currentPhase.test.id = this.id;
                        res(this.currentPhase);
                    }, err => rej(err));
                }
            }
         });
    }

    exitPhase(wasCancelled: boolean) {
        if (!this.currentPhase) {
            return;
        }
        // TODO: this calc is done in many places... Best to do only here?
        const hasWon: boolean = this.currentPhase.endCriteriaManager.endType === EndType.TARGET;
        const evt = new PhaseEndLogItem({ phase: this.currentPhase.phaseType.toString(), wonRace: hasWon });
        if (wasCancelled) {
            evt.cancelled = true;
        }
        TestStatistics.instance.logEvent(evt);

        ExerciseStats.instance.addGameRun(TestStatistics.instance.runStats);
        TestStatistics.testPhaseLoggers.forEach(_ => _(this.currentPhase, ExerciseStats.instance, evt));
        GameState.logTestPhase(this.currentPhase, evt);

        // PhaseEndLogItem.create(<PhaseEndLogItem>{ phase: this.currentPhase.phaseType, wonRace: hasWon })
        // TODO: add flag indicating that it's been cancelled OR remove this log        }

        this.currentPhase.dispose();
        this.currentPhase = null;
    }

    exitTest() { // TODO: should not be "Test" or "Planet"
        // var totalMedals = GameState.exerciseStats.getMedalCount(this.id); // get previous values before logging test stats
        // var previousMedals = GameState.getPreviousMedalCount();
        // var totalStars = MetaphorManager.getTotalStars();
        // var previousStars = totalStars - TestStatistics.instance.starCounter;

        TestStatistics.instance.logEvent(new LeaveTestLogItem());
        PhaseRunner.isRunning = false;
    }
}
