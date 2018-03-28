import {
    SyncLogStateLogItem, NewPhaseLogItem, NewProblemLogItem, IUserFullState,
    UserGeneratedState, UserServerSettings, LogItem, UserStatePushLogItem, SplitLogItem,
    IUserGeneratedState, IUserServerSettings, AnswerLogItem, UserStatePushPlaceholderLogItem,
    EndOfDayLogItem, SyncInfoLogItem, NullLogItem, LeaveTestLogItem
} from './logItem';
import { ExerciseStats, TrainingSettings, DeviceInfo } from '../dataStructs';
import { EmptyTrainingPlan } from '../trainingPlan/TrainingPlan';
import { Signal1 } from '@jwmb/signal';
import { CognitionMattersApp } from '../app';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { RouterRequest, WebRequest, AJAXResult, RequestState } from './webRequest';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { StatusFieldLogItemAppender } from '../tempStatusFieldLogItemAppender';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';

export class GlobalCacheSettings {
    debugdev: string;
    users: IRegisteredUser[] = [];

    verifyUsers() {
        const orgCnt = this.users.length;
        for (let i = this.users.length - 1; i >= 0; i--) {
            try {
                if (!UserLocalStore.hasData(this.users[i].uuid)) {
                    this.users.splice(i, 1);
                }
            } catch (err) {
            }
        }
        if (orgCnt > this.users.length) {
            UserLocalStore.globalCacheSettings = this;
        }
    }
    get latestUuid(): string {
        return this.users.length > 0 ? this.users[0].uuid : null;
         // this.users.sort((a, b) => { return a.touchedTime > b.touchedTime ? 1
         // : (a.touchedTime == b.touchedTime ? 0 : -1); })[0].uuid : null; // this.testUsers.length > 0 ? this.testUsers[0].uuid : null;
    }

    getUser(uuid: string): IRegisteredUser {
        return this.users.find(_ => _.uuid === uuid);
    }
    setUser(usr: IRegisteredUser) {
        const foundIndex = this.users.findIndex(val => val.uuid === usr.uuid);
        if (foundIndex >= 0) {
            this.users.splice(foundIndex, 1);
        }
        this.users.splice(0, 0, usr);
    }
    removeOldUsers(except: string[], targetNumRemovedKB: number = 500): number {
        // Remove oldest
        if (this.users.length <= 1) {
            return 0;
        }
        if (!except) {
            except = [];
        }
        const sorted = [].concat(this.users);
        except.forEach(x => {
            const i = sorted.findIndex(_ => _.uuid === x);
            if (i >= 0) {
                sorted.splice(i, 1);
            }
        });
        sorted.sort((a, b) => Date.parse(a.touchedTime) - Date.parse(b.touchedTime));

        let numRemoved = 0;
        let bytesRemoved = 0;
        const tryToRemoveBytes = targetNumRemovedKB * 1024;
        for (let userIndex = 0; userIndex < sorted.length; userIndex++) {
            const user = <IRegisteredUser>sorted[userIndex];
            Logger.info('Remove user ' + user.uuid);
            const uls = new UserLocalStore(user.uuid);
            bytesRemoved += uls.getSize();
            UserLocalStore.deleteUser(user.uuid);
            // uls.removeAll();
            // var i = this.users.findIndex(_ => _.uuid == user.uuid);
            // if (i >= 0) {
            //    this.users.splice(i, 1);
            // }
            numRemoved++;
            if (bytesRemoved > tryToRemoveBytes) {
                break;
            }
        }
        return bytesRemoved;
    }
}
export interface IRegisteredUser {
    uuid: string;
    touchedTime?: Date;
}

