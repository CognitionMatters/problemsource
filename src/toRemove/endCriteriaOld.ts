// import { TestStatistics } from '../toRemove/testStatistics';
// import { EndCriteriaData, CriteriaType, CriteriaValues } from './endCriteria';
// import { PlanetBundler } from '../trainingPlan/PlanetBundler';
// import { ExerciseStats } from '../dataStructs';
// import { GameState } from '../gameState';
// import { EndType } from './endCriteriaEndType';


// export class EndCriteriaManagerOLD {
//     public targetCriteria: CriteriaValues;
//     public endCriteria: CriteriaValues;
//     public failCriteria: CriteriaValues;

//     public endType: EndType;

//     constructor(data: EndCriteriaData, numProblems: number) { // private phase: { isTestStarted: boolean },  PhaseBase
//         // problemGenerator: ProblemGeneratorBase,

//         // create target criteria
//         if (data.target) {
//             this.targetCriteria = JSON.parse(JSON.stringify(data.target)); // make a copy of data since this data can be changed dynamically
//         } else {
//             this.targetCriteria = new CriteriaValues(CriteriaType.CORRECT_TOTAL);
//         }
//         this.targetCriteria.value = this.getTargetScore();
//         if (this.targetCriteria.value == null || this.targetCriteria.value < 1) {
//             if (this.targetCriteria.type === CriteriaType.CORRECT_TOTAL) {
//                 this.targetCriteria.value = numProblems;
//             } else if (this.targetCriteria.type === CriteriaType.CORRECT_IN_ROW) {
//                 this.targetCriteria.value = 5;
//             } else if (this.targetCriteria.type === CriteriaType.QUESTIONS_TOTAL) {
//                 this.targetCriteria.value = numProblems;
//             } else if (this.targetCriteria.type === CriteriaType.TIME) {
//                 this.targetCriteria.value = 60;
//             }
//         }
//         TestStatistics.instance.targetScore = this.targetCriteria.value;
//          // TODO: remove target score from test statistics? or send this value through phaseStart() or similar

//         if (data.end) {
//             this.endCriteria = data.end;
//             if (this.endCriteria.value == null || this.endCriteria.value < 1) {
//                 if (this.endCriteria.type === CriteriaType.CORRECT_TOTAL) {
//                     this.endCriteria.value = numProblems;
//                 }
//                 if (this.endCriteria.type === CriteriaType.CORRECT_IN_ROW) {
//                     this.endCriteria.value = 5;
//                 }
//                 if (this.endCriteria.type === CriteriaType.QUESTIONS_TOTAL) {
//                     this.endCriteria.value = numProblems;
//                 }
//                 if (this.endCriteria.type === CriteriaType.TIME) {
//                     this.endCriteria.value = 60;
//                 }
//             }
//         }

//         if (data.fail) {
//             this.failCriteria = data.fail;
//             if (this.failCriteria.value == null || this.failCriteria.value < 1) {
//                 if (this.failCriteria.type === CriteriaType.INCORRECT_IN_ROW) {
//                     this.failCriteria.value = 2;
//                 }
//                 if (this.failCriteria.type === CriteriaType.INCORRECT_TOTAL) {
//                     this.failCriteria.value = 2;
//                 }
//                 if (this.failCriteria.type === CriteriaType.TIME) {
//                     this.failCriteria.value = 60;
//                 }
//             }
//         }
//     }

//     /**
//      * this is used by phase to set end timer
//      * @return
//      *
//      */
//     public getEndTime(): number {
//         if (this.targetCriteria.type === CriteriaType.TIME) {
//             return this.targetCriteria.value;
//         }
//         if (this.endCriteria && this.endCriteria.type === CriteriaType.TIME) {
//             return this.endCriteria.value;
//         }
//         if (this.failCriteria && this.failCriteria.type === CriteriaType.TIME) {
//             return this.failCriteria.value;
//         }
//         return 0;
//     }

//     /**
//      * this is used by phases to check if the phase is ended, the property endType can be checked after this function is called
//      * @return
//      *
//      */
//     public checkIfPhaseEnd(): boolean {
//         if (this.getEndPercentage() >= 1) { // reached end criteria?
//             this.endType = EndType.END; // "COMPLETE";
//             return true;
//         }

