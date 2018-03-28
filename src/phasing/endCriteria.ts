import { PlanetBundler } from '../trainingPlan/PlanetBundler';
import { GameState } from '../gameState';
import { TestStatistics } from '../toRemove/testStatistics';
import { ExerciseStats } from '../dataStructs';
import { EndType } from './endCriteriaEndType';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';

export class EndCriteriaData {
    public end: CriteriaValues;
    public target: CriteriaValues;
    public fail: CriteriaValues;
    constructor() {
        this.target = new CriteriaValues(CriteriaType.CORRECT_TOTAL);
    }
}

export class CriteriaType {
    public static CORRECT_IN_ROW = <CriteriaType>(<any>'CORRECT_IN_ROW');
    public static CORRECT_TOTAL = <CriteriaType>(<any>'CORRECT_TOTAL');
    public static INCORRECT_IN_ROW = <CriteriaType>(<any>'INCORRECT_IN_ROW');
    public static INCORRECT_TOTAL = <CriteriaType>(<any>'INCORRECT_TOTAL');
    public static QUESTIONS_TOTAL = <CriteriaType>(<any>'QUESTIONS_TOTAL');
    public static RESPONSES_TOTAL = <CriteriaType>(<any>'RESPONSES_TOTAL');
    public static TIME = <CriteriaType>(<any>'TIME');
}


export class CriteriaValues {
    public type: CriteriaType;
    public value = -1;
    public dynamicValue: { type: string, values: number[], adaptAfterNoOfFails?: number } = null; // any = null;
    constructor(type?, value?) {
        this.type = type;
        this.value = value;
    }
}



export enum CriteriumUsage {
    target,
    end,
    fail
}

export abstract class DynamicValue {
    public abstract get value(): number;
    public abstract get maxValue(): number;
    public static create(data: { type: string }): DynamicValue {
        if (data) {
            let result: DynamicValue;
            if (data.type === 'MEDALS') {
                result = new DynamicValueMedals();
            }
            if (result) {
                Object.assign(result, data);
                return result;
            }
        }
        return null;
    }
}
class DynamicValueMedals extends DynamicValue {
    public adaptAfterNoOfFails = 0;
    public values: number[];
    public get maxValue() {
        return this.values[this.values.length - 1];
    }
    public get value() {
        let noOfMedals = PlanetBundler.currentPlanet.numMedals;
        if (this.adaptAfterNoOfFails > 0) {
            const noOfRuns = ExerciseStats.instance.getGameStats(GameState.sessionVars.currentTestId).numRuns;
            const noOfFailed = noOfRuns - noOfMedals;
            const adaption = Math.floor(noOfFailed / this.adaptAfterNoOfFails);
            noOfMedals -= adaption;
            noOfMedals = Math.max(0, noOfMedals);
        }
        return this.values[Math.min(noOfMedals, 2, this.values.length - 1)];
    }
}

export abstract class CriteriumBase {
    public type: string;
    protected value = -1;
    protected dynamicValue: DynamicValue; // { type: string, values: number[], adaptAfterNoOfFails?: number } = null;
    public fetchDefaultValue(data: any) {
    }
    public setValue(value: number) {
        this.dynamicValue = null;
        this.value = value;
    }
    public getValue(): number {
        if (this.dynamicValue) {
            return this.dynamicValue.value;
        }
        return this.value;
    }
    public getMaxValue(): number {
        if (this.dynamicValue) {
            return Math.max(this.dynamicValue.maxValue, this.value);
        }
        return this.value;
    }
    abstract get fractionFulfilled(): number;

