import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { GameDefinition } from './gameDefinition';
import { TrainingPlan, ProposedGameInfo } from './TrainingPlan';
import { ExerciseStats } from '../dataStructs';
import { PlanetBundler } from './PlanetBundler';
import { RandomSeed } from '@jwmb/pixelmagic/lib/utility/RandomSeed';
import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { KeyValMap } from '@jwmb/pixelmagic/lib/toReplace/keyValMap';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';

    export class LinearGameDefinition extends GameDefinition {
        public isCloneOf = '';
        public cloneNo = 1;
        public notVisibleOnMenu = false; // TODO: replace with GameDefinition::invisible
        public requires: string[] = [];
    }


    export type ConnectionType = 'THREE-WAY' | 'LINEAR';
    export class LinearTrainingPlan extends TrainingPlan {
        public isPreProcessed = false;
        public autoConnectType: ConnectionType = 'THREE-WAY';
        public tests: LinearGameDefinition[]; // LinearExerciseDefinition[];

        private processedTests: LinearGameDefinition[]; // LinearExerciseDefinition[];

        public getAvailableGames(stats: ExerciseStats): GameDefinition[] {
            this.preprocess();
            return this.processedTests.filter(_ => !_.isCloneOf);
        }
        public getProposedGames(proposedGameIds: string[], stats: ExerciseStats): ProposedGameInfo[] {
            this.preprocess();

            const allGameStats = stats.getAllGameStats();
            const planets = PlanetBundler.getPreviouslyCalcedPlanets(this); // getPlanets();
            planets.filter(_ => !_.nextGame).forEach(_ => _.nextGame = new GameDefinition());
            let lastPlanetUnlocked = true;
            return this.processedTests.map(game => {
                const planet = planets.find(p => p.nextGame.id === game.id);
                let unlocked = false;
                if (!planet || !planet.isUnlocked) {
                    if (game.requires && game.requires.length) {
                        const requiredPlanets = planets.filter(p => game.requires.indexOf(p.nextGame.id) >= 0);
                        unlocked = requiredPlanets.length >= game.requires.length && requiredPlanets.find(p => !p.isCompleted) == null;
                    } else if (lastPlanetUnlocked) {
                        unlocked = true;
                    }
                } else if (planet && planet.isCompleted) {
                    return null;
                } else {
                    unlocked = true;
                }
                lastPlanetUnlocked = planet && planet.isUnlocked;
                return new ProposedGameInfo(game.id, unlocked);
            }).filter(_ => !!_);
        }
        public getDefinedGames(): GameDefinition[] {
            this.preprocess();
            return this.processedTests
                // .filter(_ => !_.isCloneOf) //TODO: can't remove these when using PlanetBundler
                ;
            // .map(_ => {
            //    var tmp = <GameDefinition>ObjectUtils.merge(new GameDefinition(), _);
            //    //tmp.id = tmp.id.split("#")[0];
            //    return tmp;
            // });
        }

        public init(stats: ExerciseStats) {
            this.autogenerateClonesIfNeeded(stats);
        }
        private autogenerateClonesIfNeeded(stats: ExerciseStats) {
            this.preprocess();
            const allGameStats = stats.getAllGameStats();
            const planets = PlanetBundler.getPreviouslyCalcedPlanets(this); // .getPlanets(false, this);

            const numTestsPerType = new KeyValMap<string, number>();
            this.processedTests.forEach((v, i) => {
                const num = numTestsPerType.getOrAddByKey(ExerciseStats.getSharedId(v.id), 0);
                numTestsPerType.setValue(ExerciseStats.getSharedId(v.id), num + 1);
            });
            const fGenNextId = (gameId) => {
                const tmpId = ExerciseStats.getSharedId(gameId);
                const numTestsForThisGame = numTestsPerType.getValue(tmpId);
                numTestsPerType.setValue(tmpId, numTestsForThisGame + 1);
                return tmpId + '#' + (numTestsForThisGame + 1); // +1 b/c regular cloning starts at #2
            };
            let needRecalc = false;
            let cloneable = this.processedTests.filter(_ => !(<any>_).isCloneOf);
            if (planets.length > this.processedTests.length) {
                // More planets than "tests" (can happen after auto-cloning exercises in freeChoice):
                // add planets to fill out
                needRecalc = true;
                const addedTests = planets.slice(this.processedTests.length)
                    .filter(_ => _.gameRuns.length > 0).map(_ => {
                    return <LinearGameDefinition><any>{
                        isCloneOf: cloneable[0].id,
                        id: fGenNextId(_.gameRuns[0].gameId) // _.gameRuns.length ? _.gameRuns[0].gameId : _.gameId
                    };
                });
                this.tests = this.tests.concat(addedTests);
            }

            if (planets.length === this.tests.length &&
                planets.filter(_ => !_.isCompleted).length === 0) {
                // No more available planets
                if (this.allowFreeChoice) {
                    // When free choice, add a clone of first planet:
                    this.tests = this.tests.concat([<any>{ isCloneOf: cloneable[0].id, id: fGenNextId(cloneable[0].id) }]);
                    needRecalc = true;
                }
            }
            if (needRecalc) {
                this.processedTests = null;
                this.preprocess();
            }
        }

        protected preprocess() {
            if (this.processedTests) {
                return;
            }

            let tests = this.tests.map(_ => <LinearGameDefinition>ObjectUtils.merge(new LinearGameDefinition(), _, true));
            tests = tests.filter(_ => {
                if (_.isCloneOf) {
                    if (!this.tryCloneTest(_, tests)) {
                        return false;
                    }
                }
                return true;
            });
            this.processedTests = tests;

            const idList = [];
            for (let i = 0; i < tests.length; i++) {
                const testData = tests[i];
                if (idList.indexOf(testData.id) > -1) {
                    console.log('WARNING DUPLICATE ID:' + testData.id);
                } else {
                    idList.push(testData.id);
                }
                if (testData.phases.constructor !== Array) { // incorrect testData structure
                    testData.phases = [testData.phases];
                }
                testData.invisible = !!testData.notVisibleOnMenu;
            }
            tests.filter(_ => _.id.indexOf('#') < 0).forEach(_ => _.id += '#0');
            this.createAutoConnections(tests);
        }

        private random: RandomSeed = new RandomSeed(3);
        private createAutoConnections(tests: LinearGameDefinition[]) {
            if (this.autoConnectType === 'LINEAR') {
                tests.forEach((gameDef, i) => gameDef.requires =
                    i > 0 ? [this.tests[i - 1].id] : []
                );

            } else if (this.autoConnectType === 'THREE-WAY') {
                tests.forEach((gameDef, i) => gameDef.requires =
                    i > 3 ? [tests[i - this.random.nextMinMax(1, 4)].id] // this first case was unreachable in old code
                        : (i > 0 ? [tests[i - 1].id] : [])
                );

                tests.forEach((gameDef, i) => {
                    if (i < tests.length - 3) {
                        // What is this for? If some random future planet doesn't require this planet, make it so?
                        const unlockData = tests[i + this.random.nextMinMax(1, 3)];
                        if (unlockData.requires.indexOf(gameDef.id) === -1) {
                            unlockData.requires.push(gameDef.id);
                        }
                    }
                });
            }
        }
        // private createAutoConnections(type: ConnectionType, tests: LinearExerciseDefinition[]): void {
        //    var exercise: TestData;
        //    var i: number;
        //    var random: RandomSeed = new RandomSeed(3);

        //    if (type == "LINEAR") {
        //        for (i = 0; i < tests.length; i++) {
        //            exercise = tests[i];
        //            exercise.requires = i > 0 ? [tests[i - 1].id] : [];
        //        }

        //    } else if (type == "THREE-WAY") {
        //        for (i = 0; i < tests.length; i++) {
        //            exercise = tests[i];
        //            if (i > 0) {
        //                exercise.requires = [tests[i - 1].id];
        //            } else if (i > 3) { //Will never happen??
        //                exercise.requires = [tests[i - random.nextMinMax(1, 4)].id];
        //            } else {
        //                exercise.requires = [];
        //            }
        //        }
        //        for (i = 0; i < tests.length; i++) {
            //  //What is this for? If some random future planet doesn't require this planet, make it so?
        //            exercise = tests[i];
        //            var unlockData: LinearExerciseDefinition;
        //            if (i == tests.length - 1) {
        //                unlockData = tests[i + 1];
        //            } else if (i < tests.length - 3) {
        //                unlockData = tests[i + random.nextMinMax(1, 3)];
        //            }
        //            if (unlockData && unlockData.requires.indexOf(exercise.id) == -1) {
        //                unlockData.requires.push(exercise.id);
        //            }
        //        }
        //    }
        // }
        private tryCloneTest(cloneData: LinearGameDefinition, tests: LinearGameDefinition[]): boolean {
            // var testToClone = this.tests[cloneWhichId];
            let testToClone = tests.find(_ => _.id === cloneData.isCloneOf); // clone tests and
            if (!testToClone) {
                testToClone = tests.find(_ => _.id === ExerciseStats.getSharedId(cloneData.isCloneOf));
                if (!testToClone) {
                    Logger.warn('Cannot clone test with id: ' + cloneData.isCloneOf + ' since it doesn\'t exist');
                    return false;
                }
            }
            const predefinedId = cloneData.id;
            testToClone.cloneNo++;
            const copy = JSON.parse(JSON.stringify(testToClone));
            Misc.mergeData(copy, cloneData); // override with clone data
            Object.assign(cloneData, copy);
            if (!predefinedId) {
                const prefixId = cloneData.isCloneOf.split('#')[0];
                cloneData.id = prefixId + '#' + testToClone.cloneNo; // cloneData.cloneNo;
            }
            if (cloneData.title === testToClone.title) { // increment title (if not overriden by clone data)
                cloneData.title += ' ' + testToClone.cloneNo; // cloneData.cloneNo;
            }
            return true;
        }
        // private addClonedTests(tests: TestData[]) {
        //    tests.forEach((testData) => {
        //        if (testData.isCloneOf) { // collect clones in a list
        //            this.tryCloneTest(testData, tests);
        //            delete testData.isCloneOf; // remove clone references so it doesnt try to clone again (when returning to map screen)
        //            delete testData.cloneNo;
        //        } else {
        //            testData.cloneNo = 1;
        //        }
        //    });
        // }
    }
