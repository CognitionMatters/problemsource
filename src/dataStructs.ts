import { DeviceEx } from '@jwmb/pixelmagic/lib/utility/deviceEx';
// import { IPlanetInfo, PlanetBundler } from './trainingPlan/PlanetBundler';
import { TriggerData } from './triggerManager';
import { JsonCompression } from '@jwmb/pixelmagic/lib/utility/jsonCompression';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { KeyValMap } from '@jwmb/pixelmagic/lib/toReplace/keyValMap';

export class ExerciseStats { // TODO: change name of ExerciseStats to trainingStats
    public appVersion = '';
    public appBuildDate = '';
    public device: DeviceInfo = new DeviceInfo();
    public trainingDay = 0;
    public lastLogin = 0;
    public lastTimeStamp = 0;
    public triggerData: any = {};
    // private tests: IMapStringTo<ExerciseStatsData> = {};
    public gameRuns: GameRunStats[] = [];
    public metaphorData: any = {};
    public trainingPlanSettings: TrainingPlanSettings = new TrainingPlanSettings();
    public gameCustomData: { [key: string]: any } = {};

    public static instance: ExerciseStats;
    // Moved here/adapted from GameState:
    public init() {
        ExerciseStats.instance = this;
        if (!this.gameRuns) {
            this.gameRuns = [];
        } else if (this.gameRuns.length > 0) {
            if (this.gameRuns[0].constructor !== GameRunStats) {
                this.gameRuns = this.gameRuns.map(gr => <GameRunStats>ObjectUtils.merge(new GameRunStats(), gr));
            }
        }
        if ((<any>this).tests) {
            throw new Error('old stats format, conversion not available');
            // const gameRuns = ExerciseStats.convertOldPlanetStatsToPlanetsAndGameRuns(<IMapStringTo<ExerciseStatsData>>(<any>this).tests);
            // this.gameRuns = this.gameRuns.concat(gameRuns.gameRuns);
            // (<any>this).planetInfos = gameRuns.planets;
            // delete (<any>this).tests;
        }
        if (this.triggerData == null) {
            this.triggerData = {};
        }
        if (this.trainingDay == null) {
            this.trainingDay = 0;
        }
        if (this.lastTimeStamp == null) {
            this.lastTimeStamp = 0;
        }
        if (this.metaphorData == null) {
            this.metaphorData = {};
        }
        if (this.trainingPlanSettings == null) {
            this.trainingPlanSettings = new TrainingPlanSettings();
        }
    }

    static getSharedId(id: string) {
        return id.split('#')[0];
    }

    public addGameRun(value: GameRunStats) {
        this.gameRuns.push(value);
    }
    public getGameStats(gameId: string, includeCancelledRuns: boolean = false): GameStats {
        // TODO: make sure it's always sorted (should be)
        return new GameStats(this.gameRuns.filter(_ => _.gameId === gameId && (includeCancelledRuns ? true : !_.cancelled)));
    }
    public getGameStatsSharedId(gameId: string, includeCancelledRuns: boolean = false): GameStats {
        gameId = ExerciseStats.getSharedId(gameId);
        return new GameStats(this.gameRuns.filter(_ =>
            ExerciseStats.getSharedId(_.gameId) === gameId && (includeCancelledRuns ? true : !_.cancelled)));
    }
    public getGameRunsSharedId(gameId: string, includeCancelledRuns: boolean = false): GameRunStats[] {
        gameId = ExerciseStats.getSharedId(gameId);
        return this.gameRuns.filter(_ => ExerciseStats.getSharedId(_.gameId) === gameId
            && (includeCancelledRuns ? true : !_.cancelled));
    }


    // private static convertOldPlanetStatsToPlanetsAndGameRuns(
    //     data: IMapStringTo<ExerciseStatsData>): { planets: IPlanetInfo[], gameRuns: GameRunStats[] } {
    //     // var perSharedId = new KeyValMap<string, GameRunStats[]>();
    //     const perPlanet = <{ planet: IPlanetInfo, gameRuns: GameRunStats[] }[]>[];
    //     let allGameRuns = <GameRunStats[]>[];
    //     // don't use the aggregated data - that entry should be removed anyway in the future
    //     const exerciseIds = Object.keys(data);
    //     const idsUsingSharedFormat = exerciseIds.filter(_ => _.indexOf('#') < 0);
    //     const idsToRemove = idsUsingSharedFormat.filter(_ => {
    //         const rx = new RegExp(_ + '#\\d');
    //         return exerciseIds.find(x => rx.test(x)) !== null;
    //     });


