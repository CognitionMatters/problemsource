import { ProgVisualizerBase, ProgressIndicatorType } from '../../games/progVisualizerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { GameState } from '../../gameState';
import { TestStatistics } from '../../toRemove/testStatistics';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { CriteriaType } from '../../phasing/endCriteria';
import { UpdateManager } from '@jwmb/pixelmagic/lib/app/updateManager';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class ProgVisualizerMini extends ProgVisualizerBase {
    protected background: SimpleBitmap;
    protected successMeter: ProgVisualizerMiniProgressMeter;
    protected endMeter: ProgVisualizerMiniProgressMeter;

    constructor(testId: string) { // TODO: remove dependancy of test
        super(testId);
    }

    public getAssetToLoad(): Array<string> {
        return [
            // 'assets/clean/ui/clean_background01.png'
        ];
    }

    public overridePropertyValues(data: any) { // TODO: generalize this funcionality (mofified from problem)
        if (data == null) {
            return;
        }

        data.progressIndicatorType = ProgressIndicatorType.NONE;

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

    }

    private setupNewPhase() {
        if (this.successMeter) {
            this.successMeter.dispose();
        }
        this.successMeter = new ProgVisualizerMiniProgressMeter(true, this.endCriteriaManager.getTargetScore());
        this.successMeter.x = 10;
        this.successMeter.y = 10;
        this.addChild(this.successMeter);

        if (this.endMeter) {
            this.endMeter.dispose();
        }
        if (this.endCriteriaManager.getEndValue() > 0) {
            this.endMeter = new ProgVisualizerMiniProgressMeter(false, this.endCriteriaManager.getEndValue());
            this.endMeter.x = RendererManager.instance.renderSettings.width - 10 - this.endMeter.width;
            this.endMeter.y = 10;
            this.addChild(this.endMeter);
        }

        UpdateManager.instance.updated.remove(this.onUpdate, this);
        const isTimeBattle = this.endCriteriaManager.endCriteria
            && this.endCriteriaManager.endCriteria.type === CriteriaType.TIME;
        if (isTimeBattle) {
            UpdateManager.instance.updated.add(this.onUpdate, this);
        }
    }

    public onUpdate(deltaTime) {
        this.updateMeters();
    }

    private updateMeters() {
        this.successMeter.updatePercentage(this.endCriteriaManager.getTargetPercentage());

        if (this.endMeter) {
            this.endMeter.updatePercentage(this.endCriteriaManager.getEndPercentage());
        }
    }

    public onShowProblem(): Promise<any> {
        return new Promise<any>((res, rej) => res(null));
    }

    public onCorrectAnswer(): Promise<any> {
        this.updateMeters();
        this.onStarAnimation();
        return new Promise<any>((res, rej) => res(null));
    }
    public onWrongAnswer(): Promise<any> {
        this.updateMeters();
        return new Promise<any>((res, rej) => res(null));
    }
    public onShowProblemAgain(): Promise<any> {
        return new Promise<any>((res, rej) => res(null));
    }
    public onQuestionAnswer(): Promise<any> {
        this.updateMeters();
        return new Promise<any>((res, rej) => res(null));
    }
    public onPrepareGuide(): Promise<any> {
        this.setupNewPhase();
        return new Promise<any>((res, rej) => res(null));
    }
    public onPrepareModel(): Promise<any> {
        this.setupNewPhase();
        return new Promise<any>((res, rej) => res(null));
    }
    public onPrepareChallenge(targetScoreOverride: Number = 0): Promise<any> {
        this.setupNewPhase();
        return new Promise<any>((res, rej) => setTimeout(() => res(null), 0));
    }
    public onStartChallenge(): Promise<any> {
        return new Promise<any>((res, rej) => res(null));
    }

    public onStopChallenge(): Promise<any> {
        return new Promise<any>((res, rej) => {
            const gameRuns = GameState.exerciseStats.getGameRunsSharedId(TestStatistics.instance.currentGameId);
            const lastGameRun = gameRuns[gameRuns.length - 1];
            if (lastGameRun.won) {
                this.successMeter.hiliteResult();
            } else {
                this.endMeter.hiliteResult();
            }
            res(null);
        });
    }

    public onFailChallenge(): Promise<any> {
        return new Promise<any>((res, rej) => res(null));
    }

    public onStarAnimation() {
        if (this.successMeter) {
            let pos = this.successMeter.toGlobal(new PIXI.Point(0, 0));
            pos = this.toLocal(pos);
            // new StarAnimation(pos);
        }
        TestStatistics.instance.addStar();
    }

    public dispose() {
        UpdateManager.instance.updated.remove(this.onUpdate, this);
        super.dispose();
    }
}

