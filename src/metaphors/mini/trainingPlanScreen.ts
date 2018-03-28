import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { TrainingPlanScreenBase } from '../../screens/trainingPlanScreenBase';
import { PlanetInfo } from '../../trainingPlan/PlanetBundler';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class TrainingPlanScreen extends TrainingPlanScreenBase {
    protected subLoadComplete() {

        let y = 0;
        let x = 0;
        this.planetInfos.filter(o => o.visibleOnMenu).forEach((planet, i) => {
            const button = new PlanetMini(planet);
            button.x = 100 + x;
            button.y = 120 + y; // i * 70;
            y += 70;
            button.on('mousedown', e => {
                // console.log('clicked', gfx.name, e.target);
                this.startTestByID(button.name);
            }, this);
            this.addChild(button);
            if (button.getBounds().bottom > RendererManager.instance.renderSettings.height - 100) {
                y = 0;
                x += 250;
            }
        });
    }

    protected assertPlanetProgVizData(planetInfo: PlanetInfo, planetIndex: number, tpNumPlanets: number) {
    }
}

class PlanetMini extends ContainerBase {
    constructor(planetInfo: PlanetInfo) {
        super();
        this.interactive = true;
        const gfx = new PIXI.Graphics();
        gfx.lineStyle(5, 0xff0000, 0.8);
        gfx.beginFill(0xffffff);
        gfx.drawCircle(0, 0, 20);
        gfx.endFill();
        this.name = planetInfo.gameId || (planetInfo.nextGame ? planetInfo.nextGame.id : 'N/A');
        this.addChild(gfx);
        const title = new SimpleText(planetInfo.nextGame.title);
        title.x = 50;
        this.addChild(title);
    }
}
