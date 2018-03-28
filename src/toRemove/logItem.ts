import { ExerciseStats } from '../dataStructs';
import { TriggerData } from '../triggerManager';
import { ITrainingPlanData } from '../trainingPlan/TrainingPlan';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';
import { KeyValMap } from '@jwmb/pixelmagic/lib/toReplace/keyValMap';

export class ProblemResult {
    // public static CORRECT = <ProblemResult>(<any>"CORRECT");
    // public static WRONG = <ProblemResult>(<any>"WRONG");
    public static INCOMPLETE = <ProblemResult>(<any>'INCOMPLETE');
    public static TIMEOUT = <ProblemResult>(<any>'TIMEOUT');
    public static REVERSED = <ProblemResult>(<any>'REVERSED');
    // public static ANSWER = <ProblemResult>(<any>"ANSWER");
}

export class XLogType extends ProblemResult {
    public static NEW_SESSION = <XLogType>(<any>'NEW_SESSION');
    public static NEW_PHASE = <XLogType>(<any>'NEW_PHASE');
    public static NEW_PROBLEM = <XLogType>(<any>'NEW_PROBLEM');
    public static PHASE_END = <XLogType>(<any>'PHASE_END');
    public static LEAVE_TEST = <XLogType>(<any>'LEAVE_TEST');
    public static ERROR = <XLogType>(<any>'ERROR');
    public static SYNC = <XLogType>(<any>'SYNC');
}

export class LogItem {
    protected _type: XLogType;
    get type(): string { return this._type.toString(); } // representation of which LogItem subclass

    time: number; // local timestamp when object was created
    data: any; // TODO: shouldn't be used!

