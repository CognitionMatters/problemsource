import { PlanetBundler, PlanetInfo } from '../trainingPlan/PlanetBundler';
import { TestStatistics } from '../toRemove/testStatistics';
import { PhaseXSignals } from './phase';
import { GameState } from '../gameState';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { IRNGSeeder, IRNG } from '@jwmb/pixelmagic/lib/utility/random';
import { ExerciseStats } from '../dataStructs';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';

export interface ILevelSettings {
    minLevel: number;
    maxLevel: number;
    firstTimeLevel: number;
    classLvlDayChange: string;
    classLvlPhaseChange: string;
    classLvlTrialChange: string;
}

export interface ILevelChanger {
    execute(history: any): number; // TODO: use whole history as argument
}
export class LevelChangePhaseUseLastLevel implements ILevelChanger {
    changeSuccess = 0.5;
    changeFail = -1;
    execute(history: any): number {
        // TODO: check history instead
        const gameStats = ExerciseStats.instance.getGameStatsSharedId(TestStatistics.instance.currentGameId);
        const lastPhaseLevel = gameStats.lastLevel;
        const lastPhaseWon = gameStats.lastWon;
        return lastPhaseLevel + (lastPhaseWon ? this.changeSuccess : this.changeFail);
    }
}
export class StdDev {
    average: number;
    stdDev: number;

    getZScores(arr: number[]) {
        return arr.map(_ => (_ - this.average) / this.stdDev);
    }
    static removeOutliers(arr: number[], highZThreshold: number = null, lowZThreshold: number = null) {
        if (arr.length < 3) {
            return;
        }
        const sd = StdDev.calc(arr);
        const zs = sd.getZScores(arr);
        for (let i = zs.length - 1; i >= 0; i--) {
            if ((highZThreshold !== null && zs[i] > highZThreshold)
                || (lowZThreshold !== null && zs[i] < lowZThreshold)) {
                arr.splice(i, 1);
            }
        }
    }
    static calc(arr: number[]): StdDev {
        const result = new StdDev();
        if (arr.length < 2) {
            result.average = arr.length === 1 ? arr[0] : Number.NaN;
            result.stdDev = arr.length === 1 ? 0 : Number.NaN;
            return result;
        }
        let tot = 0;
        for (let i = 0; i < arr.length; i++) {
            tot += arr[i];
        }
        const avg = tot / arr.length;

        tot = 0;
        for (let i = 0; i < arr.length; i++) {
            const diff = arr[i] - avg;
            tot += diff * diff;
        }
        result.average = avg;
        result.stdDev = Math.sqrt(tot / (arr.length - 1));
        return result;
    }
}

export class LevelChangePhaseMaxAvg implements ILevelChanger {
    change = -1;

    // missedChangeOverTime: number = 0; //negative number
    // missedThreshold: number = 1;
    numPlanetsForAverage = 3;
    failedChangeInital = -0.5;
    failedChangeSubsequent = -0.25;

    // TODO: re-implement with PlanetBundler/GameRunStats
    // static test(stats: GameRunStats[]) { //IMapStringTo<ExerciseStatsData>
    //    //TestStatistics.instance.currentTest.id = "WM_grid";
    //    if (!stats) {
    //        throw "Not implemented: LevelChangePhaseMaxAvg test";
    //        //var id = "WM_crush"; //WM_grid

    //        //stats = []; //<IMapStringTo<ExerciseStatsData>>{};
    //        ////Object.keys(raw.tests).filter(_ => _.indexOf(id + "#") == 0).forEach(_ => stats[_] = raw.tests[_]);
    //    }
    //    //var tests = GameState.getAllSimilarExerciseStats(id);
    //    var l = new LevelChangePhaseMaxAvg();
    //    var adjustedMax = l.getAdjustedMaxFromTestStats(stats);
    //    var oldMax = Object.keys(stats).length == 0 ? 0 : Math.max.apply(null, Object.keys(stats).map(_ => stats[_].highestLevel));
    //    return { adjusted: adjustedMax, simple: oldMax };
    // }

    static getGoodMaxLevels(highest: number[], firstRemoveUnderSD: number = 0, thenRemoveOverSD: number = 1): number[] {
        highest = [].concat(highest);
        // calc SD, remove outliers, then get max3
        // remove first two days:
        if (highest.length > 2) {
            highest.splice(0, 2);
        }
        // remove lower-than-average values:
        StdDev.removeOutliers(highest, null, firstRemoveUnderSD);
        // remove values > 1 SD:
        // TODO: test run with some normal accounts to see if >1 makes sense
        StdDev.removeOutliers(highest, thenRemoveOverSD, null);
        return highest;
    }

