import { GameRunStats, ExerciseStats } from '../dataStructs';
import { GameDefinition } from './gameDefinition';
import { TrainingPlan, ProposedGameInfo } from './TrainingPlan';
import { GameState } from '../gameState';
import { PhaseEndLogItem } from '../toRemove/logItem';
import { PhaseXBase } from '../phasing/phase';
import { TestStatistics } from '../toRemove/testStatistics';
import { EndType } from '../phasing/endCriteriaEndType';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { KeyValMap } from '@jwmb/pixelmagic/lib/toReplace/keyValMap';

//// TODO: replace PlanetInfo with PlanetStuff
// export class PlanetInfo {
//    //indexInPlan: number = 0;
//    data: GameDefinition;
//    visibleOnMenu: boolean = true;
//    isCompleted: boolean = false;
//    isUnlocked: boolean = true;
//    numMedals: number = 0;
//    wasJustUnlocked: boolean = false;
// }

export interface IPlanetInfo {
    decided_at: number;
    unlockedTimestamp?: number;
    numMedals?: number;
    // isCompleted?: boolean;
    gameRunsRefs: number[]; // { gameId: string, started: number }[];
    gameId: string;
}

export class PlanetInfo implements IPlanetInfo {
    public decided_at = 0;
    public unlockedTimestamp = 0;
    public numMedals = 0;
    // public isCompleted: boolean = false;
    public gameRunsRefs: number[] = []; // { gameId: string, started: number }[] = [];
    public gameId: string;


    public nextGame: GameDefinition;
    public gameRuns: GameRunStats[] = [];
    public wasJustUnlocked = false;
    // public indexInPlan: number = -1; //TODO: not really necessary

    constructor(init?: Partial<IPlanetInfo>, gameDefs: GameDefinition[] = null, allGameRuns: GameRunStats[] = null) {
        if (init) { Object.keys(init).forEach(k => this[k] = init[k]); }
        if (gameDefs && allGameRuns) {
            this.init(gameDefs, allGameRuns);
        }
    }

    public serialize(stats: ExerciseStats) {
        return <IPlanetInfo>{
            gameId: this.gameId, decided_at: this.decided_at,
            gameRunsRefs: this.gameRuns.map(_ => stats.gameRuns.indexOf(_)), // { return { gameId: _.gameId, started: _.started_at } }),
            numMedals: this.numMedals,
            unlockedTimestamp: this.unlockedTimestamp
        };
    }
    public init(gameDefs: GameDefinition[], allGameRuns: GameRunStats[]) {
        this.nextGame = gameDefs.find(_ => _.id === this.gameId);
        this.gameRuns = this.gameRunsRefs.map(_ => allGameRuns[_]);
        // this.gameRuns = this.gameRunsRefs.map(_ => { return allGameRuns.find(gr =>
        // gr.gameId === _.gameId && gr.started_at === _.started); });
    }

    public get visibleOnMenu() {
        return !this.nextGame.invisible;
    }
    public get isUnlocked() {
        return this.unlockedTimestamp > 0;
    }
    public set isUnlocked(value: boolean) {
        if (!this.decided_at) {
            this.decided_at = Date.now();
        }
        this.unlockedTimestamp = value ? Date.now() : 0;
    }


    private _isCompletedOverride: boolean = null;
    public setOverrideIsCompleted(value: boolean) {
        this._isCompletedOverride = value;
    }
    public get isCompleted() {
        return this._isCompletedOverride !== null ? this._isCompletedOverride : this.numMedals >= 3;
    }

    public get lastUsed() {
        return this.gameRuns.length ? Math.max.apply(null, this.gameRuns.map(_ => _.started_at)) : 0;
    }
    public get highestLevel() {
        return this.gameRuns.length ? Math.max.apply(null, this.gameRuns.map(_ => _.highestLevel)) : 0;
    }
    public get numRunsWon() {
        return this.gameRuns.length ? this.gameRuns.filter(_ => _.won).length : 0;
    }
    public get numRuns() {
        return this.gameRuns.length;
    }
}
export class PlanetBundler {
    private static _planetInfos: PlanetInfo[] = [];
    private static _currentPlanet: PlanetInfo;