    constructor() { // initObj: Object = null) {
        this.time = Date.now();
        // if (initObj) { this.copyFrom(initObj); }
    }
    protected static createWithOverrides(objEmpty: LogItem, objOverrides: any): LogItem {
        return <LogItem>ObjectUtils.merge(objEmpty, objOverrides, false, false);
    }
    // protected copyFrom(obj: Object) {
    //     for (let k in obj) {
    //         if (obj.hasOwnProperty(k)) {
    //             let val = obj[k];
    //             (<any>this)[k] = val;
    //         }
    //     }
    // }
    validate(): Object {
        return null;
    }
    protected getSerialized(): string {
        let item: string = JSON.stringify(this);
        item = item.replace('"_type":', '"type":');
        item = '{ "className":"' + ObjectUtils.getClassName(<any>this) + '" ,' + item.substr(1);
        return item;
    }
    isOfTypes(checkAgainst: any[]): boolean {
        return checkAgainst.find(_ => LogItem._isOfType(this, _)) != null;
    }
    isOfType(checkAgainst: any): boolean {
        return LogItem._isOfType(this, checkAgainst);
    }
    private static _isOfType(obj: any, checkAgainst: any): boolean {
        while (true) {
            if (!obj.constructor) {
                return false;
            }
            if (obj.constructor === checkAgainst) { // .constructor
                return true;
            }
            obj = obj.__proto__;
            if (!obj) {
                return false;
            }
        }
    }
    static serializeList(items: LogItem[]): string {
        const withClassNames = items.map(_ => _.getSerialized());
        // var withClassNames: string[] = []; //log.concat([]);
        // items.forEach(_ => {
        //    if (_.isOfType(PhaseEndLogItem)) {
        //        var tmp = _.getSerialized();
        //    }
        //    //withClassNames.push(_.getSerialized());
        // });
        return '[' + withClassNames.join(',') + ']';
    }
    static deserializeList(str: string): LogItem[] {
        if (!str) {
            return [];
        }
        const item = <any[]>JSON.parse(str);
        let result: LogItem[] = [];
        result = item.map(_ => {
            let data = _;
            let className = (<any>_).className;
            if (!className) {
                const type = _.type ? _.type : _._type;
                switch (type) {
                    case XLogType.NEW_SESSION:
                        throw Error('Not used');
                    case XLogType.NEW_PHASE:
                        className = 'NewPhaseLogItem';
                        break;
                    case XLogType.NEW_PROBLEM:
                        className = 'NewProblemLogItem';
                        break;
                    case XLogType.PHASE_END:
                        className = 'PhaseEndLogItem';
                        break;
                    case XLogType.LEAVE_TEST:
                        className = 'LeaveTestLogItem';
                        break;
                    case 'ANSWER': // LogType.ANSWER:
                    case 'CORRECT': // LogType.CORRECT:
                    case XLogType.INCOMPLETE:
                    case XLogType.REVERSED:
                    case 'WRONG': // LogType.WRONG:
                    case XLogType.TIMEOUT:
                        className = 'AnswerLogItem';
                        break;
                    case 'ALREADY_SYNCED':
                    case 'NOT_SYNCED':
                        className = 'SyncLogStateLogItem';
                        data = { syncedUpToHere: type === 'ALREADY_SYNCED' };
                        break;
                    case 'SYNC':
                        className = 'SyncInfoLogItem';
                        data = { isStartMarker: _.sync_type === 'START', success: _.sync_type === 'SUCCESS', error: _.error };
                        break;
                    case 'USER_STATE_PUSH':
                        className = 'UserStatePushLogItem';
                        break;
                    case 'SPLIT':
                        className = 'SplitLogItem';
                        break;
                    case 'NULL':
                        className = 'NullLogItem';
                        break;
                    default:
                        throw Error('Event type not found: ' + type);
                }
            }
            if (className === '') {
                return null;
            } else if (!className) {
                throw Error('No className defined: ' + JSON.stringify(_));
            // } else if (!PixelMagic[className]) {
            //     throw Error('No class found: ' + className);
            } else {
                delete data._type;
                delete data.type;
                const o = <LogItem>Instantiator.i.instantiate(className, data);
                // const o = Object.create(PixelMagic[className].prototype);
                // o.constructor.apply(o, data);
                ObjectUtils.merge(o, data);
                return o;
            }
        });
        return result; // !item ? [] : item;
    }
    // static verifyLog(items: LogItem[]): boolean {
    //    try {
    //        zNode.constructFromLog(items);
    //    } catch (err) {
    //        Logger.error("Badly constructed log: " + err);
    //        return false;
    //    }
    //    return true;
    // }
    // static getIsSyncWorthy(items: LogItem[]) {
    //    if (!items || items.length == 0) {
    //        return false;
    //    }
    //    var index = items.findLastIndex(item => item.isOfType(SyncLogStateLogItem) && (<SyncLogStateLogItem>item).syncedUpToHere);
    //    return items.findIndex(_ => _.isOfTypes([AnswerLogItem, UserStatePushLogItem])) > 0
    //    //return true;
    // }
}

// For logging of client errors on server
export class ErrorLogItem extends LogItem {
    protected _type: XLogType = XLogType.ERROR;
    timeStamp: Date;
    level: string; // error level (INFO, WARNING, ERROR, FATAL etc)
    messages: any[];
    exception: any;
    // static create(initObj: any): ErrorLogItem {
    //    return <ErrorLogItem>LogItem.createWithOverrides(new ErrorLogItem(), initObj);
    // }
    public constructor(init?: Partial<ErrorLogItem>) {
        super();
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    }

}

// When entering an exercise / test
export class NewPhaseLogItem extends LogItem {
    protected _type: XLogType = XLogType.NEW_PHASE;
    training_day: number;
    exercise: string; // id of exercise (from training plan)
    sequence: number; // actually "phaseIndex" (# times this exercise has been entered)
    phase_type: string; // e.g. GUIDE or TEST
    // static create(initObj: any): NewPhaseLogItem {
    //    return <NewPhaseLogItem>LogItem.createWithOverrides(new NewPhaseLogItem(), initObj);
    // }
    public constructor(init?: Partial<NewPhaseLogItem>) {
        super();
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    }

}

