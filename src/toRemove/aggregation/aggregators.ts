import {
    LogItem, SyncLogStateLogItem, NewPhaseLogItem, PhaseEndLogItem, NewProblemLogItem,
    AnswerLogItem, LeaveTestLogItem
} from '../logItem';
import * as phaseStructure from './phaseStructure';
import { KeyValMap } from '@jwmb/pixelmagic/lib/toReplace/keyValMap';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';



export class Aggregation {
    // aggregators: IAggregatorBase[];
    constructor(public aggregators: IAggregatorBase[]) {
        //// TODO: rearrange into hierarchy from { A: {B: { B2 }, C: null } }
        //// this.aggregators = [new PhaseHierarchy(), new LevelPerExercise()];

        // TODO: calculate execution order depending on dependencies
        this.aggregators.forEach(_ => {
            const dep = <any[]>(<any>_).dependencyClasses;
            if (dep) {
                const instances = dep.map(d => this.aggregators.find(p => (<Object>p).constructor === d));
                (<any>_).dependencies = instances;
            }
        });
        this.aggregators.forEach(_ => _.init());
    }
    // getAggregatorT<T>(): T { //TODO: where T is IAggregatorBase
    //    //var tt = typeof T;
    //    var found = this.aggregators.filter(_ => ObjectUtils.isOfType(_, T));
    //    return found.length > 0 ? <T>found[0] : null;
    // }
    getAggregator(type: Function): IAggregatorBase {
        const found = this.aggregators.find(_ => ObjectUtils.isOfType(_, type));
        return found;
    }

    addItem(logItem: LogItem, index: number, array: LogItem[]) {
        const byLogItem = <IItemAggregatorBase[]>this.aggregators.filter(_ => _['addItem'] != null);
        // .isOfType( [new PhaseHierarchy(), new LevelPerExercise()];
        byLogItem.forEach(_ => _.addItem(logItem, index, array));
    }
    // TODO: re-implement with GameRunStats
    // static test() { //PixelMagic.aggregators.Aggregation.test()
    //    //23953 WM_
    //    //var fetchInfo = { accountId: 23077, exercise: "workmemo3dgrid", upToDay: 29 }; //RIHUGODE 36
    //    //var fetchInfo = { accountId: 22591, exercise: "WM_crush", upToDay: 17 }; //PEHAWAJE 36
    //    //var fetchInfo = { accountId: 23063, exercise: "WM_crush", upToDay: 17 }; //SOZOPUJE 36
    //    //var fetchInfo = { accountId: 23186, exercise: "WM_grid", upToDay: 35 }; //kedobuje 41

    //    var fetchInfo = { accountId: 23771, exercise: "WM_3dgrid", upToDay: 35 }; //kedobuje 41
    //    var startSimulatingFromDay = 3;
    //    var debug
    //        = "";

    //    var wr = new WebRequest("http://admin.cognitionmatters.org/api/Report/CreateReports", "POST", //localhost:56665
    //        { account_ids: [fetchInfo.accountId], report_types: [], report_specs: { "LogItems":
    // { upToDay: fetchInfo.upToDay, exercises: fetchInfo.exercise } } });
    //    wr.start().then(r => {
    //        var log = LogItem.deserializeList("" + r.responseText);
    //        var aggreg = new aggregators.Aggregation([new aggregators.PhaseHierarchy(), new aggregators.ExerciseStats()]);
    //        var exSt = <aggregators.ExerciseStats>aggreg.getAggregator(aggregators.ExerciseStats);
    //        var phases = <aggregators.PhaseHierarchy>aggreg.getAggregator(aggregators.PhaseHierarchy);

