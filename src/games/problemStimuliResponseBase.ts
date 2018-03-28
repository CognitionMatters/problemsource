import { ProblemBase, ProblemState } from './problemBase';
import { TestStatistics } from '../toRemove/testStatistics';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { ProblemResult, AnswerLogItem } from '../toRemove/logItem';
import { ProgVisualizerBase } from './progVisualizerBase';
import { ButtonStyled } from '../ui/buttonStyled';
import { IDialogGenericData, DialogGeneric } from '../ui/dialogGeneric';
import { StarAnimation } from '../ui/starAnimation';

export class ProblemStimuliResponseBase extends ProblemBase {
    public maxTime: number;
    public useDoneButton: boolean;
    public correctBeforeNext: boolean;
    public errorCountBeforeContinue: number;
    public showStimuliOnRetry: boolean;

    public doneButton: ButtonStyled;

    constructor() {
        super();
    }

    public onPreLoad() {
        if (this.maxTime) {
            this.assetsToLoad.push('assets/ui/clock01.png');
        }
        super.onPreLoad();
    }

    public setDefaultPropertyValues() {
        super.setDefaultPropertyValues();
        this.maxTime = 0;
        this.useDoneButton = false;
        this.correctBeforeNext = false;
        this.errorCountBeforeContinue = -1;
        this.showStimuliOnRetry = false;
    }

    public setStatus(newStatus: ProblemState) {
        this.status = newStatus;

        // TODO: instructionManager check if instruction or animation should be played
        // console.log("newStatus:"+newStatus);

        switch (newStatus) {
            case ProblemState.INITIALIZE:
                this.onInit();
                break;
            case ProblemState.PRELOAD:
                this.onPreLoad();
                break;
            case ProblemState.ACTIVATE:
                this.onActivate();
                break;
            case ProblemState.PRE_STIMULI:
                this.onPreStimuli();
                break;
            case ProblemState.STIMULI:
                this.onStimuli();
                break;
            case ProblemState.POST_STIMULI:
                this.onPostStimuli();
                break;
            case ProblemState.PRE_RESPONSE:
                this.onPreResponse();
                break;
            case ProblemState.RESPONSE:
                this.onResponse();
                break;
            case ProblemState.POST_RESPONSE:
                this.onPostResponse();
                break;
            case ProblemState.INACTIVATE:
                this.onInactivate();
                break;
            default:
                break;
        }
    }

    public onInit() {
        super.onInit();
    }

    public onActivate(t: any = null) { // TODO: make these function protected when typescript supports it
        this.setStatus(ProblemState.PRE_STIMULI); // TODO: add automatic instruction per state? delay next state until done
    }

    public onPreStimuli(t: any = null) {
        this.setStatus(ProblemState.STIMULI);
    }

    public onStimuli(t: any = null) {
        if (TestStatistics.instance.currentPhase) {
            TestStatistics.instance.currentPhase.registerStimuliStarted();
        }
        // if (ExerciseScreen.currentPhase) {
        //    ExerciseScreen.currentPhase.registerStimuliStarted();
        // }
        this.setStatus(ProblemState.POST_STIMULI);
    }

    public onPostStimuli(t: any = null) {
        if (TestStatistics.instance.currentPhase) {
            TestStatistics.instance.currentPhase.registerStimuliEnded();
        }
        // if (ExerciseScreen.currentPhase) {
        //    ExerciseScreen.currentPhase.registerStimuliEnded();
        // }
        this.setStatus(ProblemState.PRE_RESPONSE);
    }

    public onPreResponse(t: any = null) {
        this.setStatus(ProblemState.RESPONSE);
    }

    public onResponse(t: any = null) {
        if (TestStatistics.instance.currentPhase) {
            TestStatistics.instance.currentPhase.registerUserInputAllowed();
        }
        // if (ExerciseScreen.currentPhase) {
        //    ExerciseScreen.currentPhase.registerUserInputAllowed();
        // }
        this.inputEnabled = true;
        this.delayIdle();
        if (this.doneButton) {
            this.doneButton.enabled = true;
        }
        if (this.maxTime > 0) {
            DoLater.execute(this, this.onTimeOut, this.maxTime);
        }
    }

