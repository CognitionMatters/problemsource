import { App} from '@jwmb/pixelmagic/lib/app/app';
import { SoundPlayer } from '@jwmb/pixelmagic/lib/app/soundPlayer';
import { PlanetInfo } from '../trainingPlan/PlanetBundler';
import { CognitionMattersPageType, CognitionMattersApp } from '../app';
import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleTextEx } from '@jwmb/pixelmagic/lib/ui/simpleTextEx';
import { FPSDisplay } from '@jwmb/pixelmagic/lib/ui/fpsDisplay';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { GameDefinition } from '../trainingPlan/gameDefinition';
import { TrainingPlan } from '../trainingPlan/TrainingPlan';
import { TriggerData, TriggerActionData, TriggerTimeType } from '../triggerManager';
import { GameState } from '../gameState';
import axios from 'axios';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { cmdCmd, ConsoleCmdDef, cmdArgument } from '@jwmb/pixelmagic/lib/console/consoleManager';
import { ExerciseScreen } from '../games/exerciseScreen';
import { TestStatistics } from '../toRemove/testStatistics';
import { TrainingPlanScreenBase } from '../screens/trainingPlanScreenBase';
import { EndType } from '../phasing/endCriteriaEndType';


@cmdCmd({ description: 'Go back', shortName: 'back', longName: '' })
export class ConsoleCmdBack extends ConsoleCmdDef {
    @cmdArgument({ shortName: 'p', description: 'Phase set as complete' })
    phaseComplete = '';

    protected _execute(): any { // cl: CommandLine): any {
        const currentPage = App.instance.currentPage;
        if (ObjectUtils.isOfType(currentPage, ExerciseScreen)) {
            if (this.wasArgumentProvided('phaseComplete')) {
                TestStatistics.instance.currentPhase.endCriteriaManager.endType = EndType.TARGET;
            }
            (<ExerciseScreen>currentPage).onMenuButton();
        } else if (ObjectUtils.isOfType(currentPage, TrainingPlanScreenBase)) {
            App.instance.showPage(CognitionMattersPageType.PAGE_LOGIN);
        }
        return null;
    }
}

// @cmdCmd({ description: 'Show or change rendering mode', shortName: 'rdr', longName: 'renderer' })
// export class ConsoleCmdRenderer extends ConsoleCmdDef {
//     @cmdArgument({ shortName: 'm', description: 'Toggle renderMode' })
//     toggleMode = false;
//     @cmdArgument({ shortName: 's', description: 'Toggle size' })
//     toggleSize = false;
//     @cmdArgument({ shortName: 'd', description: 'Delete localStorage data' })
//     deleteData = false;

//     protected _execute(): any {
//         const rndr = App.instance.rendererManager.renderer; // App.instance.renderer
//         const result = [];
//         if (this.deleteData) {
//             localStorage.removeItem(RendererManager.localStorageKey);
//             result.push('Delete localStorage settings');
//         }
//         const settings = RendererManager.applyPresetRenderSettings(App.instance.rendererManager.renderSettings);
//         result.push('current: renderer=' + RendererManager.getName(rndr.type) + ' size=' + settings.width + 'x' + settings.height);
//         if (this.toggleMode) {
//             const changeTo = rndr.type === PIXI.RENDERER_TYPE.WEBGL ? PIXI.RENDERER_TYPE.CANVAS : PIXI.RENDERER_TYPE.WEBGL;

//             settings.renderer = changeTo;

//             localStorage.setItem(RendererManager.localStorageKey, JSON.stringify(settings));
//              // { "numeric": changeTo, "name": rendererString }));
//             result.push('set renderer to ' + RendererManager.getName(changeTo) + '. Active after app restart');
//         }
//         if (this.toggleSize) {
//             const ss = RendererManager.getSizeSettings(settings.maxHeight === 1024);
//             ObjectUtils.merge(settings, ss);
//             // if (settings.maxHeight == 1024) {
//             //    settings.height = 768;
//             //    settings.maxHeight = 768;
//             //    settings.width = 1024;
//             //    settings.maxWidth = 1024;
//             // } else {
//             //    settings.height = 1024;
//             //    settings.maxHeight = 1024;
//             //    settings.width = 768;
//             //    settings.maxWidth = 768;
//             // }
//             localStorage.setItem(RendererManager.localStorageKey, JSON.stringify(settings));
//             if (true) {
//             }
//             result.push('set size to ' + settings.width + 'x' + settings.height + '. Active after app restart');
//         }
//         return result.join('\n');
//     }
// }

