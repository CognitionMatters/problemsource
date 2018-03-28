import { ScreenBase } from '@jwmb/pixelmagic/lib/ui/screenBase';
import { AssetLoader } from '@jwmb/pixelmagic/lib/app/AssetLoader';
import { NotificationField } from '@jwmb/pixelmagic/lib/ui/notificationField';
import { MetaphorManager } from '../../metaphors/metaphorManager';
import { CognitionMattersApp, CognitionMattersPageType } from '../../app';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { HotCodePush } from '@jwmb/pixelmagic/lib/utility/hotCodePush';
import { DialogAlert } from '../../ui/dialogAlert';
import { AppSettings } from '../../appSettings';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { DialogGeneric } from '../../ui/dialogGeneric';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { IUserFullState } from '../../toRemove/logItem';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { Styles } from '../../ui/styles';
import { ClickableBehavior } from '@jwmb/pixelmagic/lib/components/clickableBehavior';
import { Spinner } from '../../ui/spinner';
import { StateLog } from '../../toRemove/stateLog';
import { LoginDialog } from './loginDialog';
import { LoginLogic, LoggedInResultOK, LoggedInResultDoneToday, LoggedInResultError } from './loginLogic';
import { AJAXResult } from '../../toRemove/webRequest';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class LoginSettings {
    public allowInAppAccountCreation?: boolean;
    public allowSaveUserName?: boolean;
}

export class LoginScreen extends ScreenBase {
    private static createAccountUrl = 'http://www.cognitionmatters.org/create-account'; // create-account-from-app
    private showCreateAccountLink = true;
    private loginDialog;

    constructor() {
        super();
    }

    public init() {
        AssetLoader.unloadAssets();

        if (StateLog.instance != null) {
            StateLog.instance.syncIfNewLocalData();
        }
        if (NotificationField.i) {
            NotificationField.i.clearStatus();
        }

        this.assetsToLoad = this.assetsToLoad.concat(MetaphorManager.instance.getAssetsToLoad());
        this.preload();
    }

    public preload() {
        this.assetsToLoad.push('assets/ui/cognition_matters_logo.png');
        super.preload();
    }

    public loadComplete() {
        // TODO: should be handled internally by CognitionMattersApp, but resources aren't loaded
        if (!(<CognitionMattersApp>App.instance).checkPlatformRequirements(true)) {
            return;
        }

        (<CognitionMattersApp>App.instance).updateGlobalBackground();
        this.addContent();

        if (HotCodePush.isInstalling) {
            const dlg = new DialogAlert({ title: 'N/A', text: 'Installing update, please wait...', buttonText: 'NOBUTTON' });
            const spinner = new Spinner();
            // var rct = dlg.getLocalBounds();
            // var pt = dlg.getGlobalPosition(new PIXI.Point(0, rct.y + rct.height));
            spinner.position = new PIXI.Point(RendererManager.instance.renderSettings.width / 2,
                RendererManager.instance.renderSettings.height / 2 + 75); // pt.y + 50
            this.addChild(spinner);
        } else {
            this.showLoginDialog();
        }
    }

    public addContent() {
        const logo = new SimpleBitmap('assets/ui/cognition_matters_logo.png');
        this.addChild(logo);
        logo.uniformScale = 0.5;
        logo.x = 10;
        logo.y = 10;

        // var isAndroid = (<any>window).device && (<any>window).device.platform && /^(Android)/.test((<any>window).device.platform);
        // if (isAndroid) {
        //    this.showCreateAccountLink = false;
        // }

        // if (this.showCreateAccountLink) {
        //     const createAccountButton = new ContainerBase();
        //     const createAccountText = SR.get('create_account_text');
        //     // var createAccountText = SR.get("create_account_go_to_site");
        //     // if (this.loginSettings.allowInAppAccountCreation) {
        //     //    createAccountText = SR.get("create_account_text");
        //     // }
        //     createAccountButton.addChild(new SimpleText(createAccountText, Styles.font_ui_create_account_text, false));
        //     const clickBehaviour = new ClickableBehavior(createAccountButton, createAccountButton);
        //     clickBehaviour.clicked.add(() => {
        //         if (this.loginSettings.allowInAppAccountCreation === true) {
        //             new GenerateAccountDialog((username) => {
        //                 this.showLoginDialog(username);
        //             });
        //         } else {
        //             this.openUrl(LoginScreen.createAccountUrl);
        //         }
        //     }, this);
        //     this.addChild(createAccountButton);
        //     createAccountButton.x = RendererManager.instance.renderSettings.width - createAccountButton.width - 12;
        //     createAccountButton.y = logo.y + logo.height * 0.5 - createAccountButton.height * 0.5;
        // }
    }

