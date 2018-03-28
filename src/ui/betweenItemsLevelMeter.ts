import { ProgressBar } from '@jwmb/pixelmagic/lib/ui/ProgressBar';
import { MetaphorManager } from '../metaphors/metaphorManager';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { Styles } from './styles';
import { StarExplosion } from './starExplosion';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';

export class BetweenItemsLevelMeter extends ProgressBar {
    private sideBuffer = 2;
    private recordMarker: PIXI.Graphics;
    private starExplosion: StarExplosion;

    constructor(barWidth: number, barHeight: number, minLevel: number,
        previousLevel: number, newLevel: number, previousRecordLevel: number, wasNewRecord: boolean) {
        super(
            barWidth,
            barHeight,
            minLevel,
            Math.ceil(Math.max(previousRecordLevel + 1, newLevel, 5)),
            ((previousLevel < newLevel) ? previousLevel : newLevel),
            MetaphorManager.defaultProgressBar,
            MetaphorManager.defaultProgressBarRect,
            MetaphorManager.defaultProgressBackground,
            MetaphorManager.defaultProgressBackgroundRect,
            2,
            0,
            MetaphorManager.defaultProgressBarScale
        );
        // TODO: make this metaphor independent (now default textures/scale come from magic)
        const maxLevel = Math.ceil(Math.max(previousRecordLevel + 1, newLevel, 5));
        const delay = 0.7;
        const duration = 0.7;
        Tweener.addTween(this, <TweenerOptions>{ delay: delay, time: duration, value: newLevel });

        const markersContainer = new ContainerBase();
        for (let i = minLevel; i < maxLevel + 1; i++) {
            const positionX = this.getXposForValue(i);
            const text = new SimpleText('' + i, Styles.font_ui_texts);
            text.position.x = positionX - text.width * 0.5;
            text.position.y = barHeight + Styles.defaultBuffer * 2;
            markersContainer.addChild(text);

            const line = new PIXI.Graphics();
            let lineOffset = 0;
            if (i === minLevel || i === maxLevel) {
                lineOffset = 6;
            }
            const lineHeight = barHeight + 9;
            line.beginFill(0x000000, 0.3);
            line.drawRect(positionX - 1, this.sideBuffer + lineOffset, 2, lineHeight - lineOffset);
            markersContainer.addChild(line);
        }
        this.addChildAt(markersContainer, 1);

        // record
        this.recordMarker = new PIXI.Graphics();
        this.recordMarker.beginFill(0xff0000, 1);
        const recordPositionX = this.getXposForValue(previousRecordLevel);
        this.recordMarker.x = recordPositionX;
        this.recordMarker.drawRect(-1, this.sideBuffer, 2, barHeight - this.sideBuffer * 2);
        this.addChild(this.recordMarker);


        if (wasNewRecord) {
            const newRecordX = this.getXposForValue(previousLevel);
            console.log('newRecordX:');
            console.log(newRecordX);
            Tweener.addTween(this.recordMarker, <TweenerOptions>{ delay: delay, time: duration, x: newRecordX }); // record animation

            this.starExplosion = new StarExplosion(delay + duration); // star explosion animation
            this.starExplosion.x = newRecordX;
            this.starExplosion.y = barHeight * 0.5;
            this.addChild(this.starExplosion);
        }

        this.updateBar();

    }

    private currentLevelMarker: PIXI.Graphics;
    private lastLevel = -1;
    public updateBar() {
        super.updateBar();

        if (Math.floor(this.value) !== this.lastLevel) {
            setTimeout(() => {
                this.lastLevel = Math.floor(this.value);

                if (this.currentLevelMarker == null) {
                    this.currentLevelMarker = new PIXI.Graphics();
                    this.currentLevelMarker.beginFill(0x000000, 0.2);
                    this.currentLevelMarker.drawCircle(0, 0, 20);
                    this.addChildAt(this.currentLevelMarker, 1);
                }
                const positionX = this.getXposForValue(this.lastLevel);
                this.currentLevelMarker.x = positionX;
                this.currentLevelMarker.y = this.barHeight + Styles.defaultBuffer * 2 + 11;
            }, 0);

        }
    }

    private getXposForValue(level: number) {
        return this.sideBuffer + (this.barWidth - this.sideBuffer * 2) * (level / (this.max - this.min));
    }

    public dispose() {
        super.dispose();
        if (this.starExplosion) {
            this.starExplosion.dispose();
        }

    }

}
