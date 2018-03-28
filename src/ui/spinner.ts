import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { UpdateManager } from '@jwmb/pixelmagic/lib/app/updateManager';

export class Spinner extends ContainerBase {
    public static defaultSpinnerGfxList = [];
    public timeOffset = 0;
    public frameTime = 1000 / 30;

    constructor() {
        super();
        if (Spinner.defaultSpinnerGfxList.length === 0) {
            const gfx = new PIXI.Graphics();
            gfx.lineStyle(3, 0xffffff, 0.5);
            gfx.arc(0, 0, 20, 0, 4 * Math.PI / 4);
            this.addChild(gfx);
        } else {
            Spinner.defaultSpinnerGfxList.forEach((name) => {
                const bmp = new SimpleBitmap(name);
                bmp.uniformScale = 0.5;
                bmp.centerRegistrationPoint();
                bmp.visible = false;
                this.addChild(bmp);
            });
        }
        UpdateManager.instance.updated.add(this.update, this);
    }
    private update(deltaTime) {
        if (Spinner.defaultSpinnerGfxList.length === 0) {
            this.children[0].rotation = (1.0 * Date.now() / 1000) % 2 * Math.PI * 2;
        } else {
            this.timeOffset += deltaTime;
            const imageNo = Math.round(this.timeOffset / this.frameTime) % Spinner.defaultSpinnerGfxList.length;
            for (let i = 0; i < Spinner.defaultSpinnerGfxList.length; i++) {
                this.children[i].visible = i === imageNo;
            }
        }
    }
    dispose() {
        UpdateManager.instance.updated.remove(this.update, this);
        super.dispose();
    }
}
