import { ParticleExplosion } from '@jwmb/pixelmagic/lib/ui/ParticleExplosion';


export class CloudEffect extends ParticleExplosion {
    constructor(delay: number = 0) {
        super('cloud01.png', 5, 0.3, 60, delay);
    }
}


