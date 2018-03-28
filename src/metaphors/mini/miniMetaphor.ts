import { MetaphorManager } from '../metaphorManager';
import { TrainingPlanScreen } from './trainingPlanScreen';
import { LoginScreen } from '../../screens/login/loginScreen';
import { ButtonStyled } from '../../ui/buttonStyled';
import { InsetFrame } from '@jwmb/pixelmagic/lib/ui/insetFrame';
import { Styles } from '../../ui/styles';
import { ProgVisualizerMini } from './progVisualizerMini';
import { LevelIndicator } from '../../ui/levelIndicator';
import { DialogBase } from '@jwmb/pixelmagic/lib/ui/dialogBase';
import { ViewResolverDefault } from '../../phasing/viewResolver';

export class MiniMetaphor extends MetaphorManager {
    constructor(data: any) {
        super(data);

        // TODO: should be in Styles

        DialogBase.defaultBackgroundName = 'cleanDialogBg.psd';
        DialogBase.defaultBackgroundScale9Rect = new PIXI.Rectangle(84, 77, 39, 48);
        DialogBase.defaultBackgroundScale = 2;

        ButtonStyled.defaultBackgroundName = 'cleanButtonBg1.psd';
        ButtonStyled.defaultBackgroundNameHilite = 'cleanButtonBg1.psd';
        ButtonStyled.defaultBackgroundScale9Rect = new PIXI.Rectangle(45, 52, 48, 2);
        ButtonStyled.defaultButtonScale = 2;
        ButtonStyled.defaultTextStyle = 'font_ui_magicButtons';
        ButtonStyled.defaultIconName = 'clean_icon_##.psd';

        InsetFrame.defaultBackgroundName = 'cleanInputFrame01.psd';
        InsetFrame.selectedBackgroundName = 'cleanInputFrame01.psd';
        InsetFrame.defaultBackgroundScale9Rect = new PIXI.Rectangle(20, 20, 91, 105);
        InsetFrame.defaultBackgroundScale = 2;

        LevelIndicator.defaultLevelIcon = 'clean_icon_levels.psd';
        LevelIndicator.defaultLevelFont = Styles.font_clean_levelmeterNumber;

        // StarAnimation.defaultGraphicsName = 'game_icon_background02.psd';
        // MetaphorManager.defaultShowMapButton = true;

        Styles.color_levelmeterBackground = 0xffffff;
        Styles.color_levelmeterBackgroundAlpha = 0.2;
        Styles.font_map_label = { font: '18px CleanLight', fill: 'white' };
        Styles.font_ui_title = { font: '26px CleanLight', fill: 'white' };
        Styles.font_ui_texts = { font: '18px CleanLight', fill: 'white' };
        Styles.font_ui_texts_centered = { font: '18px CleanLight', fill: 'white' };
        Styles.font_ui_create_account_text = { font: '18px CleanLight', fill: 'white' };
    }

    public getAssetsToLoad(): any[] {
        return [
            'assets/ui/buttons.json',
            // 'assets/ui/magicalUIAssets.json',
            'assets/ui/cleanUIAssets.json',
            'assets/achievements/achievements.json'
        ];
    // return [];
    }
    public getIsHorizontal() {
        return true;
    }
    public getGlobalBackgroundClass(): Function {
        return null;
    }
    public getMenuClass(): Function {
        return TrainingPlanScreen;
    }
    public getLoginClass(): Function {
        return LoginScreen;
    }
    protected getPhaseViewClassesResolverConstructor(): Function {
        return ViewResolverDefault;
    }
    public getDefaultHalfScreenProgressVisualizer(): Function {
        return ProgVisualizerMini;
    }
    public getDefaultFullScreenProgressVisualizer(): Function {
        return ProgVisualizerMini;
    }
}

// export class LoginScreenClean extends LoginScreen {
//     constructor() {
//         super();
//         this.loginSettings={allowInAppAccountCreation:true, allowSaveUserName:true};
//     }

//     public preload(){
//         this.assetsToLoad.push("assets/clean/ui/clean_background01.png");
//         super.preload();
//     }
// }
