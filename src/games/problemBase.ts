import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { AnswerLogItem } from '../toRemove/logItem';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { AssetLoader } from '@jwmb/pixelmagic/lib/app/AssetLoader';
import { ProgVisualizerBase } from './progVisualizerBase';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { Signal1 } from '@jwmb/signal';
import { RevealEffect } from '../ui/effects/RevealEffect';

export class ProblemState {
    public static NONE = <ProblemState>(<any>'NONE');
    public static PRELOAD = <ProblemState>(<any>'PRELOAD');
    public static INITIALIZE = <ProblemState>(<any>'INITIALIZE');
    public static ACTIVATE = <ProblemState>(<any>'ACTIVATE');
    public static PRE_STIMULI = <ProblemState>(<any>'PRE_STIMULI');
    public static STIMULI = <ProblemState>(<any>'STIMULI');
    public static POST_STIMULI = <ProblemState>(<any>'POST_STIMULI');
    public static PRE_RESPONSE = <ProblemState>(<any>'PRE_RESPONSE');
    public static RESPONSE = <ProblemState>(<any>'RESPONSE');
    public static POST_RESPONSE = <ProblemState>(<any>'POST_RESPONSE');
    public static POST_RESPONSE_CORRECT = <ProblemState>(<any>'POST_RESPONSE_CORRECT');
    public static POST_RESPONSE_WRONG = <ProblemState>(<any>'POST_RESPONSE_WRONG');
    public static INACTIVATE = <ProblemState>(<any>'INACTIVATE');
    public static HIDING = <ProblemState>(<any>'HIDING');
    public static DISPOSE = <ProblemState>(<any>'DISPOSE');
}

export class ProblemBase extends ContainerBase {
    public assetsToLoad: Array<string> = [];

    //        public data:any={};
    public status: ProblemState = ProblemState.NONE;
    public autoActivate = true;

    public idleDelay = 5;
    public level = 0;
    public type = 'PROBLEM_BASE';
    public problemString = '';
    public playCorrectSound = true;

    public revealType = 'MOVE_UP';
    public delayBeforeNext = 0.1;

    protected result: AnswerLogItem; // any;

    public answeredWrong = new Signal1<ProblemBase>();
    public completedProblem = new Signal1<ProblemBase>();

    public isDisposed = false;

    protected _inputEnabled = true;
    public set inputEnabled(value: boolean) {
        // this.alpha = value ? 1 : 0.5;
        this._inputEnabled = value;
    }
    public get inputEnabled(): boolean {
        return this._inputEnabled;
    }

    constructor() {
        super();

        this.setDefaultPropertyValues();
    }

    public setDefaultPropertyValues() {

    }

    public overridePropertyValues(data: any) {
        // console.log('problem data:');
        // console.log(data);
        Object.assign(this, data);
        // for (var iPropName in data) {
        //     if (this.hasOwnProperty(iPropName)) {
        //         if (typeof (this[iPropName]) === 'object') {
        //             Misc.mergeData(this[iPropName], data[iPropName]);
        //         } else {
        //             this[iPropName] = data[iPropName];
        //         }
        //     } else {
        //         console.log('No prop:' + iPropName + ' in problem type:' + (<any>this.constructor).name);
        //     }
        // }

        // override problem string with url-parameter
        if (App.instance.urlParameters.problemstring) {
            this.problemString = App.instance.urlParameters.problemstring;
        }
    }

    public setStatus(newStatus: ProblemState) {
        this.status = newStatus;

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
            default:
                break;
        }
    }

    public onInit() { // this is called from phase after properties have been propagated
        this.extractProblemString();
        this.setStatus(ProblemState.PRELOAD);
    }

    public extractProblemString() {

    }

    public onPreLoad() {
        AssetLoader.load(this.assetsToLoad, () => {
            if (this.isDisposed) {
                return;
            }
            this.addContent();
            this.show();
            if (this.autoActivate) {
                this.setStatus(ProblemState.ACTIVATE);
            }
        });
    }

    public addContent() {

    }

    public show() {
        if (this.revealType !== 'NONE') {
            this.visible = false;
            const tmpFx = new RevealEffect(this, 0, this.revealType);
        }
    }

    public onActivate() { // this is called from phase after properties have been propagated

    }

    public centerItem(item: PIXI.DisplayObject) {
        if (!item || !item.parent) {
            return;
        }
        if ((<any>item).updateTransform) { // TODO: text measurement check if this can be removed in later versions of pixi (1.6)
            (<any>item).updateTransform();
        }
        const problemRect = ProgVisualizerBase.instance.problemRect;
        const contentBounds = item.getLocalBounds();
        contentBounds.x *= item.scale.x;
        contentBounds.width *= item.scale.x;
        contentBounds.y *= item.scale.y;
        contentBounds.height *= item.scale.y;
        item.position.x = problemRect.x + problemRect.width * 0.5 - contentBounds.width * 0.5 - contentBounds.x;
        item.position.y = problemRect.y + problemRect.height * 0.5 - contentBounds.height * 0.5 - contentBounds.y;
    }

    public clearAllDelayedActions() {
        DoLater.removeAllObjectFunctions(this);
    }

    public hide() {
        DoLater.removeAllObjectFunctions(this);
        this.hideComplete();
    }

    public hideComplete() {
        this.dispose();
    }

    public dispose() {
        this.answeredWrong.removeAll();
        this.answeredWrong = null;
        this.completedProblem.removeAll();
        this.completedProblem = null;

        DoLater.removeAllObjectFunctions(this);

        this.isDisposed = true;

        super.dispose();
    }
}
