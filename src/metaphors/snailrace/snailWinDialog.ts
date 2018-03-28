import { SnailCharacter } from './snailCharacter';
import { InsetFrame } from '@jwmb/pixelmagic/lib/ui/insetFrame';
import { ButtonStyled } from '../../ui/buttonStyled';
import { DialogBase } from '@jwmb/pixelmagic/lib/ui/dialogBase';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class SnailWinDialog extends DialogBase {
    public static starMeterMaxValue = 100;
    private closeCallBack: Function;

    private wonRace = true;
    private score = 0;
    private character: SnailCharacter;
    private closeButton: ButtonStyled;

    constructor(closeCallBack: Function = null, wonRace = true, score = 0, delay = 0) {
        super(delay);

        this.closeCallBack = closeCallBack;
        this.wonRace = wonRace;
        this.score = score;
    }

    public preload() {
        this.assetsToLoad.push('assets/magical/ui/magicalUIAssets.json');
        this.assetsToLoad.push('assets/snailrace/snailrace.json');
        super.preload();
    }

    public addContent() {
        this.content.align = 'CENTER';
        const maxWidth: number = Math.min(RendererManager.instance.renderSettings.width * 0.7, 600);

        this.content.gap = -20;

        const characterFrame = new InsetFrame(250, 180);

        this.character = new SnailCharacter(true);
        this.character.x = 125;
        this.character.y = 160;
        this.character.uniformScale = 1.5;
        this.character.showHearts(5);
        characterFrame.addChild(this.character);

        this.content.addChild(characterFrame);

        // close button
        this.closeButton = ButtonStyled.create('done', true);
        this.closeButton.clicked.addOnce(this.onClose, this);
        this.content.addChild(this.closeButton);

        this.closeButton.x = this.content.width * 0.5 - this.closeButton.width * 0.5;
    }

    public addBackground() {
        super.addBackground();
    }

    private onClose() {
        if (this.closeCallBack != null) {
            this.closeCallBack(this);
        }
        this.hide();
    }


    public dispose() {
        this.character = null;
        this.closeCallBack = null;

        super.dispose();
    }
}