    public getAdjustedMaxFromPlanets(planets: PlanetInfo[]) { // tests: IMapStringTo<ExerciseStatsData>) {
        const sortedRuns = planets.sort((a, b) => a.lastUsed - b.lastUsed);
        // var sortedTests = Object.keys(tests).map(_ => tests[_]).sort((a, b) => a.lastTimeStamp - b.lastTimeStamp);
        // if (sortedTests.length == 0) {
        //    return 0;
        // }

        let highest = planets.map(_ => _.highestLevel).filter(_ => _ > 0);
            // gameRuns.map(grs => Math.max.apply(null, grs.map(_ => _.highestLevel))).filter(_ => _ > 0);
        if (highest.length === 0) {
            return 0;
        }
        // if (highest.length < 3) {
        //    return Math.max.apply(null, highest);
        // }
        // highest = LevelChangePhaseMaxAvg.getGoodMaxLevels(highest); //TODO: needs more work!

        const numPlanets = Math.max(1, this.numPlanetsForAverage);
        const sorted = highest.sort((a, b) => a - b);
        const cnt = Math.min(numPlanets, sorted.length);
        highest = sorted.slice(sorted.length - cnt);
        let avgMax = StdDev.calc(highest).average;
        avgMax = Math.round(avgMax * 100) / 100;
        // var dbg = "lvl max avg: " + avg;

        let additionalChange = 0;
        const lastTest = planets[planets.length - 1];
        const numFails = lastTest.numRuns - lastTest.numRunsWon;
            // lastTestGameRuns.length - lastTestGameRuns.filter(_ => _.won).length; //lastTest.scores.length - lastTest.noOfWins;
        if (numFails > 0) {
            additionalChange = this.failedChangeInital; // -0.5;
            if (numFails > 1) {
                additionalChange += (numFails - 1) * this.failedChangeSubsequent; // -0.25;
            }
        }
        if (lastTest.isCompleted) { // we just entered a new planet - max 0.5 extra lower level
            additionalChange = Math.max(this.failedChangeInital, additionalChange);
        }


        //// decrease depending on latest planets highest level
        // if (this.missedChangeOverTime) {
        //    for (var i = sortedTests.length - 1; i >= 0; i--) {
        //        var test = sortedTests[i];
        //        //go back until test where maxLevel was less than <missedThreshold> from the above avg level
        //        // - for each test, decrease start level with <missedChangeOverTime>
        //        var diffToMax = avgMax - test.highestLevel;
        //        if (diffToMax > this.missedThreshold) {
        //            break;
        //        }
        //        additionalChange += this.missedChangeOverTime;
        //    }
        //    //dbg += ", additionalChange: " + additionalChange;
        // }
        //// Logger.info(dbg);

        return avgMax + additionalChange;
    }

    execute(history: any): number {
        // var grs = GameState.exerciseStats.getGameStatsSharedId(TestStatistics.instance.currentTest.id);
        // var tests = GameState.exerciseStats.getAllSimilarExerciseStats(TestStatistics.instance.currentTest.id);
        const adjustedMax = this.getAdjustedMaxFromPlanets(
            PlanetBundler.getPlanetsOnlyUsedGameId(TestStatistics.instance.currentGameId));
        // if (Object.keys(tests).length == 0) {
            // adjustedMax = GameState.exerciseStats.getExerciseHighestLevel(TestStatistics.instance.currentTest.id);
            // var stats = GameState.exerciseStats.getSharedExerciseStats(TestStatistics.instance.currentTest.id);
            // adjustedMax = stats.highestLevel;
        // } else {
        //    adjustedMax = this.getAdjustedMaxFromTestStats(tests);
        // }
        const rounded = Math.round((adjustedMax + this.change) * 2) / 2;
        return rounded;
    }
}
export class LevelChangePhase implements ILevelChanger {
    change = -0.5;