    //        var fCreateStats = () => {
    //            var stats = {};
    //            exSt.byExercise.keys.forEach(k => exSt.byExercise.getValue(k)
    //                .forEach((v, i) => {
    //                    stats[(<any>v).name] = v;
    //                }));
    //            return stats;
    //        };
    //        var currPhase: NewPhaseLogItem = null;
    //        var startLevel = null;
    //        var wonLastRace = false;
    //        var wonLastPlanet = false;
    //        debug = "tday,startSimple,startAdj,numLeadCorr,%corr,maxLv,minLvl,avg,wonRace,wonPlanet".replace(/,/g, "\t") + "\n";
    //        log.forEach(_ => {
    //            aggreg.addItem(_, -1, null);
    //            if (_.isOfType(NewPhaseLogItem)) {
    //                currPhase = <NewPhaseLogItem>_;
    //                if (new RegExp(fetchInfo.exercise).test(currPhase.exercise) == false) return;
    //                startLevel = PixelMagic.LevelChangePhaseMaxAvg.test(<IMapStringTo<ExerciseStatsData>>fCreateStats());

    //            } else if (_.isOfType(PhaseEndLogItem)) {
    //                if (//currPhase.training_day >= startSimulatingFromDay &&
    //                    new RegExp(fetchInfo.exercise).test(currPhase.exercise)) {

    //                    var ph = <phaseStructure.Phase>phases.result.findLast(p => ObjectUtils.isOfType(p, phaseStructure.Phase)
    //                        && (<phaseStructure.Phase>p).logItem.exercise == currPhase.exercise);
    //                    if (!ph) { return; }

    //                    var succeededLevels = ph.problems.filter(p => p.answers.find(a =>
    // a.logItem.correct) != null).map(p => p.logItem.level);
    //                    if (succeededLevels.length == 0) {
    //                        succeededLevels = [];
    //                    }
    //                    var numLeadingIncorrect = ph.problems.findIndex(p => p.answers.find(a => a.logItem.correct) != null);
    //                    if (numLeadingIncorrect < 0) numLeadingIncorrect = ph.problems.length;

    //                    debug += "" + currPhase.training_day
    //                        + "\t" + (startLevel.simple - 0.5)
    //                        + "\t" + Math.round((startLevel.adjusted - 1) * 2) / 2

    //                        + "\t" + numLeadingIncorrect
    //                        + "\t" + Math.round(100 * succeededLevels.length / ph.problems.length)
    //                        + "\t" + Math.max.apply(null, succeededLevels)
    //                        //+ "\t" + (startLevel.simple - startLevel.adjusted); // + "\n";
    //                        + "\t" + Math.min.apply(null, succeededLevels)
    //                        + "\t" + StdDev.calc(succeededLevels).average.toFixed(2)
    //                        + "\t" + ((<PhaseEndLogItem>_).wonRace ? 1 : 0)
    //                        + "\t" + ((<PhaseEndLogItem>_).completedPlanet ? "compl" : "")
    //                        + "\n"
    //                        ;
    //                }
    //            }
    //        });
    //        console.log(debug);
    //    }).fail(err => alert(err));
    // }
}

export interface IAggregatorBase {
    acceptsInputType(): any;
    // addItem(item: PixelMagic.LogItem);
    init();
}
export interface IItemAggregatorBase extends IAggregatorBase {
    addItem(item: LogItem, index: number, array: LogItem[]);
}
// export class ExerciseStats implements IItemAggregatorBase {
//    dependencyClasses = [PhaseHierarchy];
//    dependencies = [];

//    acceptsInputType() {
//        return PixelMagic.LogItem;
//    }
//    byExercise: KeyValMap<string, ExerciseStatsData[]>; //PlanetStats
//    result: ExerciseStatsData[];

//    _ph: PhaseHierarchy;
//    init() {
//        this._ph = <PhaseHierarchy>this.dependencies[0];
//        this.byExercise = new KeyValMap<string, ExerciseStatsData[]>();
//        this.result = [];
//    }
//    addItem(o: PixelMagic.LogItem, i: number, array: PixelMagic.LogItem[]) {
//        if (o.isOfType(PhaseEndLogItem)) {
//            //TODO: the full data flow should be defined - now we're using PhaseEndLogItem to get stuff,
//            // but should be calculated (lots to do, EndCriteria stuff, medalMode etc...)
//            var phEnd = <PhaseEndLogItem>o;
//            var foundAt = this._ph.result.findLastIndex(_ => ObjectUtils.isOfType(_, aggregators.phaseStructure.Phase));
//            if (foundAt < this._ph.result.length - 2) {
//                return;
//            }
//            var node = <aggregators.phaseStructure.Phase>this._ph.result[foundAt];
//            //var node = <aggregators.phaseStructure.Phase>this._ph.result[this._ph.result.length - 1];
//            var exercise = PixelMagic.ExerciseStats.getSharedId(node.logItem.exercise);
//            var list = this.byExercise.getOrAddByKey(exercise, []);
//            var stats: ExerciseStatsData;
//            if (list.length == 0 || list[list.length - 1].isCompleted) {
//                stats = new ExerciseStatsData();
//                list.push(stats);
//                (<any>stats).name = node.logItem.exercise;
//                stats.unlockedTimeStamp = node.logItem.time;
//            } else {
//                stats = list[list.length - 1];
//            }

