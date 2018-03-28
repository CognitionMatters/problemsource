import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { Trail } from './trail';
import { SteamAnimationBehavior } from './steamAnimationBehavior';

export class SnailCharacter extends ContainerBase {
    public vehicleName: string;
    public vehicle: ContainerBase;
    public trail: Trail;


    public _heightOverGround = 40;
    public get heightOverGround(): number {
        return this._heightOverGround;
    }
    public set heightOverGround(value: number) {
        this._heightOverGround = value;

        this.vehicle.position.y = -this.heightOverGround;
    }
    public floatRotationFactor = 1;
    public preferedSpeedFactor = 1;

    constructor(isPlayer: boolean = true) {
        super();

        console.log('Snail');

        this.vehicleName = 'Spaceship';
        //            var data:Object=ConfigurableCharacter.instance.getRenderedPose(avatarData, pose); //TODO: implement character

        let vehicleBmp: SimpleBitmap;
        if (isPlayer) {
            vehicleBmp = SimpleBitmap.create('snail0' + 1 + '.png');
        } else {
            vehicleBmp = SimpleBitmap.create('snail0' + 2 + '.png');
        }
        vehicleBmp.centerRegistrationPoint();
        vehicleBmp.uniformScale = 0.5;
        this.vehicle = new ContainerBase();
        this.vehicle.addChild(vehicleBmp);

        const vehicleBounds = this.vehicle.getLocalBounds();
        this.addChild(this.vehicle);

        this.heightOverGround = 50;

        this.addTrails();
    }

    public addTrails() {
        if (this.trail == null) {
            this.trail = new Trail('cloud01.png');
            this.addChildAt(this.trail, 0);
        }
    }

    public showHearts(noOfHearts = 5) {
        const array = [0, 1, 2];
        array.forEach((index) => {
            DoLater.execute(this, () => {
                const heart = new SimpleBitmap('snail_heart01.png');
                heart.x = 30;
                heart.y = -50;
                this.addChild(heart);

                const steamBehaviour = new SteamAnimationBehavior(heart, 2, 30, 140, 0.1, 0.6, 0.1, Math.random());
            }, index * 0.35);
        });
    }

    public addSound() {
        SoundPlayer.instance.playEffect('player_move_' + this.vehicleName.toLowerCase() + '_' + [Misc.randomRange(1, 2)]);
    }

    private trailCounter = 1;
    private lastX = -9999;
    private floatValue: number = 3 * Math.random();
    public update(speed: number) {

    }

    private _starPosition = new PIXI.Point(0, 0);
    public getAvatarPos(): PIXI.Point {
        this._starPosition.x = this.vehicle.position.x;
        this._starPosition.y = this.vehicle.position.y;
        return this._starPosition;
    }

    public onSpeedBoost(no = 3) {
        if (this.trail) {
            if (no > 0) {
                this.addParticle();
            }
            let delay = 0;
            for (let i = 1; i < no; i++) {
                delay += Misc.randomRange(10, 30) * 0.01;
                DoLater.execute(this, this.addParticle, delay);
            }
            Tweener.addTween(this.scale, <TweenerOptions>{ time: 0.7, x: 1.05 });
            Tweener.addTween(this.scale, <TweenerOptions>{ time: 0.7, y: 0.95 });
            DoLater.execute(this, () => {
                Tweener.addTween(this.scale, <TweenerOptions>{ time: 0.7, x: 1 });
                Tweener.addTween(this.scale, <TweenerOptions>{ time: 0.7, y: 1 });
            }, 0.7);

        }
    }

    public addParticle() {
        this.trail.addParticle(this.vehicle.position.x, this.vehicle.position.y + 20);
    }

    public dispose() {
        super.dispose();

        DoLater.removeAllObjectFunctions(this);

        this.vehicle = null;
        this.trail = null;
    }
}