export class UserLocalStore {
    static getUsersWithUnsyncedData(ignoreUuid: string = null): IRegisteredUser[] {
        return UserLocalStore.globalCacheSettings.users
            .filter(_ => _.uuid !== ignoreUuid)
            .filter(_ => {
                const uls: UserLocalStore = new UserLocalStore(_.uuid);
                const log = uls.getLog();
                if (!log) {
                    return false;
                }
                return StateLog.getLogItemsForSync(log).length > 0;
                // log = log.filter(li => !li.isOfType(SyncInfoLogItem));
                // var syncedToIndex = log.findIndex(li => li.isOfType(SyncLogStateLogItem) && (<SyncLogStateLogItem>li).syncedUpToHere);
                // if (syncedToIndex >= 0) {
                //    log.splice(0, syncedToIndex + 1);
                // }
                // return LogItem.getIsSyncWorthy(log);
            });
    }
    static get globalCacheSettings(): GlobalCacheSettings {
        const tmp = localStorage.getItem(UserLocalStore.logPrefix + 'global');
        const result = new GlobalCacheSettings();
        ObjectUtils.merge(result, tmp ? JSON.parse(tmp) : null);
        result.verifyUsers();
        // Logger.info("Get globalcache: " + JSON.stringify(result));
        return result;
    }
    static deleteGlobalCacheSettings() {
        localStorage.removeItem(UserLocalStore.logPrefix + 'global');
    }
    static set globalCacheSettings(value: GlobalCacheSettings) {
        localStorage.setItem(UserLocalStore.logPrefix + 'global', JSON.stringify(value));
        // Logger.info("Set globalcache: " + JSON.stringify(value));
    }
    static hasData(uuid: string): boolean {
        if (!localStorage) {
            return false;
        }
        const find = UserLocalStore.logPrefix + uuid + '.';
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).indexOf(find) === 0) {
                return true;
            }
        }
        return false;
    }
    static createOrModifyUser(mergeIntoSettingsAndState: any) {
        const store = new UserLocalStore(mergeIntoSettingsAndState.uuid);
        const defaultVals = <IUserFullState>new UserGeneratedState();
        ObjectUtils.merge(defaultVals, new UserServerSettings(), false);

        let existing = store.getStateAndSettings(true);
        ObjectUtils.merge(defaultVals, existing, true);
        ObjectUtils.merge(defaultVals, mergeIntoSettingsAndState, true);
        existing = defaultVals;
        store.setServerSettings({
            uuid: existing.uuid, training_plan: existing.training_plan,
            training_settings: existing.training_settings
        });
        store.setUserState({ exercise_stats: existing.exercise_stats, user_data: existing.user_data });
    }
    static deleteUser(uuid: string) {
        const store = new UserLocalStore(uuid);
        store.removeAll();
        const gcs = UserLocalStore.globalCacheSettings;
        const index = gcs.users.findIndex(_ => _.uuid === uuid);
        if (index >= 0) {
            gcs.users.splice(index, 1);
            UserLocalStore.globalCacheSettings = gcs;
        }
    }

    private static _logger: Logger;
    static get logger(): Logger {
        if (!UserLocalStore._logger) {
            UserLocalStore._logger = Logger.createLogger('localStore', false);
        }
        return UserLocalStore._logger;
    }

    private _hasStore: boolean;
    private _userKey: string;
    private _writeToStorage: boolean;
    constructor(userKey: string, writeToStorage: boolean = true) {
        this._userKey = userKey;
        this._hasStore = typeof Storage !== 'undefined';
        this._writeToStorage = writeToStorage;
    }

    registerUserLogin() {
        if (this._hasStore) {
            const gcs = UserLocalStore.globalCacheSettings;
            let usr = gcs.getUser(this._userKey);
            if (!usr) {
                usr = { uuid: this._userKey, touchedTime: new Date() };
                gcs.setUser(usr);
            } else {
                usr.touchedTime = new Date();
            }
            UserLocalStore.globalCacheSettings = gcs;
        }
    }

    private static logPrefix = 'CEF.';
    private get keyLogItems(): string {
        return UserLocalStore.logPrefix + this._userKey + '.logItems';
    }
    private get keyLogOldItems(): string {
        return UserLocalStore.logPrefix + this._userKey + '.oldlogItems';
    }
    private get keyUserState(): string {
        return UserLocalStore.logPrefix + this._userKey + '.state';
    }
    private get keyServerData(): string {
        return UserLocalStore.logPrefix + this._userKey + '.server';
    }
    private get allKeys(): string[] {
        return [this.keyLogItems, this.keyLogOldItems, this.keyServerData, this.keyUserState];
    }

    private getItem(key: string, defaultValue: string = null): string {
        const result = this._hasStore ? localStorage.getItem(key) : null;
        return result ? result : (defaultValue ? defaultValue : null);
    }
    private setItem(key: string, value: string) {
        if (!this._hasStore) {
            return;
        }
        if (this._writeToStorage) {
            // TODO: localStorage.remainingSpace?
            try {
                localStorage.setItem(key, value);
            } catch (err) {
                try {
                    UserLocalStore.globalCacheSettings.removeOldUsers([this._userKey]);
                    localStorage.setItem(key, value);
                } catch (err2) {
                    alert('Error: LocalStorage is full (couldn\'t delete enough data)');
                }
            }
        } else {
            Logger.info('skip write localStorage (setting ' + key + ')');
        }
    }
    private removeItem(key: string) {
        if (!this._hasStore) {
            return;
        }
        localStorage.removeItem(key);
    }
    removeAll() {
        this.allKeys.forEach(_ => localStorage.removeItem(_));
        // this.setLog([]);
        // this.removeServerData();
        // this.removeUserState();
    }
    removeUserState() {
        this.removeItem(this.keyUserState);
    }
    removeServerData() {
        this.removeItem(this.keyServerData);
    }
    private _setLog(key: string, log: LogItem[]) {
        if (!this._hasStore) {
            return;
        }
        if (log && log.length) {
            // remove UserState items, stored separately
            log = log.filter(_ => !_.isOfType(UserStatePushLogItem));
            this.setItem(key, LogItem.serializeList(log));
        } else {
            this.setItem(key, '[]');
        }
    }
    splitLogAt = -1;
    setLog(log: LogItem[]) {
        const startTime = Date.now();
        // log = log.filter(_ => !_.isOfType(UserStatePushLogItem));

        if (this.splitLogAt > 0) {
            // If something has gone wrong and logItems is very long, storing all items can take a long time
            let splitIndex = -1;
            if (log.length > this.splitLogAt) {
                // Split into regular save item and old data
                splitIndex = log.findLastIndex(_ => _.isOfType(SplitLogItem));
                if (log.length - splitIndex > this.splitLogAt) {
                    if (splitIndex >= 0) { // remove old split log item
                        log.splice(splitIndex, 1);
                    }
                    log.push(SplitLogItem.create({}));
                    splitIndex = log.length - 1;
                    UserLocalStore.logger.debug(this._userKey + ' Split log at splitIndex ' + splitIndex);
                    this._setLog(this.keyLogOldItems, log);
                }
            }
            if (splitIndex < 0) {
                this._setLog(this.keyLogOldItems, null);
            } else {
                log = log.slice(splitIndex + 1);
                UserLocalStore.logger.debug(this._userKey + ' after split log is length ' + log.length);
            }
        } else {
            this._setLog(this.keyLogOldItems, null);
        }
        this._setLog(this.keyLogItems, log);
        const time = Date.now() - startTime;

        // var lastItem: string = "";
        // if (log.length > 0) {
        //    lastItem = JSON.stringify(log[log.length - 1]);
        //    if (lastItem.length > 250) {
        //        lastItem = lastItem.substr(0, 250);
        //    }
        // }
        // UserLocalStore.logger.debug(this._userKey + " setLog " + log.length + " items, time: " + time + " last:" + lastItem);
    }
    getLog(): LogItem[] {
        if (!this._hasStore) {
            return [];
        }
        let result = [];
        const old = localStorage.getItem(this.keyLogOldItems);
        if (old && old !== 'null') {
            result = LogItem.deserializeList(old);
        }
        result = result.concat(LogItem.deserializeList(localStorage.getItem(this.keyLogItems)));
        return result;
    }
    getSplitInfo() {
        const old = localStorage.getItem(this.keyLogOldItems);
        const current = localStorage.getItem(this.keyLogItems);
        return 'items in old: ' + (old && old != null ? LogItem.deserializeList(old).length : 0)
            + ', current: ' + LogItem.deserializeList(localStorage.getItem(this.keyLogItems)).length;
    }

    setUserState(state: IUserGeneratedState) {
        const startTime = Date.now();
        this.mergeAndSave(this.keyUserState, <any>state);
        UserLocalStore.logger.debug(this._userKey + ' setUserState time: ' + (Date.now() - startTime));
    }
    setServerSettings(settings: IUserServerSettings): IUserServerSettings {
        let fillThis = new UserServerSettings(); // only save server settings fields!
        Object.keys(fillThis).forEach(_ => fillThis[_] = settings[_]);
        // if ((<any>settings).secondary_training_plan) { //TODO: with proper reflection this wouldn't be needed
        //    fillThis["secondary_training_plan"] = (<any>settings).secondary_training_plan;
        // }
        let merged = ObjectUtils.merge(UserLocalStore.createEmptyServerSettings(this._userKey), fillThis, true, true);
        merged = this.mergeAndSave(this.keyServerData, merged);
        fillThis = new UserServerSettings();
        // only retrieve server settings fields, in case an earlier version of the program stored incorrect properties (e.g. exercise_stats)
        Object.keys(fillThis).forEach(_ => fillThis[_] = merged[_]);
        // if ((<any>merged).secondary_training_plan) { //TODO: with proper reflection this wouldn't be needed
        //    fillThis["secondary_training_plan"] = (<any>merged).secondary_training_plan;
        // }
        return fillThis;
    }
    getUserState(createEmptyIfNotFound: boolean = false): IUserGeneratedState {
        const tmp = this.getItem(this.keyUserState);
        if (tmp) {
            const result = UserLocalStore.createEmptyUserState();
            ObjectUtils.merge(result, <IUserGeneratedState>JSON.parse(tmp), true, true);
            return result;
        }
        return createEmptyIfNotFound ? UserLocalStore.createEmptyUserState() : null; // CharacterComponent.getRandomAvatarProps()
    }
    private static createEmptyUserState(): IUserGeneratedState {
        return { exercise_stats: new ExerciseStats(), user_data: null };
    }
    getServerSettings(createEmptyIfNotFound: boolean = false): IUserServerSettings {
        const tmp = this.getItem(this.keyServerData);
        if (tmp) {
            const result = UserLocalStore.createEmptyServerSettings(this._userKey);
            ObjectUtils.merge(result, <IUserServerSettings>JSON.parse(tmp), true, true);
            return result;
        }
        return createEmptyIfNotFound ? UserLocalStore.createEmptyServerSettings(this._userKey) : null;
    }
    private static createEmptyServerSettings(uuid: string): IUserServerSettings {
        return <IUserServerSettings><any>{ uuid: uuid, training_plan: new EmptyTrainingPlan(), training_settings: new TrainingSettings() };
    }
    hasState(): boolean {
        return this.getUserState() != null; // getState
    }
    getStateAndSettings(createEmptyIfNotFound: boolean = false): IUserFullState {
        const tmp = this.getUserState(createEmptyIfNotFound);
        if (!tmp) {
            return null;
        }
        ObjectUtils.merge(tmp, this.getServerSettings(createEmptyIfNotFound));
        return <IUserFullState>tmp;
    }

    private mergeAndSave(keyName: string, obj: any): any {
        if (!this._hasStore) {
            return;
        }
        const stored = JSON.parse(this.getItem(keyName, '{}'));
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            stored[key] = obj[key];
        }
        this.setItem(keyName, JSON.stringify(stored));
        return stored;
    }

    public getSize(): number {
        const sizes = {};
        this.allKeys.forEach(_ => sizes[_] = this.getItem(_, '').length);
        return Object.keys(sizes).map(_ => sizes[_]).reduce((p, v) => p + v);
    }
}

