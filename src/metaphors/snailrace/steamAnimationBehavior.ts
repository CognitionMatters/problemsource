import { BehaviorBase } from '@jwmb/pixelmagic/lib/components/management/behaviorBase';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { UpdateManager } from '@jwmb/pixelmagic/lib/app/updateManager';

export class SteamAnimationBehavior extends BehaviorBase {
    private startPositionX = 0;
    private startPositionY = 0;
    public age = 0;

    constructor(parent: PIXI.Container,
        protected lifeTime = 2,
        protected swayWidth = 30,
        protected swayHeight = 90,
        protected startScale = 0.1,
        protected endScale = 1.2,
        protected swaySpeed = 0.1,
        protected offsetStart = 0,
        protected disposeTargetAfter = true) {
        super(parent);

        this.startPositionX = this.parent.x;
        this.startPositionY = this.parent.y;

        UpdateManager.instance.updated.add(this.update, this);

        this.parent.scale.x = this.startScale;
        this.parent.scale.y = this.startScale;
        this.parent.alpha = 0;
        Tweener.addTween(this.parent, <TweenerOptions>{ time: this.lifeTime * 0.5, alpha: 1 });
        Tweener.addTween(this.parent, <TweenerOptions>{ time: this.lifeTime, y: this.startPositionY - this.swayHeight });
        Tweener.addTween(this.parent.scale, <TweenerOptions>{
            time: this.lifeTime, x: this.endScale, y: this.endScale, onComplete: () => this.dispose()
        });

        DoLater.execute(this, () => {
            Tweener.addTween(this.parent, <TweenerOptions>{
                time: this.lifeTime * 0.5, alpha: 0
            });
        }, this.lifeTime * 0.5);
    }

    public update(deltaTime) {
        this.age += deltaTime;

        this.parent.position.x = this.startPositionX + Math.sin(this.age * this.swaySpeed * 0.04) * this.swayWidth;
    }

    public dispose() {
        if (this.disposeTargetAfter) {
            if (this.parent['dispose']) {
                this.parent['dispose']();
            }
        }

        UpdateManager.instance.updated.remove(this.update, this);

        super.dispose();
        DoLater.removeAllObjectFunctions(this);

    }
}