// @cmdCmd({ description: 'Call AJAX.get', shortName: 'get', longName: 'get' })
// export class ConsoleCmdGet extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'url' })
//     url = 'sync-eunorth02.cognitionmatters.org/api/relay/GetSyncUrls?uuid=hetadejo'; // google.com";

//     @cmdArgument({ shortName: 'a', description: 'async' })
//     useAsync = true;

//     protected _execute(): any {
//         if (this.url.indexOf('http') !== 0) {
//             this.url = 'http://' + this.url;
//         }
//         // { 'Content-Type': 'text/plain; charset=utf-8', 'Accept': '*/*' }, // application/json text/plain
//         axios.get(this.url).then(res => {
//             Logger.info(res.data);
//         }, err => {
//             Logger.info(JSON.stringify(err, null, ' '));
//          });
//         return 'Starting axios.get (async:' + this.useAsync + ') ' + this.url;
//     }
// }

// @cmdCmd({ description: 'Switch between architectures', shortName: 'arch', longName: 'architecture' })
// export class ConsoleCmdArchitecture extends ConsoleCmdDef {
//     protected _execute(): any {
//         if (!GameState.trainingSettings.customData) {
//             GameState.trainingSettings.customData = {};
//         }
//         const cd = GameState.trainingSettings.customData;
//         if (!cd.nuArch) {
//             cd.nuArch = {};
//         }
//         cd.nuArch.skip = !cd.nuArch.skip;
//         return 'Using nuArch: ' + (!cd.nuArch.skip);
//     }
// }

// @cmdCmd({ description: 'Skill level inspection', shortName: 'skill', longName: 'skill' })
// export class ConsoleCmdSkill extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'set skill level' })
//     skill = 0;

//     @cmdArgument({ shortName: 'a', description: 'set accuracies (e.g. "0-10:1 8:0.6" NOTE: double quotes needed )' })
//     accuracies = '';

//     protected _execute(): any {
//         const result = [];
//         // if (ExerciseScreen.isRunning) {
//             let lvlMgr: any = null;
//             try {
//                 const phase = TestStatistics.instance.currentPhase;
//                 lvlMgr = (<any>phase).lvlMgr;
//             } catch (err) { }
//             const lm = <LevelArrowsChangePhase>lvlMgr.lm;
//             if (lm) {
//                 const state = (<any>lm).regulationState;
//                 if (state) {
//                     result.push('Skill:' + state.skill + ' skillAtMax:' + state.skillAtMaxLevel);
//                     if (this.wasArgumentProvided('skill')) {
//                         result.push('New skill level: ' + this.skill);
//                     }

//                     let prevL2A = '';
//                     for (const p in state.levelToAccuracy) {
//                         const arr = state.levelToAccuracy[p];
//                         if (arr && arr.length) {
//                             prevL2A += ('' + p).replace('lvl', '') + ':' + arr[arr.length - 1] + ' ';
//                         }
//                     }
//                     result.push('Latest accuracies: ' + prevL2A);

//                     if (this.accuracies) {
//                         const items = this.accuracies.split(' ');
//                         let tmpInfo = '';
//                         items.forEach(item => {
//                             const kv = item.split(':');
//                             const acc = parseFloat(kv[1]);
//                             const keySplit = kv[0].split('-').map(_ => parseInt(_, 10));
//                             if (keySplit.length === 1) {
//                                 keySplit.push(keySplit[0]);
//                             }

//                             for (let lvl = keySplit[0]; lvl <= keySplit[1]; lvl++) {
//                                 const accs = (<any>lm).getAccuracies(lvl);
//                                 accs.push(acc);
//                                 tmpInfo += '' + lvl + ':' + acc + ' ';
//                                 // state.levelToAccuracy["lvl" + i] = ;
//                             }
//                         });
//                         result.push('Set accuracies: ' + tmpInfo);
//                     }
//                 }
//             }
//         // }
//         if (!result.length) {
//             result.push('No skill state present (are you in the correct exercise?)');
//         }
//         return result.join('\n');
//     }
// }
// @cmdCmd({ description: 'Remove user data from server and/or client', shortName: 'rm', longName: 'removeUser' })
// export class ConsoleCmdRemoveUser extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'account uuid' })
//     removeUser = '';
//     @cmdArgument({ shortName: 's', description: 'server - only works for accounts with \'resettable\' group' })
//     fromServer = false;
//     @cmdArgument({ shortName: 'c', description: 'client' })
//     fromClient = true;

