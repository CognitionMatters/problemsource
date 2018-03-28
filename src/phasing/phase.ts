import { NewProblemLogItem, AnswerLogItem } from '../toRemove/logItem';
import { TestStatistics } from '../toRemove/testStatistics';
import { Signal1, Signal0 } from '@jwmb/signal';
import { IResponseAnalysisResult, IResponseAnalyzer, IResponseAnalysisResultLogAnyway } from './responseAnalysis';
import { RNGManager } from './level';
import { CriteriaValues, EndCriteriaManager, CriteriaType, EndCriteriaData } from './endCriteria';
import { Overrider } from '@jwmb/pixelmagic/lib/utility/overrider';
import { PhaseType } from './phaseType';
import { PhaseReflection, Reflection } from './phaseReflection';
import { AssetLoader } from '@jwmb/pixelmagic/lib/app/AssetLoader';
import { CSVUtils } from '@jwmb/pixelmagic/lib/utility/csvUtils';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';

export type MedalModes = 'THREE_WINS' | 'ONE_WIN' | 'TARGET_SCORE' | 'ALWAYS';

export interface IStimuli {
    type: string;
    problemString: string;
}

export class StimuliBase implements IStimuli {
    type: string;
    problemString: string;
}
export interface ISolution {
    getProposedSolution(): any[];
}
export interface IStimuliAndSolution {
    stimuli: IStimuli;
    solution: ISolution;
}


// export interface IProblemFactory {
//    createProblem(): IStimuliAndSolution;
// }
export class ProblemFactoryBase {
    problems: any[] = []; // TODO: should be called predefinedProblems
    parsedProblems: IStimuliAndSolution[] = null;
    stopWhenNoMorePredefinedProblems = true;
    repeatPredefinedProblems = true;
    numProblemsCreated = 0;

    problemFile: { path: '' } = null;
    // TODO: create an overridable _preload in PhaseX
    public static preloadProblemFile(problemFilePath: string, csvHandler: (data: Object[]) => any[] = null): Promise<any[]> {
        return new Promise<any>((res, rej) => {
            if (!problemFilePath) {
                res(null);
            } else {
                AssetLoader.load([{ id: problemFilePath, type: 'data', path: 'assets/data/' + problemFilePath }], () => {
                    const loaded = AssetLoader.getAsset(problemFilePath);
                    if (loaded) {
                        if (loaded.isJson) {
                            // var tmp = JSON.parse(loaded);
                            // if (ObjectUtils.getType(tmp) === "array") {
                            res(loaded.data);
                        } else {
                            const parsed = CSVUtils.parse(loaded.data, '\t', true);
                            if (parsed.length) {
                                res(csvHandler ? csvHandler(parsed) : parsed);
                            } else {
                                res(null);
                            }
                        }
                    }
                });
            }
         });
    }
    preload(): Promise<void> {
        return new Promise<void>((res, rej) => res());
    }

    getProblem(): IStimuliAndSolution {
        let result: IStimuliAndSolution = null;
        if (this.problems && this.problems.length && (!this.parsedProblems || this.parsedProblems.length === 0)) {
            this.parsedProblems = this.problems.map(_ => this.parseProblem(_));
        }
        if (this.parsedProblems && this.parsedProblems.length) {
            result = this.selectPredefinedProblem();
            if (!result && this.stopWhenNoMorePredefinedProblems) {
                return null;
            }
        }
        if (!result) {
            result = this.createProblem();
        }
        this.numProblemsCreated++;
        return result;
    }
    parseProblem(problem: any): IStimuliAndSolution {
        // return <IStimuliAndSolution>{ stimuli: <IStimuli>problem, solution: null };
        throw Error('Not implemented');
    }
    selectPredefinedProblem(): IStimuliAndSolution {
        if (this.problems.length) {
            if (this.repeatPredefinedProblems) {
                return this.parsedProblems[this.numProblemsCreated % this.parsedProblems.length];
            }
            if (this.numProblemsCreated < this.problems.length) {
                return this.parsedProblems[this.numProblemsCreated];
            }
        }
        return null;
    }
    createProblem(): IStimuliAndSolution {
        return null;
    }
    dispose() {
    }
}