    public static init() {
        PlanetBundler._planetInfos = null;
        // EndCriteriaManager.fGetPlanetNumMedals = () => PlanetBundler.currentPlanet.numMedals;
    }

    public static getPlanetsOnlyUsedGameId(gameId: string, useSharedId: boolean = true) {
        if (useSharedId) {
            gameId = ExerciseStats.getSharedId(gameId);
        }
        // Get only those planets where all gameRuns' are of gameId
        return PlanetBundler._planetInfos.filter(planet => planet.gameRuns.find(gr =>
            (useSharedId ? ExerciseStats.getSharedId(gr.gameId) : gr.gameId) !== gameId) === null);
    }
    public static getPreviouslyCalcedPlanets(tp: TrainingPlan = null) {
        if ((!PlanetBundler._planetInfos || PlanetBundler._planetInfos.length === 0) && tp) {
            PlanetBundler._planetInfos = PlanetBundler.deserializePlanets(tp, ExerciseStats.instance);
        }
        return PlanetBundler._planetInfos;
    }
    public static decidedFuturePlanet(planet: PlanetInfo) {
        // var ps = new PlanetInfo();
        // ps.gameId = id;
        // ps.decided_at = Date.now();
        PlanetBundler._planetInfos.push(planet);
        // this.unlockExercise(id);
        // this.tests[id].trainingTime = -1; //TODO: ugly way to mark "planet" as decided for future use
    }

    public static get currentPlanet() {
        return PlanetBundler._currentPlanet;
    }
    public static setCurrentPlanet(value: PlanetInfo | string | number) {
        if (typeof value === 'number') {
            if (value < 0 || value >= PlanetBundler._planetInfos.length) {
                throw Error('Planet index not found: ' + value);
            }
            PlanetBundler._currentPlanet = PlanetBundler._planetInfos[value];
        } else if (typeof value === 'string') {
            const available = PlanetBundler._planetInfos.filter(_ => _.isUnlocked && !_.isCompleted);
            let found = available.findLast(_ => _.gameId === value);
            if (!found) {
                found = PlanetBundler._planetInfos.findLast(_ => _.gameId === value);
                if (found) {
                    Logger.warn('Planet completed / not unlocked: ' + value);
                } else {
                    // not available as a planet, probably a "hidden" game (test)
                    // TODO: check if this is the case
                    // throw Error("Planet not found: " + value);
                    console.log('planet not found: ' + value);
                }
            }
            PlanetBundler._currentPlanet = found;
        } else {
            PlanetBundler._currentPlanet = value;
        }
    }

    // This one is odd; can't the concerned party stash the former value somewhere instead..?
    private static previousMedals = 0;
    public static getPreviousMedalCount(): number { // This can only be used directly after new medal count is set (used on win screen)
        return PlanetBundler.previousMedals;
    }
    public static getIsPlanetComplete(planetId: string): boolean {
        const p = PlanetBundler._planetInfos.findLast(_ => _.gameId === planetId);
        return p ? p.isCompleted : false;
    }
    public static getTotalPlanetsCompleted(): number {
        return PlanetBundler._planetInfos.filter(_ => _.isCompleted).length;
    }

    public static startGame(id: string) {
        PlanetBundler.setCurrentPlanet(id);
    }

