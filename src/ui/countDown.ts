import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { ClickableBehavior } from '@jwmb/pixelmagic/lib/components/clickableBehavior';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { Styles } from './styles';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { RevealEffect } from './effects/RevealEffect';

export class CountDown extends ContainerBase {

    private label: SimpleText;

    constructor(private counter: number = 5, private onReady: Function = null) {
        super();

        const clickComponent = new ClickableBehavior(this, this);
        clickComponent.clicked.add(() => this.onComplete());
        // this.components.addComponent(clickCompontent);

        this.next();

        if (App.instance.urlParameters.nocountdown) {
            DoLater.execute(this, this.onComplete, 0);
        }
    }

    private next() {
        this.counter--;

        if (this.label) {
            this.label.dispose();
            this.label = null;
        }

        if (this.counter > 0) {
            let countString: String = '';
            let soundName: String = '';
            if (this.counter === 3) {
                countString = '2';
                soundName = 'ready';
            }
            if (this.counter === 2) {
                countString = '1';
                soundName = 'set';
            }
            if (this.counter === 1) {
                countString = '0';
                soundName = 'go';
            }
            if (countString !== '') {
                this.label = new SimpleText('' + countString, Styles.font_CountDown);
                this.label.pivot.x = this.label.width * 0.5;
                this.label.pivot.y = this.label.height * 0.3;
                // this.label.rotation=-0.2;
                this.addChild(this.label);

                const tmpFx = new RevealEffect(this.label, 0, 'POP', false);

                SoundPlayer.instance.playEffect('countdown_' + soundName);
            }

            DoLater.execute(this, this.next, 1);
        } else {
            this.onComplete();
        }


    }

    private onComplete() {
        if (this.onReady != null) {
            this.onReady();
        }
        this.dispose();
    }

    public dispose() {
        super.dispose();
        DoLater.removeAllObjectFunctions(this);
        this.onReady = null;
        this.label = null;
    }
}