//            var time = phEnd.time - node.logItem.time; //TODO: depends on exercise?
//            if (phEnd.score > stats.bestScore) {
//                stats.bestScore = phEnd.score;
//                stats.bestTime = time;
//            }
//            //stats.customData
//            var correctLevels = node.problems.filter(p => p.answers.find(a => a.logItem.correct) != null)
//                .map(p => p.logItem.level);
//            var highestLevel = correctLevels.length ? Math.max.apply(null, correctLevels) : 0;
//            stats.highestLevel = Math.max(stats.highestLevel, highestLevel);
//            stats.isCompleted = phEnd.completedPlanet;
//            var lastProb = node.problems.length ? node.problems[node.problems.length - 1] : null;
//            stats.lastLevel = lastProb ? lastProb.logItem.level : 0;
//            stats.lastTimeStamp = phEnd.time;
//            stats.noOfWins += phEnd.wonRace ? 1 : 0;
//            stats.medalCount = Math.min(3, stats.noOfWins);
//            //stats.runsLeft
//            stats.scores.push(phEnd.score);
//            //stats.stars
//            var responseTimes = node.problems.length == 0 ? [0]
//                : node.problems.filter(p => p.answers.length > 0).map(p => p.answers[p.answers.length - 1].logItem.response_time);
//            stats.trainingTime = responseTimes.reduce((p, v) => p + v);
//            stats.wonLast = phEnd.wonRace;
//        }
//    }
// }
export class PhaseStats {
    // TODO: add ResponseLogItem (N responses comprises an Answer). Gives us total and individual response times
    // Or: Stimuli / Response / PartialResponse (Feedback?)
    // TODO: interleaved Problems/Phases (multiple simultaneous games) - they need some kind of IDs


    // latestLevel: number; //check last NewProblemLogItem instead
    levelMaxSucceeded: number;
    levelMaxTried: number;
    numProblems: number; // noOfQuestions
    numProblemsWithCorrectAnswer: number;
    numAnswers: number; // noOfResponses

    // targetScore: number;

    // lastLogTime: number; //only used in App::update - reload if user has been idle for too long
    // timeLimit: number; //never used
    // itemTarget: number; //never used

    // phaseStartTime: number; //by getTestTime() from EndCriteriaManager
    // problemStartTime: number; //for answer.response_time


    noOfCorrectTotal: number;
    noOfCorrectInRow: number;
    noOfIncorrectTotal: number;
    noOfIncorrectOnCurrent: number;
    noOfIncorrectInRow: number;

    // lastAnswerWasCorrect: boolean;
    // lastAnswerWasReversed: boolean;

    // starCounter: number;

    // levelCurrentProblem: number;
    // levelLastProblem: number;
    // levelHighestCorrect: number;
    // lastLevelHighestCorrect: number;
}
export class PhaseHierarchy implements IItemAggregatorBase {
    acceptsInputType() {
        return LogItem;
    }
    result: phaseStructure.Node[] = []; //
    warnings: string[] = [];
    currPha: phaseStructure.Phase = null;
    currProb: phaseStructure.Problem = null;
    ignoreErrors: boolean;
    toInsert = new KeyValMap<number, LogItem>();
    toRemove: number[] = [];