    // // { endCriteriaManager: EndCriteriaManager, getPlayerScore: () => number } //PhaseBase //medalMode: MedalModes,
    public static logTestPhase(phase: PhaseXBase
        , stats: ExerciseStats, peItem: PhaseEndLogItem) {
        const id = TestStatistics.instance.currentGameId; // phase.test.id;
        const endCriteriaManager = phase.endCriteriaManager;
        // TestStatistics.instance.currentPhase.
        let medalMode = phase.medalMode;
        const score = phase.getPlayerScore();
        const planet = PlanetBundler.currentPlanet;
        if (!planet) { // e.g. hidden tests are not associated with planets
            return;
        }
        const wonRace = endCriteriaManager.endType === EndType.TARGET;

        const runStats = TestStatistics.instance.runStats;
        planet.gameRuns.push(runStats);
        // planet.gameRunsRefs.push({ gameId: id, started: runStats.started_at });

        if (GameState.trainingSettings.customData && GameState.trainingSettings.customData.medalMode) {
            medalMode = GameState.trainingSettings.customData.medalMode;
        }
        let numMedals = 0;
        PlanetBundler.previousMedals = planet.numMedals || 0;
        if (medalMode === 'ALWAYS') {
            numMedals = Math.min(3, PlanetBundler.previousMedals + 1);
        } else {
            if (medalMode === 'THREE_WINS') {
                const numWon = planet.gameRuns.filter(_ => _.won).length;
                numMedals = Math.min(3, numWon);
            } else if (medalMode === 'ONE_WIN') {
                const numWon = planet.gameRuns.filter(_ => _.won).length;
                numMedals = numWon > 0 ? 3 : 0;
            } else if (medalMode === 'TARGET_SCORE') {
                const targetScore = endCriteriaManager.getTargetScore();  // TODO: get max value if different availabale target scores
                const scoreFract = score / targetScore;
                numMedals = scoreFract >= 1 ? 3
                    : (scoreFract >= 0.66 ? 2
                        : (scoreFract > 0.33 ? 1 : 0));
            }
        }
        planet.numMedals = numMedals; // test.medalCount

        //// save time stamp (used to decide if guide phases should be skipped)
        // test.lastTimeStamp = Date.now(); //TODO: set both in GameState::saveState() and GameState::logTestPhase(), remove one of them

        peItem.planetTargetScore = endCriteriaManager.getMaxTargetScore();
        peItem.completedPlanet = planet.isCompleted;

        PlanetBundler.serializePlanets(stats);
    }

    // static mock() {
    //    var tpSource = DynamicTrainingPlanDebug.freeExample; //DynamicTrainingPlanDebug.simpleTest; //debugPlanDataa
    //    GameState.exerciseStats = new ExerciseStats();
    //    //var date = new Date(2017, 3, 1).valueOf();
    //    //GameState.exerciseStats.tests = {
    //    //    "npals#1": <ExerciseStatsData>{ scores: [1], lastTimeStamp: date, trainingTime: 1000, isCompleted: false }
    //    //};
    //    //Object.keys(GameState.exerciseStats.tests).forEach(k =>
    // GameState.exerciseStats.tests[k] = ObjectUtils.merge(new ExerciseStatsData(),
    // GameState.exerciseStats.tests[k]));

    //    PlanetBundler.getPlanets(tpSource);
    // }

