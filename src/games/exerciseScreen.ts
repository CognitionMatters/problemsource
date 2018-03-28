import { GameDefinition } from '../trainingPlan/gameDefinition';
import { ScreenBase } from '@jwmb/pixelmagic/lib/ui/screenBase';
import { MetaphorManager } from '../metaphors/metaphorManager';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
// import { App } from '@jwmb/pixelmagic/lib/app/app';
// import { CognitionMattersPageType, CognitionMattersApp } from '../app';
import { GameState } from '../gameState';
import { TriggerManager, TriggerTimeType } from '../triggerManager';
import { PhaseRunner } from '../phasing/phaseRunner';
import { ButtonStyled } from '../ui/buttonStyled';
import { DialogGeneric } from '../ui/dialogGeneric';
import { ProgVisualizerBase } from './progVisualizerBase';
import { ExViewBase } from './exView';
import { Overrider } from '@jwmb/pixelmagic/lib/utility/overrider';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { Styles } from '../ui/styles';

export class ExerciseScreen extends ScreenBase {
    private data: GameDefinition;
    public id = '';

    private menuButton: ButtonStyled;
    private progVisualizer: ProgVisualizerBase;

    static create(data: GameDefinition, callbackWhenDone: () => void): ExerciseScreen {
        ExerciseScreen.assertProgressVisualizerData(data);
        const useHorizontal = MetaphorManager.instance.getIsHorizontal();
        // TODO: if (useHorizontal !== ConsoleCmdRenderer.getSizeIsHorizontal()) {
        //     ConsoleCmdRenderer.updateRendererSizeHorV(useHorizontal);
        // }
        return new ExerciseScreen(data, callbackWhenDone);
    }

    private constructor(data: GameDefinition, private callbackWhenDone: () => void) {
        super();

        this.data = data;
        this.id = data.id;
    }

    public init() {
        this.createProgressVisualizer(this.data);
        // Todo: remiplement training sound
        // PixelMagic.WebAudio.SoundManager2.instance.playBackground2("assets/sound/magical/A_Music_Battle_Background.mp3");
        this.menuButton = ButtonStyled.create('map', true);
        this.menuButton.name = 'backButton';
        this.menuButton.position.x = Styles.defaultBuffer;
        this.menuButton.position.y = RendererManager.instance.renderSettings.height * 0.5 - this.menuButton.height * 0.5;
        this.menuButton.clicked.add(this.onMenuButton, this);
        this.addChild(this.menuButton);
        this.menuButton.visible = false; // Always hide until initialization is complete
        // If something went wrong during initialization, show back button anyway
        DoLater.execute(this, () => {
            this.maybeShowBackButton();
        }, 5);
        super.init();
    }

    private maybeShowBackButton() {
        if ((GameState.trainingSettings.customData && GameState.trainingSettings.customData.menuButton)
            || MetaphorManager.defaultShowMapButton === true) {
            if (true) { // TODO: make button invisible in tests
                this.menuButton.visible = true;
            }

        }
    }

    private static assertProgressVisualizerData(data: GameDefinition): void {
        //// TODO: deep copy data?
        // if (!data.progVisualizer) {
        //    var tpData = <any>GameState.getTestData(data.id);
        //    if (tpData) {
        //        data.progVisualizer = <string>tpData.progVisualizer;
        //        if (!data.progVisualizerData) {
        //            data.progVisualizerData = tpData.progVisualizerData;
        //        }
        //    }
        // }

        let visualizerClassName;
        let cnstr: Function = null;
        if (!data.progVisualizer || data.progVisualizer === 'halfScreen') {
            cnstr = MetaphorManager.instance.getDefaultHalfScreenProgressVisualizer();
        } else if (data.progVisualizer === 'fullScreen') {
            cnstr = MetaphorManager.instance.getDefaultFullScreenProgressVisualizer();
        } else {
            console.warn('Testscreen: prog visualizer should ony be set to halfScreen or fullScreen, was:' + data.progVisualizer);
            visualizerClassName = data.progVisualizer;
        }
        if (!visualizerClassName) {
            visualizerClassName = ObjectUtils.getClassNameFromConstructor(cnstr);
        }
        data.progVisualizer = visualizerClassName;
    }