export class StimuliModifierManager {
    static run(modifiers: string, stimuli: any): any {
        modifiers.split(';').filter(_ => _.length > 0).forEach(_ => {
            const mod = <IStimuliModifier>Instantiator.i.instantiate('StimuliModifier' + _);
            stimuli = mod.modify(stimuli);
        });
        return stimuli;
    }
}
export interface IStimuliModifier {
    modify(stimuli: any): any;
}
export class StimuliModifierReverse {
    modify(stimuli: any): any {
        return ([].concat(<any[]>stimuli)).reverse();
    }
}
export class StimuliModifierAdd1 {
    modify(stimuli: any): any {
        return ([].concat(<any[]>stimuli)).map(_ => 1 + _);
    }
}

export class TimesRegisterStimuliResponse {
    stimuliStart: number;
    stimuliEnd: number;
    responseAllowedStart: number;
    responseTimes: number[] = [];
    feedbackStart: number;
    feedbackEnd: number;

    public getOffsetFrom(time: number) {
        const result = new TimesRegisterStimuliResponse();
        ObjectUtils.merge(result, this, true);
        Object.keys(result).forEach(k => {
            const t = ObjectUtils.getType(result[k]);
            if (t === 'number') {
                result[k] -= time;
            }
        });
        result.responseTimes = result.responseTimes.map(_ => _ - time); // - time - result.responseAllowedStart
        return result;
    }
}

export class PhaseXSignals {
    preInit = new Signal1<string>();
    prepareNextProblem = new Signal0();
    createProblemLogItem = new Signal1<NewProblemLogItem>();
    responseAnalysisFinished = new Signal1<IResponseAnalysisResult>();
    disposingPhase = new Signal0();

    bindSignals(rootObject: Object, usedPath: string[] = []) {
        if (rootObject.constructor === Array) {
            return;
        }
        Object.keys(rootObject).forEach(_ => {
            if (rootObject instanceof PIXI.ObservablePoint
                || (rootObject instanceof PIXI.DisplayObject && _ === 'parent')) {
                return;
            }
            const val = rootObject[_];
            if (val && typeof val === 'object' && _ !== '_events' && _ !== '__proto') {
                if (val['bindSignals']) {
                    val['bindSignals'](this);
                }
                if (usedPath.length > 20) {
                    console.log('ddeep man', usedPath);
                    return;
                }
                usedPath.push(_);
                this.bindSignals(val, usedPath);
                usedPath.splice(usedPath.length - 1, 1);
            }
        });
    }
    dispose() {
        Object.keys(this).forEach(_ => {
            if (this[_]['dispose']) {
                this[_]['dispose']();
            }
        });
    }
}

export class PhaseXBase {
    static createPhase(phaseData: any): Promise<PhaseXBase> {
        return new Promise<PhaseXBase>((res, rej) => {
            const phaseClassName = <string>phaseData.class;
            if (!phaseClassName) {
                throw Error('No class name provided to createPhase');
            }
            phaseData = ObjectUtils.merge({}, phaseData, true);
            // since we're deleting crucial info below (this data will be merged into class, undefined properties will throw error)
            delete phaseData.type;
            delete phaseData.class;
            const phase = <PhaseXBase>Instantiator.i.instantiate(phaseClassName);
            try {
                phase.preInit(phaseData);
            } catch (err) {
                rej(err);
                return;
            }
            phase.preload().then(() => {
                phase.init();
                res(phase);
            }, err => rej(err));
        });
    }
    static onInstantiatorScan(cls: Function) {
        Reflection.LookUp.registerPhase({ class_: cls }); // , view: ""
    }

    // static massagePhaseData(phaseData: any, probGenData: any, stimType: any) {
    //     if (!phaseData.problemFactory._class && !phaseData.views.problem) {
    //         // We can only use PhaseXBase when we have a valid problemFactory / problem
    //         return null;
    //     }
    //     return phaseData;
    // }

    protected settings: any = {};