//     protected _execute(): any {
//         const def = P.defer<string>();
//         if (!this.removeUser) {
//             def.resolve('No user supplied');
//         } else {
//             const result = [];
//             if (this.fromClient) {
//                 UserLocalStore.deleteUser(this.removeUser);
//                 result.push('Deleted local data');
//             }
//             if (this.wasArgumentProvided('fromServer')) {
//                 LoginLogic.deleteLocalUserResetServer(this.removeUser).always((v, err) => {
//                     result.push(err ? 'Problem deleting data from server: ' + err.message : 'Deleted data from server');
//                     def.resolve(result.join(', '));
//                 });
//                 // LoginLogic.deleteLocalUserResetServer(this.removeUser).then(_ => {
//                 //    result.push("Deleted data from server");
//                 //    def.resolve(result.join(", "));
//                 // }).fail(err => {
//                 //    result.push();
//                 //    def.resolve(result.join(", "));
//                 // });
//             } else {
//                 if (result.length === 0) {
//                     result.push('No action performed');
//                 }
//                 def.resolve(result.join(', '));
//             }
//         }
//         return def.promise();
//     }
// }
// @cmdCmd({ description: 'LocalStorage inspection', shortName: 'locs', longName: 'localStorageInfo' })
// export class ConsoleCmdLocalStorageInfo extends ConsoleCmdDef {
//     @cmdArgument({ shortName: 'r', description: 'remove user from localStorage. * means all users' })
//     removeUser = '';
//     protected _execute(): any {
//         const result = [];

//         try {
//             result.push('Keys: (' + Object.keys(localStorage).length + ') ' + Object.keys(localStorage).join(','));
//             const total = Object.keys(localStorage).map(_ => ('' + localStorage[_]).length).reduce((p, c) => p + c);
//             // var magnitude = Math.log(total) / Math.log(10);
//             result.push('Used: ' + ConsoleCmdLocalStorageInfo.bytesToString(total));
//             if ((<any>localStorage).remainingSpace) {
//                 result.push('Remaining: ' + ConsoleCmdLocalStorageInfo.bytesToString((<any>localStorage).remainingSpace));
//             }
//         } catch (err) { }


//         if (this.removeUser) {
//             let toRemove = [];
//             if (this.removeUser === '*') {
//                 toRemove = UserLocalStore.globalCacheSettings.users.map(_ => _.uuid);
//             } else {
//                 toRemove.push(this.removeUser);
//             }
//             toRemove.forEach(u => {
//                 const found = UserLocalStore.globalCacheSettings.users.find(_ => _.uuid === u);
//                 if (found) {
//                     result.push('removed ' + u);
//                     UserLocalStore.deleteUser(u);
//                 } else {
//                     result.push('user ' + u + ' not found');
//                 }
//             });
//         }

//         const withUnsynced = UserLocalStore.getUsersWithUnsyncedData();
//         let totalSize = 0;
//         const info = UserLocalStore.globalCacheSettings.users.map(u => {
//             let size = 0;
//             try {
//                 size = new UserLocalStore(u.uuid, false).getSize();
//                 totalSize += size;
//             } catch (err) { }
//             const hasUnsynced = withUnsynced.find(_ => _.uuid === u.uuid) != null;
//             return u.uuid + ': last=' + u.touchedTime + ' hasUnsynced=' + hasUnsynced
//                 + ' size=' + ConsoleCmdLocalStorageInfo.bytesToString(size);
//         });
//         info.push('Total size: ' + ConsoleCmdLocalStorageInfo.bytesToString(totalSize));
//         result.push(info.join('\n'));


//         return result.join('\n');
//     }
//     static bytesToString(bytes: number) {
//         const units = ['bytes', 'kB', 'MB'];
//         let unit = '';
//         for (let i = 0; i < units.length; i++) {
//             unit = units[i];
//             if (bytes < 1024) {
//                 break;
//             }
//             bytes /= 1024;
//         }
//         return '' + Math.round(bytes * 10) / 10 + ' ' + unit;
//     }
// }