class SessionInfo {
    sessionToken: string;
    lastSuccessfulCall: Date;
    serverSessionTimeoutMinutes = 20;
    get isAlive(): boolean {
        return this.sessionToken && this.lastSuccessfulCall &&
            (new Date().valueOf() - this.lastSuccessfulCall.valueOf()) / 1000 / 60
            < this.serverSessionTimeoutMinutes;
    }
}
export interface ISyncTrigOptions {
    performSync: boolean;
    pushState: boolean;
}

export class StateLog {
    private _routerRequest: RouterRequest;
    private _syncRequest: WebRequest = new WebRequest(StateLog.syncUrl, 'POST');
    // "http://mathtest01.azurewebsites.net/api/sync/sync"
    private static _syncUrl = 'https://mathbuild.azurewebsites.net/api/sync/sync';
    // http://localhost:56665/api/sync/sync http://mathtest01.azurewebsites.net/api/sync/sync
    // http://math-jb.cloudapp.net/AppTest/api/sync/sync
    static get syncUrl(): string {
        return StateLog._syncUrl;
    }

    private static _instance: StateLog;
    static get instance(): StateLog {
        return StateLog._instance;
    }
    static clearInstance() {
        StateLog._instance = null;
    }

    private static _logger: Logger;
    static get logger(): Logger {
        if (!StateLog._logger) {
            StateLog._logger = Logger.createLogger('StateLog', true);
            // StateLog._logger.addAppender(new StatusFieldLogItemAppender());
        }
        return StateLog._logger;
    }
    private static _bgSynclogger: Logger;
    static get bgSynclogger(): Logger {
        if (!StateLog._bgSynclogger) {
            StateLog._bgSynclogger = Logger.createLogger('BgSync', true);
            StateLog._bgSynclogger.addAppender(new StatusFieldLogItemAppender());
        }
        return StateLog._bgSynclogger;
    }


