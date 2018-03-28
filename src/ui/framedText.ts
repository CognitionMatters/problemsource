import { Sprite9 } from '@jwmb/pixelmagic/lib/ui/Sprite9';
import { TextStyleOptionsEx, SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { Styles } from './styles';

export class FramedText extends ContainerBase {
    public textfield: SimpleText;
    public background: Sprite9;

    constructor(text: string, font: TextStyleOptionsEx, onClick: Function = null, minWidth: number = 150,
        minHeight: number = 150) {
        super();

        const textfield = new SimpleText(text, font, false);
        textfield.position.x = -textfield.width * 0.5;
        textfield.position.y = -textfield.height * 0.5;
        this.addChild(textfield);
        this.textfield = textfield;

        const contentWidth: number = Math.max(minWidth, textfield.width + Styles.defaultBuffer * 4);
        this.background = new Sprite9(null, 'buttonFrame03.png', new PIXI.Point(contentWidth, minHeight), new PIXI.Rectangle(14, 14, 1, 1));
        this.background.position.x = -contentWidth * 0.5;
        this.background.position.y = -minHeight * 0.5;
        this.addChildAt(this.background, 0);
    }

    public dispose() {
        super.dispose();
    }
}
