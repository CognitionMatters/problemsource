import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { HList } from '@jwmb/pixelmagic/lib/ui/HList';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { RevealEffect } from './effects/RevealEffect';

export class LevelIndicator extends ContainerBase {
    public static defaultLevelFont;
    public static defaultLevelIcon = 'clean_icon_levels.psd'; // magic_icon_level

    private level: number;
    private background: PIXI.Graphics;
    private levelText: SimpleText;
    private horizontalGap = 10;
    private sideBuffer = 10;

    constructor(startLevel = 0) { // TODO: separate into title/number
        super();

        const container = new HList(this.horizontalGap);
        container.position.x = this.sideBuffer;
        // container.position.y=this.sideBuffer;
        this.addChild(container);

        const icon = new SimpleBitmap(LevelIndicator.defaultLevelIcon);
        icon.uniformScale = 0.5;
        container.addChild(icon);


        this.levelText = new SimpleText('00', LevelIndicator.defaultLevelFont);
        this.levelText.y = icon.height * 0.5 - this.levelText.height * 0.5;
        container.addChild(this.levelText);

        this.visible = false;
    }

    public setLevel(level: number, revealAnim: boolean = true) {
        if (level !== this.level) {
            this.levelText.setText(this.getLevelString(level));
            if (revealAnim) {
                const tmpFx = new RevealEffect(this, 0, 'POP');
            }
            this.level = level;
        }
    }

    public getLevelString(level: number) {
        const decimator = 1.1.toLocaleString(SR.instance.preferredLanguage).substring(1, 2); // because fuck optimization
        return (Math.round(level * 10) / 10).toString().replace('.', decimator);
    }

    public dispose() {
        super.dispose();
        this.levelText = null;
    }
}