// @cmdCmd({ description: 'Set game volume', shortName: 'vol', longName: 'volume' })
// export class ConsoleCmdVol extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'if argument is > 1, it\'s divided by 100' })
//     volume = 0;
//     protected _execute(): any {
//         let vol = this.volume;
//         if (this.wasArgumentProvided('volume')) {
//             vol = SoundManager.masterVolume > 0 ? 0 : 1;
//         }
//         SoundManager.masterVolume = vol > 1 ? vol / 100 : vol;
//         return 'set vol to ' + Math.round(100 * SoundManager.masterVolume) + '%';
//     }
// }
// @cmdCmd({ description: 'Shortcut to \'up level=\'', shortName: 'lvl', longName: 'setLevel' })
// export class ConsoleCmdLevel extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'level to set' })
//     level = 1;
//     @cmdArgument({ shortName: 'h', description: 'set GameState\'s highest and last Level for current exercise' })
//     highestLevel = -1;
//     protected _execute(): any {
//         const result = [];
//         App.instance.urlParameters.level = this.wasArgumentProvided('level') ? this.level : undefined;
//         result.push('Level set to ' + App.instance.urlParameters.level
//             + (TestStatistics.instance ? ' (current level: ' + TestStatistics.instance.levelCurrentProblem + ')' : ''));

//         if (this.wasArgumentProvided('highestLevel')) {
//             if (TestStatistics.instance && TestStatistics.instance.currentPhase) {
//                 // if (ExerciseScreen.isRunning) {
//                 const testId = TestStatistics.instance.currentGameId;
//                  // (<ExerciseScreen>App.instance.currentPage).pr.currentPhase.testId
//                 if (testId) {
//                     const lvl = this.highestLevel >= 0 ? this.highestLevel : App.instance.urlParameters.level;
//                     throw new Error('console setExerciseHighestLevel/setExerciseLastPhaseLevel not implemented');
//                     //// GameState.exerciseStats.setExerciseHighestLevel(testId, lvl);
//                     //// GameState.exerciseStats.setExerciseLastPhaseLevel(testId, lvl);
//                     // TestStatistics.instance.levelLastProblem = lvl;
//                     // result.push("Set GameState highest and last level for " + testId + ": " + lvl);
//                 }
//             }
//         }
//         //
//         return result.join('\n');
//     }
// }
// @cmdCmd({ description: 'Toggle url parameter \'nocountdown\'', shortName: 'tcd', longName: 'toggleCountDown' })
// export class ConsoleCmdNoCountDown extends ConsoleCmdDef {
//     protected _execute(): any {
//         App.instance.urlParameters.nocountdown = !App.instance.urlParameters.nocountdown;
//         return 'nocountdown:' + App.instance.urlParameters.nocountdown;
//     }
// }

// @cmdCmd({ description: 'Go exercise', shortName: 'go', longName: 'goExercise' })
// export class ConsoleCmdGo extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'Exercise ID or title' })
//     idOrTitle = '';
//     protected _execute(): any {
//         if (ObjectUtils.isOfType(App.instance.currentPage, TrainingPlanScreenBase)) {
//             const tps = App.instance.currentPage;
//             const flattened = SceneGraphUtils.getFlattened(tps);
//             const planets = flattened.filter(_ => {
//                 const i = (<any>_).info;
//                 return i && i.data && i.data.id; // ObjectUtils.isOfType(i, PlanetInfo);
//             }).map(_ => <PlanetInfo>(<any>_).info);

//             let found = planets.find(_ => _.nextGame.id === this.idOrTitle);
//             if (!found) {
//                 found = planets.findLast(_ => _.nextGame.title === this.idOrTitle);
//                 if (!found) {
//                     found = planets.findLast(_ => _.nextGame.id.toLowerCase().indexOf(this.idOrTitle.toLowerCase()) >= 0);
//                     if (!found) {
//                         found = planets.findLast(_ => _.nextGame.title.toLowerCase().indexOf(this.idOrTitle.toLowerCase()) >= 0);
//                     }
//                 }
//             }
//             if (found) {
//                 App.instance.showPage(CognitionMattersPageType.PAGE_EXERCISE, found.nextGame);
//                 return 'Start ' + found.nextGame.id + ' / ' + found.nextGame.title;
//             }
//         }
//         return 'None found';
//     }
// }

