import { BitmapButton } from '@jwmb/pixelmagic/lib/ui/BitmapButton';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { TextRenderComponent } from './textRenderComponent';
import { Styles } from './styles';

export class ButtonStyled extends BitmapButton {
    public static textRender: TextRenderComponent;
    private static isCreatedByFactory = false;

    public static defaultBackgroundName = 'buttonFrame01.png';
    public static defaultBackgroundNameHilite = 'buttonFrame02.png';
    public static defaultBackgroundScale9Rect = new PIXI.Rectangle(14, 14, 1, 1);
    public static defaultButtonScale = 1;
    public static defaultIconName = 'icon_##01.png';
    public static defaultTextStyle = 'font_ui_standardButtons';

    public static create(label: string, disableAfterClick: boolean = false, size: string = 'medium'): ButtonStyled {
        ButtonStyled.isCreatedByFactory = true;
        if (ButtonStyled.textRender == null) {
            ButtonStyled.textRender = new TextRenderComponent();
        }

        let icon = '';
        let iconPosition = 'LEFT';
        switch (label.toLowerCase()) { // set possible icon
            case 'login':
            case 'next':
            case 'start':
            case 'competeAgain':
                {
                    icon = ButtonStyled.defaultIconName.replace('##', 'right');
                    iconPosition = 'LEFT';
                    label = '';
                    break;
                }

            case 'logout':
            case 'previous':
                {
                    icon = ButtonStyled.defaultIconName.replace('##', 'left');
                    iconPosition = 'LEFT';
                    label = '';
                    break;
                }

            case 'map':
                {
                    icon = ButtonStyled.defaultIconName.replace('##', 'map');
                    iconPosition = 'LEFT';
                    label = '';
                    break;
                }

            case 'ok':
            case 'done':
            case 'close':
                {
                    icon = ButtonStyled.defaultIconName.replace('##', 'close');
                    iconPosition = 'LEFT';
                    label = '';
                    break;
                }

            default:
                {
                    break;
                }
        }

        // standard state
        ButtonStyled.textRender.backgroundBitmap = ButtonStyled.defaultBackgroundName;
        ButtonStyled.textRender.backgroundRect = ButtonStyled.defaultBackgroundScale9Rect;
        ButtonStyled.textRender.outsideBuffer = 24 * ButtonStyled.defaultButtonScale;
        ButtonStyled.textRender.invisibleBuffer = 0 * ButtonStyled.defaultButtonScale;
        ButtonStyled.textRender.textColor = 0xFFFFFF;
        ButtonStyled.textRender.style = Styles[ButtonStyled.defaultTextStyle];
        ButtonStyled.textRender.fontOffsetY = -2 * ButtonStyled.defaultButtonScale;

        if (size === 'medium') {
            ButtonStyled.textRender.fixedHeight = 70 * ButtonStyled.defaultButtonScale;
        } else if (size = 'small') {
            ButtonStyled.textRender.fixedHeight = 50 * ButtonStyled.defaultButtonScale;
        }

        ButtonStyled.textRender.text = TextRenderComponent.getString(label).toUpperCase();
        if (icon !== '') { // TODO: implement button icons
            ButtonStyled.textRender.icon = new SimpleBitmap(icon);
            ButtonStyled.textRender.iconPosition = iconPosition;
        } else {
            if (ButtonStyled.textRender.icon) {
                ButtonStyled.textRender.icon.dispose();
                ButtonStyled.textRender.icon = null;
            }
        }
        const standardTexture = ButtonStyled.textRender.getRendered();

        // over state
        ButtonStyled.textRender.backgroundBitmap = ButtonStyled.defaultBackgroundNameHilite;
        const overTexture = ButtonStyled.textRender.getRendered();

        const button = new BitmapButton(
            standardTexture,
            overTexture,
            null,
            null,
            disableAfterClick
        );
        button.clickSounds = ['menu_select_1', 'menu_select_2'];
        button.uniformScale = 1 / ButtonStyled.defaultButtonScale;

        return button;
    }

    constructor(public standardTexture: PIXI.Texture,
        public overTexture: PIXI.Texture = null,
        public downTexture: PIXI.Texture = null,
        public disabledTexture: PIXI.Texture = null,
        public disableAfterClick: boolean = false) {
        super(standardTexture, overTexture, null, null, disableAfterClick);
        if (ButtonStyled.isCreatedByFactory === false) {
            throw new Error('Class ButtonStyled should be created by factory method');
        }
        ButtonStyled.isCreatedByFactory = false;
    }

}