    protected loginSettings: LoginSettings = new LoginSettings();
    public showLoginDialog(username = '') {
        let presetUsername = '';

        // if (false) { //Display latest used login
        //     if (UserLocalStore.globalCacheSettings.latestUuid) {
        //         presetUsername = UserLocalStore.globalCacheSettings.latestUuid;
        //     }
        // }
        // if (!(<any>window).device || window.location.host.indexOf('localhost') >= 0) {
        //     presetUsername = this.developerUserShortcuts(presetUsername);
        // }

        if (AppSettings.data && AppSettings.data.savedUserName) {
            presetUsername = AppSettings.data.savedUserName;
        }

        if (username !== '') {
            presetUsername = username;
        }

        this.loginDialog = new LoginDialog(presetUsername, (username_, saveUsername) => {
            this.confirmNameAndLogin(username_, saveUsername);
        }, this.loginSettings);

        // var createAccountButton = ButtonStyled.create("createaccount", true, "small");
        // createAccountButton.clicked.add(() => {
        // 		window.open("http://www.cognitionmatters.org/create-account", '_system');
        // }, this);
        // this.addChild(createAccountButton);
        // createAccountButton.visible = false;
    }

    public confirmNameAndLogin(username: string, saveUsername: boolean) {
        if (AppSettings.data.savedUserName !== '' && (username !== AppSettings.data.savedUserName || saveUsername === false)) {
            const title = SR.get('clearAccountWarningTitle');
            let message = SR.get('clearAccountWarningMessage');
            message = message.split('[USERID]').join(AppSettings.data.savedUserName);
            DialogAlert.create({ title: title, text: message, closeCallback: () => this.login(username, saveUsername) });
        } else {
            this.login(username, saveUsername);
        }
    }

