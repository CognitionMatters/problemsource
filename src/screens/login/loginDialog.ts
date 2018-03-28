import { BitmapButton } from '@jwmb/pixelmagic/lib/ui/BitmapButton';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { Styles } from '../../ui/styles';
import { LoginSettings } from './loginScreen';
import { CognitionMattersApp } from '../../app';
import { Checkbox } from '@jwmb/pixelmagic/lib/ui/checkbox';
import { InsetFrame } from '@jwmb/pixelmagic/lib/ui/insetFrame';
import { ButtonStyled } from '../../ui/buttonStyled';
import { SignalBinding } from '@jwmb/signal';
import { DialogBase } from '@jwmb/pixelmagic/lib/ui/dialogBase';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { UpdateManager } from '@jwmb/pixelmagic/lib/app/updateManager';
import { PIXIDom, PIXIDomSprite } from '@jwmb/pixelmagic/lib/pixiUtils/pixiDOM';

export class LoginDialog extends DialogBase {
    // Todo: Move to static url container class.
    private defaultUserName: string;
    private loginCallBack: Function;
    private usernameInput: PIXIDomSprite; // PIXI.DOM.Sprite; PIXIDomSprite ContainerBase
    private loginButton: BitmapButton;
    private resizeBinding: SignalBinding;
    private saveUsernameCheckbox: Checkbox;

    constructor(defaultUserName = '', loginCallBack: Function = null, private loginSettings: LoginSettings) {
        super();

        this.defaultUserName = defaultUserName;

        this.loginCallBack = loginCallBack;
    }

    public static create(defaultUserName = '', loginCallBack: Function = null, loginSettings: LoginSettings) {
        let tmp = new LoginDialog(defaultUserName, loginCallBack, loginSettings);
        tmp = null;
    }

    public preload() {
        super.preload();
    }