    //     Object.keys(data).filter(k => idsToRemove.indexOf(k) < 0).forEach(k => {
    //         const planetData = data[k];

    //         const numInstances = Math.max(0, (planetData.scores || []).length, planetData.noOfWins || 0);
    //         // planetData.medalCount || 0,
    //         if (numInstances === 0) { // an unlocked, but not used planet, we can skip it here
    //             return;
    //         }

    //         const pi: IPlanetInfo = {
    //             gameId: PlanetBundler.getGameIdFromPlanetId(k),
    //             numMedals: planetData.medalCount,
    //             unlockedTimestamp: planetData.unlockedTimeStamp || (planetData.lastTimeStamp - planetData.trainingTime),
    //             decided_at: 0,
    //             gameRunsRefs: []
    //         };
    //         pi.decided_at = pi.unlockedTimestamp;

    //         const gameRuns = <GameRunStats[]>[];
    //         const ppi = { planet: pi, gameRuns: gameRuns };
    //         perPlanet.push(ppi);

    //         for (let i = 0; i < numInstances; i++) {
    //             const gr = new GameRunStats();
    //             gr.gameId = PlanetBundler.getGameIdFromPlanetId(k); // k; //baseId;
    //             gr.highestLevel = planetData.highestLevel;
    //             // gr.score = i < planetData.scores.length ? planetData.scores[i]: 0;
    //             gr.lastLevel = planetData.lastLevel;
    //             gr.trainingTime = 0;
    //             gr.started_at = pi.unlockedTimestamp;
    //             gr.won = false;

    //             gameRuns.push(gr);
    //         }
    //         for (let i = 0; i < planetData.noOfWins; i++) {
    //             gameRuns[gameRuns.length - 1 - i].won = true;
    //         }
    //         if (gameRuns.length) {
    //             const last = gameRuns[gameRuns.length - 1];
    //             last.highestLevel = planetData.highestLevel;
    //             last.customData = planetData.customData;
    //             // last.lastTimeStamp = planetData.lastTimeStamp;
    //             last.trainingTime = planetData.trainingTime;
    //         }

    //         pi.gameRunsRefs = Number.range(0, gameRuns.length - 1).map(_ => _ + allGameRuns.length);
    //         allGameRuns = allGameRuns.concat(gameRuns);
    //     });
    //     return { planets: perPlanet.map(_ => _.planet), gameRuns: allGameRuns };
    // }
    public getAllGameStats(): KeyValMap<string, GameRunStats[]> {
        const perSharedId = new KeyValMap<string, GameRunStats[]>();
        this.gameRuns.forEach(run => {
            const baseId = ExerciseStats.getSharedId(run.gameId);
            let list = perSharedId.getValueOrDefault(baseId, null);
            if (list === null) {
                list = <GameRunStats[]>[];
                perSharedId.addPair(baseId, list);
            }
            list.push(run);
        });
        return perSharedId;
    }

    public static getForSerialization(stats: ExerciseStats) {
        // Check if we're nearing 100kB, if so compress data
        if (stats.gameRuns.length >= 200) {
            const size = JSON.stringify(stats).length;
            if (size > 90000 || true) {
                const comp = new JsonCompression();
                const optionsGameId = {
                    'gameId': {
                        'compress': { 'type': 'dictionary', 'name': 'game' }
                    }
                };
                comp.addList('gameRuns', stats.gameRuns,
                    ObjectUtils.merge({ 'started_at': { 'compress': { 'type': 'diff' } } }, optionsGameId));
                comp.addList('planetInfos', (<any>stats).planetInfos, ObjectUtils.merge(
                    {
                        'decided_at': { 'compress': { 'type': 'diff' } },
                        'unlockedTimestamp': { 'compress': { 'type': 'diff' } }
                    }, optionsGameId));
                    const compressed = comp.getAll();

                    const compressedStr = JSON.stringify(compressed);

                if (stats.gameRuns.length % 50 === 0) {
                    comp.decompress(compressed);
                    if (!ObjectUtils.equals(comp.lists.getValue('gameRuns'), stats.gameRuns)
                        || !ObjectUtils.equals(comp.lists.getValue('planetInfos'), (<any>stats).planetInfos)) {
                        console.log('lslsl');
                    }
                    const uncompressedStr = JSON.stringify({ gameRuns: stats.gameRuns, planetInfos: (<any>stats).planetInfos });
                }
            }
        }
        return stats;
    }
}


