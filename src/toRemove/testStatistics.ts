import { GameRunStats, ExerciseStats } from '../dataStructs';
import { NewPhaseLogItem, LogItem, AnswerLogItem, NewProblemLogItem, PhaseEndLogItem, LeaveTestLogItem } from './logItem';
import { PhaseRunner } from '../phasing/phaseRunner';
import { GameState } from '../gameState';
import { EndCriteriaManager } from '../phasing/endCriteria';
import { PhaseType } from '../phasing/phaseType';
import { PhaseXBase } from '../phasing/phase';

export type TStartGame = (id: string) => void;
export type TLogTestPhase = (
    phase: { endCriteriaManager: EndCriteriaManager, getPlayerScore: () => number },
    stats: ExerciseStats, logItem: PhaseEndLogItem) => void;

export class TestStatistics {
    private static _instance: TestStatistics;
    public static get instance(): TestStatistics {
        if (TestStatistics._instance == null) {
            TestStatistics._instance = new TestStatistics();
        }
        return TestStatistics._instance;
    }

    // public currentTest: TempTestScreenReplacement; //TestScreen;
    public currentGameId: string;

    public targetScore: number;

    public lastLogTime: number;
    // private timeLimit: number;
    // public itemTarget:number;

    private phaseStartTime: number;
    private problemStartTime: number;

    public noOfQuestions: number;
    public noOfCorrectTotal: number;
    public noOfCorrectInRow: number;
    public noOfIncorrectTotal: number;
    public noOfIncorrectOnCurrent: number;
    public noOfIncorrectInRow: number;
    public noOfResponses: number;

    public lastAnswerWasCorrect: boolean;
    private lastAnswerWasReversed: boolean;

    public starCounter: number; // TODO: shouldn't be here

    public levelCurrentProblem: number;
    public levelLastProblem: number;
    private levelHighestCorrect: number;
    private lastLevelHighestCorrect: number;

    constructor() { // TODO: refactor remove reference to test? send data when needed with events
        if (TestStatistics._instance) {
            throw new Error(('TestStatistics already instantiated, use instance instead'));
        }
        this.lastLogTime = Date.now();
    }

    public static startGameCalls: TStartGame[] = [];
    public static testPhaseLoggers: TLogTestPhase[] = [];

    public runStats: GameRunStats;
    public startNewExercise(pr: PhaseRunner): void {
        this.phaseRunner = pr;
        // this.currentPhase = null;
        this.currentGameId = pr.id;

        TestStatistics.startGameCalls.forEach(_ => _(this.currentGameId));
        // this.runStats = new GameRunStats({ gameId: this.currentGameId, started_at: Date.now(),
        // trainingDay: GameState.getTrainingDay() });
        this.runStats = null;

        this.phaseStartTime = 0;
        this.problemStartTime = 0;

        this.noOfQuestions = 0;
        this.noOfCorrectTotal = 0;
        this.noOfCorrectInRow = 0;
        this.noOfIncorrectTotal = 0;
        this.noOfIncorrectOnCurrent = 0;
        this.noOfIncorrectInRow = 0;
        this.noOfResponses = 0;
        this.lastAnswerWasCorrect = false;
        this.lastAnswerWasReversed = false;

        this.starCounter = 0;

        this.levelCurrentProblem = 0;
        this.levelLastProblem = 0;
        this.levelHighestCorrect = 0;
        this.lastLevelHighestCorrect = 0;
    }

    public resetPhaseStartTime() {
        this.phaseStartTime = Date.now();
    }

    public phaseRunner: PhaseRunner;
     // TODO: shouldn't really be here - take care of when refactoring away statics (GameState, TestStatistics.instance)
    // public currentPhase: PhaseXBase;
    // public get hasPhase() {
    //     return !!this.currentPhase;
    // }
    // public startPhase(phase: PhaseXBase) {
    //     this.currentPhase = phase;
    // }
    public get currentPhase(): PhaseXBase {
        return this.phaseRunner.currentPhase;
    }

