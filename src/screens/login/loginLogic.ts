import { StateLog, UserLocalStore } from '../../toRemove/stateLog';
import { NotificationField } from '@jwmb/pixelmagic/lib/ui/notificationField';
import { MetaphorManager } from '../../metaphors/metaphorManager';
import { CognitionMattersApp, CognitionMattersPageType } from '../../app';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { HotCodePush } from '@jwmb/pixelmagic/lib/utility/hotCodePush';
import { DialogAlert } from '../../ui/dialogAlert';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { DialogGeneric } from '../../ui/dialogGeneric';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { IUserFullState } from '../../toRemove/logItem';
import { WebRequest, AJAXResult } from '../../toRemove/webRequest';
import { Version } from '@jwmb/pixelmagic/lib/utility/version';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
import { GameState } from '../../gameState';
import { DeviceInfo } from '../../dataStructs';
import { HashedUsername } from '@jwmb/pixelmagic/lib/utility/mnemoJapanese';
import { TrainingPlanTestBase } from '../../debugTrainingPlans/trainingPlanTest';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';


export class LoggedInResult {
}
export class LoggedInResultOK extends LoggedInResult {
    // state: IUserFullState;
    constructor(public state: IUserFullState) {
        super();
    }
}
export class LoggedInResultError extends LoggedInResult {
    constructor(public error: string) {
        super();
    }
}
export class LoggedInResultErrorUpdate extends LoggedInResultError {
    constructor(public error: string, public updateUrl: string) {
        super(error);
    }
}
export class LoggedInResultDoneToday extends LoggedInResult {
}


export class LoginLogic {
    private static _loginAttempts: any = null;

    static deleteLocalUserResetServer(username: string): Promise<boolean> {
        return new Promise<boolean>((res, rej) => {
            UserLocalStore.deleteUser(username);
            const url = StateLog.syncUrl.replace('api/sync/sync', 'api/sync/deletedata') + '/?uuid=' + username;
             // "/" + username; //
             const request = new WebRequest(url, 'GET');
             request.start()
             .then(_ => {
                 res(true);
             }, err => {
                 if ((<any>err).responseText) {
                     const tmp = JSON.parse((<any>err).responseText);
                     err.message = tmp.exceptionMessage;
                 }
                 rej(err); // .resolve(false);
             });
         });
    }

    static login(username: string): Promise<LoggedInResult> {
        return new Promise<LoggedInResult>((res, rej) => {
            username = HashedUsername.dehash(username.trim());
            if (!username) {
                const err = new AJAXResult();
                err.message = 'Invalid username (control)'; // TODO: localize
                rej(err);
                return;
            }
            if (LoginLogic._loginAttempts == null
                || username !== LoginLogic._loginAttempts.username
                || Date.now() - LoginLogic._loginAttempts.lastTry > 20 * 60 * 1000) {
                LoginLogic._loginAttempts = { username: username, numTimesNoServerResponse: 0, lastTry: Date.now() }; // numTries: 0,
            }
            LoginLogic._loginAttempts.lastTry = Date.now();
            // LoginScreen._loginAttempts.numTries++;
            if (StateLog.getIsTestAccount(username)) {
                UserLocalStore.deleteUser(username);
                UserLocalStore.createOrModifyUser({
                    uuid: username, training_settings:
                        { syncSettings: { defaultSyncUrl: 'N/A' }, timeLimits: [120] },
                    // user_data: CharacterComponent.getRandomAvatarProps()
                });
                // training_plan: TrainingPlanTestBase.getTrainingPlanFromAccountName(username),
            }

            StateLog.clearInstance();
            let tmpStateLog = new StateLog(username);
            tmpStateLog = null;
            const loginEvenIfNoServerContact = LoginLogic._loginAttempts.numTimesNoServerResponse >= 1;
            StateLog.instance.init(loginEvenIfNoServerContact)
                .then((state) => {
                    if (state.syncInfo && state.syncInfo.error && (<AJAXResult>state.syncInfo.error).status === 0) {
                        if (loginEvenIfNoServerContact) {
                            const statusSettings = {
                                id: 'serverConnection', text: SR.get('warningNoServerUsingLocal', {
                                    useIfNotFound: '-Couldn\'t reach server, using latest local information instead.'
                                        // 'Progress (training day, earned items) may seem lost but will be
                                        // restored on the next successful login.'
                                })
                            };
                            NotificationField.i.setStatus(statusSettings);
                            NotificationField.i.openStatus(statusSettings.id, () =>
                                res(LoginLogic.postLogin(state)));
                            return;
                        }
                    }
                    res(LoginLogic.postLogin(state));
                }, err => {
                    if ((<any>err).status === 401) {
                    } else {
                        if ((<AJAXResult>err).status === 0) {
                            // err.message = ""; // SR.get("");
                            LoginLogic._loginAttempts.numTimesNoServerResponse++;
                        } else {
                        }
                    }
                    StateLog.clearInstance();
                    rej(err);
                });
         });
    }

