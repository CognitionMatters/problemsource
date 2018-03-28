import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { ButtonStyled } from './buttonStyled';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { VSpace } from '@jwmb/pixelmagic/lib/ui/VSpace';
import { Trigonometry } from '@jwmb/pixelmagic/lib/utility/Trigonometry';
import { DialogBase } from '@jwmb/pixelmagic/lib/ui/dialogBase';
import { RevealEffect } from './effects/RevealEffect';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class TimeIsUpDialog extends DialogBase {
    private closeCallBack: Function;

    public static create(wasLastTrainingPlan: boolean = true, closeCallBack: Function = null) {
        let tmp = new TimeIsUpDialog(wasLastTrainingPlan, closeCallBack);
        tmp = null;
    }
    constructor(private wasLastTrainingPlan: boolean = true, closeCallBack: Function = null) {
        super(0.2, 0.4, false);
        this.closeCallBack = closeCallBack;
    }

    preload() {
        this.assetsToLoad.push('assets/ui/done_for_today/doneForTodayAssets.json');
        super.preload();
    }

    public addContent() {
        this.content.align = 'CENTER';
        this.content.autoUpdate = false;
        const maxWidth: number = Math.min(RendererManager.instance.renderSettings.width * 0.7, 600);

        const animationContainer = new ContainerBase();
        this.content.addChild(animationContainer);

        const clock = new SimpleBitmap('done_today_clock01.psd');
        clock.uniformScale = 0.5;
        clock.alpha = 0.3;
        clock.anchor_ = new PIXI.Point(0.5, 0.5);
        clock.x = clock.width * 0.5;
        clock.y = clock.height * 0.5;
        animationContainer.addChild(clock);

        const longHand = new SimpleBitmap('done_today_long_hand01.psd');
        longHand.uniformScale = 0.5;
        longHand.anchor_ = new PIXI.Point(0.5, 0.5);
        longHand.x = clock.width * 0.5;
        longHand.y = clock.height * 0.5;
        longHand.rotation = Trigonometry.degreeToRad(360 / 12 * 0);
        animationContainer.addChild(longHand);
        Tweener.addTween(longHand, <TweenerOptions>{
            time: 1.5, transition: 'linear', rotation:
                Trigonometry.degreeToRad(360 / 12 * (12))
        });

        const shortHand = new SimpleBitmap('done_today_long_hand01.psd');
        shortHand.uniformScale = 0.5;
        shortHand.anchor_ = new PIXI.Point(0.5, 0.5);
        shortHand.x = clock.width * 0.5;
        shortHand.y = clock.height * 0.5;
        shortHand.rotation = Trigonometry.degreeToRad(360 / 12 * 2);
        animationContainer.addChild(shortHand);
        Tweener.addTween(shortHand, <TweenerOptions>{ time: 1.5, transition: 'linear', rotation: Trigonometry.degreeToRad(360 / 12 * 3) });

        const checkBox = new SimpleBitmap('done_today_checkbox01.psd');
        checkBox.uniformScale = 0.5;
        checkBox.centerRegistrationPoint();
        checkBox.x = clock.width * 0.25;
        checkBox.y = clock.height * 0.25;
        shortHand.rotation = Trigonometry.degreeToRad(360 / 12 * 2);
        animationContainer.addChild(checkBox);

        RevealEffect.create(checkBox, 2, 'POP');
        this.content.addChild(new VSpace(0));

        const closeButton = ButtonStyled.create('done', true);
        closeButton.clicked.add(this.onClose, this);

        this.content.addChild(closeButton);

        this.content.autoUpdate = true;

    }

    private onClose() {
        if (this.closeCallBack != null) {
            this.closeCallBack(this);
        }
        this.hide();
    }

    public dispose() {
        this.closeCallBack = null;

        super.dispose();
    }
}
