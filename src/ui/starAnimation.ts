import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
import { CloudEffect } from './effects/CloudEffect';

export class StarAnimation extends SimpleBitmap {
    public static defaultGraphicsName = 'star01.png';
    public static origin: PIXI.Point = new PIXI.Point(0, 0);

    constructor(private targetPos: PIXI.Point, private playSound: boolean = true, startImmediately: boolean = true) {
        super(PIXI.Texture.fromFrame(StarAnimation.defaultGraphicsName));

        this.centerRegistrationPoint();
        App.instance.currentPage.addChild(this);

        this.playSound = playSound;
        this.targetPos = targetPos;
        this.position.x = StarAnimation.origin.x;
        this.position.y = StarAnimation.origin.y;

        this.rotation = Misc.randomRange(-40, 40);

        if (startImmediately) {
            this.startAnimation();
        }
    }

    public startAnimation() {
        if (this.parent == null) {
            this.dispose();
        }
        this.visible = true;
        const duration = 0.5;
        Tweener.addTween(this, <TweenerOptions>{ time: duration, rotation: this.rotation + 3 });
        Tweener.addTween(this.position, <TweenerOptions>{ time: duration, transition: 'easeInSine', x: this.targetPos.x });
        Tweener.addTween(this.scale, <TweenerOptions>{ time: duration, transition: 'easeOutCubic', x: 0.2, y: 0.2 });
        Tweener.addTween(this, <TweenerOptions>{ delay: duration * 0.7, time: duration * 0.3, alpha: 0.1 });
        Tweener.addTween(this.position, <TweenerOptions>{
            time: duration,
            transition: 'easeOutCubic', y: this.targetPos.y, onComplete: () => this.dispose()
        });

        const soundAlternatives = [
            'star_reward_1',
            'star_reward_2',
            'star_reward_3'
        ];
        SoundPlayer.instance.playEffect(Misc.randomItem(soundAlternatives));
    }

    public cancelAnimation() {
        if (this.parent == null) {
            return;
        }
        const cloud = new CloudEffect();
        cloud.position.x = this.position.x;
        cloud.position.y = this.position.y;
        this.parent.addChild(cloud);

        this.dispose();
    }
}
