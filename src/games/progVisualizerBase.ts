import { EndCriteriaManager } from '../phasing/endCriteria';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { ProgressBar } from '@jwmb/pixelmagic/lib/ui/ProgressBar';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { UpdateManager } from '@jwmb/pixelmagic/lib/app/updateManager';
import { Styles } from '../ui/styles';

export class ProgressIndicatorType {
    public static END = <ProgressIndicatorType>(<any>'END');
    public static TARGET = <ProgressIndicatorType>(<any>'TARGET');
    public static FAIL = <ProgressIndicatorType>(<any>'FAIL');
    public static NONE = <ProgressIndicatorType>(<any>'NONE');
}

export class ProgVisualizerBase extends ContainerBase {
    public static instance: ProgVisualizerBase;
    // public static starSpawnPosition
    public problemRect: PIXI.Rectangle;

    public progressIndicatorType = ProgressIndicatorType.NONE;
    public progressIndicator: ProgressBar;
    public testId: string;
    public endCriteriaManager: EndCriteriaManager;
    public isChallenge: Boolean = false;
    public problemBgColor: number;
    private backgroundColorArea: PIXI.Graphics;

    constructor(testId: string) { // TODO: remove dependency of test
        super();
        ProgVisualizerBase.instance = this;
        this.testId = testId;
    }

    public getAssetToLoad(): Array<string> {
        return [];
    }

    public overridePropertyValues(data: any) { // TODO: generalize this funcionality (mofified from problem)
        if (data == null) {
            return;
        }
        Object.assign(this, data);
        // for (let iPropName in data) {
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
    }

    public init() {
        this.addContent();
        this.setupProblemRect();
        this.setupProgressIndicator();
    }

    public addContent() {
        this.backgroundColorArea = new PIXI.Graphics();
        this.addChild(this.backgroundColorArea);
        this.bgColor = 0x006a93;
    }

    public setupProgressIndicator() {
        if (this.progressIndicatorType !== ProgressIndicatorType.NONE) {
            this.progressIndicator = new ProgressBar(200, 20, 0, 1, 0);
            this.progressIndicator.y = 10;
            this.progressIndicator.x = RendererManager.instance.stageWidth * 0.5 - this.progressIndicator.width * 0.5;
            this.addChild(this.progressIndicator);
            UpdateManager.instance.updated.add(this.updateProgressIndicator, this);
        }
    }

    public updateProgressIndicator() {
        if (this.endCriteriaManager == null) {
            return;
        }
        if (this.progressIndicatorType === ProgressIndicatorType.END) {
            // if (this.endCriteriaManager.endType==CriteriaType.TIME)
            this.progressIndicator.value = 1 - this.endCriteriaManager.getEndPercentage();
        }
        if (this.progressIndicatorType === ProgressIndicatorType.FAIL) {
            // if (this.endCriteriaManager.endType==CriteriaType.TIME)
            this.progressIndicator.value = 1 - this.endCriteriaManager.getFailPercentage();
        } else if (this.progressIndicatorType === ProgressIndicatorType.TARGET) {
            this.progressIndicator.value = this.endCriteriaManager.getTargetPercentage();
        }
    }

    private _bgColor = -1;
    private get bgColor(): number {
        return this._bgColor;
    }

    private set bgColor(value: number) { // TODO: refactor move these to separate progressVizualisor
        if (value !== this._bgColor) {
            this._bgColor = value;
            if (this.backgroundColorArea) {
                this.backgroundColorArea.clear();
                this.backgroundColorArea.beginFill(this._bgColor);
                this.backgroundColorArea.drawRect(0, 0, RendererManager.instance.stageWidth, RendererManager.instance.stageHeight);
            }
        }
    }

    public setupProblemRect() {
        // measurements // TODO: move this to metafor?
        const problemAreaWidth: number = RendererManager.instance.renderSettings.width - Styles.defaultBuffer * 2;
        let problemAreaHeight: number = RendererManager.instance.renderSettings.height - Styles.defaultBuffer * 2;

        if (this.progressIndicatorType !== ProgressIndicatorType.NONE) {
            problemAreaHeight -= 40;
        }

        this.problemRect = new PIXI.Rectangle(
            RendererManager.instance.renderSettings.width * 0.5 - problemAreaWidth * 0.5,
            RendererManager.instance.renderSettings.height * 0.5 - problemAreaHeight * 0.5,
            problemAreaWidth,
            problemAreaHeight);
    }

    public onShowProblem(): Promise<any> {
        return new Promise<any>(res => res());
    }
    public onCorrectAnswer(): Promise<any> {
        return new Promise<any>(res => res());
    }
    public onWrongAnswer(): Promise<any> {
        return new Promise<any>(res => res());
    }
    public onShowProblemAgain(): Promise<any> {
        return new Promise<any>(res => res());
    }
    public onQuestionAnswer(): Promise<any> {
        return new Promise<any>(res => res());
    }
    public onPrepareGuide(): Promise<any> {
        this.bgColor = 0x777777;
        return new Promise<any>(res => res());
    }
    public onPrepareModel(): Promise<any> {
        this.bgColor = 0x006a93;
        return new Promise<any>(res => res());
    }
    public onPrepareChallenge(targetScoreOverride: Number = 0): Promise<any> {
        this.bgColor = 0xc96435;
        return new Promise<any>(res => {
            setTimeout(() => {
                res();
            }, 0);
        });
    }
    public onStartChallenge(): Promise<any> {
        return new Promise<any>(res => {
            res();
        });
    }
    public onStopChallenge(): Promise<any> {
        return new Promise<any>(res => res());
    }
    public onFailChallenge(): Promise<any> {
        return new Promise<any>(res => res());
    }
    public onStarAnimation() {

    }

    public dispose() {
        UpdateManager.instance.updated.remove(this.updateProgressIndicator, this);
        this.backgroundColorArea = null;
        super.dispose();
    }
}
