import { ExerciseScreen } from './exerciseScreen';
import { PhaseRunner } from '../phasing/phaseRunner';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { AssetLoader } from '@jwmb/pixelmagic/lib/app/AssetLoader';
import { ProgVisualizerBase } from './progVisualizerBase';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { EndType } from '../phasing/endCriteriaEndType';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { PhaseType } from '../phasing/phaseType';
import { Signal1 } from '@jwmb/signal';
import { IStimuli } from '../phasing/phase';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';

export interface IProblem {
    answeredWrong: Signal1<IProblem>;
    completedProblem: Signal1<IProblem>;
    overridePropertyValues(values: any);
    onInit();
    hide();
    dispose();
}
// export interface IStimuli {
//     type: string;
//     problemString: string;
// }
// export class StimuliBase implements IStimuli {
//     type: string;
//     problemString: string;
// }
// export interface ISolution {
//     getProposedSolution(): any[];
// }
// export interface IStimuliAndSolution {
//     stimuli: IStimuli;
//     solution: ISolution;
// }


export class ExViewBase extends ContainerBase {
    protected test: ExerciseScreen;
    protected pr: PhaseRunner;
    protected currentProblem: IProblem; // ProblemBase;
    protected assetsToLoad: any[] = [];

    init(test: ExerciseScreen, pr: PhaseRunner) {
        this.pr = pr;
        this.test = test;

        this.visible = false;
        this.subInit();
        this.preLoad();
    }
    protected subInit() {
    }

    private preLoad() {
        AssetLoader.load(this.assetsToLoad, () => {
            if (this.pr && this.pr.currentPhase) { // Verify user didn't leave test before load was complete
                this.loadComplete();
            }
        });
    }
    protected loadComplete() {
        // TODO: avoid singletons, we might want multiple visualizers, maybe multiple players on split screen
        if (this.pr.currentPhase.phaseType === PhaseType.TEST) {
            ProgVisualizerBase.instance.onPrepareChallenge().then(() => this.startTest());
        } else if (this.pr.currentPhase.phaseType === PhaseType.GUIDE
            || this.pr.currentPhase.phaseType === PhaseType.MODEL) {
            ProgVisualizerBase.instance.onPrepareGuide().then(() => this.onNextProblem());
        }
        this.show();
    }
    protected startTest() {
        if (!this.pr || !this.pr.currentPhase) {
            return; // TODO: endPhase()?
        }
        const progVisPromise = ProgVisualizerBase.instance.onStartChallenge();

        this.pr.currentPhase.registerStartPhase();

        // if there is an end time criteria setup this here
        const endTime: number = this.pr.currentPhase.endCriteriaManager.getEndTime();
        if (endTime > 0) {
            DoLater.execute(this, this.endPhase, endTime);
        }

        progVisPromise.then(() => this.onNextProblem());
    }

    protected onNextProblem(t: Object = null) {
        const iprob = this.initNextProblem();
        if (iprob) {
            this.prepareShowProblem(iprob);
        } else {
            // TODO: end phase
            this.endPhase();
        }
    }
    protected prepareShowProblem(iprob: IProblem) {
        iprob.onInit();
        iprob.answeredWrong.add(this.checkIfPhaseEnd, this); // TODO: always make phase end check here (and rename to answered())?
        iprob.completedProblem.add(this.onNextProblem, this);
        this.showProblem(iprob);
    }
    protected initNextProblem(): IProblem {
        if (this.isDisposed || this.checkIfPhaseEnd()) {
            return null;
        }
        if (!this.pr || !this.pr.currentPhase) { // TODO: shouldn't happen - should already be disposed or phase should have ended
            return null;
        }
        const prob = this.pr.currentPhase.getNextProblem();
        if (!prob) {
            return null;
        }
        const problemClass: string = this.pr.currentPhase.getProblemViewClass(prob.type);
        const obj = Instantiator.i.instantiate(problemClass);

        const iprob = <IProblem>obj;
        const def = ObjectUtils.merge({}, prob);
        ObjectUtils.merge(def, this.pr.currentPhase.views.problemProps);
        ObjectUtils.merge(def, this.getModifyProblemProperties(prob));
        // Note: these modifications should be either only visual, or a propagation of the problemFactory-generated stuff
        iprob.overridePropertyValues(def);
        return iprob;
    }
    protected getModifyProblemProperties(prob: IStimuli): any {
        return {};
    }
    protected checkIfPhaseEnd(t: any = null) {
        if (this.pr && this.pr.currentPhase && this.pr.currentPhase.endCriteriaManager
            && this.pr.currentPhase.endCriteriaManager.checkIfPhaseEnd()) {
            this.endPhase();
            return true;
        }
        return false;
    }

    protected showProblem(problem: IProblem) {
        if (this.currentProblem) {
            this.currentProblem.hide(); // TODO: should this be called beginDispose?
            this.currentProblem = null;
        }

        this.currentProblem = problem;

        this.pr.currentPhase.registerShowProblem();

        // add problem
        this.addChild(<PIXI.DisplayObject><any>this.currentProblem);

        ProgVisualizerBase.instance.onShowProblem();
    }

    // private onSkip(t: Object = null) {
    //    if (this.pr.currentPhase.phaseType == "TEST" && !this.pr.currentPhase.fakePhase.isTestStarted) { // this.isTestStarted == false) {
    //        return;
    //    }
    //    this.pr.currentPhase.endCriteriaManager.endType = EndType.TARGET;
    //    this.endPhase(t);
    // }

    private isPhaseEnded = false;
    protected endPhase(t: Object = null) {
        if (this.isPhaseEnded) { // double check that this isn't called twice
            return;
        }
        if (!this.pr || !this.pr.currentPhase) {
            Logger.warn('currentPhase null:ed before view::endPhase');
             // Can happen if we forcefully exit phase while a DoLater is still running
            return;
        }
        const wasTest = this.pr.currentPhase.phaseType === PhaseType.TEST;
        const wasFailed = this.pr.currentPhase.endCriteriaManager.endType === EndType.FAILED;
        this.pr.exitPhase(false);

        this.isPhaseEnded = true;
        DoLater.clearCallsToFunction(this, this.endPhase);
        DoLater.clearCallsToFunction(this, this.onNextProblem);

        if (wasTest) {
            if (wasFailed) { // a phase can only fail if there is a fail criteria set
                this.visible = false;
                this.onTestFailed();
                return;
            } else {
                this.visible = false;
                this.onTestComplete();
            }
        } else {
            // TestStatistics.instance.logEvent(PhaseEndLogItem.create(<PhaseEndLogItem>{ phase: this.pr.currentPhase.phaseType }));
            this.test.getNextPhase();
        }
    }

    private onTestComplete() {
        ProgVisualizerBase.instance.onStopChallenge().then(() => this.test.getNextPhase()); // this.test.leaveTest()
    }

    private onTestFailed() {
        ProgVisualizerBase.instance.onFailChallenge().then(() => this.test.getNextPhase()); // this.test.leaveTest()
    }
    protected show() {
        this.visible = true;
    }
    private hide() {
        DoLater.execute(this, this.dispose, 0.001);
    }
    public dispose() {
        this.pr = null;

        this.isPhaseEnded = true;
        DoLater.removeAllObjectFunctions(this);
        if (this.currentProblem) {
            // this.currentProblem.hide();
            this.currentProblem.dispose();
            this.currentProblem = null;
        }
        this.test = null;
        this.isDisposed = true;
        super.dispose();
    }
}
