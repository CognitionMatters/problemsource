import { PageType, App } from '@jwmb/pixelmagic/lib/app/app';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { MetaphorManager } from './metaphors/metaphorManager';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { GameState } from './gameState';
import { ScreenBase } from '@jwmb/pixelmagic/lib/ui/screenBase';
import { Version } from '@jwmb/pixelmagic/lib/utility/version';
import { DeviceEx, DevicePlatform } from '@jwmb/pixelmagic/lib/utility/deviceEx';
import { DialogAlert } from './ui/dialogAlert';
import { AppSettings } from './appSettings';
import { NotificationField } from '@jwmb/pixelmagic/lib/ui/notificationField';
import { HotCodePush } from '@jwmb/pixelmagic/lib/utility/hotCodePush';
import { TestStatistics } from './toRemove/testStatistics';
import { ExerciseScreen } from './games/exerciseScreen';
import { RenderSettings, ScaleMode, RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
// import { SoundHTMLAudio } from '@jwmb/pixelmagic/lib/audio/htmlAudio/htmlAudio';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { PlanetBundler } from './trainingPlan/PlanetBundler';
import { EndOfDayLogItem } from './toRemove/logItem';
import { TriggerManager } from './triggerManager';
import { TriggerCriteriaDefaults } from './triggerCriteriaDefaults';
import { GameStateAvoidCircular } from './gameStateAvoidCircular';
import { TrainingPlan } from './trainingPlan/TrainingPlan';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { FPSDisplay } from '@jwmb/pixelmagic/lib/ui/fpsDisplay';
import { HTMLAudioStrategy } from '@jwmb/audiojs';

export class CognitionMattersPageType extends PageType {
    public static PAGE_LOGIN = <CognitionMattersPageType>(<any>'PAGE_LOGIN');
    public static PAGE_MAP = <CognitionMattersPageType>(<any>'PAGE_MAP');
    public static PAGE_EXERCISE = <CognitionMattersPageType>(<any>'PAGE_EXERCISE');
}


export class CognitionMattersApp extends App {
    public idleTimeout;
    private singleFrameTimeout: number;
    public appVersion;
    public appName;
    public buildDate: Date;
    public appVersionUpdatedTo: string;
    public globalBackground: ContainerBase;

    // getScreenPos moved to rendererManager

    constructor() {
        super();
        /*##INSERT BEGIN buildDate##*/
        this.buildDate = new Date(2000, 0, 1);
        /*##INSERT END buildDate##*/

        const renderSettings = new RenderSettings();
        renderSettings.height = 768;
        renderSettings.maxHeight = 768;
        renderSettings.width = 1024;
        renderSettings.maxWidth = 1024;
        // renderSettings.height = 1024;
        // renderSettings.maxHeight = 1024;
        // renderSettings.width = 768;
        // renderSettings.maxWidth = 768;

        renderSettings.renderOptions = <any>{ backgroundColor: 0x000000 };
            // TODO: set background color in pixi in other way (deprecated?)
        renderSettings.renderer = PIXI.RENDERER_TYPE.CANVAS; // WEBGL CANVAS
        renderSettings.scaleMode = ScaleMode.SCALE_PROPORTIONALLY;
        RendererManager.applyPresetRenderSettings(renderSettings);
        // window.addEventListener('orientationchange', () => {
        //    var getHorizontal = Math.abs(<number>window.orientation) == 90;
        //    if (ConsoleCmdRenderer.getSizeIsHorizontal() == getHorizontal) { //only switch if we're not already in correct mode
        //        return;
        //    }
        //    var settings = App.instance.rendererManager.renderSettings;
        //    ObjectUtils.merge(settings, ConsoleCmdRenderer.getSizeSettings(getHorizontal));
        //    ConsoleCmdRenderer.updateRendererSize(settings);
        //    //new DialogAlert({ text: "Switched orientation. Now horizontal? " + getHorizontal
        //        + " " + settings.width + "x" + settings.height
        // });
        // });

        // Vektor Cognition Flex
        this.appName =
            /*##INSERT BEGIN config.widget.name##"<v>"*/
            'Cognition Flex';
        /*##INSERT END config.widget.name##*/

        let fontsToLoad = [
            ['OswaldRegular', 'fonts/Oswald/Oswald-Light.ttf'],
            ['OswaldBold', 'fonts/Oswald/Oswald-Regular.ttf']
        ];
        if (this.appName === 'Cognition Flex') { // TODO: move to metaphor
            fontsToLoad = fontsToLoad.concat([
                ['CleanThin', 'fonts/WorkSans/WorkSans-Thin.ttf'],
                ['CleanExtraLight', 'fonts/WorkSans/WorkSans-ExtraLight.ttf'],
                ['CleanLight', 'fonts/WorkSans/WorkSans-Light.ttf'],
                ['CleanRegular', 'fonts/WorkSans/WorkSans-Regular.ttf']
            ]);
        }

        DeviceEx.instance = new DeviceEx((<any>window).device); // TODO: <Device>
        if ((<any>window).Keyboard && (<any>window).Keyboard.shrinkView) {
            (<any>window).Keyboard.shrinkView(false);
        }
        this.init(renderSettings, fontsToLoad);

        AppSettings.load();

        this.idleTimeout = 10;
        this.singleFrameTimeout = -1; // window.isPhonegap ? 3000 : -1; //this.isDev
        this.appVersion =
            /*##INSERT BEGIN config.widget.version##"<v>"*/
            '1.5.9';
        /*##INSERT END config.widget.version##*/

        this.timeLastUpdate = Date.now();

        if (DeviceEx.instance.platformDefined === DevicePlatform.iOS && (<any>window).StatusBar && (<any>window).StatusBar.hide) {
            (<any>window).StatusBar.hide();
        }

        SoundPlayer.instance.classForSoundStrategy = HTMLAudioStrategy;

        Logger.create();
        Logger.info('App started');

        if (this.urlParameters['fakedate']) {
            this.fakeDate(this.urlParameters['fakedate']);
        }

        if (this.isDev) {
            SR.instance.importCsv('assets/StringResources.txt');
        }

        // get app version no
        const tmpAppVersionUpdatedTo =
            /*##INSERT BEGIN config.widget.version##"<v>"*/
            '';
        /*##INSERT END config.widget.version##*/
        this.appVersionUpdatedTo = tmpAppVersionUpdatedTo || '' + this.appVersion;
        if ((<any>window).isPhonegap) {
            if ((<any>window).AppVersion && (<any>window).AppVersion.version) {
                this.appVersion = (<any>window).AppVersion.version;
            } else {
                // try { // old plugin:
                //     window.getAppVersion((version) => {
                //         this.appVersion = version;
                //         this.appVersionUpdatedTo = tmpAppVersionUpdatedTo || '' + this.appVersion;
                //     });
                // } catch (err) {
                //     Logger.info('getAppVersion failed: ' + err);
                // }
            }
        }

        TrainingPlan.onGetTrainingPlanData = () => GameState.getCurrentTrainingPlanData();
        this.elementRestartWarning = document.getElementById('restartWarning');
        if (this.elementRestartWarning) {
            this.elementRestartWarning.parentNode.removeChild(this.elementRestartWarning);
        }

        const tm = new TriggerManager(TriggerCriteriaDefaults.get());

        // this.inited.add(() => this.addContent());
        this.inited.addOnce(this.addContent, this);
    }

    private isPaused = false;
    onPauseEvent() {
        if (!this.isPaused) {
            this.updateManager.stop();
        }
        this.isPaused = true;
    }
    onResumeEvent() {
        // var txt = SR.get("btn_start");
        if (this.isPaused) {
            this.updateManager.start();
        } else {
            // txt += " *";
        }
        // new DialogAlert({ title: "#btn_OK", text: txt, buttonText: "OK", closeCallback: () => { } });
        this.isPaused = false;
    }

    public updateGlobalBackground() {
        const globalBackgroundClass: any = MetaphorManager.instance.getGlobalBackgroundClass();
        if (globalBackgroundClass == null) {
            if (this.globalBackground) {
                this.globalBackground.dispose();
                this.globalBackground = null;
            }
        } else {
            if (this.globalBackground instanceof globalBackgroundClass) {

            } else {
                if (this.globalBackground) {
                    this.globalBackground.dispose();
                }
                this.globalBackground = new globalBackgroundClass();
                this.pageContainer.addChildAt(this.globalBackground, 0);
            }
        }
    }

    private pixiDomSetup() {
        // TODO: !!!
        // PIXI.DOM.Setup(this.rendererManager.renderer, false, false);
    }
    private pixiDomResize() {
        // const canvas = this.rendererManager.renderer.view;
        // (<any>PIXI.DOM).rendererScale = canvas.clientWidth / canvas.width;
    }

    private addContent() {
        // TODO: should be the language that was used last time?
        SR.instance.preferredLanguage = 'en-US'; // sv-SE en-US fi-FI
        const cultureCodeOverride = this.urlParameters.cultureCode || (<any>window).cultureCode;
        if (cultureCodeOverride && SR.instance.languageOrder.indexOf(cultureCodeOverride) >= 0) {
            SR.instance.preferredLanguage = cultureCodeOverride;
        }

        // Default to Magic theme
        // TODO: should be last theme used?
        // const defaultTheme = this.appName === 'Cognition Flex' ? CleanMetaphor : MagicalMetaphor; // MagicalMetaphor CleanMetaphor
        MetaphorManager.initFromString(this.appName === 'Cognition Flex' ? 'CleanMetaphor' : 'MagicalMetaphor', {});

        // (<any>PixelMagic).SoundManagerOrg = (<any>PixelMagic).SoundManager;
        // if (WebAudio.Context.audioContext) {
        //     (<any>PixelMagic).SoundManager = <SoundManager><any>PixelMagic.WebAudio.SoundManager2;
        // }

        this.pixiDomSetup();

        this.rendererManager.resized.add(() => this.onReSize); // , this);
        this.onReSize();

        NotificationField.i.fOpenStatusDisplay = (options: { text: string, title?: string, callback?: () => void }) => {
            DialogAlert.create({
                text: options.text,
                title: options.title || 'INFO', removePreviousDialog: false, closeCallback: options.callback
            });
        };
        NotificationField.i.fGetPIXIField = (current: SimpleText) => {
            if (current) { return current; }
            const field = new SimpleText('', { font: '18px Verdana', fill: '#6699cc' }, false,
                RendererManager.instance.renderSettings.width);
            field.x = 0;
            field.y = RendererManager.instance.renderSettings.height - field.height;
            (<CognitionMattersApp>App.instance).overlayContainer.addChild(field);
            return field;
        };
        HotCodePush.bindEvents();
        HotCodePush.manualUpdate({});

        // Sound Manager
        SoundPlayer.instance.volume = this.urlParameters.soundvolume ? parseFloat(this.urlParameters.soundvolume) : 1;

        // Game State
        GameState.resetSessionVars();
        GameState.onSetTrainingPlanData = GameStateAvoidCircular.setTrainingPlanData;

        // Add prototypes/polyfills
        if (!Date.now) { // make sure Date objects have Now function on all platforms
            Date.now = function now() {
                return +(new Date);
            };
        }

        this.showPage(CognitionMattersPageType.PAGE_LOGIN);
        this.updateManager.updated.add((delta) => this.update(delta)); // , this);

        // WebAudio.Sound.playSound("assets/sound/background/menu_background.mp3");
        // WebAudio.Sound.playSound("assets/sound/fx/swoop_chime_bar.mp3");

        // AssetLoader.load(['assets/magical/ui/beta.png'], () => {
        //     var betaImg = new SimpleBitmap("assets/magical/ui/beta.png");
        //     betaImg.y = 10;
        //     betaImg.x = 1024 - betaImg.width - 10;
        //     betaImg.alpha = 0.1;
        //     this.overlayContainer.addChild(betaImg);
        // });

        // PixelMagic.PlanetBundler.mock();
        // PixelMagic.TestDynamicPlan.weighting();
        // new PixelMagic.TestDynamicNode().asdasd();
    }
    private isLoding = false;
    private timeLastUpdate;
    private dlgAlertRestart: DialogAlert;
    private update(deltaTime) {
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - this.timeLastUpdate;
        this.timeLastUpdate = currentTime;

        if (this.fps && FPSDisplay.msToFPS(Math.min.apply(null, this.fps.getHistory(7))) < 4) {
            if (!this.dlgAlertRestart && (<any>window).isPhonegap) {
                const fpsHistory = this.fps.getHistory(7).map(_ =>
                    FPSDisplay.msToFPS(_)).map(_ => (Math.round(_ * 10) / 10).toString()).join(' ');
                // this.forceQuit("FPS: " + fpsHistory);
                this.dlgAlertRestart = new DialogAlert(
                    { title: '#warningLowFPSTitle', text: '#warningLowFPSText', buttonText: 'NOBUTTON', removePreviousDialog: false });
            }
        } else if (this.dlgAlertRestart) {
            this.dlgAlertRestart.dispose();
            this.dlgAlertRestart = null;
        }
        if (this.idleTimeout > 0 && Date.now() > TestStatistics.instance.lastLogTime + (1000 * 60 * this.idleTimeout)) {
            location.reload();
        }
    }

    public checkPlatformRequirements(forceQuit: boolean): boolean {
        if (DeviceEx.instance.platformDefined === DevicePlatform.iOS) {
            const minVersion = new Version('8.2.0'); // 8.1.2
            if (DeviceEx.instance.versionEx.compare(minVersion) < 0) { //   deviceVersion
                const text = SR.get('errorIOSVersionLow').replace('{0}', minVersion.toString());
                try { // might be called before resources are loaded, if so use regular alert
                    DialogAlert.create({
                        title: '#error', text: text,
                        closeCallback: () => { if (forceQuit) { this.forceQuit(); } }
                    });
                } catch (err) {
                    alert(text);
                    if (forceQuit) {
                        this.forceQuit();
                    }
                }
                return false;
            }
        }
        return true;
    }

    private elementRestartWarning: HTMLElement;
    public forceQuit(additionalInfo: string = null) {
        try {
            (<any>navigator).app.exitApp();
            // location.reload();
        } catch (err) {
            try {
                (<any>window).device.exitApp();
            } catch (err2) {
            }
            let el = document.getElementById('pixelMagicContainer');
            if (el) {
                if (el.parentElement) {
                    el.parentElement.removeChild(el);
                }
                if (this.elementRestartWarning) {
                    el = this.elementRestartWarning; // document.getElementById("restartWarning");
                    if (el) {
                        document.body.appendChild(el);
                        el.style.visibility = 'visible';
                        const elWarningTitle = <HTMLHeadingElement>document.getElementById('restartWarningTitle');
                        if (elWarningTitle) {
                            if (SR.getIfExists('restartWarningTitle')) {
                                elWarningTitle.textContent = SR.getIfExists('restartWarningTitle');
                            }
                        }
                        if (additionalInfo) {
                            el = document.getElementById('restartWarningInfo');
                            if (el) {
                                el.textContent = additionalInfo;
                            }
                        }
                    }
                }
            }
        }
    }

    public showPage(pageId: CognitionMattersPageType, data?: any) {
        if ((<any>window).Keyboard && (<any>window).Keyboard.hide) {
            (<any>window).Keyboard.hide();
        }

        DoLater.execute(this, () => {
            const tmpCurrentPage = this.currentPage;
            // if(this.currentPage){
            //    this.currentPage.dispose();
            // }

            try {
                if (pageId === CognitionMattersPageType.PAGE_LOGIN) {
                    const loginScreen: any = MetaphorManager.instance.getLoginClass();
                    this.currentPage = new loginScreen();

                } else if (pageId === CognitionMattersPageType.PAGE_MAP) {
                    const mapScreen: any = MetaphorManager.instance.getMenuClass();
                    const useHorizontal = mapScreen.useHorizontal; // TODO: should be part of interface!
                    if (useHorizontal !== RendererManager.getSizeIsHorizontal()) {
                        RendererManager.updateRendererSizeHorV(useHorizontal);
                    }
                    this.currentPage = new mapScreen();


                } else if (pageId === CognitionMattersPageType.PAGE_EXERCISE) {
                    GameState.sessionVars.currentTestId = data.id;
                    const nextPage: ScreenBase = ExerciseScreen.create(data, () => {
                        if (GameState.checkIfTimeIsUp(0)) {
                            this.showTimeIsUpDialog();
                        } else {
                            this.showPage(CognitionMattersPageType.PAGE_MAP);
                        }
                     });
                    // if (!nextPage) {
                    //    nextPage = new TestScreen(data);
                    // }
                    this.currentPage = nextPage;
                } else {
                    throw new Error('No such pageId');
                }
            } catch (err) {
                Logger.error(err);
                // TODO: maybe this.forceQuit();
                return;
            }
            if (tmpCurrentPage) {
                tmpCurrentPage.dispose();
            }
            this.currentPage.init();
            this.pageContainer.addChild(this.currentPage);
        }, 0);
    }


    public showTimeIsUpDialog() {
        // var isLastTrainingPlan = true; //GameState.trainingPlanIndex >= GameState.trainingSettings.timeLimits.length-1;
        // if (isLastTrainingPlan) {
        MetaphorManager.instance.showEndOfDayActions(() => {
            TestStatistics.instance.logEvent(new EndOfDayLogItem({ training_day: GameState.getTrainingDay() }));
            App.instance.showPage(CognitionMattersPageType.PAGE_LOGIN);
        });
        // } else {
        //    MetaphorManager.instance.showEndOfTimeLimitActions();
        // }
    }
    public onReSize() {
        // RendererManager.instance.renderSettings.width = this.rendererManager.stageWidth;
        // RendererManager.instance.renderSettings.height = this.rendererManager.stageHeight;
        // Settings.appScale = 1;
        (<PIXI.SystemRenderer>(<any>this.rendererManager)._renderer).view.style.marginLeft =
            ((document.getElementById('pixelMagicContainer').clientWidth
                - document.getElementsByTagName('canvas')[0].clientWidth) / 2) + 'px';
        this.pixiDomResize();
    }

    public fakeDate(faketime: string) {
        const timemachine = <any>{};
        throw new Error('timemachine please!');
        // let faketimeDate: string = null;
        // let faketimeDiff = 0;
        // const timeMeasures = {
        //     'w': 7 * 24 * 60 * 60 * 1000, 'd': 24 * 60 * 60 * 1000,
        //     'h': 60 * 60 * 1000, 'm': 60 * 1000
        // };
        // const faketimeRx = new RegExp('-?' + Object.keys(timeMeasures).map(_ => '(\\d+' + _ + ')?').join(''));
        // const faketimeRxResult = faketimeRx.exec(faketime);
        // if (faketime.indexOf(' ') > 0) { // 'December 25, 1991 13:12:59'
        //     faketimeDate = faketime;
        // } else if (faketimeRxResult.length) {
        //     faketimeRxResult.splice(0, 1);
        //     const tmp = timemachine.originalNow();
        //     faketimeDiff = faketimeRxResult.filter(_ => _ ? true : false).map(_ => {
        //         const unit = _.substr(_.length - 1);
        //         return parseInt(_.substr(0, _.length - 1), 10) * timeMeasures[unit];
        //     }).reduce((p, c) => p + c);
        //     faketimeDiff *= faketime[0] === '-' ? -1 : 1;
        //     // let tmpDate = new Date(timemachine.originalNow() + faketimeDiff);
        // }
        // // https://github.com/schickling/timemachine
        // timemachine._apply();
        // timemachine.config({
        //     dateString: faketimeDate,
        //     // timestamp: Date.now() + 24 * 60 * 60 * 1000,
        //     keepTime: faketimeDiff !== 0,
        //     difference: faketimeDiff === 0 ? null : faketimeDiff,
        //     tick: true
        // });
        // Logger.info('FakeDate:' + new Date().toISOString());
    }
}