    private static _registeredSessionReset = false;
    private static _warnedOfDevCheatMode = false;
    static getPlanets(forceRecalc: boolean = false, tp: TrainingPlan = null): PlanetInfo[] {
        if (!PlanetBundler._registeredSessionReset) {
            GameState.sessionResetted.add(() => {
                PlanetBundler.init();
            });
            PlanetBundler._registeredSessionReset = true;
            PlanetBundler.init();
        }
        if (PlanetBundler._planetInfos) {
            if (forceRecalc) {
                PlanetBundler._planetInfos = null;
            } else {
                return PlanetBundler._planetInfos;
            }
        }
        if (!tp) {
            tp = TrainingPlan.create(null);
        }
        PlanetBundler._planetInfos = PlanetBundler.deserializePlanets(tp, ExerciseStats.instance);

        // var isDevCheatMode = (<CognitionMattersApp>App.instance).isDev;
        // if (isDevCheatMode) {
        //    if (!PlanetBundler._warnedOfDevCheatMode) {
        //        Logger.warn("Dev cheat mode, target criteria lowered");
        //        PlanetBundler._warnedOfDevCheatMode = true;
        //    }
        //    tp.changeTargetEndCriteriaForTesting();

        //    //for quick testing, set any started planet to complete
        //    PlanetBundler._planetInfos.filter(_ => !_.isCompleted && _.lastUsed > 0)
        //        .forEach(p => {
        //            var gr1 = p.gameRuns[0];
        //            for (var i = p.numMedals; i < 3; i++) {
        //                var gr = new GameRunStats({ gameId: gr1.gameId, won: true,
        // trainingTime: gr1.trainingTime, started_at: gr1.started_at});
        //                GameState.exerciseStats.gameRuns.push(gr);
        //                p.gameRuns.push(gr); //p.gameRunsRefs.push({ gameId: gr.gameId, started: gr.started_at });
        //            }
        //            p.numMedals = 3;
        //        });
        //    PlanetBundler.serializePlanets(ExerciseStats.instance);
        //    PlanetBundler._planetInfos = PlanetBundler.deserializePlanets(tp, ExerciseStats.instance);
        // }

        const bundler = new PlanetBundler();
        const planets = bundler.recalcPlanets(tp, ExerciseStats.instance);
        return planets;
    }

    private static deserializePlanets(tp: TrainingPlan, stats: ExerciseStats) {
        // TODO: better transfer mechanism between _planetInfos and ExerciseStats.instance
        const storedInfos = <IPlanetInfo[]>(<any>stats).planetInfos || [];
        (<any>stats).planetInfos = storedInfos;
        const definedGames = tp.getDefinedGames();
        return storedInfos.map(_ => new PlanetInfo(_, definedGames, stats.gameRuns));
    }
    private static serializePlanets(stats: ExerciseStats) {
        (<any>stats).planetInfos = PlanetBundler._planetInfos.map(_ => _.serialize(stats));

        if ((<any>stats).planetInfos.length > 10) {
            // console.log('KSKS');
        }
        // console.log("PlanetInfos compression");
        // JsonCompression.testCompression((<any>stats).planetInfos, {
        //    "gameId": {
        //        "compress": { "type": "dictionary", "name": "game" }
        //    },
        //    //"gameRunsRefs": {
        //    //    "compress": { "type": "subList" },
        //    //    "properties": { "gameId": { "compress": { "type": "dictionary", "name": "game" } } }
        //    //}
        // });
        //// console.log("GameRuns compression");
        //// JsonCompression.testCompression(stats.gameRuns);
    }