// @cmdCmd({ description: 'Set urlParameters', shortName: 'up', longName: 'setUrlParameters' })
// export class ConsoleCmdUrlParameters extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'parameters in url format, e.g. level=5&countDown=false' })
//     parameters = '';
//     protected _execute(): any {
//         /// \w+:/
//         const pairs = this.parameters.split('&');
//         pairs.forEach(_ => {
//             const pair = _.split('=');
//             App.instance.urlParameters[pair[0]] = pair[1];
//         });
//         // var obj = JSON.parse("{" + this.parameters + "}");
//         // for (var p of obj) {
//         //    App.instance.urlParameters[p] = obj[p];
//         // }
//         return 'ok'; // level set to " + this.level;
//     }
// }


// @cmdCmd({ description: 'StateLog info', shortName: 'sl', longName: 'stateLog' })
// export class ConsoleCmdStateLogInfo extends ConsoleCmdDef {
//     @cmdArgument({ shortName: 's', description: 'split log in localStorage at ' })
//     logSplit = 0;

//     @cmdArgument({ shortName: 'g', description: 'Save game state (GameState.saveState())' })
//     saveGameState = false;


//     protected _execute(): any { // cl: CommandLine): any {
//         if (!StateLog.instance) {
//             return 'No user logged in';
//         }
//         let result = '';
//         if (this.wasArgumentProvided('logSplit')) {
//             StateLog.instance.getLocalStoreDEBUGGING().splitLogAt = this.logSplit;
//             result += 'Set splitLogAt to ' + this.logSplit + '\n';
//         }

//         let log = StateLog.instance.getLogItemsCopyDEBUGGING();
//         log = log.filter(_ => !_.isOfType(UserStatePushLogItem));
//         // var tmp = LogItem.serializeList(log);
//         result += 'numItems: ' + log.length + ' serialized:' + Math.round(LogItem.serializeList(log).length / 1024) + ' kB' +
//             ' from localStorage: ' + StateLog.instance.getLocalStoreDEBUGGING().getLog().length
// + '\nsplit: ' + StateLog.instance.getLocalStoreDEBUGGING().getSplitInfo();

//         result += '\n' + log.splice(Math.max(0, log.length - 5)).map(_ => JSON.stringify(_)).join('\n');

//         if (this.saveGameState) {
//             const sl = StateLog.instance.getLocalStoreDEBUGGING();
//             const sizeBefore = sl.getSize();
//             const logLengthBefore = StateLog.instance.getLogItemsCopyDEBUGGING().length;
//             const userStateLengthBefore = JSON.stringify(sl.getUserState(true)).length;
//             PixelMagic.GameState.saveState();
//             result += '\nSaved state. localStorage size before: ' + sizeBefore + ', after: ' + sl.getSize();
 // ConsoleCmdLocalStorageInfo.bytesToString(
//             result += '\nlogItems length before:' + logLengthBefore + ', after: ' + StateLog.instance.getLogItemsCopyDEBUGGING().length;
//             result += '\nuserState length before:' + userStateLengthBefore + ', after: ' + JSON.stringify(sl.getUserState(true)).length;
//         }

//         return result;
//     }
// }
// @cmdCmd({ description: 'Add logItems to user', shortName: 'ali', longName: 'addLogItems' })
// export class ConsoleCmdAddLogItems extends ConsoleCmdDef {
//     @cmdArgument({ shortName: 'n', description: 'number of NullLogItems to add' })
//     numLogItems = 0;
//     @cmdArgument({ shortName: 'z', description: 'size of each item\'s data property' })
//     dataSize = 30;

//     protected _execute(): any { // cl: CommandLine): any {
//         if (!StateLog.instance) {
//             return 'No user logged in';
//         }
//         const data = Number.range(1, this.dataSize).map(_ => ('' + _ % 10)).join('');
//         const time = Date.now();
//         Number.range(1, this.numLogItems).forEach(_ =>
//             StateLog.instance.log(new NullLogItem({ data: data }))
//         );
//         const elapsed = Date.now() - time;
//         const otherInfo = ConsoleCmdDef.getCmd('sl').execute(null);
//         return 'Added ' + this.numLogItems + ' items, ' + (elapsed / this.numLogItems).toPrecision(2)
// + ' ms/item. Statelog: ' + otherInfo; // StateLog.instance.getLogItemsCopyDEBUGGING().length;
//     }
// }