//         if (this.getTargetPercentage() >= 1) { // reached target criteria?
//             this.endType = EndType.TARGET; // ;"WON";
//             return true;
//         }

//         if (this.getFailPercentage() >= 1) { // reached fail criteria
//             this.endType = EndType.FAILED; // "FAILED";
//             return true;
//         }
//         return false;
//     }

//     public setTargetScore(value: number) {
//         this.targetCriteria.value = value;
//     }

//     // public static fGetPlanetNumMedals: () => number;
//     public getTargetScore(): number {
//         if (this.targetCriteria.dynamicValue == null) {
//             return this.targetCriteria.value;
//         }

//         if (this.targetCriteria.dynamicValue.type === 'MEDALS') {
//             // let noOfMedals = EndCriteriaManager.fGetPlanetNumMedals();
//             let noOfMedals = PlanetBundler.currentPlanet.numMedals; // PlanetBundler.getMedalCount(GameState.sessionVars.currentTestId);
//             if (this.targetCriteria.dynamicValue.adaptAfterNoOfFails > 0) {
//                 const noOfRuns = ExerciseStats.instance.getGameStats(GameState.sessionVars.currentTestId).numRuns;
//                 const noOfFailed = noOfRuns - noOfMedals;
//                 const adaption = Math.floor(noOfFailed / this.targetCriteria.dynamicValue.adaptAfterNoOfFails);
//                 noOfMedals -= adaption;
//                 noOfMedals = Math.max(0, noOfMedals);
//             }
//             return this.targetCriteria.dynamicValue.values[Math.min(noOfMedals, 2, this.targetCriteria.dynamicValue.values.length - 1)];
//         }
//         return 99;
//     }

//     public getMaxTargetScore(): number {
//         if (this.targetCriteria.dynamicValue) {
//             if (this.targetCriteria.dynamicValue.type === 'MEDALS') {
//                 return Math.max(this.targetCriteria.dynamicValue.values[2], this.targetCriteria.value);
//             }
//         }
//         return this.targetCriteria.value;
//     }

//     public getTargetPercentage(): number { // TODO: Move endCriteriaManager to testStatistics and pipe through calls
//         return this.getCriteriaPercentage(this.targetCriteria);
//     }

//     public getEndPercentage(): number {
//         return this.getCriteriaPercentage(this.endCriteria);
//     }

//     public getEndValue(): number {
//         if (this.endCriteria && this.endCriteria.value) {
//             return this.endCriteria.value;
//         }
//         return -1;
//     }

//     public getFailPercentage(): number {
//         return this.getCriteriaPercentage(this.failCriteria);
//     }

//     private getCriteriaPercentage(criteriaValues: CriteriaValues) {
//         if (criteriaValues == null) {
//             return 0;
//         }

//         let value = 0;
//         if (criteriaValues.type === CriteriaType.CORRECT_IN_ROW) {
//             value = TestStatistics.instance.noOfCorrectInRow / criteriaValues.value;
//         }

//         if (criteriaValues.type === CriteriaType.CORRECT_TOTAL) {
//             value = TestStatistics.instance.noOfCorrectTotal / criteriaValues.value;
//         }

//         if (criteriaValues.type === CriteriaType.INCORRECT_IN_ROW) {
//             value = TestStatistics.instance.noOfIncorrectInRow / criteriaValues.value;
//         }

//         if (criteriaValues.type === CriteriaType.INCORRECT_TOTAL) {
//             value = TestStatistics.instance.noOfIncorrectTotal / criteriaValues.value;
//         }

//         if (criteriaValues.type === CriteriaType.QUESTIONS_TOTAL) {
//             value = Math.max(0, TestStatistics.instance.noOfQuestions) / criteriaValues.value;
//         }

//         if (criteriaValues.type === CriteriaType.RESPONSES_TOTAL) {
//             value = Math.max(0, TestStatistics.instance.noOfResponses - 1) / criteriaValues.value;
//         }

//         if (criteriaValues.type === CriteriaType.TIME) {
//             // if (TestStatistics.instance.hasPhase) { // && TestStatistics.instance.currentPhase.isTestStarted
//             value = (TestStatistics.instance.getTestTime() / 1000) / criteriaValues.value;
//             // } else {
//             //     value = 0;
//             // }
//         }
//         return value;
//     }

//     public dispose(): void {
//         // this.phase=null;
//     }
// }
