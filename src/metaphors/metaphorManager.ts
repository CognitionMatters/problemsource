import { ExerciseStats } from '../dataStructs';
import { TriggerManager } from '../triggerManager';
import { TimeIsUpDialog } from '../ui/timeIsUpDialog';
import { TestStatistics } from '../toRemove/testStatistics';
import { PhaseEndLogItem, EndOfDayLogItem } from '../toRemove/logItem';
import { EndCriteriaManager } from '../phasing/endCriteria';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { Styles } from '../ui/styles';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { PlanetBundler } from '../trainingPlan/PlanetBundler';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';
import { ViewResolverBase } from '../phasing/viewResolverBase';

export abstract class MetaphorManager {
    // TODO: these shouldn't be set here but be required overrides by metaphor
    public static defaultProgressBackground = 'magic_inset_progress_background.psd';
    public static defaultProgressBackgroundRect = new PIXI.Rectangle(9, 10, 13, 7);
    public static defaultProgressBar = 'magic_progressbar.psd';
    public static defaultProgressBarRect = new PIXI.Rectangle(9, 10, 6, 7);
    public static defaultProgressBarScale = 2;
    public static defaultShowMapButton = false;
    private static fakedStars = 0;
    private static _instance: MetaphorManager;

    public data: any;

    public static initFromString(metaphorClassName: string, data: any) {
        // LevelIndicator.defaultLevelFont = Styles.font_levelmeterNumber;
        metaphorClassName = 'MiniMetaphor';
        MetaphorManager._instance = <MetaphorManager>Instantiator.i.instantiate(metaphorClassName, data);
        // MetaphorManager._instance = new MiniMetaphor(data);

        // if (metaphorClassName === 'PlanetRace'
        //     || metaphorClassName === ObjectUtils.getClassNameFromConstructor(PlanetRaceMetaphor)) {
        //         MetaphorManager._instance = new PlanetRaceMetaphor(data);
        // } else if (metaphorClassName === 'Magical'
        //       || metaphorClassName === ObjectUtils.getClassNameFromConstructor(MagicalMetaphor)) {
        //     MetaphorManager._instance = new MagicalMetaphor(data);
        // } else if (metaphorClassName === 'Clean' || metaphorClassName === ObjectUtils.getClassNameFromConstructor(CleanMetaphor)) {
        //     MetaphorManager._instance = new CleanMetaphor(data);
        // } else {
        //     Logger.warn('No metaphor selected: ' + metaphorClassName);
        // }
    }

    public static get instance(): MetaphorManager {
        return MetaphorManager._instance;
    }

    constructor(data: any) {
        MetaphorManager._instance = this;
        this.init(data);
    }

    protected init(data: any = {}) {
        this.data = data;
        const useHorizontal = this.getIsHorizontal();
        // if (useHorizontal != ConsoleCmdRenderer.getSizeIsHorizontal()) {
        RendererManager.updateRendererSizeHorV(useHorizontal);
        // }
        TestStatistics.testPhaseLoggers.push(MetaphorManager.instance.logTestPhase);
        // TODO: PlanetBundler reference should not be added in base class
        TestStatistics.testPhaseLoggers.push(PlanetBundler.logTestPhase);
        TestStatistics.startGameCalls.push(PlanetBundler.startGame);

        MetaphorManager.fakedStars = 0;
    }

    public postLogin() {
    }
    public logTestPhase(phase: {}, stats: ExerciseStats, peItem: PhaseEndLogItem) {
        // TODO: This shouldn't be done from here, each metaphor should handle
        stats.metaphorData.stars = (stats.metaphorData.stars || 0) + TestStatistics.instance.starCounter;
        // test.stars+=TestStatistics.instance.starCounter;
    }
    public static addFakeStars(value: number) {
        MetaphorManager.fakedStars += value;
    }
    public static getTotalStars(): number {
        return (ExerciseStats.instance.metaphorData.stars || 0) + MetaphorManager.fakedStars;
        // return Object.keys(GameState.exerciseStats.tests)
        //  .map(k => GameState.exerciseStats.tests[k].stars).sum() + MetaphorManager.fakedStars;
    }

    public addTriggers() {
        TriggerManager.instance.clearMetaphorTriggers();
    }

    public addToProp(name: string, value: number) {
        if (typeof this.data[name] !== 'undefined') {
            this.data[name] += value;
        } else {
            console.warn('Prop: ' + name + ' doesn\'t exist in current metaphor');
        }
    }

