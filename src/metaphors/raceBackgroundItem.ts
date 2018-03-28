import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class RaceBackgroundItem extends SimpleBitmap {
    public static create(assetName: string): RaceBackgroundItem {
        const texture = PIXI.Texture.fromFrame(assetName);
        const bitmap = new RaceBackgroundItem(texture);
        return bitmap;
    }

    public startX = 0;
    public layerSpeedX = 1;
    public loopDistance = 1024;

    constructor(texture: PIXI.Texture) { // make constructor private when possible
        super(texture);
    }

    public move(speed: number) {
        this.position.x = this.position.x + speed * this.layerSpeedX;

        if (this.position.x < -this.width) {
            this.position.x += this.loopDistance;
        }

        if (this.position.x > RendererManager.instance.renderSettings.width + 10) {
            this.visible = false;
        } else {
            this.visible = true;
        }
    }
}