    trigSyncOn: (logItem: LogItem, allLogItems: LogItem[]) => ISyncTrigOptions;

    private _useServer = true;
    private _credentials: string;
    public get credentials(): string {
        return this._credentials;
    }
    private _sessionInfo: SessionInfo;
    private _localStore: UserLocalStore;

    static getIsTestAccount(account: string): boolean {
        return account && account.indexOf('test') === 0;
    }

    constructor(userCredentials: string, singleton: boolean = true) { // , useServer: boolean = true) {
        if (singleton) {
            if (StateLog._instance) { throw new Error('Instance already created: ' + StateLog._instance); }
            StateLog._instance = this;
        }

        // ObjectUtils.merge({ a: new TrainingSettings(), b: { prop: "A" }, c: []}, { a: null, b: null, c: null}, true);
        this._localStore = new UserLocalStore(userCredentials);
        const serverSettings = this._localStore.getServerSettings(true);

        if (serverSettings.training_settings.syncSettings && serverSettings.training_settings.syncSettings.eraseLocalData) {
            this._localStore.removeAll();
        } else {
            if (serverSettings.training_settings.syncSettings.eraseLocalUserFullState) {
                this._localStore.removeServerData();
                this._localStore.removeUserState();
            }
            if (serverSettings.training_settings.syncSettings.eraseLocalLog) {
                this._localStore.setLog([]);
            }
        }
        // if (testUser.deleteServerData) { //too risky, might forget in some release build (would send delete command to sync server)
        // }

        if (singleton && serverSettings.training_settings.syncSettings.syncOnInit) {
            let uuidsToSync = UserLocalStore.getUsersWithUnsyncedData(userCredentials).filter(_ => !StateLog.getIsTestAccount(_.uuid));
            // uuidsToSync = ["haha", "hoho"].map(_ => { return <IRegisteredUser>{ uuid: _ }; });
            if (uuidsToSync.length > 0) {
                uuidsToSync = uuidsToSync.filter(_ => !StateLog.getIsTestAccount(_.uuid));
                const stateLogs = uuidsToSync.map(_ => new StateLog(_.uuid, false));
                const foundWithNoInitSync = stateLogs.find(_ =>
                    _._localStore.getServerSettings(true).training_settings.syncSettings.syncOnInit === false) != null;
                // alert("Syncing " + uuidsToSync.map(_ => _.uuid).join(","));
                if (foundWithNoInitSync) {
                    StateLog.bgSynclogger.info('ids to sync: ' + uuidsToSync.map(_ => _.uuid).join(','));
                }
                // chain them together with promises instead of starting all at same time:
                const fnInitWrapper = (index: number, list: StateLog[]) => {
                    if (index === list.length) {
                        if (foundWithNoInitSync) {
                            StateLog.bgSynclogger.info('All syncs complete');
                        }
                        return null;
                    }
                    if (foundWithNoInitSync) {
                        StateLog.bgSynclogger.info('start id ' + list[index]._credentials);
                    }
                    list[index].sync()
                        .then(_ =>
                            fnInitWrapper(index + 1, list)
                        , err => {
                            StateLog.bgSynclogger.info('error:' + JSON.stringify(err));
                            fnInitWrapper(index + 1, list);
                        });
                };
                fnInitWrapper(0, stateLogs);
            }
        }

        this._credentials = userCredentials;

        this._useServer = serverSettings.training_settings.syncSettings.defaultSyncUrl !== 'N/A';
        this._sessionInfo = new SessionInfo();

        this._localStore.registerUserLogin();
        this.logItems = this._localStore.getLog();

        if (!this._useServer) {
            this._routerRequest = new RouterRequest(null, null);
            // this._localStore.setServerSettings(<IUserServerSettings>{ training_plan: TrainingPlanData.debugPlan,
            // training_settings: { timeLimits: [5] } });
        } else {
            const settings = serverSettings.training_settings;
            let routerUrl = 'http://sync-eunorth02.cognitionmatters.org/api/relay/GetSyncUrls';
            // "http://math-jb.cloudapp.net/AppTest/api/relay/GetSyncUrls"; //"http://localhost:56665/api/relay/GetSyncUrls";
            if (settings && settings.syncSettings) {
                const syncSettings = settings.syncSettings;
                if (syncSettings.routerUrl) { routerUrl = syncSettings.routerUrl; }
                if (syncSettings.defaultSyncUrl) {
                    StateLog._syncUrl = syncSettings.defaultSyncUrl; // NB: set both
                    this._syncRequest.baseUrl = syncSettings.defaultSyncUrl; // NB: set both
                }
            }
            // contact "router" service in background in order to find the sync endpoint
            this._routerRequest = new RouterRequest(routerUrl, userCredentials);
            const self = this;
            if (routerUrl) {
                this._routerRequest.start(3000)
                    .then(data => {
                        const result = data[0];
                        self._syncRequest.baseUrl = <string>result[0].url; // NB: set both!
                        StateLog._syncUrl = <string>result[0].url; // NB: set both!
                    }, err => {
                        StateLog.logger.info('routerRequest failed - don\'t care');
                    });
            }
        }
    }
    dispose() {
        this.sigLogItem.dispose();
        this.sigLogItem = null;
    }
    init(ignoreServerNotFoundError: boolean = false): Promise<IUserFullState> {
        const fHandlePostInit = (st: IUserFullState) => {
            if (!this.isCurrentUser) {
                return;
            }
            const trig = st.training_settings.syncSettings.syncTriggerCode;
            if (trig === 'none') {
                this.trigSyncOn = null; // (logItem: LogItem) => { return {} };
            } else {
                this.trigSyncOn = (logItem: LogItem) => {
                    return {
                        performSync: logItem.isOfType(LeaveTestLogItem) || logItem.isOfType(EndOfDayLogItem),
                        pushState: logItem.isOfType(LeaveTestLogItem)
                    }; // logItem.type == LogType.PHASE_END ||
                };
            }
        };

        return new Promise<IUserFullState>((res, rej) => {
            StateLog.logger.info('Initing!');
            // const self = this;

            // const deferred = P.defer<IUserFullState>();
            const state = this._localStore.getStateAndSettings(false);
            if (state == null || state.training_settings.syncSettings.syncOnInit) { // syncAtInit || mustSync) {
                // return this.sync();
                this.sync().then(fs => {
                    fHandlePostInit(fs);
                    res(fs);
                    // deferred.resolve(fs);
                }, err => {
                    if (ignoreServerNotFoundError && state != null && (<AJAXResult>err).status === 0) {
                        fHandlePostInit(state);
                        this.trigSyncOn = null; // Don't try autosyncing if we couldn't reach server
                        state.syncInfo = { error: <AJAXResult>err };
                        res(state); // deferred.resolve(state);
                    } else {
                        let storedLen = 0;
                        if (state && state.exercise_stats) {
                            storedLen = JSON.stringify(state.exercise_stats).length;
                        }
                        if (storedLen < 10) {
                            UserLocalStore.deleteUser(this.credentials);
                        }
                        rej(err); // deferred.reject(err);
                    }
                });
            } else {
                fHandlePostInit(state);
                res(state); // deferred.resolve(state);
            }
            // return deferred.promise();
        });
    }