    private static _registered: CriteriumBase[];
    public static create(data: CriteriaValues, usage: CriteriumUsage, defaults: any) { // type: CriteriaType) {
        if (!CriteriumBase._registered) {
            CriteriumBase._registered =
                [CriteriumCorrectInRow, CriteriumIncorrectInRow,
                    CriteriumCorrectTotal, CriteriumIncorrectTotal,
                    CriteriumQuestionsTotal, CriteriumResponsesTotal,
                    CriteriumTime]
                .map(_ => <CriteriumBase>Instantiator.i.instantiate(_));
        }
        if (!data.type) {
            data.type = CriteriaType.CORRECT_TOTAL;
        }
        let criterium = CriteriumBase._registered.find(_ => _.type === data.type);
        if (!criterium) {
            throw new Error('No end criterum of type ' + data.type);
        }
        criterium = <CriteriumBase>Instantiator.i.instantiate((<any>criterium).constructor);

        criterium.dynamicValue = DynamicValue.create(data.dynamicValue);

        if (data.value) {
            criterium.value = data.value;
        }
        if (!criterium.dynamicValue && (criterium.value === null || criterium.value === undefined)) {
            criterium.fetchDefaultValue(defaults);
        }
        return criterium;
    }
}
export class CriteriumCorrectInRow extends CriteriumBase {
    public type = 'CORRECT_IN_ROW';
    protected value = 5;
    get fractionFulfilled() {
        return TestStatistics.instance.noOfCorrectInRow / this.getValue();
    }
}
export class CriteriumIncorrectInRow extends CriteriumBase {
    public type = 'INCORRECT_IN_ROW';
    protected value = 2;
    get fractionFulfilled() {
        return TestStatistics.instance.noOfIncorrectInRow / this.getValue();
    }
}
export class CriteriumCorrectTotal extends CriteriumBase {
    public type = 'CORRECT_TOTAL';
    public fetchDefaultValue(defaults: any) {
        if (defaults && defaults.numProblems) {
            this.value = defaults.numProblems;
        }
    }
    get fractionFulfilled() {
        return TestStatistics.instance.noOfCorrectTotal / this.getValue();
    }
}
export class CriteriumIncorrectTotal extends CriteriumBase {
    public type = 'INCORRECT_TOTAL';
    protected value = 2;
    get fractionFulfilled() {
        return TestStatistics.instance.noOfIncorrectTotal / this.getValue();
    }
}
export class CriteriumQuestionsTotal extends CriteriumBase {
    public type = 'QUESTIONS_TOTAL';
    public fetchDefaultValue(defaults: any) {
        if (defaults && defaults.numProblems) {
            this.value = defaults.numProblems;
        }
    }
    get fractionFulfilled() {
        return TestStatistics.instance.noOfQuestions / this.getValue();
    }
}
export class CriteriumResponsesTotal extends CriteriumBase {
    public type = 'RESPONSES_TOTAL';
    get fractionFulfilled() {
        return TestStatistics.instance.noOfResponses / this.getValue();
    }
}

export class CriteriumTime extends CriteriumBase {
    public type = 'TIME';
    protected value = 60;
    get fractionFulfilled() {
        return TestStatistics.instance.getTestTime() / 1000 / this.getValue();
    }
}

export class EndCriteriaManager {
    public targetCriteria: CriteriumBase;
    public endCriteria: CriteriumBase;
    public failCriteria: CriteriumBase;

    public endType: EndType;

    constructor(data: EndCriteriaData, numProblems: number) {
        const defaults = { numProblems: numProblems };
        this.targetCriteria = CriteriumBase.create(data.target || new CriteriaValues(CriteriaType.CORRECT_TOTAL)
            , CriteriumUsage.target, defaults);
        TestStatistics.instance.targetScore = this.targetCriteria.getValue();

        if (data.end) {
            this.endCriteria = CriteriumBase.create(data.end, CriteriumUsage.end, defaults);
        }
        if (data.fail) {
            this.failCriteria = CriteriumBase.create(data.fail, CriteriumUsage.fail, defaults);
        }
    }

    public getTargetScore(): number {
        return this.targetCriteria.getValue();
    }
    public setTargetScore(value: number) {
        this.targetCriteria.setValue(value);
    }

    public getTargetPercentage(): number { // TODO: Move endCriteriaManager to testStatistics and pipe through calls
        return this.getCriteriaPercentage(this.targetCriteria);
    }
    public getEndPercentage(): number {
        return this.getCriteriaPercentage(this.endCriteria);
    }
    public getFailPercentage(): number {
        return this.getCriteriaPercentage(this.failCriteria);
    }
    private getCriteriaPercentage(criterium: CriteriumBase) {
        return criterium ? criterium.fractionFulfilled : 0;
    }

    public getEndTime(): number {
        if (this.targetCriteria.type === CriteriaType.TIME) {
            return this.targetCriteria.getValue();
        }
        if (this.endCriteria && this.endCriteria.type === CriteriaType.TIME) {
            return this.endCriteria.getValue();
        }
        if (this.failCriteria && this.failCriteria.type === CriteriaType.TIME) {
            return this.failCriteria.getValue();
        }
        return 0;
    }

    public checkIfPhaseEnd(): boolean {
        if (this.getEndPercentage() >= 1) { // reached end criteria?
            this.endType = EndType.END;
            return true;
        }
        if (this.getTargetPercentage() >= 1) { // reached target criteria?
            this.endType = EndType.TARGET;
            return true;
        }
        if (this.getFailPercentage() >= 1) { // reached fail criteria
            this.endType = EndType.FAILED;
            return true;
        }
        return false;
    }

    public getMaxTargetScore(): number {
        return this.targetCriteria.getMaxValue();
    }
    public getEndValue(): number {
        if (this.endCriteria && this.endCriteria.getValue()) {
            return this.endCriteria.getValue();
        }
        return -1;
    }
}