    public login(username: string, saveUsername: boolean) {
        username = username.toLowerCase();

        if (saveUsername) {
            AppSettings.data.savedUserName = username;
        } else {
            AppSettings.data.savedUserName = '';
        }
        AppSettings.save();

        if (username.indexOf('..') === 0) {
            let cmd = username.substr(2);
            if (cmd === 'del') {
                localStorage.clear();
                DialogAlert.create({
                    title: 'btn_ok', text: 'localStorage cleared',
                    closeCallback: () => {
                        LoginDialog.create('', (username_, saveUsername_) => {
                            this.confirmNameAndLogin(username_, saveUsername_);
                        }, this.loginSettings);
                    }
                });
            } else if (cmd === 'cmd' || cmd.indexOf('!') === 0) {
                LoginDialog.create('', (username_) => this.confirmNameAndLogin(username_, saveUsername), this.loginSettings);
                const console = (<CognitionMattersApp>App.instance).consoleMgr;
                if (console) {
                    if (cmd === 'cmd') {
                        console.showToggleSwitch(true);
                    } else {
                        console.toggle();
                        cmd = cmd.substr(1);
                        const output = console.checkCommand(cmd);
                        if (output && (<any>output).result) {
                            Logger.info((<any>output).result);
                        }
                    }
                }
            }
            return;
        }

        const spinner = new Spinner();
        spinner.position = new PIXI.Point(RendererManager.instance.renderSettings.width / 2,
            RendererManager.instance.renderSettings.height / 2);
        this.addChild(spinner);

        LoginLogic.login(username)
            .then(result => {
                spinner.dispose();
                if (result instanceof LoggedInResultOK) {
                    const displayAppVersion = (<LoggedInResultOK>result).state.training_settings.customData
                        && (<LoggedInResultOK>result).state.training_settings.customData.displayAppVersion;
                    // AppVersionAccountDisplay.show(displayAppVersion);
                    App.instance.showPage(CognitionMattersPageType.PAGE_MAP, (<LoggedInResultOK>result).state.training_plan);
                    // App.instance.showPage(PageType.PAGE_MAP, (<LoggedInResultOK>result).state.training_plan);
                } else {
                    if (result instanceof LoggedInResultDoneToday) {
                        DialogGeneric.create({
                            title: '#doneTodayAlreadyTitle',
                            description: '#doneTodayAlreadyText',
                            closeButtonText: 'close'
                        }, () => App.instance.showPage(CognitionMattersPageType.PAGE_LOGIN)); // App.instance.showPage(PageType.PAGE_LOGIN)
                    } else if (result instanceof LoggedInResultError) {
                        DialogAlert.create({
                            text: result.error, closeCallback: () => {
                                App.instance.showPage(CognitionMattersPageType.PAGE_LOGIN);
                            }
                        });
                    } else {
                        DialogAlert.create({
                            text: 'Unknown login problem!', closeCallback: () => {
                                App.instance.showPage(CognitionMattersPageType.PAGE_LOGIN);
                            }
                        });
                    }
                }
            }, err => {
                spinner.dispose();
                if ((<any>err).appDownloadUrl) {
                    DialogAlert.create({
                        text: err.message, closeCallback: () => {
                            window.open(encodeURI((<any>err).appDownloadUrl), '_system');
                        }
                    });
                } else {
                    let errMsg = 'Sync error: ' + err.message;
                    if ((<any>err).status === 401) {
                        errMsg = SR.get('errorUserNotFound', { useIfNotFound: 'User not found!' });
                    } else {
                        if ((<AJAXResult>err).status === 0) {
                            errMsg = SR.get('errorNoInternet', { useIfNotFound: 'Couldn\'t reach server. Please try logging in again!' });
                        }
                    }
                    DialogAlert.create({
                        text: errMsg, closeCallback: () => {
                            App.instance.showPage(CognitionMattersPageType.PAGE_LOGIN);
                        }
                    });
                }
            });
    }

    private closeBrowser() {
        const svc = (<any>window).SafariViewController;
        if (svc) {
            svc.hide();
        }
    }


    private openUrlExternalBrowser(url: string) {
        window.open(url, '_system');
    }
    private openUrl(url: string, readerMode: boolean = false) {
        const svc = (<any>window).SafariViewController;
        if (!svc) {
            this.openUrlExternalBrowser(url);
            return;
        }
        svc.isAvailable(available => {
            if (available) {
                svc.show({
                    url: url,
                    hidden: false, // default false. You can use this to load cookies etc in the background (see issue #1 for details).
                    animated: false, // default true, note that 'hide' will reuse this preference
                    // (the 'Done' button will always animate though)
                    // transition: 'curl', // unless animated is false you can choose from: curl, flip, fade, slide (default)
                    enterReaderModeIfAvailable: readerMode, // default false
                    // tintColor: "#ff0000" // default is ios blue
                },
                    // this success handler will be invoked for the lifecycle events 'opened', 'loaded' and 'closed'
                    result => {
                        if (result.event === 'opened') {
                            Logger.info('opened');
                        } else if (result.event === 'loaded') {
                            Logger.info('loaded');
                        } else if (result.event === 'closed') {
                            Logger.info('closed');
                        }
                    },
                    msg => {
                        Logger.warn('KO: ' + msg);
                    });
            } else {
                this.openUrlExternalBrowser(url);
                //// potentially powered by InAppBrowser because that (currently) clobbers window.open
                // window.open(url, '_blank', 'location=yes');
            }
        });
    }
}