    private _isVerifying = false;
    private logItems: LogItem[] = [];
    getLogItemsCopyDEBUGGING(): LogItem[] {
        return [].concat(this.logItems);
    }
    getLocalStoreDEBUGGING() {
        return this._localStore;
    }
    public sigLogItem = new Signal1<LogItem>();
    log(logItem: LogItem) {
        this.sigLogItem.dispatch(logItem);
        this.logItems.push(logItem);
        if (this._isVerifying) { // Needed so we don't cause infinite loop of Logger.warn/error, exceptions, log()...
            return;
        }
        // if (!window.isPhonegap) { // TODO: !window.isPhonegap
        //     this._isVerifying = true;
        //     try {
        //         zNode.constructFromLog(this.logItems, true);
        //     } catch (err) {
        //         StateLog.logger.error('Badly constructed log: ' + err);
        //     }
        //     this._isVerifying = false;
        // }

        if (logItem.isOfType(UserStatePushLogItem)) {// logItem["type"] == "USER_STATE_PUSH") {
            const tmpState = <UserStatePushLogItem>logItem;
            this._localStore.setUserState(<IUserGeneratedState>{ exercise_stats: tmpState.exercise_stats, user_data: tmpState.user_data });
            // Replace with placeholder (too costly to save into log localstorage)
            this.logItems.splice(this.logItems.length - 1, 1);
            this.logItems.push(UserStatePushPlaceholderLogItem.create(null));
            // this.assertOnlyOneUserStateInLog();
        }
        this._localStore.setLog(this.logItems);


        if (this.trigSyncOn) {
            const options = this.trigSyncOn(logItem, this.logItems);
            if (options.performSync) {
                if (options.pushState) {
                    this.logUserState();
                }
                this.sync(); // Don't care about result on auto-trigged sync
            }
        }
    }

    private getCurrentUserState(): IUserGeneratedState {
        let state: IUserGeneratedState;
        if (!this.isCurrentUser || !this._sessionInfo.isAlive) {
            state = this._localStore.getUserState(); // Can't get "hot" data if we're not the logged-in user, or we're just starting up
        } else {
            state = <IUserGeneratedState>{ exercise_stats: ExerciseStats.instance, user_data: null };
            // GameState.userData
        }
        if (state.exercise_stats) {
            state.exercise_stats = ExerciseStats.getForSerialization(state.exercise_stats);
        }
        return state;
    }
    private logUserState() {
        if (!this.isCurrentUser) {
            StateLog.logger.warn('Can\'t log userstate from non-current user');
            return;
        }
        this.log(UserStatePushLogItem.create(<UserStatePushLogItem>this.getCurrentUserState()));
    }