export class ProgVisualizerMiniProgressMeter extends ContainerBase {
    private background: PIXI.Graphics;
    private foreground: PIXI.Graphics;
    private backgroundMask: PIXI.Graphics;
    private foregroundMask: PIXI.Graphics;
    private value = 0;

    constructor(private isSuccessMeter = true, private maxValue = 5,
        private startValue = 0, private itemSize = 30) { // TODO: remove dependency of test
        super();
        this.createBar();
    }

    private createBar() {
        const rounding = this.itemSize;
        const gap = 4;
        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        this.foreground = new PIXI.Graphics();
        this.addChild(this.foreground);

        this.background.beginFill(0x0000ff, 0.2);
        this.foreground.beginFill(this.isSuccessMeter ? 0xff0000 : 0x00ff00, 0.6);
        if (this.maxValue < 10) {
            for (let i = 0; i < this.maxValue; i++) {
                this.background.drawCircle(i * (this.itemSize + gap) + this.itemSize * 0.5, this.itemSize * 0.5, this.itemSize * 0.5);
                this.foreground.drawCircle(i * (this.itemSize + gap) + this.itemSize * 0.5, this.itemSize * 0.5, this.itemSize * 0.5);
            }
        } else {
            this.background.drawRoundedRect(0, 0, (this.itemSize + gap) * 10, this.itemSize, rounding);
            this.foreground.drawRoundedRect(0, 0, (this.itemSize + gap) * 10, this.itemSize, rounding);
        }

        this.updateValue(this.startValue);
    }

    updateValue(newValue: number) {
        this.value = newValue;
        let percentage = this.value / this.maxValue;
        if (this.maxValue === 0) {
            percentage = 1;
        }
        this.updatePercentage(percentage);
    }

    hiliteResult() {
        for (let i = 0; i < 3; i++) {
            DoLater.execute(this, () => {
                this.alpha = 0;
                Tweener.addTween(this, <TweenerOptions>{ delay: 0.2, time: 0.2, alpha: 1 });
            }, i * 0.5);
        }
        return new Promise<any>((res, rej) => res(null));
    }

    updatePercentage(percentage: number) {
        if (!this.foregroundMask) {
            this.foregroundMask = new PIXI.Graphics();
            this.addChild(this.foregroundMask);
            // this.foreground.mask = this.foregroundMask;

            this.backgroundMask = new PIXI.Graphics();
            this.addChild(this.backgroundMask);
            // this.background.mask = this.backgroundMask;
        }
        const remaining = this.width * percentage;
        this.foregroundMask.clear();
        this.foregroundMask.beginFill(0xff0000, 0.5);
        this.foregroundMask.drawRect(0, 0, remaining, this.height);
        this.foregroundMask.endFill();

        this.backgroundMask.clear();
        this.backgroundMask.beginFill(0x0000ff, 0.5);
        this.backgroundMask.drawRect(remaining, 0, this.width - remaining, this.height);
        // this.backgroundMask.drawRect(remaining, 0, this.width, this.height); // this.width, this.height);
        this.backgroundMask.endFill();
    }
}