    init() {
    }
    addItem(_: LogItem, i: number, array: LogItem[]) {
        const tryToFix = true;
        if (_.isOfType(SyncLogStateLogItem)) {
            this.ignoreErrors = (<SyncLogStateLogItem>_).syncedUpToHere;
        }
        if (this.ignoreErrors) {
            return;
        }
        if (_.isOfType(NewPhaseLogItem)) {
            if (this.currPha) {
                this.warnings.push('NewPhase w/o PhaseEnd');
                if (tryToFix) {
                    this.toInsert.addPair(i, new PhaseEndLogItem({ phase: 'FAKE' }));
                     // PixelMagic.PhaseEndLogItem.create(<PixelMagic.PhaseEndLogItem>{ phase: "FAKE" }))
                }
            }
            this.currProb = null;
            this.currPha = new phaseStructure.Phase();
            this.currPha.untypedLogItem = _;
            this.result.push(this.currPha); // structure

        } else if (_.isOfType(NewProblemLogItem)) {
            if (this.currPha == null) {
                throw Error('No phase for ' + JSON.stringify(_));
            }
            this.currProb = new phaseStructure.Problem();
            this.currProb.untypedLogItem = _;
            this.currProb.phase = this.currPha;
            this.currPha.problems.push(this.currProb);

        } else if (_.isOfType(AnswerLogItem)) {
            if (this.currProb == null) {
                throw Error('No problem for ' + JSON.stringify(_));
            }
            const answ = new phaseStructure.Answer();
            answ.untypedLogItem = _;
            answ.problem = this.currProb;
            this.currProb.answers.push(answ);

        } else if (_.isOfType(PhaseEndLogItem)) {
            if (this.currPha == null) {
                let tmpWarning = 'N/A';
                for (let backCnt: number = i - 1; backCnt >= 0; backCnt--) {
                    if (array[backCnt].isOfType(PhaseEndLogItem)) {
                        const sliced = array.slice(backCnt, i + 1);
                        const comp = ObjectUtils.merge({}, sliced[0]);
                        const comp2 = ObjectUtils.merge({}, _);
                        comp.time = comp2.time;
                        if (ObjectUtils.equals(comp, comp2)) {
                            this.toRemove.push(i);
                        } else {
                            this.toRemove.push(i);
                        }
                        tmpWarning = '\n\n' + LogItem.serializeList(sliced);
                        // toInsert.addPair(i + 1, ErrorLogItem.create(<ErrorLogItem>{ level: "WARN",
                        // messages: [LogItem.serializeList(sliced)] }));
                        break;
                    }
                }
                this.warnings.push('Duplicate PhaseEnd: ' + tmpWarning);
            }
            this.currPha = null;
            this.currProb = null;
        } else if (_.isOfType(LeaveTestLogItem)) {
            if (this.currPha != null) {
                this.warnings.push('PhaseEnd not null at LeaveTest');
            }
        } else {
            const other = new phaseStructure.Node();
            other.untypedLogItem = _;
            this.result.push(other); // structure
        }

    }

    aaa(): PhaseStats {
        // require
        // this.result.filter(_ => _.untypedLogItem.isOfType(PixelMagic.NewPhaseLogItem) && (<PixelMagic.NewPhaseLogItem>_).
        const phase = <phaseStructure.Phase>this.result.findLast(_ => _.untypedLogItem.isOfType(NewPhaseLogItem));
        // phase.logItem.exercise
        const result: PhaseStats = new PhaseStats();
        const probsWithCorrectAnswers = phase.problems.filter(_ => _.answers.find(a => a.logItem.correct) != null);
        const correctLevels = probsWithCorrectAnswers.map(_ => _.logItem.level);
        const allAnswers: phaseStructure.Answer[] = [].concat(phase.problems.map(_ => _.answers));

        result.numProblems = phase.problems.length;
        result.numAnswers = allAnswers.length;
        // result.latestLevel = phase.problems[phase.problems.length - 1].logItem.level;
        result.levelMaxSucceeded = Math.max.apply(null, correctLevels);
        result.levelMaxTried = Math.max.apply(null, phase.problems.map(_ => _.logItem.level));
        result.numProblemsWithCorrectAnswer = probsWithCorrectAnswers.length;

        return result;
    }
}
export class LevelStats {
    numQuestions = 0;
    numAnswers = 0;
    numCorrectAnswers = 0;
    numTimesEnteredLevelFromBelow = 0;
    numTimesEnteredLevelFromAbove = 0;
    get numTimesEntered(): number {
        return this.numTimesEnteredLevelFromAbove + this.numTimesEnteredLevelFromBelow;
    }
}
export class PerExercisePerLevel implements IItemAggregatorBase {

