import { PhaseXBase, IStimuli, ISolution } from '../phasing/phase';
import { IRNG, RNGHelper, RNGseed } from '@jwmb/pixelmagic/lib/utility/random';
import { StateLog } from '../toRemove/stateLog';
import { LogItem } from '../toRemove/logItem';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { PlanetInfo, PlanetBundler } from '../trainingPlan/PlanetBundler';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { IResponseAnalysisResult, IResponseAnalyzer } from '../phasing/responseAnalysis';
import * as aggregators from '../toRemove/aggregation/aggregators';
import { TimeMachine } from '../utils/timeMachine';

export class TestUserBehavior {
    currentPhase: PhaseXBase;
    stimuli: IStimuli;
    exerciseBehavior: ExerciseTestBehavior;
    rng: IRNG;
    settings: any;
    playingBadly = false;
    playingGreat = false;

    constructor() {
        this.rng = new RNGseed();
        this.rng.setSeed(0);

        this.settings = {
            'exerciseBehaviors': {
                'global': {
                    lostFocusChancePerTrial: 0.05,
                    responseTimeBase: 3000,
                    startProblemTime: 5000
                },
                'ten_pals': { // Note: we go by stimuliType, not exercise id (we only changed to npals for exercise id)
                    // NO - now we've added search by gameId as well
                    responseTimeBase: 6000,
                    startProblemTime: 0,
                    maxLevel: 30
                },
                'wm': {
                    maxLevel: 5,
                    responseTimeBase: 2000,
                },
                'arrows': {
                    maxLevel: 60,
                    responseTimeBase: 4000,
                },
                'nback': {
                    maxLevel: 5
                },
                'tangram': {
                    responseTimeBase: 45000
                },
                'addsub': {
                    lostFocusChancePerTrial: 0.1,
                    maxLevel: 34
                }
            },
            'mainMenu': {

            }
        };

    }
    initPostLogin() {
        StateLog.instance.sigLogItem.add(this.onLogItem.bind(this));
        this.aggreg = new aggregators.Aggregation([
            new aggregators.PhaseHierarchy(),
            new aggregators.LevelPerExercise(),
            new aggregators.PerExercisePerLevel(),
            // new aggregators.ExerciseStats()
        ]);
    }
    aggreg: aggregators.Aggregation;
    private logItemsCopy: LogItem[] = [];
    private onLogItem(item: LogItem) {
        this.logItemsCopy.push(item);
        this.aggreg.addItem(item, this.logItemsCopy.length - 1, this.logItemsCopy);
        // var aaa = (<aggregators.LevelPerExercise>this.aggreg.getAggregator(aggregators.LevelPerExercise)).result;
        // .getValue(this.phaseRunner.currentPhase.
    }

    private foundInstances: ExerciseTestBehavior[] = null;
    private getBehavior(problemType: string): ExerciseTestBehavior {
        if (!this.foundInstances) {
            const classes = Instantiator.i.getClassNamesByRegex(/ExerciseTestBehavior/);
            this.foundInstances = classes.map(_ => <ExerciseTestBehavior>Instantiator.i.instantiate(_));
            this.foundInstances.forEach(_ => _.userBehavior = this);
            // ExerciseTestBehavior.defaultInstance = ExerciseTestBehavior.foundInstances.find(
            // _ => ObjectUtils.isOfType(_, ExerciseTestBehavior));
        }
        const canBeUsed = this.foundInstances.map(_ => ({ howGood: _.howGoodForProblemType(problemType), instance: _ }))
            .sort((a, b) => a.howGood > b.howGood ? 1 : (a.howGood < b.howGood ? -1 : 0));
        return canBeUsed[canBeUsed.length - 1].instance;
    }


    protected advanceTime(ms: number) {
        // Logger.info("adv.time", ms);
        // Logger.info("Time now: " + Date.now() + " " + new Date().toISOString());
        const currently = Date.now();
        TimeMachine.config({
            timestamp: currently + ms,
            keepTime: false,
            tick: true
        });
    }
    reachedEndOfTraining() {
        if (true) { // just some performance tests
            const str = LogItem.serializeList(this.logItemsCopy);
            this.aggreg = new aggregators.Aggregation([
                new aggregators.PhaseHierarchy(),
                new aggregators.LevelPerExercise(),
                new aggregators.PerExercisePerLevel()
            ]);

            const times = [Date.now()];
            const items = LogItem.deserializeList(str);
            times.push(Date.now());
            items.forEach((v, i, a) => this.aggreg.addItem(v, i, a));
            times.push(Date.now());

            const elapsed = times.map((v, i, a) => i === 0 ? 0 : v - a[i - 1]);
            Logger.info(elapsed, items.length);
        }
    }
    reachedEndOfDay() {
        this.advanceTime(24 * 60 * 60 * 1000);
    }
    selectPlanet(planets: PlanetInfo[]): PlanetInfo {
        this.advanceTime(4000); // takes time to select planet
        return RNGHelper.nextFromList(this.rng, planets);
        // return planets[0]; //possiblePlanets.length - 1];
    }