// @cmdCmd({ description: 'watermark', shortName: 'watermark', longName: 'watermark' })
// export class ConsoleCmdWatermark extends ConsoleCmdDef {
//     static createWatermark(): ContainerBase {
//         const watermark = new ContainerBase();
//         watermark.name = 'watermark';
//         Number.range(0, 4).forEach(_ => {
//             const protoText = new SimpleTextEx('Internal prototype', { font: '72px OswaldBold', fill: '#ffffff' });
//             protoText.alpha = 0.2;
//             protoText.y = 200 * _;
//             protoText.x = 100 + 200 * _;
//             watermark.addChild(protoText);
//         });
//         return watermark;
//     }
//     protected _execute(): any {
//         const root = SceneGraphUtils.getRoot(App.instance.pageContainer);
//         const found = root.getChildByName('watermark');
//         if (found) {
//             (<ContainerBase>found).dispose();
//         } else {
//             root.addChild(ConsoleCmdWatermark.createWatermark());
//         }
//     }
// }

// @cmdCmd({ description: 'Character/Hero settings', shortName: 'hero', longName: 'heroSettings' })
// export class ConsoleCmdCharacter extends ConsoleCmdDef {
//     @cmdArgument({ shortName: 'p', description: 'attack power (current staff)' })
//     attackPower = -1;
//     @cmdArgument({ shortName: 't', description: 'attack type (current staff)' })
//     attackType = -1;
//     @cmdArgument({ shortName: 's', description: 'staff (e.g. electric, fire...)' })
//     staffType = '';
//     @cmdArgument({ shortName: 'l', description: 'hero level' })
//     heroLevel = 0;

//     protected _execute(): any { // cl: CommandLine): any {
//         const c = new Character.CharacterModelHero();
//         const result = [];
//         if (this.attackPower >= 0) {
//             result.push('Staff power ' + c.staff.attackPower + ' -> ' + this.attackPower);
//             c.staff.attackPower = this.attackPower;
//         }
//         if (this.wasArgumentProvided('staffType')) {
//             const staffs = <Character.Staff[]>Character.CharacterPartsRepository.instance.registered
//                 .filter(_ => ObjectUtils.isOfType(_.type, Character.ItemTypeStaff));
//             if (!this.staffType) {
//                 result.push(staffs.map(_ => _.id.replace('Staff', '')).join(', '));
//             } else {
//                 const staff = staffs.find(_ => _.id.indexOf(this.staffType) === 0);
//                 result.push('Staff ' + c.staff.id + ' -> ' + staff.id);
//                 Character.CharacterPartsRepository.instance.get(staff.id);
//                 if (!c.getItemById(staff.id)) {
//                     c.pickup(staff);
//                 }
//                 c.equip(staff);
//                 c.save();
//             }
//         }
//         if (this.attackType >= 0) {
//             result.push('Staff attack type ' + c.staff.attackType + ' -> ' + this.attackType);
//             c.staff.attackType = this.attackType;
//         }
//         if (this.heroLevel > 0) {
//             result.push('Hero level ' + c.level + ' -> ' + this.heroLevel);
//             c.level = this.heroLevel;
//         }

//         if (!result.length) {
//             const name = 'hero';
//             const root = SceneGraphUtils.getRoot(App.instance.pageContainer);
//             const found = root.getChildByName(name);
//             if (found) {
//                 (<HeroCharacter>found).dispose();
//             } else {
//                 const hc = new HeroCharacter();
//                 hc.name = name;
//                 hc.position = new PIXI.Point(300, 300);
//                 root.addChild(hc);
//             }
//             result.push('' + (found ? 'Removed' : 'Added') + ' hero');
//         }
//         return result.join('\n');
//     }
// }

// @cmdCmd({ description: 'Div tests', shortName: 'diag', longName: 'diagnostics' })
// export class ConsoleCmdDiagnostics extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'upload localStorage for uuid data to server (use logged in user if not provided)' })
//     uuid = '';
//     protected _execute(): any {
//         // Upload file to server
//         const syncData: any = {};
//         if (this.wasArgumentProvided('uuid')) {
//             const uuid = this.uuid || ConsoleCmdUserTest.getAccountUuid();
//             if (uuid) {
//                 syncData.uuid = uuid;
//                 const uls = new UserLocalStore(uuid);
//                 const data = uls.getStateAndSettings(false);
//                 syncData.stateAndSettings = data;
//             }
//         }