    public setProp(name: string, value: number) {
        if (typeof this.data[name] !== 'undefined') {
            this.data[name] = value;
        } else {
            console.warn('Prop: ' + name + ' doesn\'t exist in current metaphor');
        }
    }

    public getPropValue(name: string): number {
        if (typeof this.data[name] !== 'undefined') {
            return this.data[name];
        } else {
            console.warn('Prop: ' + name + ' doesn\'t exist in current metaphor');
        }
        return 0;
    }


    public getIsHorizontal() {
        return false;
    }
    public abstract getAssetsToLoad(): Array<string | any>;

    public abstract getGlobalBackgroundClass(): Function;

    // public getMenuClass(): Function {
    //     throw new Error('No set metaphor');
    // }
    public abstract getMenuClass(): Function;

    public abstract getLoginClass(): Function;

    protected abstract getPhaseViewClassesResolverConstructor(): Function;

    protected phaseViewResolver: ViewResolverBase;

    public getPhaseViewClassesResolver(): ViewResolverBase {
        if (this.phaseViewResolver == null) {
            this.phaseViewResolver = <ViewResolverBase>Instantiator.i.instantiate(this.getPhaseViewClassesResolverConstructor());
        }
        return this.phaseViewResolver;
    }

    public abstract getDefaultHalfScreenProgressVisualizer(): Function;

    public abstract getDefaultFullScreenProgressVisualizer(): Function;

    //     // public showEndOfTimeLimitActions() {
    //     //    new TimeIsUpDialog(false, ()=> {
    //     //        TestStatistics.instance.logEvent(EndOfDayLogItem.create(<EndOfDayLogItem>{training_day: GameState.getTrainingDay()}));
    //     //        GameState.trainingPlanIndex = 1;
    //     //        App.instance.showPage(CognitionMattersPageType.PAGE_MAP);
    //     //    });
    //     // }

    public showEndOfDayActions(onClose: () => void) {
        TimeIsUpDialog.create(true, () => {
            if (onClose) {
                onClose();
            }
        });
    }
}

export class PlanetRaceMetaphor extends MetaphorManager {
    public getAssetsToLoad(): any[] {
        throw new Error('Method not implemented.');
    }
    public getGlobalBackgroundClass(): Function {
        throw new Error('Method not implemented.');
    }
    public getMenuClass(): Function {
        throw new Error('Method not implemented.');
    }
    public getLoginClass(): Function {
        throw new Error('Method not implemented.');
    }
    protected getPhaseViewClassesResolverConstructor(): Function {
        throw new Error('Method not implemented.');
    }
    public getDefaultHalfScreenProgressVisualizer(): Function {
        throw new Error('Method not implemented.');
    }
    public getDefaultFullScreenProgressVisualizer(): Function {
        throw new Error('Method not implemented.');
    }
}
export class CleanMetaphor extends MetaphorManager {
    public getAssetsToLoad(): any[] {
        throw new Error('Method not implemented.');
    }
    public getGlobalBackgroundClass(): Function {
        throw new Error('Method not implemented.');
    }
    public getMenuClass(): Function {
        throw new Error('Method not implemented.');
    }
    public getLoginClass(): Function {
        throw new Error('Method not implemented.');
    }
    protected getPhaseViewClassesResolverConstructor(): Function {
        throw new Error('Method not implemented.');
    }
    public getDefaultHalfScreenProgressVisualizer(): Function {
        throw new Error('Method not implemented.');
    }
    public getDefaultFullScreenProgressVisualizer(): Function {
        throw new Error('Method not implemented.');
    }
}
export class MagicalMetaphor extends MetaphorManager {
    public getAssetsToLoad(): any[] {
        throw new Error('Method not implemented.');
    }
    public getGlobalBackgroundClass(): Function {
        throw new Error('Method not implemented.');
    }
    public getMenuClass(): Function {
        throw new Error('Method not implemented.');
    }
    public getLoginClass(): Function {
        throw new Error('Method not implemented.');
    }
    protected getPhaseViewClassesResolverConstructor(): Function {
        throw new Error('Method not implemented.');
    }
    public getDefaultHalfScreenProgressVisualizer(): Function {
        throw new Error('Method not implemented.');
    }
    public getDefaultFullScreenProgressVisualizer(): Function {
        throw new Error('Method not implemented.');
    }
}