    public onInput() {
        //            if (this.status==ProblemState.RESPONSE){
        //                if(this.useDoneButton==false){
        //                    this.result=this.getResult();
        //                    if (this.result.type!=ProblemResult.INCOMPLETE){
        //                        TestStatistics.instance.logEvent(this.result);
        //                        this.setStatus(ProblemState.POST_RESPONSE);
        //                    }
        //                }
        //            }
        if (this.status === ProblemState.RESPONSE) {
            if (this.useDoneButton === false) {
                this.result = this.getResult();
                if (this.result.errorType !== ProblemResult.INCOMPLETE) {
                    // if (!ExerciseScreen.isRunning) {
                    //    TestStatistics.instance.logEvent(this.result);
                    // }
                    this.setStatus(ProblemState.POST_RESPONSE);
                }
            } else {
                if (this.getResult().errorType === ProblemResult.INCOMPLETE) {
                    this.hideDoneButton();
                } else {
                    this.showDoneButton();
                }
            }
        }
    }

    public getResult(): AnswerLogItem {
        return AnswerLogItem.create(<AnswerLogItem>{ correct: true }); // {type: ProblemResult.CORRECT}
    }

    protected onPostResponse(t: Object = null) {
        const resultPromise = this.result.correct ? this.onCorrect() : this.onError();
        resultPromise.then(() => {
            if (!TestStatistics.instance.currentPhase) {
                 // ExerciseScreen.isRunning && !(<ExerciseScreen>App.instance.currentPage).pr.currentPhase) {
                // Phase is over
                return;
            }
            if (this.isDisposed === false) {
                if (!this.result.correct) {
                    let continueToNext = !this.correctBeforeNext; // check if ok to continue with wrong answer / no of tries
                    if (this.errorCountBeforeContinue > -1
                        && this.errorCountBeforeContinue <= TestStatistics.instance.noOfIncorrectOnCurrent) {
                        continueToNext = true;
                    }
                    if (continueToNext === false) {
                        ProgVisualizerBase.instance.onShowProblemAgain().then(() => {
                            // if (ExerciseScreen.isRunning) {
                            if (!TestStatistics.instance.currentPhase) {
                                // Phase is over
                                return;
                            }
                            TestStatistics.instance.currentPhase.clearResponse();
                            // }
                            this.visible = true;
                            if (this.showStimuliOnRetry) {
                                this.setStatus(ProblemState.STIMULI);
                            } else {
                                // TODO: should this not go to ProblemState.PRERESPONSE?
                                this.setStatus(ProblemState.RESPONSE);
                            }
                            this.answeredWrong.dispatch(this);
                        });
                        return;
                    }
                }
                this.onInactivate();
            }
        });

        return;
    }

    public onCorrect(): Promise<any> {
        this.stopIdle();
        const problemResponsePromise = DoLater.delayedPromise(this, this.onCorrectResponse());
        const progVisualiserPromise = ProgVisualizerBase.instance.onCorrectAnswer();
        return Promise.all([progVisualiserPromise, problemResponsePromise]);
        // P.when(progVisualiserPromise, problemResponsePromise).then(function () { d.resolve(null) });
    }

    public onCorrectResponse(): number {
        this.updateStarOrigin();
        this.visible = false;
        return 0.1;
    }

    public onError(): Promise<any> {
        this.stopIdle();
        return new Promise<any>((res, rej) => {
            const problemResponsePromise = DoLater.delayedPromise(this, this.onErrorResponse());
            problemResponsePromise.then(() => {
                const showAgain = this.correctBeforeNext
                    || (this.errorCountBeforeContinue > 0
                        && TestStatistics.instance.noOfIncorrectOnCurrent < this.errorCountBeforeContinue);
                if (!showAgain) {
                    this.visible = false;
                } else {
                    this.inputEnabled = false;
                }
                ProgVisualizerBase.instance.onWrongAnswer().then(() => {
                    res(null); // d.resolve(null);
                });
            });
        });
    }

