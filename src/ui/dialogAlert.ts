import { BitmapButton } from '@jwmb/pixelmagic/lib/ui/BitmapButton';
import { AssetLoader } from '@jwmb/pixelmagic/lib/app/AssetLoader';
import { Styles } from './styles';
import { ButtonStyled } from './buttonStyled';
import { DialogBase } from '@jwmb/pixelmagic/lib/ui/dialogBase';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export interface IDialogAlertSettings {
    title?: string;
    text: string;
    buttonText?: string;
    closeCallback?: () => void;
    removePreviousDialog?: boolean;
}
export class DialogAlert extends DialogBase {
    public closeButton: BitmapButton;

    constructor(private settings: IDialogAlertSettings) {
        super(0, 0.4, settings.removePreviousDialog);
        this.settings.title = this.settings.title || 'Error';
        this.settings.buttonText = this.settings.buttonText || 'OK';
    }

    public static create(settings: IDialogAlertSettings) {
        let tmp = new DialogAlert(settings);
        tmp = null;
    }

    public preload() {
        super.preload();
    }
    public addContent() {
        if (this.isDisposed) {
            return;
        }
        if (this.assetsToLoad.find(_ => AssetLoader.getAsset(_) === null) !== null) {
        // if (!AssetLoader.getAsset(ButtonStyled.defaultBackgroundName)) {
            alert(this.settings.text);
            return;
        }
        this.content.align = 'CENTER';
        const maxWidth: number = Math.min(RendererManager.instance.renderSettings.width * 0.7, 600);

        if (this.settings.title && this.settings.title !== 'N/A') {
            const title = new SimpleText(this.settings.title, Styles.font_ui_title, true, maxWidth);
            this.content.addChild(title);
        }
        if (this.settings.text) {
            const description = new SimpleText(this.settings.text, Styles.font_ui_texts_centered, false, maxWidth);
            this.content.addChild(description);
        }
        if (this.settings.buttonText !== 'NOBUTTON') {
            this.closeButton = ButtonStyled.create(this.settings.buttonText, true);
            this.closeButton.clicked.add(this.onClose, this);
            this.content.addChild(this.closeButton);
        }
    }

    private onClose() {
        if (this.settings.closeCallback) {
            this.settings.closeCallback();
        }
        this.hide();
    }
    dispose() {
        super.dispose();
        this.settings = null;
    }
}