    public addContent() {
        // App.instance.overlayContainer.addChild(new PixelMagic.Exercises.NVR.TestBench());

        this.content.align = 'LEFT';
        const maxWidth: number = Math.min(RendererManager.instance.renderSettings.width * 0.7, 600);

        const title = new SimpleText('#loginTitle', Styles.font_ui_title, true, maxWidth);
        this.content.addChild(title);

        // var useUppercase = false;
        // var sizeStyle = '';
        const inputFrame = new InsetFrame(300, 45);

        const useUppercase = true;
        const placeholder = SR.get('userNamePlaceholder');
        if (useUppercase) {
            // placeholder = placeholder.toUpperCase();
        }
        const domContainer = document.getElementById('pixelMagicContainer');
        const canvasElement = domContainer.firstElementChild;
        const rect = canvasElement.getBoundingClientRect();
        this.usernameInput = new PIXIDomSprite('<input id="userNameInput" ' + ' type="text" autocapitalize="'
            + (useUppercase ? 'characters' : 'off') + '" autocorrect="off" autocomplete="off" value="'
            + this.defaultUserName + '" placeholder="' + placeholder + '" />', { x: 0, y: 0 }); // + '" ' + 'onkeypress="alert(1234)"'
        // this.usernameInput = new ContainerBase(); // ('cognition_matters_logo.png');
        inputFrame.addChild(this.usernameInput);
        const inputElement = <HTMLElement>(<any>this.usernameInput).domElement;
        const adjustInputElement = () => {
            if (inputElement) {
                inputElement.style.left = ((document.getElementById('pixelMagicContainer').clientWidth
                    - document.getElementsByTagName('canvas')[0].clientWidth) / 2) + 'px';
            }
        };
        UpdateManager.instance.postRendered.addOnce(() => {
            // TODO: need to remove this listener?
            if (inputElement) {
                inputElement.addEventListener('keypress', this.onInputKeyPress.bind(this));
                adjustInputElement();
            }
        });
        this.content.addChild(inputFrame);


        const row = new ContainerBase();
        if (this.loginSettings.allowSaveUserName) {
            this.saveUsernameCheckbox = new Checkbox(true, 'save user name');
            row.addChild(this.saveUsernameCheckbox);
        }
        this.resizeBinding = RendererManager.instance.resized.add(() => adjustInputElement());

        this.loginButton = ButtonStyled.create('login', true);
        this.loginButton.clicked.add(this.onLogin, this);
        row.addChild(this.loginButton);
        this.loginButton.x = (this.usernameInput ? this.usernameInput.width : 0) - this.loginButton.width;

        this.content.addChild(row);

        // add version/date
        this.content.autoUpdate = false;
        const date = (<CognitionMattersApp>App.instance).buildDate;
        let dateStr = '';
        if (date) {
            dateStr = date.getDate() + '/' + (date.getMonth() + 1) + ' ' + date.getHours() + ':' + date.getMinutes();
        }
        const isUpdated = (<CognitionMattersApp>App.instance).appVersionUpdatedTo
            && (<CognitionMattersApp>App.instance).appVersionUpdatedTo !== (<CognitionMattersApp>App.instance).appVersion;
        const versionNo = new SimpleText('' + (isUpdated ? '*' : '')
            + (<CognitionMattersApp>App.instance).appVersionUpdatedTo + '   (' + dateStr + ')', Styles.font_app_version, false, maxWidth);
        versionNo.x = 0;
        versionNo.y = this.content.height - versionNo.height;
        this.content.addChild(versionNo);

        // if autologin is set in url, go to map automatically
        if (App.instance.urlParameters.autologin) {
            DoLater.execute(this, () => {
                this.onLogin(null, App.instance.urlParameters.autologin);
            }, 0);
        }


    //     // sound tests
    //     // var testButtons=new VList();
    //     // testButtons.y=this.loginButton.y + this.loginButton.height;
    //     // testButtons.uniformScale=0.8;
    //     // this.content.addChild(testButtons);
    //     //
    //     // var soundSuffix=".mp3"
    //     // var button1=ButtonStyled.create("Play effect");
    //     // button1.clicked.add(()=>{
    //     //    SoundManager.instance.playEffect("fanfare");
    //     // }, this);
    //     // testButtons.addChild(button1);
    //     //
    //     // var button2=ButtonStyled.create("Start background");
    //     // button2.clicked.add(()=>{
    //     //    SoundManager.instance.playBackground("menu_background");
    //     // }, this);
    //     // testButtons.addChild(button2);
    //     //
    //     // var button3=ButtonStyled.create("Stop background");
    //     // button3.clicked.add(()=>{
    //     //    SoundManager.instance.stopBackground();
    //     // }, this);
    //     // testButtons.addChild(button3);
    //     //
    //     // var button4=ButtonStyled.create("Play voiceover");
    //     // button4.clicked.add(()=>{
    //     //    SoundManager.instance.playVoiceOver("addapp_dialog05");
    //     // }, this);
    //     // testButtons.addChild(button4);
    //     //
    //     // var button5=ButtonStyled.create("Play voiceover, with");
    //     // button5.clicked.add(()=>{
    //     //    SoundManager.instance.playVoiceOver("addapp_dialog05", 1, ()=>{alert("sound complete")});
    //     // }, this);
    //     // testButtons.addChild(button5);
    //     //
    //     // var button6=ButtonStyled.create("Play delayed sound effect");
    //     // button6.clicked.add(()=>{
    //     //    new DoLater(this, ()=>{SoundManager.instance.playEffect("fanfare");}, 2);
    //     // }, this);
    //     // testButtons.addChild(button6);
    //     //
    //     // var button7=ButtonStyled.create("Play delayed voiceover effect");
    //     // button7.clicked.add(()=>{
    //     //    new DoLater(this, ()=>{SoundManager.instance.playVoiceOver("addapp_dialog05");}, 2);
    //     // }, this);
    //     // testButtons.addChild(button7);
    }

    public addBackground() {
        super.addBackground();
        this.overlay.visible = false;
    }

    private get inputHTMLElement(): HTMLInputElement {
        if (this.usernameInput) {
            return <HTMLInputElement>(<any>this.usernameInput).domElement;
        }
        return null;
    }
    private onInputKeyPress(e: KeyboardEvent) {
        if (e.keyCode === 13) {
            if (this.inputHTMLElement && this.inputHTMLElement.value) {
                this.onLogin();
            }
        }
    }
    public onLogin(t: any = null, userName: string = ''): void {
        if (userName === '') {
            const usernameInputDOM = <HTMLInputElement>document.getElementById('userNameInput');
            userName = (usernameInputDOM ? usernameInputDOM.value : '') || 'testaccount';
            if (userName === '') {
                this.loginButton.enabled = true;
                return;
            }
        }

        let saveUserName = false;
        if (this.saveUsernameCheckbox && this.saveUsernameCheckbox.value === true) {
            saveUserName = true;
        }


        if (this.loginCallBack != null) {
            console.log('login using: ' + userName);
            this.loginCallBack(userName, saveUserName);
            this.dispose(); // this.hide();
        }
    }

    public dispose() {
        if (this.usernameInput) {
            const inputElement = <HTMLElement>(<any>this.usernameInput).domElement;
            if (inputElement) {
                inputElement.removeEventListener('keypress', this.onInputKeyPress.bind(this));
            }
            this.usernameInput.destroy();
            this.usernameInput = null;
            if (PIXIDom.instance) {
                PIXIDom.instance.deactivate();
            }
        }
        if (this.resizeBinding) {
            this.resizeBinding.detach();
        }

        this.loginButton = null;
        this.loginCallBack = null;

        super.dispose();
    }
}