    rngMgr: RNGManager = new RNGManager(); // All phases will probably use a RNG
    views: any = { problem: '', phase: '', problemProps: null };
    // just a store for presentation layer to access these settings (probably shouldn't be here at all)

    responseAnalyzer: IResponseAnalyzer = null;
    phaseType: PhaseType = '';

    endCriteriaManager: EndCriteriaManager;
    protected numProblemsGenerated = 0;
    protected stimuli: IStimuli;
    problemFactory: ProblemFactoryBase = null;

    times: TimesRegisterStimuliResponse;

    solution: ISolution;
    fullUserResponse: any[];
    testId = ''; // TODO: called test here, but planet in other places?

    endCriteriaData = new EndCriteriaData(); // TODO: should just be injected into endCriteriaManager
    // "fake" stuff for compability with GameState.logTestPhase()
    // fakePhase: TempPhaseBaseReplacement; // PhaseBase;
    // test: any = { id: "" };

    medalMode: MedalModes = 'THREE_WINS'; // TODO: medalMode is metaphor-related, shouldn't be a core property
    getPlayerScore(): number {
        return TestStatistics.instance.noOfCorrectTotal;
    }

    signals = new PhaseXSignals();

    constructor() {
    }
    dispose() {
        this.signals.disposingPhase.dispatch();
        this.signals.dispose();
        this.signals = null;
        this.problemFactory.dispose();
        this.problemFactory = null;
    }
    preInit(overrideSettings: any) {
        this.endCriteriaData.target = new CriteriaValues(CriteriaType.CORRECT_TOTAL, -1);
        this.endCriteriaData.end = new CriteriaValues('', -1);
        this.endCriteriaData.fail = new CriteriaValues('', -1);

        let defaults = this.getDefaults();
        if (defaults === undefined) {
            defaults = {};
        }
        PhaseReflection.recConstructorToClassName(defaults);
        ObjectUtils.merge(defaults, overrideSettings, true, true);
        Overrider.override(this, defaults);
        // this.phaseType = <PhaseType>this.settings.phase;
        this.testId = TestStatistics.instance.currentGameId; // TODO: ugly

        //// TODO: Fake stuff
        // this.fakePhase = <TempPhaseBaseReplacement>{}; // new PhaseBase(null);
        // this.fakePhase.isTestStarted = false;
        // this.fakePhase.problemGenerator = <ProblemGeneratorBase>{};
        const numPredefinedProblems = Math.max(this.problemFactory.problems.length,
            this.problemFactory.parsedProblems ? this.problemFactory.parsedProblems.length : 0);
        // this.fakePhase.problemGenerator.getNumberOfProblems = () => { return numPredefinedProblems; };
        // TODO: separate dosage handling! Or rather, endCriteria
        // this.fakePhase,
        this.endCriteriaManager = new EndCriteriaManager(this.endCriteriaData, numPredefinedProblems);

        this.signals.bindSignals(this);

        this.beforePreInitDispatch();

        this.signals.preInit.dispatch(this.testId);
    }
    protected getDefaults(): any {
        return {};
    }
    protected preload(): Promise<void> {
        return new Promise<void>((res, rej) => {
            const promises = [this.problemFactory.preload(), this._preload()];
            Promise.all(promises).then(val => res(), err => rej(err));
        });
    }
    protected _preload() { // deferred: P.Deferred<void>) {
        return new Promise<void>((res, rej) => res());
        // deferred.resolve(null);
    }

    protected beforePreInitDispatch() {
    }

    init() {
    }

    registerStartPhase() {
        // this.fakePhase.isTestStarted = true;
        TestStatistics.instance.resetPhaseStartTime();
        // TODO: log this?
    }