export class DeviceInfo {
    public platform = '';
    public model = '';
    public version = '';
    public uuid = '';
    public static retrieve() {
        const result = new DeviceInfo();
        if (DeviceEx.instance) {
        // if ((<any>window).device) {
            // const device = <Device>(<any>window).device;
            result.platform = DeviceEx.instance.platform;
            result.model = DeviceEx.instance.model;
            result.version = DeviceEx.instance.version;
            result.uuid = DeviceEx.instance.uuid;
        }
        return result;
    }
}

export class TrainingPlanSettings {
    // public unlockedExerciseTypes: IMapStringTo<boolean> = {};
    // public uniqueGroupWeights: IMapStringTo<number> = {};
    // public groupWeightChanges: GroupWeightChangeLog[] = [];
    public initialGroupWeights: { [key: string]: number } = {};
    public changes: TrainingPlanChange[] = [];
    // public initialExerciseWeights: IMapStringTo<number> = {};
}
// export class GroupWeightChangeLog {
//    public timestamp: number;
//    public weights: IMapStringTo<number>;
// }
export class TrainingPlanChange {
    public timestamp: number;
    public type: string;
    public change: any;
}


class ExerciseStatsData {
    public isCompleted = false;
    public medalCount = 0;
    public bestScore = -1;
    public bestTime = 60;
    public lastLevel = 0;
    public highestLevel = 0;
    public noOfWins = 0;
    public wonLast = false;
    public scores: Array<number> = [];
    // public stars:number=0;
    public lastTimeStamp = 0;
    public customData: any = null;

    public trainingTime = 0;
    public runsLeft = 3;

    public unlockedTimeStamp = 0;
}

export class GameStats {
    constructor(private _gameRuns: GameRunStats[]) {
    }

    public get numRuns(): number  {
        return this._gameRuns.length;
    }
    public get highestLevel(): number {
        return this._gameRuns.length ? Math.max.apply(null, this._gameRuns.map(_ => _.highestLevel)) : 0;
    }
    public get lastLevel(): number {
        return this._gameRuns.length ? this._gameRuns[this._gameRuns.length - 1].lastLevel : 0;
    }
    public get lastWon(): boolean {
        return this._gameRuns.length ? this._gameRuns[this._gameRuns.length - 1].won : false;
    }
    public get trainingTime(): number { // getExerciseResponseTime
        return this._gameRuns.length ? this._gameRuns.map(_ => _.trainingTime).sum() : 0;
    }
}

export type Partial<T> = {
    [P in keyof T]?: T[P];
};

export class GameRunStats {
    public gameId = '';
    // TODO: reintroduce this one later..? public isCompleted: boolean = false;
    // public medalCount: number = 0;
    // public bestScore: number = -1;
    // public bestTime: number = 60;
    public lastLevel = 0;
    public highestLevel = 0;
    // public noOfWins: number = 0;
    // public wonLast: boolean = false;
    public won = false;
    // public scores: Array<number> = [];
    // public stars: number = 0;
    // public lastTimeStamp: number = 0;
    public customData: any = null;

    public trainingTime = 0;
    public trainingDay = 0;
    // public runsLeft: number = 3;

    public started_at = 0;

    public cancelled = false;

    public constructor(init?: Partial<GameRunStats>) {
        // TODO: do we need polyfill for Object.assign?
        // Object.assign(this, init);
        if (init) {
            Object.keys(init).forEach(k => this[k] = init[k]);
        }
    }
}
export interface CustomData {
    menuButton?: boolean;
    canLogout?: boolean;
    unlockAllPlanets?: boolean;
    appVersion?: any;
    allowMultipleLogins?: boolean;
    canEnterCompleted?: boolean;
    nuArch?: any;
    medalMode?: any;
    clearClientUserData?: any;
    debugSync?: any;
    numberLine?: any;
    displayAppVersion?: boolean;
}
export class TrainingSettings {
    timeLimits: number[] = []; // time_limits
    uniqueGroupWeights: any;
    manuallyUnlockedExercises: string[] = [];
    idleTimeout = 10;
    cultureCode = 'sv-SE';
    customData: CustomData = {};
    // training_settings: any;
    triggers: TriggerData[] = [];
    pacifistRatio = 0.1; // TODO: add to a metaphorSettings structure instead

    trainingPlanOverrides: any = {};
    // syncSettings: TrainingSyncSettings = new TrainingSyncSettings();
    // erase_local_data?: boolean;
}
