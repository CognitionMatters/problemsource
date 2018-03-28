import { TextStyleOptionsEx, SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { Sprite9 } from '@jwmb/pixelmagic/lib/ui/Sprite9';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { HList } from '@jwmb/pixelmagic/lib/ui/HList';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';

export class TextRenderComponent extends ContainerBase {

    public outsideBuffer = 20;
    public invisibleBuffer = 0;
    public roundness = 4;
    public backgroundColor = 0xFFFFFF;
    public textColor = 0x333333;
    public backgroundAlpha = 1;
    public text = 'TEST';
    public style: TextStyleOptionsEx;

    public icon: SimpleBitmap;
    public iconPosition = 'LEFT';
    public iconGap = 7;

    public fixedWidth = 0;
    public fixedHeight = 0;

    public minWidth = 0;
    public minHeight = 0;

    public fontOffsetY = 0;

    public label: SimpleText;
    public content: HList;
    public background: ContainerBase;

    public useTooltipArrow: Boolean = false;
    public arrow: PIXI.Graphics;

    public backgroundBitmap: string;
    public backgroundRect = new PIXI.Rectangle(10, 10, 12, 12);
    public bitmapBg: Sprite9;

    constructor() {
        super();
    }

    public update(): void {
        if (this.content) {
            this.content.dispose();
            this.background.dispose();
        }

        this.background = new ContainerBase();
        this.addChild(this.background);

        this.content = new HList();
        this.content.align = 'CENTER';
        this.content.gap = this.iconGap;
        this.addChild(this.content);

        if (this.text !== '') {
            this.label = new SimpleText(this.text, this.style);
            this.content.addChild(this.label);
        }

        if (this.icon) {
            if (this.iconPosition === 'LEFT') {
                this.content.addChildAt(this.icon, 0);
            } else {
                this.content.addChild(this.icon);
            }
            //            this.icon.bitmap.pixelSnapping=PixelSnapping.ALWAYS;
            this.icon.position.y = -(this.fontOffsetY + 2);
        }

        const contentBounds = this.content.getLocalBounds();
        let bgWidth: number = Math.max(contentBounds.width + this.outsideBuffer * 2 + this.invisibleBuffer * 2, this.minWidth);
        if (this.fixedWidth > 0) {
            bgWidth = this.fixedWidth;
        }

        let bgHeight: number = Math.max(contentBounds.height + this.outsideBuffer * 2 + this.invisibleBuffer * 2, this.minHeight);
        if (this.fixedHeight > 0) {
            bgHeight = this.fixedHeight;
        }

        this.content.position.x = bgWidth * 0.5 - contentBounds.width * 0.5;
        this.content.position.y = bgHeight * 0.5 - contentBounds.height * 0.5 + this.fontOffsetY;


        if (this.backgroundBitmap) {
            this.bitmapBg = new Sprite9(null, this.backgroundBitmap, new PIXI.Point(bgWidth, bgHeight), this.backgroundRect);
            this.background.addChild(this.bitmapBg);
        }

        if (this.useTooltipArrow) {
            if (this.arrow == null) {
                this.arrow = new PIXI.Graphics();
                this.arrow.beginFill(this.backgroundColor, this.backgroundAlpha);
                this.arrow.moveTo(-8, 0);
                this.arrow.lineTo(0, 20);
                this.arrow.lineTo(8, 0);
                this.background.addChild(this.arrow);
            }
            this.arrow.position.x = bgWidth * 0.5;
            this.arrow.position.y = bgHeight;
        }
    }

    public getRendered(): PIXI.Texture {
        this.update();
        const bounds = this.getLocalBounds();
        const texture = Misc.snapShot(this, bounds);
        return texture;
    }

    public static getString(stringId: string, language: string = 'se'): string { // TODO: move strings to strings database
        if (stringId.length <= 1) {
            return stringId;
        }
        return SR.get('btn_' + stringId);
    }

}