    static postLogin(state: IUserFullState) {
        if (state.training_settings.customData && state.training_settings.customData.appVersion) {
            // "customData":{"appVersion":{"minVersion":"0.0.57",
            // "downloadUrl":"https://build.phonegap.com/apps/1822886/download/ios"}} download/ios   builds
            const vThis = new Version((<CognitionMattersApp>App.instance).appVersionUpdatedTo);
            if (!vThis.isEmpty) {
                const serverAppVersionData = state.training_settings.customData.appVersion;
                const vRequired = new Version(serverAppVersionData.minVersion);
                if (vThis.compare(vRequired) < 0) {
                    HotCodePush.log('Individual minVersion, update needed: ' + serverAppVersionData.minVersion);
                    if (serverAppVersionData.isHotCodePush) {
                        // TODO: check if we need to install directly (user can't continue using app while it's downloading)
                        if (serverAppVersionData.updateImmediately) {
                            HotCodePush.manualUpdate({
                                configFileUrl: serverAppVersionData.downloadUrl, autoInstall: true, installDirectly: true
                            });
                            return;
                        } else {
                            HotCodePush.localStorageUrl = serverAppVersionData.downloadUrl;
                        }
                    } else {
                        return new LoggedInResultErrorUpdate('App needs to be updated to ' + vRequired.toString(),
                            serverAppVersionData.downloadUrl);
                    }
                }
            }
        }
        // set test mode?
        // if (StateLog.getIsTestAccount(username) || App.instance.urlParameters.debugmode) {
        //     Settings.isTestAccount = true;
        // } else {
        //     Settings.isTestAccount = false;
        // }
        if (SR.instance.languageOrder.indexOf(state.training_settings.cultureCode) >= 0) {
            SR.instance.preferredLanguage = state.training_settings.cultureCode;
            SoundPlayer.instance.voiceOverLanguage = state.training_settings.cultureCode;
        }

        // TODO: what, double!?
        // set exercise stats
        GameState.exerciseStats = state.exercise_stats;

        // set training plans
        if (StateLog.getIsTestAccount(state.uuid)) {
            /// ^test/.test(username)){//!state.training_plan.tests || state.training_plan.tests.length == 0) {
            const tpc = TrainingPlanTestBase.getTrainingPlanSettings(state.uuid); // username
            if (tpc) {
                state.training_plan = tpc.training_plan;
                ObjectUtils.merge(App.instance.urlParameters, tpc.urlParameters || {});
                ObjectUtils.merge(state.training_settings, tpc.training_settings || {});
                ObjectUtils.merge(state.user_data, tpc.user_data || {});
                ObjectUtils.merge(state.exercise_stats, tpc.exercise_stats || {});
            } else {
                return new LoggedInResultError('Test account not found!');
            }
        }
        if (App.instance.urlParameters.cultureCode && App.instance.urlParameters.cultureCode.length > 1) {
            state.training_settings.cultureCode = App.instance.urlParameters.cultureCode;
        }
        if (SR.instance.languageOrder.indexOf(state.training_settings.cultureCode) >= 0) {
            SR.instance.preferredLanguage = state.training_settings.cultureCode;
            SoundPlayer.instance.voiceOverLanguage = state.training_settings.cultureCode;
        }

        // TODO: what, double!?
        // set exercise stats
        GameState.exerciseStats = state.exercise_stats;

        // Overrides from trainingSettings:
        if (state.training_settings && state.training_settings.trainingPlanOverrides) {
            // TODO: extremely simplistic, we want sophisticated merging behavior which can be
            // defined both by destination and source structures
            ObjectUtils.merge(state.training_plan, state.training_settings.trainingPlanOverrides, true, false);
        }

        GameState.trainingPlanData = state.training_plan; // [state.training_plan];
        // if (state.secondary_training_plan) {
        //    GameState.trainingPlans.push(state.secondary_training_plan);
        // }

        // set user data and settings
        // GameState.userData = state.user_data;
        GameState.trainingSettings = state.training_settings;
        // if (GameState.trainingSettings.customData && GameState.trainingSettings.customData.isTestAccount) { //TODO: ugly
        //     Settings.isTestAccount = GameState.trainingSettings.customData.isTestAccount;
        // }

        // update training day and possibly swap training plans
        let result = LoginLogic.handleTrainingDay();
        if (result == null) {
            // TODO: solve this differently Settings.userHasJustLoggedIn = true;
            result = new LoggedInResultOK(state);
        }

        GameState.exerciseStats.device = DeviceInfo.retrieve();
        return result;
    }

