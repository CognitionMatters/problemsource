import { TextStyleOptionsEx } from '@jwmb/pixelmagic/lib/ui/SimpleText';
import { Styles as baseStyles } from '@jwmb/pixelmagic/lib/ui/styles';

export class Styles { // TODO: use standard css for these instead?
    // public static font_notification: TextStyleOptionsEx = { font: '27px OswaldRegular', fill: 'white' };
    // public static font_instructions: TextStyleOptionsEx = { font: '22px OswaldRegular', fill: 'white' };

    // public static font_ui_title: TextStyleOptionsEx = { font: '36px OswaldBold', fill: 'black' };
    // public static font_ui_texts: TextStyleOptionsEx = { font: '18px OswaldRegular', fill: 'black' };

    // public static font_app_version: TextStyleOptionsEx = { font: '12px OswaldRegular', fill: 'black' };

    public static get font_notification() { return baseStyles.font_notification; }
    public static set font_notification(value) { baseStyles.font_notification = value; }

    public static get font_instructions() { return baseStyles.font_instructions; }
    public static set font_instructions(value) { baseStyles.font_instructions = value; }

    public static get font_ui_title() { return baseStyles.font_ui_title; }
    public static set font_ui_title(value) { baseStyles.font_ui_title = value; }

    public static get font_ui_texts() { return baseStyles.font_ui_texts; }
    public static set font_ui_texts(value) { baseStyles.font_ui_texts = value; }

    public static get font_app_version() { return baseStyles.font_app_version; }
    public static set font_app_version(value) { baseStyles.font_app_version = value; }

    
    public static font_ui_create_account_text: TextStyleOptionsEx = { font: '18px OswaldRegular', fill: '#999999' };
    public static font_ui_texts_centered: TextStyleOptionsEx = { font: '18px OswaldRegular', fill: 'black' };
    public static font_ui_texts_grey: TextStyleOptionsEx = { font: '18px OswaldRegular', fill: '#999999' };


    public static font_ui_footer: TextStyleOptionsEx = { font: '16px OswaldRegular', fill: 'white' };
    public static font_ui_standardButtons: TextStyleOptionsEx = { font: '18px OswaldRegular', fill: 'white' };

    public static font_problemBooleanQuestionMark: TextStyleOptionsEx = { font: '80px OswaldBold', fill: 'black' };

    public static font_problemAlternativesCandidate: TextStyleOptionsEx = { font: '46px OswaldBold', fill: 'black' };
    public static font_problemAlternativesStimuli: TextStyleOptionsEx = { font: '46px OswaldBold', fill: 'white' };


    public static font_ui_wm_number_charAnswer: TextStyleOptionsEx = { font: '80px OswaldBold', fill: 'black' };
    public static font_problemCharAnswer: TextStyleOptionsEx = { font: '80px OswaldBold', fill: 'white' };
    public static font_problemChar: TextStyleOptionsEx = { font: '80px OswaldBold', fill: 'white' };
    public static font_problemNumberButtons: TextStyleOptionsEx = { font: '46px OswaldBold', fill: 'black' };
    public static font_problemNumberButtonsDouble: TextStyleOptionsEx = { font: '40px OswaldRegular', fill: 'black' };
    public static font_problemNumberButtonsHilite: TextStyleOptionsEx = { font: '46px OswaldBold', fill: '#777777' };
    public static font_problemNumberButtonsDoubleHilite: TextStyleOptionsEx = { font: '40px OswaldRegular', fill: '#777777' };

    public static font_ui_wm_numberButtons: TextStyleOptionsEx = { font: '46px OswaldRegular', fill: 'white' };

    public static font_TenPalsBarNumber: TextStyleOptionsEx = { font: '22px OswaldRegular', fill: 'black' };

    public static font_ArrowsNumberline: TextStyleOptionsEx = { font: '32px OswaldRegular', fill: 'white' };
    public static font_ArrowsAssignmentNumber: TextStyleOptionsEx = { font: '48px OswaldRegular', fill: 'white' };
    public static font_ArrowsAssignmentNumberWhite: TextStyleOptionsEx = { font: '48px OswaldRegular', fill: 'white' };
    public static color_ArrowsNumberline = 0x808080;
    public static color_ArrowsNumberlineHelpline = 0xffffff;
    public static color_ArrowsNumberlineHelplineAlpha = 1;
    public static color_ArrowsNumberlineHelplineLowStepAlpha = 0.2;
    // public static color_ArrowsProblemRect: number = 0x000000;
    // public static color_ArrowsProblemRectAlpha: number = 0;

    public static font_map_label: TextStyleOptionsEx = { font: '16px OswaldRegular', fill: 'black' };

    public static font_CountDown: TextStyleOptionsEx = {
        font: '120px OswaldBold',
        fill: 'white',
        dropShadow: true,
        dropShadowAngle: Math.PI / 4,
        dropShadowDistance: 4,
        dropShadowColor: 'rgba(0,0,0,0.5)'
    };

    public static font_levelmeterNumber: TextStyleOptionsEx = { font: '32px OswaldRegular', fill: 'white' };
    public static color_levelmeterBackground = 0xffffff;
    public static color_levelmeterBackgroundAlpha = 0.1;
    public static font_crossword_letter: TextStyleOptionsEx = { font: '36px OswaldRegular', fill: 'black' };

    public static font_wordpic_memory: TextStyleOptionsEx = { font: '36px OswaldRegular', fill: 'black' };

    public static font_magic_character_item_icon: TextStyleOptionsEx = { font: '11px OswaldBold', fill: 'black' };
    public static font_ui_magicButtons: TextStyleOptionsEx = {
        font: '36px OswaldBold',
        fill: 'white',
        dropShadow: true,
        dropShadowAngle: Math.PI / 4,
        dropShadowDistance: 4,
        dropShadowColor: 'rgba(0,0,0,0.5)'
    };

    public static font_clean_menu_exercise_label: TextStyleOptionsEx = { font: '18px CleanLight', fill: 'white' };
    public static font_clean_menu_titles: TextStyleOptionsEx = { font: '24px CleanExtraLight', fill: 'white' };
    public static font_clean_menu_data: TextStyleOptionsEx = { font: '48px CleanThin', fill: 'white' };
    public static font_clean_levelmeterNumber: TextStyleOptionsEx = { font: '34px CleanThin', fill: 'white' };

    public static defaultBuffer = 10;

}