    public static convertGameStatsToPlanets(gameStats: KeyValMap<string, GameRunStats[]>): PlanetInfo[] {
        // TODO: this shouldn't be used anymore!
        const planets = <PlanetInfo[]>[];
        // Since getAllGameStats currently uses old game stats data format to emulate "new" format,
        // we don't have anything that indicates how phases should be grouped into planets
        const groupedByCreatedTime = new KeyValMap<number, GameRunStats[]>();
        gameStats.keys.forEach((k, i) => {
            if (gameStats.values[i].length === 0) {
                return;
            }

            const list = gameStats.values[i].sort((a, b) => a.started_at - b.started_at);
            const timeForReset = list[0].started_at;
            for (let j = 1; j < list.length; j++) {
                const diff = Math.abs(list[j].started_at - list[j - 1].started_at);
                if (diff < 10) {
                    list[j].started_at = timeForReset;
                }
            }
            list.forEach(gr => {
                const group = groupedByCreatedTime.getOrAddByKey(gr.started_at, []);
                group.push(gr);
            });
        });

        groupedByCreatedTime.keys.forEach((k, i) => {
            const grList = groupedByCreatedTime.values[i];
            // Make sure they're separated by game (unlockedTimeStamp is actually "createdAtTimeStamp"
            // and several can be created simultaneously "ahead of time"):
            const groupedByGameId = new KeyValMap<string, GameRunStats[]>();
            grList.forEach(gr => {
                const list = groupedByGameId.getOrAddByKey(gr.gameId, []);
                list.push(gr);
            });
            groupedByGameId.keys.forEach((gameId, i2) => {
                const grs = groupedByGameId.values[i2]; // .filter(_ => _.trainingTime >= 0)
                const planet = new PlanetInfo();
                // TODO: currently there's no flag for this, could use "fake" negative training time as flag
                planet.unlockedTimestamp = grs.filter(_ => _.trainingTime > 0).length > 0 ? Date.now() : 0;

                planet.numMedals = grs.filter(_ => _.won).length;
                // planet.isCompleted = planet.numMedals >= 3;

                // planet.visibleOnMenu - is set later (depends on training plan)
                planet.wasJustUnlocked = false;
                planet.nextGame = <GameDefinition>{ id: grs[0].gameId }; // gameId
                planets.push(planet);
            });
        });
        return planets;
    }
    public static getGameIdFromPlanetId(id: string) {
        const split = id.split('#');
        if (split.length > 1) {
            if (parseFloat(split[1]).toString() === split[1]) {
                return split[0];
            }
        }
        return id;
    }
    public recalcPlanets(tp: TrainingPlan, stats: ExerciseStats, selectionParameters: any = null): PlanetInfo[] {
        const gameStats = stats.getAllGameStats();

        const existingPlanets = PlanetBundler._planetInfos.slice(); // PlanetBundler.convertGameStatsToPlanets(gameStats);

        const tmpNotCompletedPlanets = existingPlanets.filter(_ => !_.isCompleted);
        // In free mode, planet might not have received a nextGame, use gameRuns to set:
        tmpNotCompletedPlanets.filter(_ => !_.nextGame).forEach(_ => {
            _.nextGame = new GameDefinition();
            if (_.gameRuns && _.gameRuns.length) {
                _.nextGame.id = _.gameRuns[0].gameId;
            }
        });
        const notCompletedPlanetGameIds = tmpNotCompletedPlanets.map(_ => _.nextGame.id)
            .map(_ => PlanetBundler.getGameIdFromPlanetId(_));
        const available = tp.getProposedGames(notCompletedPlanetGameIds, stats); // , selectionParameters);

        // Linear: available will contain all games (also completed ones)
        // Dynamic: only non-completed.
        // TODO: how to keep order? In linear, we can complete 3rd exercise,  but it should still be in 3rd place
        // In Dynamic, we want to keep order of completed/already unlocked planets, and only use available to add planets

        // Linear plan may have the #<number> suffix already from plan (tenpals#1 etc)
        const availablePureGameIds = available.map(_ => PlanetBundler.getGameIdFromPlanetId(_.id));
        const removed = notCompletedPlanetGameIds.filter(id => !availablePureGameIds.find(_ => _ === id));

        // planets that shouldn't be available - set them to completed if they have been used, remove them if not:
        const unavailable = existingPlanets.filter(_ => !_.isCompleted).filter(_ => removed.indexOf(_.nextGame.id) >= 0);
        unavailable.filter(_ => _.isUnlocked).forEach(_ => _.setOverrideIsCompleted(true)); // _.numMedals = 3);
        unavailable.filter(_ => !_.isUnlocked).forEach(_ => existingPlanets.splice(existingPlanets.indexOf(_), 1));

        // flag newly unlocked planets:
        existingPlanets.filter(_ => !_.isCompleted && !_.isUnlocked).forEach(_ => {
            if (available.find(a => a.id === _.gameId && a.unlocked)) {
                _.isUnlocked = true;
                _.wasJustUnlocked = true;
            }
        });

        const fAddPlanet = (pgi: ProposedGameInfo) => {
            const planet = new PlanetInfo();
            planet.isUnlocked = pgi.unlocked;
            planet.wasJustUnlocked = planet.isUnlocked;
            // PlanetBundler.getOrCreatePlanet(_.id).unlocked_at = Date.now();
            planet.numMedals = 0;
            planet.nextGame = <GameDefinition>{ id: pgi.id };

            if (pgi.id.indexOf('#') < 0) {
                const numPreviousPlanets = Math.floor(gameStats.getValueOrDefault(pgi.id, []).filter(p => p.won).length / 3);
                planet.nextGame.id = pgi.id + '#' + (numPreviousPlanets + 1);
            }
            // In old system, we didn't write data until actually entering game
            // TODO: writing data!!
            // TODO: switch to linear test stats / phase structure, add some part that indicates which phases are with which planet
            PlanetBundler.decidedFuturePlanet(planet);
            return planet;
        };

        // available that are not in existing:
        const notInExisting = available.filter(_ =>
            existingPlanets.filter(p => !p.isCompleted)
                .find(p => p.nextGame.id === _.id || PlanetBundler.getGameIdFromPlanetId(p.nextGame.id) === _.id) == null);
        let planets = existingPlanets.concat(notInExisting.map(_ => fAddPlanet(_)));
        // var planets = available.map(_ => {
        //    //Find existing planet with same gameId (could be with the # if that's what the tp generates, e.g. lineartrainingplan)
        //    var planet = existingPlanets.filter(p => !p.isCompleted)
        //        .find(p => p.nextGame.id === _.id || PlanetBundler.getGameIdFromPlanetId(p.nextGame.id) === _.id);
        //    if (planet) {
        //        //planet.isUnlocked = true; Nope, just because we had it before doesn't mean it was unlocked
        //        existingPlanets.splice(existingPlanets.indexOf(planet), 1);
        //    } else {
        //        fAddPlanet(_);
        //    }
        //    return planet;
        // });
        // Insert the pre-existing planets that were not present in availablePlanets:
        // planets = existingPlanets.concat(planets);

        const definedGames = tp.getDefinedGames();
        planets.forEach(planet => {
            const nextGameId = (planet.nextGame && planet.nextGame.id) ? planet.nextGame.id : planet.gameId; // .gameRuns[0].gameId;
            // In allowFreeChoice, a planet might not have nextGame defined, if so use last gameRun for id.
            let findId = nextGameId; // planet.nextGame.id;
            let gameDef = definedGames.find(_ => _.id === findId);
            if (!gameDef) {
                findId = PlanetBundler.getGameIdFromPlanetId(nextGameId);
                gameDef = definedGames.find(_ => _.id === findId);
                if (!gameDef) {
                    if (planet.gameRuns && planet.gameRuns.length) {
                        findId = planet.gameRuns[0].gameId;
                        gameDef = definedGames.find(_ => _.id === findId);
                    }
                    if (!gameDef) {
                        gameDef = definedGames.find(_ => PlanetBundler.getGameIdFromPlanetId(_.id) === findId);
                        if (!gameDef) {
                            throw Error('No game definition found for ' + nextGameId);
                        }
                    }
                }
            }
            // planet.visibleOnMenu = !gameDef.invisible; //TODO: should this be a decision made by the View?
            // var fakeData = <TestData>ObjectUtils.merge({}, gameDef);
            // fakeData.id = planet.data.id;
            planet.nextGame = gameDef; // fakeData;
        });
        planets.filter(_ => _.nextGame).forEach(_ => _.gameId = _.nextGame.id);
        planets = planets.filter(_ => _.visibleOnMenu);
        // planets.forEach((v, i) => v.indexInPlan = i);

        const unlockAll = GameState.trainingSettings.customData && GameState.trainingSettings.customData.unlockAllPlanets;
        if (unlockAll) {
            planets.forEach(o => {
                o.setOverrideIsCompleted(false);
                o.unlockedTimestamp = 1;
                o.wasJustUnlocked = false;
            });
        }

        // planets.forEach((o, i) => o.indexInPlan = i);

        PlanetBundler.serializePlanets(stats);

        return planets;
    }
}
