import { ScreenBase } from '@jwmb/pixelmagic/lib/ui/screenBase';
import { BitmapButton } from '@jwmb/pixelmagic/lib/ui/BitmapButton';
import { RandomSeed } from '@jwmb/pixelmagic/lib/utility/RandomSeed';
import { TrainingPlan } from '../trainingPlan/TrainingPlan';
import { TriggerTimeType } from '../triggerManager';
import { PlanetBundler, PlanetInfo } from '../trainingPlan/PlanetBundler';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { CognitionMattersApp, CognitionMattersPageType } from '../app';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { GameState } from '../gameState';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { GameDefinition } from '../trainingPlan/gameDefinition';
import { ButtonStyled } from '../ui/buttonStyled';
import { Styles } from '../ui/styles';

export abstract class TrainingPlanScreenBase extends ScreenBase {
    // protected tpr: TrainingPlanRunnerBase;
    protected logoutButton: BitmapButton;
    protected lockedInteraction = false;
    protected randomGen = new RandomSeed(2);
    protected tp: TrainingPlan;
    public isLoadComplete = false;
    static lastLocation: PIXI.Point = new PIXI.Point(0, 0);
    public static useHorizontal = true; // TODO: should be part of interface!

    constructor() {
        super();
        this.tp = TrainingPlan.create(null, null, TriggerTimeType.MAP);

        this._planetInfos = PlanetBundler.getPlanets(true, this.tp);
    }

    protected _planetInfos: PlanetInfo[];
    protected get planetInfos() {
        return this._planetInfos;
    }


    public init() {
        this.subInit();
        this.preload();
    }
    protected subInit() {
    }
    public unlockList: ContainerBase[] = [];

    loadComplete() {
        (<CognitionMattersApp>App.instance).updateGlobalBackground();

        this.subLoadComplete();
        this.isLoadComplete = true;

        if (App.instance.urlParameters.test) {
            if (this.startTestByID(App.instance.urlParameters.test, true)) {
                return;
            }
        }

        if (GameState.trainingSettings.customData && GameState.trainingSettings.customData.canLogout) {
            // Settings.isTestAccount) {
            DoLater.execute(this, () => {
                this.logoutButton = ButtonStyled.create('logout', true);
                this.logoutButton.position.x = Styles.defaultBuffer ;
                // RendererManager.instance.renderSettings.width - this.logoutButton.width -
                this.logoutButton.position.y = Styles.defaultBuffer;
                this.logoutButton.clicked.add(this.onLogOut, this);
                this.addChild(this.logoutButton);
            }, 1);
        }
    }
    protected abstract subLoadComplete();

    protected startTestByID(id: string, fuzzySearch: boolean = false): boolean {
        let found = this.planetInfos.find(_ => _.nextGame.id === id);
        if (!found) {
            if (fuzzySearch) {
                found = this.planetInfos.find(_ => _.nextGame.id.toLowerCase().indexOf(id.toLowerCase()) >= 0);
            }
            if (!found) {
                return false;
            }
        }
        this.startTest(found.nextGame);
        return true;
    }
    protected isStartingTest = false;
    protected startTest(data: GameDefinition) {
        if (this.isStartingTest) {
            return;
        }
        this.isStartingTest = true;
        App.instance.showPage(CognitionMattersPageType.PAGE_EXERCISE, data);
    }


    protected createPlanets(planets: PlanetInfo[],
        planetCreator: (planetInfo: PlanetInfo) => ContainerBase, numPlanetsInPlan: number): ContainerBase[] {
        const result: ContainerBase[] = [];
        let planetIndex = -1;
        for (const planetInfo of planets) {
            if (!planetInfo.visibleOnMenu) {
                continue;
            }
            planetIndex++;
            this.assertPlanetProgVizData(planetInfo, planetIndex, numPlanetsInPlan);
            const planet = planetCreator(planetInfo);
            result.push(planet);
            if (planetInfo.wasJustUnlocked) {
                this.unlockList.push(planet);
            }
            if ((planetInfo.isUnlocked === true && planetInfo.isCompleted === false) || planetInfo.wasJustUnlocked === true) {
                // this.lastPlayableOffsetY = offsetY;
                // if (this.firstPlayableOffsetY == -1) {
                //    this.firstPlayableOffsetY = offsetY;
                // }
            }
        }
        return result;
    }

    protected abstract assertPlanetProgVizData(planetInfo: PlanetInfo, planetIndex: number, tpNumPlanets: number);

    protected onLogOut() {
        App.instance.showPage(CognitionMattersPageType.PAGE_LOGIN);
    }

    dispose() {
        super.dispose();
        this.unlockList = null;
        this.logoutButton = null;
    }
}
