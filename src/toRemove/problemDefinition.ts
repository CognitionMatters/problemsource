import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';

export class ProblemDefinition {
    constructor(public id: string, public difficulty: number) { }
}

export class ProblemSet {

    public static findId(difficulty: number, fuzzifier: number, alternativeSet: Array<ProblemDefinition>,
        avoidedIds: Array<string>): string {
        const potentialAlternatives = new Array<ProblemDefinition>();
        for (let i = 0; i < alternativeSet.length; i++) {
            const currentAlternative = alternativeSet[i];
            if (currentAlternative.difficulty > 0 && Math.abs(difficulty - currentAlternative.difficulty) <= fuzzifier
                && (avoidedIds == null || avoidedIds.find((o) => o === currentAlternative.id) == null)) {
                // Todo: use bias algorithm?
                // for(var u = 0; u <= fuzzifier - Math.abs(difficulty - currentAlternative.difficulty); u++)
                potentialAlternatives.push(currentAlternative);
            }
        }
        if (potentialAlternatives.length === 0) {
            return null;
        }
        return Misc.randomItem(potentialAlternatives).id;
    }


    public static getProblemDefinition<T extends ProblemDefinition>(id: string, alternativeSet: Array<T>): T {
        for (let i = 0; i < alternativeSet.length; i++) {
            const currentAlternative = alternativeSet[i];
            if (currentAlternative.id === id) {
                return currentAlternative;
            }
        }
        return null;
    }
}