    static getLogItemsForSync(logItems: LogItem[]): LogItem[] {
        if (logItems == null) {
            logItems = [];
        }
        let eventsToSend = logItems.concat([]);

        const alreadySyncedIndex = eventsToSend.findIndex(_ => _.isOfType(SyncLogStateLogItem)
            && (<SyncLogStateLogItem>_).syncedUpToHere);
        if (alreadySyncedIndex >= 0) {
            // Find out if we need to supply the already synced items
            // They're used for reference on server to identify which phase/problem the new problem/answer should be associated with
            // If we don't have any new "loose" problems/answers (ie a new phase was started), we can shed those items
            const notSyncedIndex = eventsToSend.findIndex(_ => _.isOfType(SyncLogStateLogItem)
                && !(<SyncLogStateLogItem>_).syncedUpToHere);
            if (notSyncedIndex > alreadySyncedIndex) {
                const tmpNotSynced = eventsToSend.slice(notSyncedIndex + 1);
                const newPhaseIndex = tmpNotSynced.findIndex(_ => _.isOfType(NewPhaseLogItem));
                // _.type == LogType.NEW_PHASE);
                const dependendOnNewPhaseIndex = tmpNotSynced.findIndex(_ =>
                    ObjectUtils.isAnyType(_, [NewProblemLogItem, AnswerLogItem]));
                // _.type == LogType.NEW_PROBLEM || _.type == LogType.ANSWER);
                const hasNeededPhaseStuff = dependendOnNewPhaseIndex >= 0 && newPhaseIndex >= 0 && dependendOnNewPhaseIndex > newPhaseIndex;
                if (hasNeededPhaseStuff || dependendOnNewPhaseIndex < 0) {
                    eventsToSend = eventsToSend.splice(notSyncedIndex + 1);
                }
            }
            // NOTE: Depending on sync trigger, LEAVE_TEST may be first item in eventsToSend. No problem currently
        }

        // Remove all except last UserStatePushPlaceholder:
        const userStateIndex = eventsToSend.findLastIndex(_ => _.isOfType(UserStatePushPlaceholderLogItem));
        if (userStateIndex >= 0) {
            for (let i: number = userStateIndex - 1; i >= 0; i--) {
                if (eventsToSend[i].isOfType(UserStatePushPlaceholderLogItem)) {
                    eventsToSend.splice(i, 0);
                }
            }
        }

        // Regular UserStatePush shouldn't be here, remove just in case:
        if (eventsToSend.findIndex(_ => _.isOfType(UserStatePushLogItem)) >= 0) {
            StateLog.logger.warn('UserStatePushLogItem found in log');
            eventsToSend = eventsToSend.filter(_ => !_.isOfType(UserStatePushLogItem));
        }

        // Remove irrelevant items:
        eventsToSend = eventsToSend.filter(_ => !(_.isOfType(SyncInfoLogItem)
            && ((<SyncInfoLogItem>_).success) || (<SyncInfoLogItem>_).isStartMarker)); // _.type !== "SYNC" && _.sync_type !== "SUCCESS");
        eventsToSend = eventsToSend.filter(_ => !_.isOfType(NullLogItem) && !_.isOfType(SplitLogItem));
        const firstAnswerIndex = eventsToSend.findIndex(_ => _.isOfType(AnswerLogItem)); // (<string>_.type).indexOf("ANSWER") == 0);
        // if (false && firstAnswerIndex < 0) {
        //    //if we have no answers, then we should remove PHASE/PROBLEM items from this sync
        //    eventsToSend = eventsToSend.filter(_ => !_.isOfType(NewPhaseLogItem)
        // && !_.isOfType(NewProblemLogItem)) // _.type !== LogType.NEW_PHASE && _.type !== LogType.NEW_PROBLEM);
        //    //also remove PhaseEnd
        //    eventsToSend = eventsToSend.filter(_ => !_.isOfType(PhaseEndLogItem))
        // }

        //// TODO: we'll want to send these to server eventually
        // eventsToSend = eventsToSend.filter(_ => !_.isOfType(EndOfDayLogItem));

        return eventsToSend;
    }

    get isCurrentUser(): boolean {
        return StateLog.instance && this._credentials === StateLog.instance._credentials;
    }

