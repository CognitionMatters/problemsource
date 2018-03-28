import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { RevealEffect } from './RevealEffect';

export class FadeInEffect extends RevealEffect {
    constructor(target: PIXI.DisplayObject, delay: number, type: string = 'FADE_IN', playSound: boolean = true,
    private onComplete: () => void) {
        super(target, delay, type, playSound);
    }

    public startTween() {
        if (this.type === 'FADE_IN') {
            this.target.visible = true;
            this.target.alpha = 0.0;
            Tweener.addTween(this.target, <TweenerOptions>{
                time: 0.4, alpha: 1, onComplete: () => {
                    // this.onCompleteDefer.resolve(null);
                    if (this.onComplete) {
                        this.onComplete();
                    }
                    this.dispose();
                }
            });
        } else {
            super.startTween();
        }
    }
    // public onComplete(): Promise<any> {
    //     return this.onCompleteDefer.promise();
    // }
}