    result = new KeyValMap<string, KeyValMap<number, LevelStats>>();
    private exerciseToLastLevel = new KeyValMap<string, number>();
    private _currentExercise: string;
    private _currentLevel: number;
    private _currectExerciseStats: KeyValMap<number, LevelStats>;
    private _currectLevelStats: LevelStats;
    private _currentProblemHasCorrectAnswer: boolean;
    private numProblemsInCurrentPhase: number;

    acceptsInputType() {
        return LogItem;
    }
    init() {
    }
    addItem(item: LogItem, index: number, array: LogItem[]) {
        if (item.isOfType(NewPhaseLogItem)) {
            this.numProblemsInCurrentPhase = 0;
            this._currentExercise = (<NewPhaseLogItem>item).exercise;
            this._currectExerciseStats = this.result.getValueOrDefault(this._currentExercise, null);
            if (this._currectExerciseStats == null) {
                this._currectExerciseStats = new KeyValMap<number, LevelStats>();
                this.result.addPair(this._currentExercise, this._currectExerciseStats);

                this.exerciseToLastLevel.addPair(this._currentExercise, -1);
            }

        } else if (item.isOfType(NewProblemLogItem)) {
            this._currentLevel = (<NewProblemLogItem>item).level;
            const lastLvl = Math.floor(this.exerciseToLastLevel.getValue(this._currentExercise));
            const lvl = Math.floor(this._currentLevel);
            this._currectLevelStats = this._currectExerciseStats.getValueOrDefault(lvl, null);
            if (this._currectLevelStats == null) {
                this._currectLevelStats = new LevelStats();
                this._currectExerciseStats.addPair(lvl, this._currectLevelStats);
            }
            this._currectLevelStats.numQuestions++;
            if (lvl > lastLvl) {
                this._currectLevelStats.numTimesEnteredLevelFromBelow++;
            } else if (lvl < lastLvl) {
                this._currectLevelStats.numTimesEnteredLevelFromAbove++;
            }

        } else if (item.isOfType(AnswerLogItem)) {
            this._currectLevelStats.numAnswers++;

            const answer = <AnswerLogItem>item;
            this._currectLevelStats.numCorrectAnswers += answer.correct ? 1 : 0;
        }
    }
}
export class LevelPerExercise implements IItemAggregatorBase {
    result: KeyValMap<string, PhaseStats> = new KeyValMap<string, PhaseStats>();

    private _currentExercise: string;
    private _currentLevel: number;
    private _currentLevelStats: PhaseStats;
    private _currentProblemHasCorrectAnswer: boolean;

    acceptsInputType() {
        return LogItem;
    }

    init() {
        // this.result = new KeyValMap<string, PhaseStats>();
    }
    addItem(item: LogItem, index: number, array: LogItem[]) {
        if (item.isOfType(NewPhaseLogItem)) {
            this._currentExercise = (<NewPhaseLogItem>item).exercise;
            this._currentLevelStats = new PhaseStats();
            this.result.addPair(this._currentExercise, this._currentLevelStats);

        } else if (item.isOfType(NewProblemLogItem)) {
            this._currentLevelStats.numProblems++;
            this._currentLevel = (<NewProblemLogItem>item).level;
            this._currentProblemHasCorrectAnswer = false;

        } else if (item.isOfType(AnswerLogItem)) {
            this._currentLevelStats.levelMaxTried = this._currentLevel;

            const answer = <AnswerLogItem>item;
            this._currentLevelStats.numAnswers++;
            if (answer.correct) {
                if (!this._currentProblemHasCorrectAnswer) {
                    this._currentProblemHasCorrectAnswer = true;
                    this._currentLevelStats.numProblemsWithCorrectAnswer++;
                }
                this._currentLevelStats.levelMaxSucceeded = Math.max(this._currentLevelStats.levelMaxSucceeded, this._currentLevel);
            }
        }
    }
}