    syncIfNewLocalData(): Promise<IUserFullState> {
        return new Promise<IUserFullState>((res, rej) => {
            // Called when returning to login menu - syncs if we didn't when finishing up
            if (!this.isCurrentUser) {
                StateLog.logger.warn('syncIfNewLocalData: can only use on StateLog.instance');
                rej({ message: 'syncIfNewLocalData: can only use on StateLog.instance' });
            } else {
                const serverSettings = this._localStore.getServerSettings(true);
                if (!serverSettings.training_settings.syncSettings.syncOnInit) {
                    res(null);
                } else {
                    const savedState = this._localStore.getUserState(false);
                    const currentState = this.getCurrentUserState();
                    if (!ObjectUtils.equals(savedState, currentState)) { // State has been updated
                        this.logUserState();
                    }
                    // Silly to sync if we only have an END_OF_DAY...
                    let eventsToSend = StateLog.getLogItemsForSync(this.logItems);
                    eventsToSend = eventsToSend.filter(_ => !_.isOfType(EndOfDayLogItem));
                    if (eventsToSend.length === 0) {
                        res(null);
                    } else {
                        this.sync().then(val => res(val), err => rej(err));
                    }
                }
            }
        });
    }
    get isSyncing(): boolean {
        return this._syncRequest && this._syncRequest.mode === RequestState.Working;
    }
    private sync(): Promise<IUserFullState> { // includeState: boolean
        // const deferred = P.defer<any>();
        return new Promise<IUserFullState>((res, rej) => {

            if (!this.isCurrentUser) {
                // StateLog.bgSynclogger.info("Starting " + this._credentials);
            }

            let eventsToSend = StateLog.getLogItemsForSync(this.logItems);
            if (eventsToSend.length === 0 && this._sessionInfo.isAlive) { // No new data to send
                StateLog.logger.info(this._credentials + ' Skip sync, no new data');
                res(null); // deferred.resolve(null);
                return;
                // return deferred.promise();
            }

            if (this._syncRequest.mode === RequestState.Working) {
                // if sync is ongoing, resync directly afterwards
                StateLog.logger.info(this._credentials + ' Already syncing, deferring to later!');
                // this._syncRequest.promise.always((v, err) => {
                this._syncRequest.promise.then(_ => { }).catch(_ => { }).then(_ => {
                    StateLog.logger.info(this._credentials + ' sync complete, start again: '
                        + this._syncRequest.mode + '/' + RequestState.Working);
                    this.sync().then(r1 => res(r1), e1 => rej(e1));
                });
                // this._syncRequest.promise.always((v, err) => {
                //     StateLog.logger.info(this._credentials + ' sync complete, start again: '
                //         + this._syncRequest.mode + '/' + RequestState.Working);
                //     this.sync().then(r1 => deferred.resolve(r1), e1 => deferred.reject(e1));
                // });
                return; // deferred.promise();
            }

            if (this._routerRequest.mode === RequestState.Working) {
                // chaining here... sync will happen after routerRequest completed
                // this._routerRequest.promise.always((v, err) => {
                this._syncRequest.promise.then(_ => { }).catch(_ => { }).then(_ => {
                    this.sync().then(r1 => res(r1), e1 => rej(e1));
                });
                return; // deferred.promise();
            }

            const userStateIndex = eventsToSend.findLastIndex(_ => _.isOfType(UserStatePushPlaceholderLogItem));
            if (userStateIndex >= 0) {
                // Switch back to a proper UserStatePush:
                eventsToSend.splice(userStateIndex, 1);
                eventsToSend.splice(userStateIndex, 0, UserStatePushLogItem.create(<UserStatePushLogItem>this.getCurrentUserState()));
                eventsToSend = eventsToSend.filter(_ => !_.isOfType(UserStatePushPlaceholderLogItem));
            }



            if (!this._sessionInfo.isAlive) {
                this._sessionInfo = new SessionInfo(); // We'll need a new session
            }

            const validationErrors = eventsToSend.map(_ => ({ item: _, validation: _.validate() }))
                .filter(_ => _.validation ? true : false);
            if (validationErrors.length) {
                StateLog.logger.warn('' + validationErrors.length + ' LogItem validation errors, first: '
                    + validationErrors[0].item.type + '/' + JSON.stringify(validationErrors[0].validation));
            }

            const convertedEvents = JSON.parse(LogItem.serializeList(eventsToSend));
            // JSON.stringify(convertedEvents, null, " ");
            const forDebug = eventsToSend.map(_ => _.type);
            if (forDebug.length > 10) {
                forDebug.splice(5, forDebug.length - 10, '...');
            }
            StateLog.logger.info(this._credentials + ' Start syncing ' + eventsToSend.length
                + ' items, include state:' + (eventsToSend.findIndex(_ => _.isOfType(UserStatePushLogItem)) >= 0)
                + ' ' + forDebug); // _.type == "USER_STATE_PUSH") >= 0));
            this.log(SyncInfoLogItem.create(<SyncInfoLogItem>{ isStartMarker: true }));
            // { "type": "SYNC", "sync_type": "START" });

            const syncData: any = {
                ApiKey: 'abc',
                Uuid: this._credentials,

                SessionToken: this._sessionInfo.sessionToken,
                RequestState: this._sessionInfo.sessionToken == null,
                Events: convertedEvents,
                ContinueOnEventsError: true

                , CurrentTime: Date.now()
                , Device: DeviceInfo.retrieve()
                , ClientApp: (<CognitionMattersApp>App.instance).appName
                , ClientVersion: '' + (<CognitionMattersApp>App.instance).appVersion
                + ',' + (<CognitionMattersApp>App.instance).appVersionUpdatedTo
            };
            if ((<CognitionMattersApp>App.instance).fps) {
                const fpsBins = (<CognitionMattersApp>App.instance).fps.bins;
                if (fpsBins && fpsBins.length > 0) {
                    syncData.FPS = [].concat(fpsBins);
                    fpsBins.splice(0, fpsBins.length);
                }
            }
            // this._syncRequest.baseUrl = "https://admin.cognitionmatters.org/api/sync/sync";
            // this._syncRequest.baseUrl = "http://localhost:56668/api/sync/sync";

            if (!this._useServer || !this._syncRequest.baseUrl) {
                if (syncData.RequestState) {
                    res(this._localStore.getStateAndSettings(true));
                } else {
                    res(null);
                }
                return; // deferred.promise();
            }

            const self = this;
            this._syncRequest.start(syncData)
                .then(msg => {
                    const json: any = JSON.parse(msg.responseText);
                    if (json.error && json.error !== 'OK') {
                        const xr = new AJAXResult();
                        xr.message = json.error;
                        rej(xr);
                    } else {
                        const currentState = self._localStore.getStateAndSettings(false);
                        let useThisState: IUserFullState = currentState;
                        if (json.state) {
                            const serverState: IUserFullState = <IUserFullState>JSON.parse(json.state);

                            if (serverState.training_settings && serverState.training_settings.customData
                                && serverState.training_settings.customData.clearClientUserData) {
                                delete serverState.training_settings.customData.clearClientUserData;
                                this._localStore.removeUserState();
                            }

                            // always use server's version of ServerSettings:
                            let serverSettings: any;
                            try {
                                serverSettings = self._localStore.setServerSettings(<IUserServerSettings>serverState);
                                // ObjectUtils.getProperties(new UserServerSettings()).forEach(_ => serverUserState[_] = serverState[_]);
                            } catch (err) {
                                // This is the first thing we're trying to store, so in an emergency,
                                // it's fairly OK to delete all localStorage data:
                                try {
                                    localStorage.clear();
                                    serverSettings = self._localStore.setServerSettings(<IUserServerSettings>serverState);
                                } catch (err2) {
                                }
                            }
                            // check timestamp - should we use local or server user state:
                            const serverUserState = new UserGeneratedState();
                            Object.keys(serverUserState).forEach(_ => { if (serverState[_]) { serverUserState[_] = serverState[_]; } });
                            const hadLocalUserState = self._localStore.getUserState(false) != null;
                            const localUserState = self._localStore.getUserState(true);
                            // <IUserFullState>ObjectUtils.override(new UserGeneratedState(), self._localStore.getUserState(false), true);

                            const debugSync = serverState.training_settings.customData
                                && serverState.training_settings.customData.debugSync;
                            if (debugSync) {
                                Logger.info('lastTimeStamp server: ' + serverUserState.exercise_stats.lastTimeStamp
                                    + ' local:' + localUserState.exercise_stats.lastTimeStamp);
                                Logger.info('lastLogin server: ' + serverUserState.exercise_stats.lastLogin
                                    + ' local:' + localUserState.exercise_stats.lastLogin);
                                Logger.info('trainingDay server: ' + serverUserState.exercise_stats.trainingDay
                                    + ' local:' + localUserState.exercise_stats.trainingDay);
                                Logger.info('appVersion server: ' + serverUserState.exercise_stats.appVersion
                                    + ' local:' + localUserState.exercise_stats.appVersion);
                            }

                            let userState = localUserState;
                            if (!hadLocalUserState
                                || localUserState.exercise_stats.lastTimeStamp < serverUserState.exercise_stats.lastTimeStamp) {
                                if (debugSync) {
                                    Logger.info('Use server\'s user state');
                                }
                                userState = serverUserState;
                                self._localStore.setUserState(serverUserState);
                            }
                            // if (debugSync) {
                            //    ConsoleCmdDiagnostics.uploadData({ "userState": userState, "serverSettings": serverSettings });
                            // }
                            useThisState = <IUserFullState>ObjectUtils.merge(userState, serverSettings);
                            // useThisState = self._localStore.getStateAndSettings(false);
                            // Just to utilize that this function inserts any incorrect null values
                            if (debugSync) {
                                Logger.info('useThisState day:' + useThisState.exercise_stats.trainingDay
                                    + ' v:' + useThisState.exercise_stats.appVersion
                                    + ' lts:' + useThisState.exercise_stats.lastTimeStamp);
                            }
                        } else {
                            useThisState = currentState;
                        }

                        // if (currentState.training_settings && currentState.training_settings.syncSettings) {
                        //    currentState.training_settings.syncSettings.
                        // }

                        if (self._sessionInfo.sessionToken) {
                            if (json.sessionToken && json.sessionToken !== self._sessionInfo.sessionToken) {
                                // Server switched session (regarded old session as invalid) - do nothing
                                // TODO: verify, right now this can't happen, right?
                            }
                        } else {
                            if (json.sessionToken) {
                                self._sessionInfo.sessionToken = json.sessionToken;
                            } else {
                                throw new Error('No sessionToken returned from server');
                            }
                        }

                        if (json.warning) {
                            StateLog.logger.warn('Sync warning: ' + json.warning);
                        }
                        self._sessionInfo.lastSuccessfulCall = new Date();
                        // if (!json.phasesInsertFail) {
                        self.postSyncClean();
                        // }
                        self.log(SyncInfoLogItem.create(<SyncInfoLogItem>{ isStartMarker: false, success: true }));
                        // { "type": "SYNC", "sync_type": "SUCCESS" });
                        res(useThisState);
                    }
                }, err => {
                    // (msg) => {
                    let ajaxResult: AJAXResult = null;
                    if (ObjectUtils.isOfType(err, AJAXResult)) {
                        ajaxResult = <AJAXResult>err;
                    } else if (err.message && ObjectUtils.isOfType(err.message, AJAXResult)) {
                        ajaxResult = <AJAXResult><any>err.message;
                    } else {
                        ajaxResult = new AJAXResult();
                        ajaxResult.responseText = err.message;
                    }
                    if (ajaxResult.responseText && ajaxResult.responseText.indexOf('{') === 0) {
                        const tmp = JSON.parse('' + ajaxResult.responseText);
                        if (tmp) {
                            if (tmp.exceptionMessage) {
                                ajaxResult.message = tmp.exceptionMessage;
                            }
                        }
                    }
                    const msg = ajaxResult.message ? ajaxResult.message : ajaxResult.responseText;
                    // .message + ((<any>err).exceptionMessage ? ": " + (<any>err).exceptionMessage : "");
                    this.log(SyncInfoLogItem.create(<SyncInfoLogItem>{ error: msg }));
                    // StateLog.logger.error("Sync error: " + msg);
                    rej(ajaxResult); // deferred.reject({ message: msg });
                });
            // true);
            // return deferred.promise();
        });
    }

