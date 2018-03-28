import { ParticleExplosion } from '@jwmb/pixelmagic/lib/ui/ParticleExplosion';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';

export class StarExplosion extends ParticleExplosion {
    constructor(delay: number = 0) {
        super('star01.png', 7, 0.7, 80, delay);
    }

    public createExplosion() {
        super.createExplosion();
        SoundPlayer.instance.playEffect('star_explosion_1');
    }
}
