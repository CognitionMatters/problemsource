import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';

export class RevealEffect {
    public static create(target: PIXI.DisplayObject, delay: number,
        type: string = 'DEFAULT', playSound: boolean = true) {
        let tmp = new RevealEffect(target, delay, type, playSound);
        tmp = null;
    }

    constructor(public target: PIXI.DisplayObject, delay: number,
        public type: string = 'DEFAULT', public playSound: boolean = true) {
        this.target.visible = false;
        DoLater.execute(this, this.startTween, delay);
    }

    public startTween() {
        this.target.visible = true;

        if (this.type === 'DEFAULT') {
            this.type = 'MOVE_UP';
        }

        if (this.type === 'MOVE_UP') {
            const endY = this.target.position.y;
            this.target.position.y += 120;
            this.target.alpha = 0.3;
            Tweener.addTween(this.target, <TweenerOptions>{ time: 0.2, y: endY, alpha: 1, onComplete: () => this.dispose() });
            if (this.playSound) {
                //                    PopCode.instance.playSound("moving_"+Misc.randomRange(1,3)); //TODO: sound
            }
        }
        if (this.type === 'POP') {
            const bounds = this.target.getLocalBounds();
            const endX = this.target.position.x;
            const endY = this.target.position.y;
            const endScale = this.target.scale.x;
            this.target.position.x += (bounds.width * 0.5 + bounds.x * 0.5 - this.target.pivot.x) * 0.6 * endScale;
            this.target.position.y += (bounds.height * 0.5 + bounds.y * 0.5 - this.target.pivot.y) * 0.6 * endScale;
            this.target.scale.x = endScale * 0.6;
            this.target.scale.y = endScale * 0.6;
            Tweener.addTween(this.target.position, <TweenerOptions>{ time: 0.4, transition: 'easeOutElastic', x: endX, y: endY });
            Tweener.addTween(this.target.scale, <TweenerOptions>{
                time: 0.4, transition: 'easeOutElastic', x:
                endScale, y: endScale, onComplete: () => this.dispose()
            });
            if (this.playSound) { //  PopCode.instance.playSound("gummybounce_"+Misc.randomRange(1,3)); //TODO: sound
            }
        }
    }
    public dispose() {
        DoLater.clearCallsToFunction(this, this.startTween);
        this.target = null;
    }
}