    public onErrorResponse(): number {
        return 0.1;
    }

    public onInactivate(t: Object = null) {
        this.completedProblem.dispatch(this);
    }

    public delayIdle(delayTime: number = 0, fixedTime: boolean = false) {
        this.stopIdle();

        if (delayTime === 0) {
            if (this.idleDelay > 0) {
                delayTime = this.idleDelay;
            }
        }

        const delay: number = Math.max(delayTime, this.idleDelay);
        //            if (fixedTime==false && InstructionLayer.instance) { // TODO: refactor add instuction
        //                delay+=InstructionLayer.getCurrentDurationLeft();
        //            }

        if (this.parent) { // TODO: better way to see if object is disposed
            DoLater.execute(this, this.onIdle, delay);
        }
    }

    public onIdle() {

    }

    public stopIdle() {
        DoLater.clearCallsToFunction(this, this.onIdle);
        DoLater.clearCallsToFunction(this, this.delayIdle);
    }

    public onTimeOut() {
        if (this.isDisposed) {
            return;
        }
        // if (ExerciseScreen.isRunning) {
        // TODO: is "-1" always a good value? Some string instead? (But sad to have to go from "number" to "any"...)
        // Maybe add special registerFinalRespone() method instead?
        if (!TestStatistics.instance.currentPhase) {
            return;
        }
        TestStatistics.instance.currentPhase.registerResponse(-1);
        this.result = TestStatistics.instance.currentPhase.getAnswerLogItem();
        // } else {
        //    this.result = new AnswerLogItem();
        //    this.result.correct = false;
        // }
        const inData: IDialogGenericData = {
            onClose: 'NOTHING', closeButtonText: 'next', image: 'assets/ui/clock01.png', imageScale: 0.7
        };
        DialogGeneric.create(inData, () => this.onPostResponse());
    }

    public updateStarOrigin() {
        const problemRect = ProgVisualizerBase.instance.problemRect;
        StarAnimation.origin.x = problemRect.x + problemRect.width * 0.5;
        StarAnimation.origin.y = problemRect.y + problemRect.height * 0.5;
    }

    public addContent() {
        super.addContent();

        if (this.useDoneButton) {
            this.addDoneButton();
            this.hideDoneButton();
        }
    }

    // Done button
    private addDoneButton() {
        this.doneButton = ButtonStyled.create('next', true);
        this.doneButton.clicked.add(() => {
            // if (ExerciseScreen.isRunning) {
            // TODO: is "-1" always a good value? Some string instead? (But sad to have to go from "number" to "any"...)
            // Maybe add special registerFinalRespone() method instead?
            TestStatistics.instance.currentPhase.registerResponse(-1);
            // }
            this.result = this.getResult();
            if (this.result.errorType !== ProblemResult.INCOMPLETE) {
                // Todo: Disable problem alternatives during validation
                // this.disableAlternatives();
                // if (!ExerciseScreen.isRunning) {
                //    TestStatistics.instance.logEvent(this.result);
                // }
                this.setStatus(ProblemState.POST_RESPONSE);
            }
        });

        this.addChild(this.doneButton);
        // Place the done button in the lower right corner of the problem rect
        const targetRect = ProgVisualizerBase.instance.problemRect;
        this.doneButton.position.x = targetRect.x + targetRect.width - this.doneButton.width - 10;
        this.doneButton.position.y = targetRect.y + targetRect.height - this.doneButton.height - 10;
    }

    public showDoneButton() {
        if (this.doneButton) {
            this.doneButton.visible = true;
        }
    }

    public hideDoneButton() {
        if (this.doneButton) {
            this.doneButton.visible = false;
        }
    }


    public dispose() {
        this.status = ProblemState.DISPOSE;
        this.result = null;

        super.dispose();
    }
}