    private postSyncClean(): void {
        // Remove everything except last Phase/Problem - in case phase wasn't completed so server can find correct ones in db
        let keepForLater: LogItem[] = [];
        let foundProblem = false;
        let foundPhase = false;
        let indexSyncStart = -1;
        for (let i: number = this.logItems.length - 1; i >= 0; i--) {
            const logItem: any = this.logItems[i];
            if (indexSyncStart < 0) {
                if (logItem.isOfType(SyncInfoLogItem) && (<SyncInfoLogItem>logItem).isStartMarker) {
                    // logItem.type == "SYNC" && logItem.sync_type == "START") { //
                    indexSyncStart = i;
                }
                continue;
            }
            if (!foundProblem && logItem.isOfType(NewProblemLogItem)) { // logItem.type == LogType.NEW_PROBLEM) {
                keepForLater.push(logItem);
                foundProblem = true;
            } else if (!foundPhase && logItem.isOfType(NewPhaseLogItem)) { // logItem.type == LogType.NEW_PHASE) {
                keepForLater.push(logItem);
                foundPhase = true;
            }
        }
        if (keepForLater.length === 3 || keepForLater.length === 2) {
            if (keepForLater.length === 2) {
                keepForLater.push(SyncLogStateLogItem.create(<SyncLogStateLogItem>{ syncedUpToHere: true }));
            } else {
                StateLog.logger.warn('keepForLater.length == 3 shouldn\'t happen');
                // keepForLater[0].type = "ALREADY_SYNCED"; //OLD_SESSION
            }
            keepForLater.reverse();
            keepForLater.push(SyncLogStateLogItem.create(<SyncLogStateLogItem>{ syncedUpToHere: false }));
            // keepForLater.push({ type: "NOT_SYNCED" });
            // Append items that came after sync started:
            this.logItems = this.logItems.splice(indexSyncStart + 1);
            keepForLater = keepForLater.concat(this.logItems);
            this.logItems = keepForLater;
        } else {
            this.logItems = [];
        }
        StateLog.logger.debug(this._credentials + ' Set cleaned-up log');
        this._localStore.setLog(this.logItems);
    }
}