// When a new problem/stimuli is generated/presented
export class NewProblemLogItem extends LogItem {
    protected _type: XLogType = XLogType.NEW_PROBLEM;
    problem_type: string; // id of exercise/problem type, e.g. WM_GRID, TEN_PALS
    problem_string: string; // all info (almost) about problem serialized in custom, per-problem, format (e.g. the WM sequence)
    level = 0; // Note: not all problem types have a level
    // static create(initObj: any): NewProblemLogItem {
    //    return <NewProblemLogItem>LogItem.createWithOverrides(new NewProblemLogItem(), initObj);
    // }
    public constructor(init?: Partial<NewProblemLogItem>) {
        super();
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    }

    validate(): Object {
        let result = null;
        if (this.problem_string && this.problem_string.length > 255) {
            result = {};
            result['problem_string'] = 'Length:' + this.problem_string.length;
            this.problem_string = this.problem_string.substr(0, 255);
        }
        return result;
    }
}

// When the "round" (battle, race, etc) is finished
export class PhaseEndLogItem extends LogItem {
    protected _type: XLogType = XLogType.PHASE_END;
    phase: string; // redundant? same as NewPhaseLogItem's phase_type? (TEST GUIDE)
    noOfQuestions: number; // redundant - can be calculated from other data
    noOfCorrect: number; // redundant - can be calculated from other data
    noOfIncorrect: number; // redundant - can be calculated from other data

    score: number; // normally # solved problems, but it's up to the exercise
    targetScore: number; // copied from endCriteraManager
    // TODO: should not be part of core data - the "planet" concept is higher-level
    planetTargetScore: number; // retrieved from endCriteraManager getMaxTargetScore
    wonRace: boolean; // redundant? same as score >= targetScore?
    // TODO: should not be part of core data - the "planet" concept is higher-level
    completedPlanet: boolean; // probably redundant - training plan manager decides this from other data
    cancelled: boolean; // did user cancel the phase (e.g. back button?)

    protected getSerialized(): string { // TODO: temporary, remove
        let str = super.getSerialized();
        if (this.phase === 'TEST') {
            const tmp = JSON.stringify({ 'noOfInCorrect': this.noOfIncorrect });
             // "noOfQuestions": this.questions, "noOfCorrect": this.corrects, "noOfIncorrect": this.incorrects });
            str = tmp.substr(0, tmp.length - 1) + ',' + str.substr(1, str.length - 1);
        }
        return str;
    }
    // static create(initObj: any): PhaseEndLogItem {
    //    return <PhaseEndLogItem>LogItem.createWithOverrides(new PhaseEndLogItem(), initObj);
    // }
    public constructor(init?: Partial<PhaseEndLogItem>) {
        super();
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    }

}
export class LeaveTestLogItem extends LogItem {
    protected _type: XLogType = XLogType.LEAVE_TEST;
    // static create(initObj: any): LeaveTestLogItem {
    //    return <LeaveTestLogItem>LogItem.createWithOverrides(new LeaveTestLogItem(), initObj);
    // }
    public constructor(init?: Partial<LeaveTestLogItem>) {
        super();
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    }

}

// When user gives a response (or response time is up)
export class AnswerLogItem extends LogItem {
    protected _type: XLogType = 'ANSWER'; // LogType.ANSWER;
    answer: string; // the user's response, serialized in a custom format
    correctAnswer: string; // TODO: only set (in MathProblem), never used
    correct = false;
    errorType: string; // custom error information, e.g. BACKWARDS for WM_numbers (user didn't reverse the sequence)
    tries = 0; // # of tries - redundant, each try should be registered as a separate AnswerLogItem?
    group: string; // TODO: only used by Questionnaires, should be modelled differently?
    response_time = 0; // Time from stimuli start to end of response
    timings: any = null;
    // TODO: add more time points, e.g. time when stimuli ended, time until response started
    static create(initObj: any): AnswerLogItem {
        const logItem = <AnswerLogItem>LogItem.createWithOverrides(new AnswerLogItem(), initObj);
        return logItem;
    }
    // TODO: replace create method with partial constructor below
    // public constructor(init?: Partial<AnswerLogItem>) {
    //    super();
    //    if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    // }

}

