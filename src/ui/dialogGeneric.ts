import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { ExerciseScreen } from '../games/exerciseScreen';
import { CognitionMattersApp } from '../app';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { BitmapButton } from '@jwmb/pixelmagic/lib/ui/BitmapButton';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { Styles } from './styles';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
import { TouchAnimation } from './touchAnimation';
import { ButtonStyled } from './buttonStyled';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { InstructionLayer } from './instructionLayer';
import { DialogBase } from '@jwmb/pixelmagic/lib/ui/dialogBase';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';


export interface IDialogGenericData {
    title?: string;
    description?: string;
    image?: string;
    imageScale?: number;
    guideAnimation?: boolean;
    instructionId?: string;
    delay?: number;
    closeButtonText?: string;
    onClose?: 'NEXT_PROBLEM' | 'NEXT_TEST' | 'NEXT_PHASE' | 'START_CHALLENGE' | 'NOTHING';
    footer?: string;
}

export class DialogGeneric extends DialogBase {
    public data: IDialogGenericData;
    public closeButton: BitmapButton;
    public closeCallback: Function;
    public instructionLayer: InstructionLayer;

    public static create(data: IDialogGenericData, closeCallback: Function = null) {
        const tmp = new DialogGeneric(data, closeCallback);
        return tmp;
    }

    constructor(data: IDialogGenericData, closeCallback: Function = null) {
        // TODO: onClose should be either one of pre-defined actions such as NEXT_PROBLEM, - OR - a callback
        // Don't know right now if this is a problem for auto-setting closeButtonText (next/start), will have to check training plans
        //  (NEXT_TEST not used from code, but may be in training plans)
        if (data.onClose == null) {
            data.onClose = 'NEXT_PROBLEM';
        }
        if (data.closeButtonText == null) {
            if (data.onClose === 'NEXT_TEST') {
                data.closeButtonText = 'next';
            } else {
                data.closeButtonText = 'start';
            }
        }

        if (data.delay == null) {
            data.delay = 0;
        }
        super(data.delay);

        this.data = data;
        this.closeCallback = closeCallback;
    }

    public addContent() {
        this.content.align = 'CENTER';
        const maxWidth: number = Math.min(RendererManager.instance.renderSettings.width * 0.7, 600);

        if (this.data.title) {
            const title = new SimpleText(this.data.title, Styles.font_ui_title, true, maxWidth);
            this.content.addChild(title);
        }
        if (this.data.image) { // TODO: support image
            // if (this.data.image.indexOf("[TEXT]")==0){
            //    var string:String=this.data.image.replace("[TEXT]", "");
            //    var imageText:MathAdvText=new MathAdvText(string, Styles.font_problemNumberGroup);
            //    this.content.addChild(imageText);
            // }else{
            const image: SimpleBitmap = new SimpleBitmap(this.data.image);
            if (this.data.imageScale) {
                image.uniformScale = this.data.imageScale;
            }
            this.content.addChild(image);
            // }
        }
        if (this.data.instructionId) {
            if (!this.data.description) {
                this.data.description = SR.get(this.data.instructionId); // InstructionsLib.getString();
            }
            DoLater.execute(this, this.startInstruction, 0);
        }

        if (this.data.description) {
            const description = new SimpleText(this.data.description, Styles.font_ui_texts_centered, false, maxWidth);
            this.content.addChild(description);
        }
        this.closeButton = ButtonStyled.create(this.data.closeButtonText, true);
        this.closeButton.clicked.add(this.onClose, this);
        this.content.addChild(this.closeButton);

        if (this.data.footer) {
            const footer = new SimpleText(this.data.footer, Styles.font_ui_footer, false, maxWidth);
            footer.position.x = RendererManager.instance.renderSettings.width * 0.5 - footer.width * 0.5;
            footer.position.y = RendererManager.instance.renderSettings.height - footer.height - Styles.defaultBuffer;
            this.addChild(footer);
        }
    }

    public startInstruction() {
        let instruction = <any>SoundPlayer.instance.playVoiceOver(this.data.instructionId, 1, () => this.instructionDone());
        // TODO: if (WebAudio.Context.audioContext || !window.isPhonegap) {
            if (SoundPlayer.instance.voiceOverSound) {
                instruction = SoundPlayer.instance.voiceOverSound;
            }
            if (SoundPlayer.instance.constructor === SoundPlayer) {
                if (instruction.constructor === HTMLAudioElement) {
                    (<HTMLAudioElement>instruction).addEventListener('error', () => this.closeButton.enabled = true);
                }
            }
            if (instruction) {
                instruction.settings = instruction.settings || {};
                instruction.settings.onError = () => { this.closeButton.enabled = true; };
                this.closeButton.enabled = false;
            }
        // }
    }

    private handAnimation: TouchAnimation;

    public instructionDone(t: Object = null) {
        DoLater.clearCallsToFunction(this, this.instructionDone);
        this.closeButton.enabled = true;
        if (this.data.guideAnimation) {
            const handAnimation = new TouchAnimation();
            this.handAnimation = handAnimation;
            this.addChild(handAnimation);
            handAnimation.position = new PIXI.Point(RendererManager.instance.renderSettings.width * 0.5,
                RendererManager.instance.renderSettings.height * 0.75);

            handAnimation.addMoveToTargetCommand(this.closeButton, 1);
            handAnimation.addTouchCommand();
            handAnimation.addWaitCommand(1);
            handAnimation.start();
        }
    }

    public onClose(t: Object = null): void {
        if (this.handAnimation) {
            this.handAnimation.dispose();
            this.handAnimation = null;
        }
        if (this.closeCallback != null) {
            this.closeCallback();
            this.hide();
            return;
        }

        this.hide();

        // var test = <TestScreen>(<CognitionMattersApp>App.instance).currentPage;
        // Not used for these cases anymore? WM exercises uses BetweenItemsDialog, Snail race uses Snail*Dialog...
        const test = <ExerciseScreen>(<CognitionMattersApp>App.instance).currentPage;
        if (test) {
            if (this.data.onClose === 'NEXT_PROBLEM') {
                throw new Error('DialogGeneric doesn\'t support ' + this.data.onClose);
                // test.currentPhase.onNextProblem();
            } else if (this.data.onClose === 'NEXT_PHASE' || this.data.onClose === 'START_CHALLENGE') {
                test.getNextPhase();
            } else if (this.data.onClose === 'NEXT_TEST') {
                test.leaveTest();
            }
        }
    }

    public dispose() {
        this.data = null;
        this.closeButton = null;
        this.closeCallback = null;

        DoLater.clearCallsToFunction(this, this.startInstruction);
        DoLater.clearCallsToFunction(this, this.instructionDone);

        if (this.instructionLayer) { // TODO: implement
            this.instructionLayer.dispose();
            this.instructionLayer = null;
        }

        super.dispose();
    }
}