    getNextProblem(): IStimuli {
        if (this.endCriteriaManager.checkIfPhaseEnd()) {
            return null;
        }
        this.times = new TimesRegisterStimuliResponse();
        this.signals.prepareNextProblem.dispatch();
        this.prepareProblemFactoryForNextProblem();
        this.stimuli = this.subGetNextProblem();
        if (this.stimuli) {
            this.numProblemsGenerated++;
        }
        return this.stimuli;
    }
    protected prepareProblemFactoryForNextProblem() {
    }
    protected subGetNextProblem(): IStimuli {
        // TODO: set up factory etc here depending on problem definition? So we can switch problem types between items?
        const ss = this.problemFactory.getProblem();
        if (!ss) {
            return null;
        }
        this.fullUserResponse = [];
        this.solution = ss.solution;
        return ss.stimuli;
    }
    getProblemViewClass(problemType: string): string {
        // Normally, problem class is defined in Phase data:
        let problemClass: string = this.views.problem;
        if (!problemClass) {
            // but in e.g. GUIDE phases, there's no such info on the phase itself
            const pinfo = PhaseReflection.problemTypeToInfo(problemType);
            if (!pinfo) {
                throw new Error('No problem type info for ' + problemType);
            }
            problemClass = pinfo._class;
            if (!this.responseAnalyzer) {
                const tmp = { responseAnalyzer: null };
                Overrider.override(tmp, { responseAnalyzer: pinfo.responseAnalyzer });
                this.responseAnalyzer = <IResponseAnalyzer>tmp.responseAnalyzer;
            }
        }
        return problemClass;
    }

    registerShowProblem() {
        TestStatistics.instance.logEvent(this.createProblemLogItem());
    }
    protected createProblemLogItem(): NewProblemLogItem {
        // var result = NewProblemLogItem.create(<NewProblemLogItem>{
        // problem_type: this.stimuli.type, problem_string: this.stimuli.problemString });;
        const result = new NewProblemLogItem({ problem_type: this.stimuli.type, problem_string: this.stimuli.problemString });
        this.signals.createProblemLogItem.dispatch(result);
        return result;
    }
    // getIncorrectFullResponse(errorType?: string): any[] {
    //    throw Error("Not implemented");
    // }

    registerFullResponse(fullResponse: any): IResponseAnalysisResult {
        let result: IResponseAnalysisResult = null;
        for (let i = 0; i < fullResponse.length; i++) {
            result = this.registerResponse(fullResponse[i]);
        }
        return result;
    }
    registerResponse(partialResponse: any, dontLogResult: boolean = false): IResponseAnalysisResult {
        this.times.responseTimes.push(new Date().valueOf());
        this.fullUserResponse.push(partialResponse);

        const analysis = this.responseAnalyzer.analyze(this.fullUserResponse, this.solution);

        if (dontLogResult) {
            this.times.responseTimes.splice(this.times.responseTimes.length - 1, 1);
            this.fullUserResponse.splice(this.fullUserResponse.length - 1, 1);
        } else {
            if (analysis.isFinished || (<IResponseAnalysisResultLogAnyway><any>analysis).logResultAnyway) {
                this.signals.responseAnalysisFinished.dispatch(analysis);
                // this.responseAnalysisFinished(analysis);

                const logItem = this.responseAnalyzer.getAnswerLogItem(this.fullUserResponse, this.solution);
                if (this.times.stimuliStart === undefined) {
                    this.times.stimuliStart = this.times.responseAllowedStart;
                }
                logItem.timings = this.times.getOffsetFrom(this.times.stimuliStart); // ObjectUtils.merge({}, this.times);
                // TODO: should be done here, not in TestStatistics.instance.logEvent:
                // logItem.response_time = this.times.responseTimes[this.times.responseTimes.length - 1] - this.times.responseTimes[0];
                TestStatistics.instance.logEvent(logItem);
            }
        }
        return analysis;
    }
    // protected responseAnalysisFinished(analysis: IResponseAnalysisResult) {
    // }
    getAnswerLogItem(): AnswerLogItem {
        return this.responseAnalyzer.getAnswerLogItem(this.fullUserResponse, this.solution);
    }
    clearResponse() {
        this.fullUserResponse = [];
    }

    registerStimuliStarted() {
        this.times.stimuliStart = new Date().valueOf();
    }
    registerStimuliEnded() {
        this.times.stimuliEnd = new Date().valueOf();
    }
    registerUserInputAllowed() {
        this.times.responseAllowedStart = new Date().valueOf();
    }
}