//         if (syncData) {
//             ConsoleCmdDiagnostics.uploadData(syncData);
//             return 'Uploading data...';
//         }
//         return 'No data to upload';
//     }
//     public static uploadData(syncData: any) {
//         // var url = "http://localhost:56665/api/sync/sync";
//         let url = StateLog.syncUrl;
//         url = url.replace('api/sync/sync', 'api/sync/upload');
//         const rq = new WebRequest(url, 'POST');
//         // rq.headers = { "Content-Type": "text/plain" };
//          // application/json text/plain application/x-www-form-urlencoded  , "Accept": "text/plain"
//         // var strData = "data=" + JSON.stringify(syncData);
//         // var strData = "data=" + 'mystring';
//         // var strData = JSON.stringify({ "data": "mystring"});
//         const strData = JSON.stringify({ 'Data': JSON.stringify(syncData) }); // syncData
//         rq.start(strData).then(result => {
//             Logger.info('Uploaded: ' + (result.responseText || JSON.stringify(result)));
//         }).fail(err => {
//             let msg = '';
//             if (err && (<any>err).responseText) {
//                 const jErr = JSON.parse((<any>err).responseText);
//                 if (jErr) {
//                     msg = '' + jErr.message + ' ' + jErr.exceptionMessage; // exceptionType stackTrace
//                 }
//             }
//             if (!msg) {
//                 msg = JSON.stringify(err);
//             }
//             Logger.error('Upload error: ' + msg);
//         });
//     }
// }
// @cmdCmd({ description: 'Log in', shortName: 'login', longName: '' })
// export class ConsoleCmdLogin extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'username' })
//     username = '';
//     protected _execute(): any {
//         LoginLogic.login(this.username).then(result => {
//             if (ObjectUtils.isOfType(result, LoggedInResultOK)) {
//                 App.instance.showPage(CognitionMattersPageType.PAGE_MAP, (<LoggedInResultOK>result).state.training_plan);
//             } else if (ObjectUtils.isOfType(result, LoggedInResultDoneToday)) {
//                 Logger.error('Already logged in today');
//             } else {
//                 Logger.error('Unknown login problem: ' + JSON.stringify(result));
//             }
//         });
//     }
// }
// @cmdCmd({ description: 'Div tests', shortName: 'xxx', longName: '' })
// export class ConsoleCmdXXX extends ConsoleCmdDef {
//     @cmdArgument({ shortName: '', description: 'some arg' })
//     someArg = '';
//     @cmdArgument({ shortName: 'a', description: 'argA' })
//     argA = '';

//     protected _execute(): any { // cl: CommandLine): any {
//         const result = [];
//         // var bmp = new SimpleBitmap("cloud03.psd");
//         // var t = Misc.snapShot(bmp);
//         // var tmp = new SimpleBitmap(t);
//         // tmp.position = new PIXI.Point(100, 100);
//         // SceneGraphUtils.getRoot(App.instance.pageContainer).addChild(tmp);

//         // t = Misc.snapShot(tmp);
//         // var tmp2 = new SimpleBitmap(t);
//         // tmp2.position = new PIXI.Point(200, 200);
//         // SceneGraphUtils.getRoot(App.instance.pageContainer).addChild(tmp2);
//         // return null;

//         let found: PIXI.DisplayObject = null;
//         if (this.someArg === '__tenpals') {
//             // found = new DraggableTenPalsBar(3, "COLORS/BARS", 5);
//             const t = TenPalsBar.createTenpalUnitBitmap(3, false, true, 5, 'COLORS/BARS');
//             const aa = new SimpleBitmap(t);
//             const cb = new ContainerBase();
//             cb.addChild(aa);
//             found = cb;
//             // } else if (this.someArg == "__tenpals") {
//         } else if (this.someArg === 'slider') {
//             const f = <ContainerBase>App.instance.pageContainer.getChildByName('slider');
//             if (f) {
//                 f.dispose();
//             } else {
//                 TouchDrag.debug = true;
//                 const tmp = new ContainerBase();
//                 tmp.name = 'slider';
//                 tmp.position = new PIXI.Point(39, 651);
//                 tmp.addChild(new ArrowsHandle(944, 0, 10, 1));
//                 App.instance.pageContainer.addChild(tmp);
//             }
//         }

