import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { ProblemBase } from '../games/problemBase';
import { TestStatistics } from './testStatistics';
import { GameState } from '../gameState';
import { App } from '@jwmb/pixelmagic/lib/app/app';
// import { ProblemArrows } from '../../cmcontent/games/arrows/problemArrows';

export class ProblemGeneratorData {
    public generator: string;
    public randomizeProblemOrder: boolean;
    public levelStartLevelFromLastPhase: boolean; // if set to false, start level will be set from highest level
    public levelMin: number;
    public levelMax: number;
    public levelNewDayChange: number;
    public levelNewPhaseChange;
    public levelSuccessChange: number;
    public levelFailureChange: number;
    public levelWonChallengeChange: number;
    public levelLostChallengeChange: number;
    public levelMaxFallFromHighest: number;
    public highestLevel: number;
    public problemProps: any = {};
    public phaseProps: any = {};
}

export class ProblemGeneratorBase { // TODO: separete into LevelManager/ProblemGenerator?
    // problem list
    public problems: Array<any> = []; // TODO: type problem data
    public problemProps: any;
    public problemIndex = -1;

    public phaseProps: any = {};

    public randomizeProblemOrder = false;

    // level adjustments
    public levelStartLevelFromLastPhase = false;
    public levelMin = 0;
    public levelMax = 0;
    public levelNewDayChange = 0;
    public levelNewPhaseChange = 0;
    public levelSuccessChange = 0;
    public levelFailureChange = 0;
    public levelWonChallengeChange = 0;
    public levelLostChallengeChange = 0;
    public levelMaxFallFromHighest = 99;
    public currentLevel = 0;

    constructor(data: ProblemGeneratorData) { // TODO: insert separate problem generator data
        this.init(data);
    }

    public init(data: ProblemGeneratorData) {
        Object.assign(this, data);
        // for (var iPropName in data) {
        //     if (typeof (data[iPropName]) == "object") {
        //         //Misc.mergeData(this[iPropName], data[iPropName]);
        //     } else {
        //         this[iPropName] = data[iPropName];
        //     }
        // }

        if (this.randomizeProblemOrder === true) {
            this.problems = Misc.randomizeArray(this.problems);
        }
        this.setInitialLevel();
    }

    public getNextProblem(): ProblemBase { // phase:PhaseBase
        this.problemIndex++;
        this.updateDifficultyLevel();
        console.log('currentLevel:' + this.currentLevel);
        const problemDef = this.getProblemDefinition();
        const problem = this.getProblemFromDefintion(problemDef);
        problem.overridePropertyValues(this.problemProps);
        problem.overridePropertyValues(problemDef);
        problem.level = this.currentLevel;
        return problem;
    }

    public setInitialLevel() {
        const highestLevel = TestStatistics.instance.getHighestCorrectLevel();
        if (this.levelStartLevelFromLastPhase) {
            // GameState.exerciseStats.getGameStatsSharedId(TestStatistics.instance.currentGameId).
            const gameStats = GameState.exerciseStats.getGameStatsSharedId(TestStatistics.instance.currentGameId);
            const lastLevel = gameStats.lastLevel;
            const lastPhaseWon = gameStats.lastWon;
            if (lastPhaseWon) { // TODO: maybe this should work even when this.levelStartLevelFromLastPhase is false?
                this.currentLevel = lastLevel + this.levelWonChallengeChange;
            } else {
                this.currentLevel = lastLevel + this.levelLostChallengeChange;
            }
        } else {
            const startChange = this.levelNewPhaseChange; // TODO: check if first in day
            this.currentLevel = highestLevel + startChange;
        }


        const min = Math.max(this.levelMin, highestLevel - this.levelMaxFallFromHighest);
        this.currentLevel = Misc.limitRange(this.currentLevel, min, this.levelMax);

        if (App.instance.urlParameters.level) {
            console.log('App.instance.urlParameters.level():');
            console.log(App.instance.urlParameters.level);
            this.currentLevel = parseInt(App.instance.urlParameters.level, 10);
        }
    }