// When time is up for the session
export class EndOfDayLogItem extends LogItem {
    protected _type: XLogType = 'END_OF_DAY';
    training_day: number; // redundant, noted in each NewPhaseLogItem
    // static create(initObj: any): EndOfDayLogItem {
    //    return <EndOfDayLogItem>LogItem.createWithOverrides(new EndOfDayLogItem(), initObj);
    // }
    public constructor(init?: Partial<EndOfDayLogItem>) {
        super();
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    }

}

// export class TestEndLogItem extends PhaseEndLogItem { //Maybe as an optional prop in PhaseEnd instead
//    constructor(initObj: Object = null) { super(initObj); }
//    score: number;
//    target_score: number;
//    planet_target_score: number;
//    won_race: boolean;
//    completed_planet: boolean;
//    //? ended: boolean;
// }
export class NullLogItem extends LogItem {
    protected _type: XLogType = 'NULL';
    data: any;
    // static create(initObj: any): NullLogItem {
    //    return <NullLogItem>LogItem.createWithOverrides(new NullLogItem(), initObj);
    // }
    public constructor(init?: Partial<NullLogItem>) {
        super();
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
    }

}
export class SplitLogItem extends LogItem {
    protected _type: XLogType = 'SPLIT';
    static create(initObj: any): SplitLogItem {
        return <SplitLogItem>LogItem.createWithOverrides(new SplitLogItem(), initObj);
    }
}
export class AnswerQuestionnaireLogItem extends AnswerLogItem {
    score: number;
    // backwards: boolean;
    static create(initObj: any): AnswerQuestionnaireLogItem {
        return <AnswerQuestionnaireLogItem>LogItem.createWithOverrides(new AnswerQuestionnaireLogItem(), initObj);
    }
}
export class SyncInfoLogItem extends LogItem {
    // constructor(initObj: Object = null) { super(initObj); }
    protected _type: XLogType = XLogType.SYNC;
    get sync_type(): string { return this.isStartMarker ? 'START' : (this.success ? 'SUCCESS' : 'FAIL'); }

    isStartMarker = true;
    success = false;
    error: string = null;

    static create(initObj: any): SyncInfoLogItem {
        return <SyncInfoLogItem>LogItem.createWithOverrides(new SyncInfoLogItem(), initObj);
    }
}
export class SyncLogStateLogItem extends LogItem {
    get type(): string { return this.syncedUpToHere ? 'ALREADY_SYNCED' : 'NOT_SYNCED'; }
    syncedUpToHere = false;
    static create(initObj: any): SyncLogStateLogItem {
        return <SyncLogStateLogItem>LogItem.createWithOverrides(new SyncLogStateLogItem(), initObj);
    }
}
export class UserStatePushPlaceholderLogItem extends LogItem {
     // Because we don't want to store into regular log, too costly performance-wise
    protected _type: XLogType = 'USER_STATE_PUSH_PLACEHOLDER';
    static create(initObj: any): UserStatePushPlaceholderLogItem {
        return <UserStatePushPlaceholderLogItem>LogItem.createWithOverrides(new UserStatePushPlaceholderLogItem(), initObj);
    }
}
// For storing aggregated data on server
export class UserStatePushLogItem extends LogItem implements IUserGeneratedState {
    protected _type: XLogType = 'USER_STATE_PUSH';
    exercise_stats: ExerciseStats;
    user_data: any;
    static create(initObj: any): UserStatePushLogItem {
        return <UserStatePushLogItem>LogItem.createWithOverrides(new UserStatePushLogItem(), initObj);
    }
}