//         if (found) {
//             found.position = new PIXI.Point(200, 200);
//             App.instance.pageContainer.addChild(found);
//         } else {
//             if (this.someArg) {
//                 found = SceneGraphUtils.selectOne(this.someArg, App.instance.pageContainer);
//                 // found = SceneGraphUtils.getDescendantByNameOrClassName(this.someArg, App.instance.pageContainer);
//             } else {
//                 // var aa = new PIXI.Graphics();
//                 // aa.beginFill(0xff0000, 0.2).drawCircle(0, 0, 50).endFill();
//                 // var t = Misc.snapShot(aa);
//                 // found = new SimpleBitmap(t);
//                 // found = aa;
//                 found = new SimpleBitmap('cloud03.psd');
//                 found.position = new PIXI.Point(200, 200);
//                 App.instance.pageContainer.addChild(found);
//             }
//         }
//         const ms = parseInt(this.argA || '0');
//         const func = () => this.showSnapshot(found);
//         if (ms === 0) {
//             func(); // this.showSnapshot(found);
//         } else {
//             setTimeout(func, ms - 1);
//         }
//         return result.join('\n');
//     }
//     showSnapshot(found: PIXI.DisplayObject): void {
//         if (!found) {
//             return;
//         }
//         const bounds = found.getLocalBounds();
//         const tx = new PIXI.RenderTexture(<PIXI.CanvasRenderer>App.instance.rendererManager.renderer,
//             Math.ceil(bounds.width), Math.ceil(bounds.height));
//         const matrix = new PIXI.Matrix();
//         matrix.tx = -bounds.x;
//         matrix.ty = -bounds.y;
//         tx.render(found, matrix, false);

//         const d = new SimpleBitmap(tx);
//         this.copyBasicSettings(found, d);
//         d.position = new PIXI.Point(300, 300);
//         App.instance.pageContainer.addChild(d); // SceneGraphUtils.getRoot(App.instance.pageContainer)

//         // tx = Misc.snapShot(found);
//         // d = new SimpleBitmap(tx);
//         // this.copyBasicSettings(found, d);
//         // d.position = new PIXI.Point(300, 400);
//         // App.instance.pageContainer.addChild(d);
//         // result.push("snapshot " + d.width + "x" + d.height);
//     }
//     copyBasicSettings(fromObj: PIXI.DisplayObject, toObj: PIXI.DisplayObject) {
//         toObj.scale = fromObj.scale.clone();
//         toObj.pivot = fromObj.pivot.clone(); // PIXI.Point(-bounds.x, -bounds.y);
//         toObj.rotation = fromObj.rotation;
//         toObj.position = fromObj.position.clone();
//     }
// }


// @cmdCmd({ description: 'Cheat', shortName: 'cheat', longName: '' })
// export class ConsoleCmdCheat extends ConsoleCmdDef {
//     @cmdArgument({ shortName: 't', description: 'End criteria target' })
//     endCriteriaTarget = 0;

//     @cmdArgument({ shortName: 'm', description: 'medalMode (e.g. ONE_WIN)' })
//     medalMode = '';

//     @cmdArgument({ shortName: 'l', description: 'levelChange factor' })
//     levelChangeFact = 1;

//     protected _execute(): any {
//         const currentPage = App.instance.currentPage;
//         if (ObjectUtils.isOfType(currentPage, TrainingPlanScreenBase)) {
//             const tmp = [];
//             if (this.medalMode) {
//                 tmp.push((g: GameDefinition, p: any) => p.medalMode = <MedalModes>this.medalMode);
//             }
//             if (this.endCriteriaTarget) {
//                 tmp.push((g: GameDefinition, p: any) => TrainingPlan.modifyEndCriteriaTarget(p.endCriteriaData, 1));
//             }
//             if (this.levelChangeFact !== 1) {
//                 tmp.push((g: GameDefinition, p: any) => {
//                     if (/^WM_/.test(g.id)) {
//                         let lvlMgr = (<any>p).lvlMgr;
//                         if (!lvlMgr) {
//                             lvlMgr = {};
//                             (<any>p).lvlMgr = lvlMgr;
//                         }
//                         lvlMgr.trialChange = { changeSuccess: 0.5 * this.levelChangeFact, changeFail: -1 * this.levelChangeFact };
//                     }
//                 });
//             }
//             TrainingPlan.staticModifiers = tmp.map(f => (tp: TrainingPlan) => TrainingPlan.modifyPhases(tp, f));

//             const def = `{
// "^WM_": { lvlMgr: { trialChange: { changeSuccess: 0.25, changeFail: -0.5 } } },
// "^(npals|tenpals)": { lvlMgr: { phaseChange: { changeSuccess: 5, changeFail: -2 } } }
// }`;
//             TrainingPlan.overridePhaseData(def);

//             App.instance.showPage(CognitionMattersPageType.PAGE_MAP);
//         }
//         return null;
//     }
// }