    public updateDifficultyLevel() {
        const highestLevel = TestStatistics.instance.getHighestCorrectLevel();
        if (TestStatistics.instance.noOfQuestions > 0) {
            if (TestStatistics.instance.lastAnswerWasCorrect) {
                this.currentLevel = this.currentLevel + this.levelSuccessChange;
            } else {
                this.currentLevel = this.currentLevel + this.levelFailureChange;
            }
            const min = Math.max(this.levelMin, highestLevel - this.levelMaxFallFromHighest);
            this.currentLevel = Misc.limitRange(this.currentLevel, min, this.levelMax);
        }
    }

    /**
     * Get next problem definition
     */
    public getProblemDefinition(): any {
        if (this.problems.length > 0) {
            if (this.problemIndex < this.problems.length) {
                let listCopy = this.problems.slice();
                if (this.randomizeProblemOrder === true) {
                    listCopy = Misc.randomizeArray(listCopy);
                }
                this.problems = this.problems.concat(listCopy);
            }
            return this.problems[this.problemIndex];
        } else {
            return { type: 'WM_GRID', problemString: '1,2,3' };
        }
    }


    /**
     * Instanciates a problem based on problem definition
     */
    public getProblemFromDefintion(problemData: any): ProblemBase {
        const problem: ProblemBase = null;
        // if (problemData.type === "DIALOG") {
        //     problem = new ProblemDialog(phase, problemData);
        // }
        // if (problemData.type === "ANIMATION") {
        //     problem = new ProblemAnimation(problemData);
        // }
        // if (problemData.type === 'MISSING_SYMBOL') {
        //     problem = new ProblemMissingSymbol();
        // }
        // if (problemData.type === 'WRONG_MISSING_SYMBOL') {
        //     problem = new ProblemWrongMissingSymbols(problemData);
        // }
        // if (problemData.type === 'NUMBER_SEQUENCE') {
        //     problem = new ProblemSequences(problemData);
        // }
        // if (problemData.type === 'COMPARE') {
        //     problem = new ProblemCompare(problemData);
        // }
        // if (problemData.type === 'NUMBER_IMAGE') {
        //     problem = new ProblemHRTNumberImage(problemData);
        // }
        // if (problemData.type === 'LINE_IMAGE') {
        //     problem = new ProblemHRTLineImage(problemData);
        // }
        // if (problemData.type === 'CONNECT_NUMBERS') {
        //     problem = new ProblemHRTConnectNumbers(problemData);
        // }
        // if (problemData.type === 'WORD_PROBLEM') {
        //     problem = new ProblemWordProblem(problemData);
        // }
        // if (problemData.type === 'WORDPROBLEM02') {
        //     problem = new ProblemWordProblemChange(problemData);
        // }
        // if (problemData.type === 'WORDPROBLEM_TOTAL') {
        //     problem = new ProblemWordProblemTotal(problemData);
        // }
        // if (problemData.type === 'QUESTION_SCALE') {
        //     problem = new QuestionScale(problemData);
        // }
        // if (problemData.type === 'NUMBER_LINE') {
        //     problem = new ProblemNumberLine(problemData);
        // }
        // if (problemData.type === 'COMPARE_ITEMS') {
        //     problem = new ProblemCompareNumbersDots(problemData);
        // }
        // if (problemData.type === 'IDENTIFY') {
        //     problem = new ProblemIdentify(problemData);
        // }
        // if (problemData.type === 'PLACE_VALUE') {
        //     problem = new ProblemPlaceValue(problemData);
        // }
        // if (problemData.type === 'DESTROY') {
        //     problem = new ProblemDestroyGame(problemData);
        // }
        // if (problemData.type === 'COLLECT') {
        //     problem = new ProblemCollect(problemData);
        // }
        // if (problemData.type === 'TEN_PALS') {
        //     problem = new ProblemTenPals();
        // }
        // if (problemData.type === "NUMBER_RACE") {
        //     problem = new ProblemNumberRace(problemData);
        // }
        // if (problemData.type === "NUMBER_CATCHER") {
        //     problem = new ProblemNumberCatcher(problemData);
        // }
        // if (problemData.type === 'WM_GRID') {
        //     problem = new ProblemWorkMemoGrid();
        // }
        // if (problemData.type === 'WM_NUMBERS') {
        //     problem = new ProblemWorkMemoNumbers();
        // }
        // if (problemData.type === 'WM_3DGRID') {
        //     problem = new ProblemWorkMemo3dGrid();
        // }
        // if (problemData.type === 'WM_CIRCLE') {
        //     problem = new ProblemWorkMemoCircle();
        // }
        // if (problemData.type === 'WM_MOVING') {
        //     problem = new ProblemWorkMemoMoving();
        // }
        // if (problemData.type === 'WM_CRUSH') {
        //     problem = new ProblemMemoCrush();
        // }
        // if (problemData.type === "NUMEROCITY") {
        //     problem = new ProblemNumerocity(problemData);
        // }
        // if (problemData.type === "ALTERNATIVES") {
        //     problem = new ProblemAlternatives(problemData);
        // }
        // if (problemData.type === 'DISCRIMINATE_NUMBERGROUPS') {
        //     problem = new ProblemNumberGroupDiscriminate(problemData);
        // }
        // if (problemData.type === 'PRODUCE_NUMBERGROUPS') {
        //     problem = new ProblemNumberGroupsProduce(problemData);
        // }
        // if (problemData.type === 'RELATIONS') {
        //     problem = new ProblemRelationsAmount(problemData);
        // }
        // if (problemData.type === 'COLLECT') {
        //     problem = new ProblemCollect(problemData);
        // }
        // if (problemData.type === 'COUNTING') {
        //     problem = new ProblemCounting(problemData);
        // }
        // if (problemData.type === 'COUNT_OUT') {
        //     problem = new ProblemCountOut(problemData);
        // }
        // if (problemData.type === 'READING_ALTERNATIVES') {
        //     problem = new ProblemReadingAlternatives(problemData);
        // }
        // if (problemData.type === 'ARROWS') {
        //     problem = new ProblemArrows();
        // }
        // if (problemData.type === 'READING_BUILDWORDS') {
        //     problem = new ProblemBuildWords();
        // }
        // if (problemData.type === 'READING_CROSSWORDS' || problemData.type === 'CROSSWORD') {
        //     const instance: Object = Object.create(PixelMagic['ProblemCrossword'].prototype);
        //     // TODO: why this instead of simple instance?
        //     instance.constructor.apply(instance);
        //     problem = <ProblemBase>instance;
        // }
        // if (problemData.type === 'QUESTIONNAIRE' || problemData.type === 'QUESTION_SCALE') {
        //     problem = new ProblemQuestionnaire();
        // }
        // if (problemData.type === 'COUNT_OUT') {
        //     const instance: Object = Object.create(PixelMagic['ProblemCountOut'].prototype);
        // // TODO: why this instead of simple instance?
        //     instance.constructor.apply(instance);
        //     problem = <ProblemBase>instance;
        // }
        // if (problemData.type === 'TANGRAM') {
        //     problem = new ProblemTangram();
        // }

        // if (problemData.type === 'READING_COLLECT') {
        //     problem = new ProblemReadingCollect();
        // }
        // 			if (problemData.type=="IQ_MATRIX") {
        // 				problem = new ProblemIQMatrix(problemData);
        // 			}

        /**
         * Fallback solution, tries to implement problem directly from problem type
         * (does allow external libraries to run even tho they are not included in this library)
         */
        // if (problem == null) {
        //     let problemClass = PixelMagic[problemData.type];
        //     if (problemClass) {
        //         const problemConstructor = problemClass.prototype;
        //         if (problemConstructor) {
        //             const instance: Object = Object.create(problemConstructor);
        //             if (instance) {
        //                 instance.constructor.apply(instance);
        //                 problem = <ProblemBase>instance;
        //             }
        //         }
        //     }
        // }

        if (problem == null) {
            console.log('NO SUCH PROBLEM TYPE: ' + problemData.type);
        }
        return problem;
    }

    public getNumberOfProblems(): number {
        console.log('this.problems.length:');
        console.log(this.problems.length);
        if (this.problems.length > 0) {
            return this.problems.length;
        } else {
            return 5;
        }
    }

    public dispose() {
        this.problems = null;
        this.problemProps = null;
    }
}
