import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';


export class AnimationEffect {
    constructor(public target: PIXI.DisplayObject, public type: string = 'POP') {

        if (this.type === 'POP') {
            const bounds = this.target.getLocalBounds();
            const endX = this.target.position.x;
            const endY = this.target.position.y;
            const endScale = 1;
            this.target.position.x += (bounds.width * 0.5 + bounds.x * 0.5 - this.target.pivot.x) * 0.6;
            this.target.position.y += (bounds.height * 0.5 + bounds.y * 0.5 - this.target.pivot.y) * 0.6;
            this.target.scale.x = 0.6;
            this.target.scale.y = 0.6;
            Tweener.addTween(this.target.position, <TweenerOptions>{ time: 0.4, transition: 'easeOutElastic', x: endX, y: endY });
            Tweener.addTween(this.target.scale, <TweenerOptions>{
                time: 0.4,
                transition: 'easeOutElastic',
                x: endScale,
                y: endScale,
                onComplete: () => this.dispose()
            });
        }
    }

    public dispose() {
        this.target = null;
    }

}