    static handleTrainingDay(): LoggedInResult {
        const sumOfTimeLimits = LoginLogic.getSumOfTimeLimits();
        let allowMultipleLogins = false;
        // if (Settings.isTestAccount) { allowMultipleLogins = true; }
        if ((sumOfTimeLimits === 0)
            || (GameState.trainingSettings.customData && GameState.trainingSettings.customData.allowMultipleLogins)
            || App.instance.urlParameters.aml || App.instance.urlParameters.allowMultipleLogins) {
            allowMultipleLogins = true;
        }
        if (GameState.exerciseStats.lastLogin === null) { GameState.exerciseStats.lastLogin = 0; }
        if (GameState.exerciseStats.lastLogin < Date.now() - ((sumOfTimeLimits) * 60 * 1000) || App.instance.urlParameters.isNewDay) {
            if (allowMultipleLogins || GameState.exerciseStats.lastLogin < Date.now() - 1 * 60 * 60 * 1000) {
                // new training day
                GameState.exerciseStats.trainingDay++;
                GameState.exerciseStats.lastLogin = Date.now();

                MetaphorManager.instance.postLogin();
                // LoginLogic.swapTrainingPlansAndTimeLimits();
                // console.log("New Training day: " + GameState.exerciseStats.trainingDay);
                // console.log("GameState.trainingSettings.timeLimits:");
                // console.log(GameState.trainingSettings.timeLimits);
            } else {
                // already trained today
                return new LoggedInResultDoneToday();
                // deferred.resolve(new LoggedInResultDoneToday());
                // return;
            }

        } else {
            // continue training day
            // LoginLogic.swapTrainingPlansAndTimeLimits();
            const timeUsed = Math.max(0, (Date.now() - GameState.exerciseStats.lastLogin) / (60 * 1000));
             // Min 0, in case last login date was in future (this or other device has incorrect date)
            if (GameState.trainingSettings.timeLimits.length > 1 && timeUsed > GameState.trainingSettings.timeLimits[0]) {
                return new LoggedInResultDoneToday();
                // GameState.nextTrainingPlan();
                // var timeUsedOfSecondLimit = timeUsed - GameState.trainingSettings.timeLimits[0];
                // GameState.trainingSettings.timeLimits[1] = Math.max(GameState.trainingSettings.timeLimits[1] - timeUsedOfSecondLimit, 0);
            } else {
                GameState.trainingSettings.timeLimits[0] = Math.max(GameState.trainingSettings.timeLimits[0] - timeUsed, 0);
            }
            // console.log("Continue Training day: " + GameState.exerciseStats.trainingDay + ", timeUsed:" + timeUsed);
            // console.log("GameState.trainingSettings.timeLimits:");
            // console.log(GameState.trainingSettings.timeLimits);
            return null;
        }
    }

    // private static swapTrainingPlansAndTimeLimits(){
    //    if (GameState.exerciseStats.trainingDay % 2 == 0) { //TODO: check training time today and update timeLimits
    //        GameState.swapTrainingPlansAndTimeLimits();
    //    }
    // }

    private static getSumOfTimeLimits(): number {
        const defaultTime = 0;
        if (GameState.trainingSettings.timeLimits == null || GameState.trainingSettings.timeLimits.length === 0) {
            return defaultTime;
        }
        let sum = 0;
        for (let i = 0; i < GameState.trainingSettings.timeLimits.length; i++) {
            sum += GameState.trainingSettings.timeLimits[i];
        }
        return sum;
    }
}