export class TrainingSyncSettings {
    constructor(initObj: Object = null) {
        if (initObj) { this.copyFrom(initObj); }
    }
    protected copyFrom(obj: Object) {
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) {
                const val = obj[k];
                (<any>this)[k] = val;
            }
        }
    }
    eraseLocalData = false; // remove all local data
    eraseLocalUserFullState = false; // remove server settings and user-generated state
    eraseLocalLog = false; // clear LogItems
    syncOnInit = true;
    defaultSyncUrl: string;
    routerUrl: string;
    syncTriggerCode: string;
     // TODO... Can't use runtime execution of string, will fail after minification...
     // "{ performSync: logItem.isOfType(LeaveTestLogItem), pushState: logItem.isOfType(LeaveTestLogItem) }"
}
export interface CustomData {
    menuButton?: boolean;
    canLogout?: boolean;
    unlockAllPlanets?: boolean;
    appVersion?: any;
    allowMultipleLogins?: boolean;
    canEnterCompleted?: boolean;
    nuArch?: any;
    medalMode?: any;
    clearClientUserData?: any;
    debugSync?: any;
    numberLine?: any;
    displayAppVersion?: boolean;
}
export class TrainingSettings {
    timeLimits: number[] = []; // time_limits
    uniqueGroupWeights: any;
    manuallyUnlockedExercises: string[] = [];
    idleTimeout = 10;
    cultureCode = 'sv-SE';
    customData: CustomData = {};
    // training_settings: any;
    triggers: TriggerData[] = [];
    pacifistRatio = 0.1; // TODO: add to a metaphorSettings structure instead

    trainingPlanOverrides: any = {};
    syncSettings: TrainingSyncSettings = new TrainingSyncSettings();
    // erase_local_data?: boolean;
}
export interface IUserGeneratedState {
    exercise_stats: ExerciseStats;
    user_data: any;
}
export class UserGeneratedState implements IUserGeneratedState {
    exercise_stats: ExerciseStats = new ExerciseStats();
    user_data: any = {}; // new AvatarData();
}
export interface IUserServerSettings {
    uuid: string;
    training_plan: ITrainingPlanData; // TrainingPlanData;
    training_settings: TrainingSettings; // any
}
export class UserServerSettings implements IUserServerSettings {
    uuid = '';
    training_plan: ITrainingPlanData = null; // TrainingPlanData = new TrainingPlanData();
    training_settings: TrainingSettings = new TrainingSettings();
}
export interface IUserFullState extends IUserGeneratedState, IUserServerSettings {
    uuid: string;
    // training_day:number=0;
    training_plan: ITrainingPlanData; // TrainingPlanData;
    // secondary_training_plan: TrainingPlanData;

    training_settings: TrainingSettings;

    exercise_stats: ExerciseStats;
    user_data: any;

    syncInfo: any;
}
// export class UserFullState implements IUserGeneratedState, IUserServerSettings {
//    uuid: string;
//    //training_day:number=0;
//    training_plan: TrainingPlanData = new TrainingPlanData();
//    secondary_training_plan: TrainingPlanData;

//    //training_settings: ITrainingSettings = { time_limits: [], manually_unlocked_exercises: [] };
//    training_settings: TrainingSettings; //any;

//    exercise_stats: ExerciseStats = new ExerciseStats();
//    user_data: AvatarData = new AvatarData();
// }

// export class LogVerificationResult {
//    errors: string[] = [];
//    warnings: string[] = []
//    structure: zNode[];
// }

// export class ZNode {
//     untypedLogItem: LogItem;

//     static toString(nodes: ZNode[]): string {
//         return nodes.map(n => {
//             if ((<any>n).logItem) {
//                 const ph = <ZPhase>n;
//                 return '\n' + JSON.stringify(ph.logItem)
//                     + ph.problems.map(pr => '\n  ' + JSON.stringify(pr.logItem)
//                         + pr.answers.map(a => '\n    ' + JSON.stringify(a.logItem)).join('')
//                     ).join('');
//             } else {
//                 return '\n' + JSON.stringify(n.untypedLogItem);
//             }
//         }).join(''); // "\n");
//     }
//     static constructFromLog(logItems: LogItem[], tryToFix: boolean): ZNode[] { // LogVerificationResult { //zNode[]
//         // var result = new LogVerificationResult(); //: zNode[] = [];
//         const result: ZNode[] = [];
//         const warnings: string[] = [];
//         let currPha: ZPhase = null;
//         let currProb: ZProblem = null;

//         const toInsert = new KeyValMap<number, LogItem>();
//         let toRemove: number[] = [];