    levelStartLevelFromLastPhase = false;
    execute(history: any): number {
        // TODO: check history instead
        // TODO: check if first in day
        return TestStatistics.instance.getHighestCorrectLevel() + this.change;
    }
}
export class LevelChangeDay implements ILevelChanger {
    change = -1;
    execute(history: any): number {
        return this.change;
    }
}
export class LevelChangeTrial implements ILevelChanger {
    changeSuccess = 0.5;
    changeFail = -1;
    execute(history: any): number {
        return history.isCorrect ? this.changeSuccess : this.changeFail; // TODO: use data from last trial
    }
}
export class RNGManager {
    seeder: IRNGSeeder = null;
    rng: IRNG = null;

    bindSignals(signals: PhaseXSignals) {
        signals.prepareNextProblem.add(this.prepare.bind(this));
    }
    prepare() {
        this.rng.setSeed(this.seeder.getSeed());
    }
}
export class LevelManager {
    dayChange: ILevelChanger = null;
    phaseChange: ILevelChanger = null;
    trialChange: ILevelChanger = null;

    minLevel = 0;
    firstTimeLevel = NaN;
    maxLevel = 999;
    maxFallFromHighest = NaN;
    level = 0;

    decimalPrecision = -1;

    bindSignals(signals: PhaseXSignals) {
        const self = this;
        signals.preInit.add(this.enterExercise.bind(this));
        signals.createProblemLogItem.add(_ => {
            _.level = self.level;
        });
        signals.responseAnalysisFinished.add(_ => {
            self.postTrial(_);
        });
        signals.disposingPhase.add(() => this.leaveExercise.bind(this));
    }
    constructor(settings: ILevelSettings = null) {
        if (settings) {
            this.dayChange = <ILevelChanger>Instantiator.i.instantiateNoThrowIfEmpty(settings.classLvlDayChange);
            this.trialChange = <ILevelChanger>Instantiator.i.instantiateNoThrowIfEmpty(settings.classLvlTrialChange);
            this.phaseChange = <ILevelChanger>Instantiator.i.instantiateNoThrowIfEmpty(settings.classLvlTrialChange);

            this.minLevel = settings.minLevel;
            this.firstTimeLevel = settings.firstTimeLevel;
            this.maxLevel = settings.maxLevel;
        }
    }

    assertLevel(level: number): number {
        if (isNaN(level)) {
            level = 0;
        }
        if (!isNaN(this.maxFallFromHighest)) {
            level = Math.max(level, TestStatistics.instance.getHighestCorrectLevel() - this.maxFallFromHighest);
        }
        level = Math.min(Math.max(level, this.minLevel), this.maxLevel);

        if (this.decimalPrecision > -1) {
            const pw = Math.pow(10, Math.round(this.decimalPrecision));
            level = Math.round(level * pw) / pw;
        }

        return level;
    }

    enterExercise(testId: string) {
        if (App.instance.urlParameters.level) {
            this.level = parseFloat(App.instance.urlParameters.level);
            return;
        }

        // TODO: use history
        // Check where we are: first time ever? New day/ phase ? Returned to ongoing phase?
        const numRuns = ExerciseStats.instance.getGameStatsSharedId(testId).numRuns; // GameState.getNumberOfRuns(testId);
        const isFirstTime = numRuns === 0;
        if (isFirstTime) {
            // TODO: plugin for this as well? E.g. it could be dependent on the performance of other exercises.
            this.level = this.assertLevel(isNaN(this.firstTimeLevel) ? this.minLevel : this.firstTimeLevel);
        } else {
            // this.level = GameState.getExerciseLastPhaseLevel(testId); //TODO: use history
            const isStartOfDay = false; // TODO: can't find this info with GameState, right?
            if (isStartOfDay) {
                if (this.dayChange) {
                    this.level = this.dayChange.execute({});
                }
            } else {
                const isStartOfPhase = true; // false if we left in the middle of a phase - but currently this can't happen
                if (isStartOfPhase) {
                    if (!this.phaseChange) {
                        this.phaseChange = new LevelChangePhaseUseLastLevel();
                    }
                    this.level = this.phaseChange.execute({});
                } else {

                }
            }
            this.level = this.assertLevel(this.level);
        }
    }
    leaveExercise() {
    }
    postTrial(trialResult: any) {
        if (this.trialChange) {
            this.level = this.assertLevel(this.level + this.trialChange.execute(trialResult));
        }
    }

    dispose() {
        if (this.dayChange) {
        }
        if (this.phaseChange) {
        }
        if (this.trialChange) {
        }
    }
}

