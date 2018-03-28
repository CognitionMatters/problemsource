import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';

export class Trail extends ContainerBase {
    private particles: Array<SimpleBitmap> = [];
    private particleIndex = -1;

    constructor(imageName: string = 'cloud01') {
        super();

        for (let i = 0; i < 10; i++) {
            const cloud = SimpleBitmap.create(imageName);
            cloud.centerRegistrationPoint();
            cloud.alpha = 0;
            this.addChild(cloud);
            this.particles.push(cloud);
        }
    }


    public addParticle(x: number, y: number, duration: number = 1.5, speedX: number = -300,
        speedY: number = 0, startScale: number = 0.3, endScale: number = 1.6) {
        this.particleIndex++;
        if (this.particleIndex > this.particles.length - 1) {
            this.particleIndex = 0;
        }

        const particle = this.particles[this.particleIndex];
        particle.position.x = x;
        particle.position.y = y;
        particle.rotation = Misc.randomRange(0, 360);
        particle.scale.x = startScale;
        particle.scale.y = startScale;
        particle.alpha = 1;
        Tweener.addTween(particle.position, <TweenerOptions>{
                time: duration, x: particle.position.x + speedX, y: particle.position.y + speedY,
                transition: 'easeOutQuad'
            });
        Tweener.addTween(particle.position, <TweenerOptions>{
            time: duration, scaleX: endScale, scaleY: endScale, transition: 'easeOutQuad'
        });
        Tweener.addTween(particle, <TweenerOptions>{
            time: duration, alpha: 0, rotation: particle.rotation + 50, transition: 'easeOutQuad'
        });
    }

    public dispose() {
        super.dispose();

        this.particles = null;
    }
}
