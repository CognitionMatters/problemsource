import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';

export class CircleEffect extends ContainerBase {
    private graphics: PIXI.Graphics;
    constructor(delay: number = 0, color: number = 0xFFFFFF) {
        super();

        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(10, color, 1);
        this.graphics.drawCircle(0, 0, 70);
        this.addChild(this.graphics);

        this.visible = false;

        DoLater.execute(this, this.startEffect, delay);
    }

    public startEffect() {
        this.visible = true;
        this.alpha = 0.99;
        this.scale.x = 0.1;
        this.scale.y = 0.1;

        Tweener.addTween(this, <TweenerOptions>{ time: 0.5, alpha: 0.0001, uniformScale: 1, transition: 'easeOutExpo' });
        DoLater.execute(this, this.dispose, 0.5);
    }

    public dispose() {
        this.visible = false;
        super.dispose();
        this.graphics = null;
    }
}