    private createProgressVisualizer(data: GameDefinition): void {
        ExerciseScreen.assertProgressVisualizerData(data);
        const visualizerId = data.progVisualizer;
        this.progVisualizer = <ProgVisualizerBase>Instantiator.i.instantiate(visualizerId, [this.id, this.data.progVisualizerData]);
        // const instance: Object = Object.create(PixelMagic[visualizerId].prototype);
        // instance.constructor.apply(instance, [this.id, this.data.progVisualizerData]);
        // this.progVisualizer = <ProgVisualizerBase>instance;

        this.progVisualizer.overridePropertyValues(data.progVisualizerData);
        this.addChild(this.progVisualizer);

        this.assetsToLoad = this.assetsToLoad.concat(this.progVisualizer.getAssetToLoad());
    }

    public loadComplete() {
        if (this.isDisposed) {
            Logger.warn('ExerciseScreen disposed ' + this.id);
            return;
        }
        if (!this.progVisualizer) {
            Logger.error('No progVisualizer in ExerciseScreen / ' + this.id);
            this.createProgressVisualizer(<GameDefinition>{ progVisualizer: 'ProgVisualizerBase' });
        }
        try {
            this.progVisualizer.init();
        } catch (err) {
            Logger.error('progVisualizer.init failed in ' + this.id + ' ' + err);
        }

        this.getNextPhase();
        // this.progVisualizer.init();
    }

    private pr: PhaseRunner;
    public getNextPhase() {
        if (this.view) {
            this.view.dispose();
            this.view = null;
        }
        if (!this.pr) {
            this.pr = new PhaseRunner(this.data); // this.id
        }
        if (!this.pr.moveNextValidPhase()) {
            this.leaveTest();
            return;
        }
        this.maybeShowBackButton();


        const phaseData: any = this.pr.getCurrentData();
        if (phaseData.type === 'Dialog') { // TODO: what is this? Can it be implemented so it fits with the rest of the phase system?
            // if (this.currentPhase) {
            //    if (this.currentPhase.currentProblem) {
            //        this.currentPhase.currentProblem.hide();
            //    }
            // }
            DialogGeneric.create(phaseData);
            return;
        }

        // var ph = this.pr.create();
        this.pr.create().then(ph => {
            if (this.isDisposed) {
                return;
            }
            const obj = { view: null };
            try {
                Overrider.override(obj, { view: ph.views.phase });
            } catch (err) {
                throw err;
            }
            this.view = <ExViewBase>obj.view; // ObjectXUtils.instantiate(ph.views.phase);
            this.addChild(this.view);
            this.progVisualizer.endCriteriaManager = ph.endCriteriaManager;

            this.view.init(this, this.pr);
        }, err => {
            Logger.error(err);
        });
    }
    private view: ExViewBase;

    public onMenuButton() {
        if (this.pr.currentPhase) {
            // TODO: make sure progress visualizer stops as well
            this.pr.exitPhase(true);
        }
        this.leaveTest();
    }

    private isTestLeft = false;
    public leaveTest() {
        if (this.isTestLeft) {
            return;
        }
        // TODO: move out to data layer
        const actionsList = TriggerManager.instance.checkTriggers(TriggerTimeType.LEAVE_TEST); // active triggers
        if (actionsList.length > 0) {
            TriggerManager.instance.activateList(actionsList, () => this.leaveTest());
            return;
        }

        this.isTestLeft = true;
        this.pr.exitTest();

        if (this.callbackWhenDone) {
            this.callbackWhenDone();
        }
    }

    public dispose() {
        if (this.view) {
            this.view.dispose();
            this.view = null;
        }
        super.dispose();

        DoLater.removeAllObjectFunctions(this);

        this.pr = null;
        this.data = null;

        if (this.progVisualizer) {
            this.progVisualizer.dispose();
            this.progVisualizer = null;
        }
    }
}