    private _lastAnswerItem: AnswerLogItem; // Just for response_time correction...
    public logEvent(logItem: LogItem) {
        logItem.time = Date.now();
        this.lastLogTime = logItem.time;

        if (logItem.isOfType(NewPhaseLogItem)) { // NEW_PHASE) {
            this.runStats = new GameRunStats({
                gameId: this.currentGameId, started_at: logItem.time,
                trainingDay: GameState.getTrainingDay()
            });
            (<NewPhaseLogItem>logItem).training_day = GameState.getTrainingDay(); // TODO: refactor
            this.levelCurrentProblem = 0;
            this.levelLastProblem = -1;
            this.levelHighestCorrect = 0;
            this.lastLevelHighestCorrect = 0;
            this.noOfQuestions = 0;
            this.noOfCorrectInRow = 0;
            this.noOfCorrectTotal = 0;
            this.noOfIncorrectTotal = 0;
            this.noOfIncorrectInRow = 0;
            this.phaseStartTime = Date.now();
            this.noOfIncorrectOnCurrent = 0;

        } else if (logItem.isOfType(NewProblemLogItem)) { // NEW_PROBLEM) {
            this.noOfQuestions++;
            this.noOfIncorrectOnCurrent = 0;

            this.levelLastProblem = this.levelCurrentProblem;
            this.levelCurrentProblem = (<NewProblemLogItem>logItem).level;
            if (this.noOfQuestions === 1) {
                this.levelLastProblem = (<NewProblemLogItem>logItem).level;
            }

            this.problemStartTime = Date.now();
            this._lastAnswerItem = null;

        } else if (logItem.isOfType(PhaseEndLogItem)) {
            if ((<PhaseEndLogItem>(logItem)).phase === PhaseType.TEST) {
                const peItem = <PhaseEndLogItem>logItem;

                this.runStats.won = peItem.wonRace;
                if (peItem.cancelled) {
                    this.runStats.cancelled = peItem.cancelled;
                }

                peItem.noOfQuestions = this.noOfQuestions;
                peItem.noOfCorrect = this.noOfCorrectTotal;
                peItem.noOfIncorrect = this.noOfIncorrectTotal;

                peItem.score = this.noOfCorrectTotal;
                peItem.targetScore = this.targetScore;
                peItem.wonRace = peItem.wonRace;

                // ExerciseStats.instance.addGameRun(TestStatistics.instance.runStats);
                // TestStatistics.testPhaseLoggers.forEach(_ => _(this.currentPhase, ExerciseStats.instance, peItem));
                // GameState.logTestPhase(this.currentPhase, peItem);

                // this.currentPhase = null;
            }

        } else if (logItem.isOfType(LeaveTestLogItem)) {
            // only user to sync state

        } else if (logItem.isOfType(AnswerLogItem)) {
            const answItem = <AnswerLogItem>logItem;

            this.runStats.highestLevel = answItem.correct ? this.levelLastProblem : this.runStats.highestLevel;
            this.runStats.lastLevel = this.levelLastProblem;

            let responseTime = Date.now() - this.problemStartTime;
            answItem.response_time = responseTime; // TODO: add stimuli time

            // Because responseTime is cumulative when multiple answers to same problem, remove last responseTime
            responseTime = this._lastAnswerItem ? responseTime - this._lastAnswerItem.response_time : responseTime;
            this.runStats.trainingTime += responseTime;
            this._lastAnswerItem = answItem;

            this.noOfResponses++;

            answItem.tries = this.noOfIncorrectOnCurrent + (answItem.correct ? 1 : 0);
            if (this.noOfIncorrectOnCurrent === 0) {
                this.lastAnswerWasCorrect = answItem.correct;
            }

            if (answItem.correct) {
                this.noOfCorrectInRow++;
                this.noOfCorrectTotal++;

                this.noOfIncorrectInRow = 0;

                this.lastAnswerWasReversed = false; // TODO: move specific WM-digits functionality

                if (this.levelCurrentProblem > this.levelHighestCorrect) {
                    this.lastLevelHighestCorrect = this.levelHighestCorrect;
                    this.levelHighestCorrect = this.levelCurrentProblem;
                }
            } else {
                this.noOfCorrectInRow = 0;

                this.noOfIncorrectTotal++;
                this.noOfIncorrectOnCurrent++;
                this.noOfIncorrectInRow++;

                this.lastLevelHighestCorrect = this.levelHighestCorrect;
                this.lastAnswerWasReversed = (<any>logItem).reversedAnswer ? (<any>logItem).reversedAnswer : false;
                 // TODO: move specific WM-digits functionality
            }
        } else {
            console.log('NOPE');
        }
        // StateLog.instance.log(logItem);
    }

    // TODO: move to somewhere else!
    public addStar() {
        this.starCounter++;
    }
    public getTestTime(): number {
        return this.phaseStartTime > 0 ? Date.now() - this.phaseStartTime : 0;
    }
    public getHighestCorrectLevel(): number {
        return Math.max(ExerciseStats.instance.getGameStatsSharedId(this.currentGameId).highestLevel, this.levelHighestCorrect);
    }
    public getLastHighestCorrectLevel(): number { // this is used by level meters
        return Math.max(ExerciseStats.instance.getGameStatsSharedId(this.currentGameId).highestLevel, this.lastLevelHighestCorrect);
    }
}