    startPhase(phase: PhaseXBase) {
        this.currentPhase = phase;
        this.advanceTime(3000); // intro time
        this.playingBadly = phase.testId.indexOf('WM_') === 0 && RNGHelper.nextFloat(this.rng, 0, 1) < 0.05;
        this.playingGreat = !this.playingBadly && phase.testId.indexOf('WM_') === 0 && RNGHelper.nextFloat(this.rng, 0, 1) < 0.05;
    }

    startProblem(stimuli: IStimuli) {
        this.stimuli = stimuli;
        if (!this.stimuli.type) {
            throw Error('stimuli.type is undefined!');
        }
        this.exerciseBehavior = this.getBehavior(this.stimuli.type);
        let bhName = ObjectUtils.getClassName(this.exerciseBehavior);
        bhName = bhName.replace('ExerciseTestBehavior', '').toLowerCase();
        const bhSettings = this.settings.exerciseBehaviors;
        const settings = ObjectUtils.merge({}, bhSettings['global']);
        if (bhSettings[this.stimuli.type.toLowerCase()]) {
            ObjectUtils.merge(settings, bhSettings[this.stimuli.type.toLowerCase()]);
        }
        if (bhSettings[bhName]) {
            ObjectUtils.merge(settings, bhSettings[bhName]);
        }
        const gameId = PlanetBundler.getGameIdFromPlanetId(this.currentPhase.testId);
        if (bhSettings[gameId]) {
            ObjectUtils.merge(settings, bhSettings[gameId]);
        }
        ObjectUtils.merge(this.exerciseBehavior, settings);
        this.exerciseBehavior.rng = this.rng;
        this.advanceTime(settings.startProblemTime); // TODO: problem presentation time, depends on exercise and level etc
    }
    reply() {
        const response = this.exerciseBehavior.createFullResponse(this.stimuli, this.currentPhase.solution,
            this.currentPhase.responseAnalyzer);
        let analysis: IResponseAnalysisResult;
        for (let i = 0; i < response.response.length; i++) {
            const partial = response.response[i];
            this.advanceTime(response.times[Math.min(response.times.length - 1, i)]); // pause before reply
            analysis = this.currentPhase.registerResponse(partial);
            if (analysis.isFinished) {
                break;
            }
        }
        const answ = this.currentPhase.getAnswerLogItem();
        if (!answ.correct) {
            // Logger.info(answ);
        }
    }
}
export interface IResponseWithTime {
    times: number[];
    response: any[];
}
export class ExerciseTestBehavior {
    rng: IRNG;
    lostFocusChancePerTrial = 0;
    responseTimeBase = 3000;
    userBehavior: TestUserBehavior;
    maxLevel = -1;

    howGoodForProblemType(type: string): number {
        return 0.01;
    }
    createFullResponse(stimuli: IStimuli, solution: ISolution, responseAnalyzer: IResponseAnalyzer): IResponseWithTime {
        let response = solution.getProposedSolution();
        let incorrect = false;
        if (this.maxLevel > 0) {
            if ((<any>stimuli).level) {
                const fractFromMax = (<any>stimuli).level / this.maxLevel;
                incorrect = this.rng.next() < Math.pow(fractFromMax, 4);
            }
        }
        if (!incorrect) {
            incorrect = this.rng.next() < this.lostFocusChancePerTrial;
        }
        if (incorrect) {
            try {
                const incorrectResponse = responseAnalyzer.getIncorrectFullResponse(solution);
                if (incorrectResponse === null) {
                    throw new Error('IncorrectRespone was null');
                }
                response = incorrectResponse;
            } catch (err) {
                Logger.info('Failed to create incorrect response');
            }
        }
        if ((<any>responseAnalyzer).waitForDoneSignal) { // TODO: shouldn't be done here - solution needs to know about this
            response.push(-1);
        }
        return <IResponseWithTime>{ times: [this.responseTimeBase], response: response };
    }
}
export class ExerciseTestBehaviorTangram extends ExerciseTestBehavior {
    howGoodForProblemType(type: string): number {
        return type.toLowerCase().indexOf('tangram') >= 0 ? 1 : 0;
    }
}

