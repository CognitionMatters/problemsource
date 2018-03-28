import { BitmapButton } from '@jwmb/pixelmagic/lib/ui/BitmapButton';
import { InstructionLayer } from './instructionLayer';
import { VSpace } from '@jwmb/pixelmagic/lib/ui/VSpace';
import { BetweenItemsLevelMeter } from './betweenItemsLevelMeter';
import { ButtonStyled } from '../ui/buttonStyled';
import { DialogBase } from '@jwmb/pixelmagic/lib/ui/dialogBase';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class BetweenItemsDialog extends DialogBase {
    public closeButton: BitmapButton;
    public closeCallback: Function;
    public instructionLayer: InstructionLayer;

    private previousLevel: number;
    private newLevel: number;
    private previousRecordLevel: number;
    private wasNewRecord: boolean;

    public static create(previousLevel: number, newLevel: number,
        previousRecordLevel: number, wasNewRecord: boolean, closeCallback: Function = null) {
        let tmp = new BetweenItemsDialog(previousLevel, newLevel,
            previousRecordLevel, wasNewRecord, closeCallback);
        tmp = null;
    }
    constructor(previousLevel: number, newLevel: number,
        previousRecordLevel: number, wasNewRecord: boolean, closeCallback: Function = null) {
        super(0.2);

        this.previousLevel = previousLevel;
        this.newLevel = newLevel;
        this.previousRecordLevel = previousRecordLevel;
        this.wasNewRecord = wasNewRecord;
        this.closeCallback = closeCallback;
    }

    public addContent() {
        this.content.align = 'CENTER';
        this.content.autoUpdate = false;
        const maxWidth: number = Math.min(RendererManager.instance.renderSettings.width * 0.7, 600);

        // var titleText="";
        // if(this.wasNewRecord){
        //     titleText = "fdbk_record"; //Nytt rekord!";
        // }else if(TestStatistics.instance.lastAnswerWasCorrect){
        //     titleText = "fdbk_correct"; //Rätt!";
        // }else{
        //     titleText = "fdbk_incorrect"; //Fel";
        // }
        //
        // var title:MathAdvText=new MathAdvText("#" + titleText, Styles.font_ui_title, true, maxWidth);
        // this.content.addChild(title);

        this.content.addChild(new VSpace(10));

        // level meter
        const meter = new BetweenItemsLevelMeter(350, 35, 0, this.previousLevel,
            this.newLevel, this.previousRecordLevel, this.wasNewRecord);
        this.content.addChild(meter);

        this.content.addChild(new VSpace(10));

        this.closeButton = ButtonStyled.create('next', true);
        this.closeButton.name = 'next';
        this.closeButton.clicked.add(this.onClose, this);
        this.content.addChild(this.closeButton);

        this.content.autoUpdate = true;
    }

    public onClose(t: Object = null): void {
        if (this.closeCallback != null) {
            this.closeCallback();
        }
        this.hide();
    }

    public dispose() {
        this.closeButton = null;
        this.closeCallback = null;

        super.dispose();
    }
}