//         let ignoreErrors = false;
//         // try {
//         logItems.forEach((_, i) => {
//             if (_.isOfType(SyncLogStateLogItem)) {
//                 ignoreErrors = (<SyncLogStateLogItem>_).syncedUpToHere;
//             }
//             if (ignoreErrors) {
//                 return;
//             }
//             if (_.isOfType(NewPhaseLogItem)) {
//                 if (currPha) {
//                     warnings.push('NewPhase w/o PhaseEnd');
//                     if (tryToFix) {
//                         toInsert.addPair(i, new PhaseEndLogItem({ phase: 'FAKE' }));
//                          // PhaseEndLogItem.create(<PhaseEndLogItem>{ phase: "FAKE" })
//                     }
//                 }
//                 currProb = null;
//                 currPha = new ZPhase();
//                 currPha.logItem = <NewPhaseLogItem>_;
//                 result.push(currPha); // structure

//             } else if (_.isOfType(NewProblemLogItem)) {
//                 if (currPha == null) {
//                     throw Error('No phase for ' + JSON.stringify(_));
//                 }
//                 currProb = new ZProblem();
//                 currProb.logItem = <NewProblemLogItem>_;
//                 currProb.phase = currPha;
//                 currPha.problems.push(currProb);

//             } else if (_.isOfType(AnswerLogItem)) {
//                 if (currProb == null) {
//                     throw Error('No problem for ' + JSON.stringify(_));
//                 }
//                 const answ = new ZAnswer();
//                 answ.logItem = <AnswerLogItem>_;
//                 answ.problem = currProb;
//                 currProb.answers.push(answ);

//             } else if (_.isOfType(PhaseEndLogItem)) {
//                 if (currPha == null) {
//                     let tmpWarning = 'N/A';
//                     for (let backCnt: number = i - 1; backCnt >= 0; backCnt--) {
//                         if (logItems[backCnt].isOfType(PhaseEndLogItem)) {
//                             const sliced = logItems.slice(backCnt, i + 1);
//                             const comp = ObjectUtils.merge({}, sliced[0]);
//                             const comp2 = ObjectUtils.merge({}, _);
//                             comp.time = comp2.time;
//                             if (ObjectUtils.equals(comp, comp2)) {
//                                 toRemove.push(i);
//                             } else {
//                                 toRemove.push(i);
//                             }
//                             tmpWarning = '\n\n' + LogItem.serializeList(sliced);
//                              // toInsert.addPair(i + 1, ErrorLogItem.create(<ErrorLogItem>{ level: "WARN",
//                              // messages: [LogItem.serializeList(sliced)] }));
//                             break;
//                         }
//                     }
//                     warnings.push('Duplicate PhaseEnd: ' + tmpWarning);
//                 }
//                 currPha = null;
//                 currProb = null;
//             } else if (_.isOfType(LeaveTestLogItem)) {
//                 if (currPha != null) {
//                     warnings.push('PhaseEnd not null at LeaveTest');
//                 }
//             } else {
//                 const other = new ZNode();
//                 other.untypedLogItem = _;
//                 result.push(other); // structure
//             }
//         });
//         // } catch (err) {
//         //    result.errors.push(err);
//         // }
//         // var tmp = zNode.toString(result.structure);
//         // result.warnings = warnings;
//         if (warnings.length) {
//             Logger.warn('Log verification: ' + warnings.join(', '));
//         }
//         for (let i: number = toInsert.keys.length - 1; i >= 0; i--) {
//             const index = toInsert.keys[i];
//             toRemove = toRemove.map(_ => _ >= index ? _ + 1 : _);
//             logItems.splice(index, 0, toInsert.values[i]);
//         }
//         if (toRemove.length > 0) {
//             toRemove.sort((a, b) => b - a).forEach(_ => logItems.splice(_, 1));
//         }
//         return result;
//     }

// }
// export class ZPhase extends ZNode {
//     problems: ZProblem[] = [];
//     logItem: NewPhaseLogItem;

// }
// export class ZProblem {
//     phase: ZPhase;
//     logItem: NewProblemLogItem;
//     answers: ZAnswer[] = [];
// }
// export class ZAnswer {
//     logItem: AnswerLogItem;
//     problem: ZProblem;
// }

