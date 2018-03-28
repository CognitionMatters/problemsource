import { FullUserTest, TestingSyncMode } from '../testing/userTest';
import { cmdCmd, cmdArgument, ConsoleCmdDef } from '@jwmb/pixelmagic/lib/console/consoleManager';
import { StateLog } from '../toRemove/stateLog';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { LoginScreen } from '../screens/login/loginScreen';
import { LoginDialog } from '../screens/login/loginDialog';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { TriggerData, TriggerTimeType, TriggerActionData } from '../triggerManager';
import { PIXIDomHelpers } from '@jwmb/pixelmagic/lib/pixiUtils/pixiDomHelpers';
import { PIXIDomSprite } from '@jwmb/pixelmagic/lib/pixiUtils/pixiDOM';


@cmdCmd({
    description:
        'Run automated, non-GUI test of an account. If test is already running, '
        + 'issuing any \'ut\' command will make it stop', shortName: 'ut', longName: 'userTest'
})
export class ConsoleCmdUserTest extends ConsoleCmdDef {
    @cmdArgument({
        shortName: '',
        description: 'Account name. If none is provided, use currently logged in user, or the text in the login textbox'
    })
    account = '';
    @cmdArgument({
        shortName: 'q',
        description: 'Quit autotesting when a criterium is met, e.g. trainingDay:1/numGold:1/completedExercise:math'
    })
    exit = '';
    @cmdArgument({ shortName: 's', description: 'Sync when? day/none' }) // phase/planet/
    syncMode = 'day';
    @cmdArgument({ shortName: 'u', description: 'Class name for user behavior' })
    userbehaviour = '';
    @cmdArgument({ shortName: 't', description: 'Start time, as negative hour offset (number) from actual time or date string' })
    time = '720';
    @cmdArgument({ shortName: 'x', description: 'Clear account data on server before logging in' })
    clearData = false;
    // @cmdArgument({ shortName: "c", description: "Cancel ongoing test" })
    // cancel: boolean = false;

    currentTest: FullUserTest;

    public static getAccountUuid() {
        if (StateLog.instance) {
            if (StateLog.instance.credentials) {
                return StateLog.instance.credentials;
            }
        }
        // try to get preset username from textbox:
        if (ObjectUtils.isOfType(App.instance.currentPage, LoginScreen)) {
            const dlg = <LoginDialog>PIXIDomHelpers.findByClass(RendererManager.instance.stage, LoginDialog);
            if (dlg) {
                const found = <PIXIDomSprite>PIXIDomHelpers.findByClass(dlg, PIXIDomSprite);
                if (found) {
                    return (<any>found).domElement.value;
                }
            }
        }
        return null;
    }

    // ut -q completedExercise:Alternatives
    protected _execute(): any { // cl: CommandLine): any {
        if (this.currentTest != null) {
            this.currentTest.stop();
            this.currentTest = null;
            return;
        }
        const account = this.account || ConsoleCmdUserTest.getAccountUuid(); // cl.getAnonArgument(0, null);
        // this.findArgument('c');
        const cancelCriterium = this.exit; // this.getArgumentValue(this.findArgument("c"), cl, null);
        const additionalTriggers = [];
        if (cancelCriterium) {
            const td = <TriggerData>{};
            const split = cancelCriterium.split(':');
            td.criteriaValues = [{ name: split[0], value: split[1] }];
            td.triggerTime = TriggerTimeType.LEAVE_TEST; // POST_RACE;
            if (td.criteriaValues[0].name === 'trainingDay') {
                td.triggerTime = TriggerTimeType.MAP; // POST_RACE;
            }
            td.actionData = <TriggerActionData>{};
            td.actionData.id = 'GoMainMenu';
            additionalTriggers.push(td);
        }
        let timeOffset = 0;
        if (this.time) {
            if (this.time === '-1') {
                timeOffset = 24 * 60 * 60 * 1000 * -1;
            } else {
                try {
                    const tmpDate = Date.parse(this.time);
                    if (!isNaN(tmpDate)) {
                        timeOffset = tmpDate - Date.now();
                    }
                } catch (err) {
                }
                if (timeOffset === 0) {
                    const match = /-?\d*\.?\d+/.exec(this.time);
                    if (match) {
                        timeOffset = parseFloat(this.time) * 60 * 60 * 1000 * -1;
                    }
                }
            }
        }
        this.currentTest = new FullUserTest(
            <any>{
            account: account, deleteServer: this.clearData,
            // "phase": , "planet": PixelMagic.Testing.TestingSyncMode,
            syncMode: {
                'day': TestingSyncMode.EndOfDay,
                'none': TestingSyncMode.NoSync
            }[this.syncMode],
            checkTimeLimits: true, userBehavior: null, startTimeOffset: timeOffset, // - 24 * 60 * 60 * 1000,
            triggers: additionalTriggers
        });
        return null;
    }
}
