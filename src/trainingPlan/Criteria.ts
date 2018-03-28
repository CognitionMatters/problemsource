import { ExerciseStats } from '../dataStructs';
import { PlanetBundler } from './PlanetBundler';
import { GameState } from '../gameState';

export interface ICriteria {
    isFulfilled(stats: ExerciseStats): boolean;
}

// Todo: And/or will generate different results if their lists are empty, what does a empty list mean?
export class BooleanAndCriteria implements ICriteria {
    public subCriteria: Array<ICriteria> = [];

    public isFulfilled(stats: ExerciseStats): boolean {
        if (this.subCriteria.length === 0) { // Todo: Keep or discard this?
            return false;
        }
        return this.subCriteria.map(o => o.isFulfilled(stats)).reduce((a, b) => a && b, true);
    }
}

export class BooleanOrCriteria implements ICriteria {
    public subCriteria: Array<ICriteria> = [];

    public isFulfilled(stats: ExerciseStats): boolean {
        return this.subCriteria.map(o => o.isFulfilled(stats)).reduce((a, b) => a || b, false);
    }
}

export class BooleanNotCriteria implements ICriteria {
    public subCriteria: ICriteria;

    public isFulfilled(stats: ExerciseStats): boolean {
        return !this.subCriteria.isFulfilled(stats);
    }
}

export enum MagnitudeComparisonType {
    Equal,
    NotEqual,
    Greater,
    Smaller,
    EqualOrGreater,
    EqualOrSmaller,
}

export class MagnitudeComparer {
    public static compare(comparisonType: MagnitudeComparisonType, value1: number, value2: number) {
        const result = (comparisonType === MagnitudeComparisonType.Equal && value1 === value2)
            || (comparisonType === MagnitudeComparisonType.NotEqual && value1 !== value2)
            || (comparisonType === MagnitudeComparisonType.Greater && value1 > value2)
            || (comparisonType === MagnitudeComparisonType.Smaller && value1 < value2)
            || (comparisonType === MagnitudeComparisonType.EqualOrGreater && value1 >= value2)
            || (comparisonType === MagnitudeComparisonType.EqualOrSmaller && value1 <= value2);
        return result;
    }
}

export class ExerciseLevelCriteria implements ICriteria {
    public exerciseId: string;
    public level = 0;
    public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        return MagnitudeComparer.compare(this.magnitudeComparison, stats.getGameStatsSharedId(this.exerciseId).lastLevel, this.level);
    }
}

export class ExerciseResponseTimeCriteria implements ICriteria {
    public exerciseId: string;
    public time = 0;
    public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        return MagnitudeComparer.compare(this.magnitudeComparison,
            stats.getGameStatsSharedId(this.exerciseId).trainingTime, this.time * 1000);
    }
}

export class ExerciseLevelHighestCriteria implements ICriteria {
    public exerciseId: string;
    public level = 0;
    public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        return MagnitudeComparer.compare(this.magnitudeComparison, stats.getGameStatsSharedId(this.exerciseId).highestLevel, this.level);
    }
}

export class PlanetCompleteCriteria implements ICriteria {
    public exerciseId: string;
    // public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        const planets = PlanetBundler.getPlanetsOnlyUsedGameId(this.exerciseId, false);
        return planets.length ? planets.find(_ => _.isCompleted) !== null : false;
        // return MagnitudeComparer.compare(this.magnitudeComparison, stats.getGameStatsSharedId(this.exerciseId).numRuns, this.runs);
    }
}

export class ExerciseRunsCriteria implements ICriteria {
    public exerciseId: string;
    public runs = 0;
    public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        return MagnitudeComparer.compare(this.magnitudeComparison, stats.getGameStatsSharedId(this.exerciseId).numRuns, this.runs);
    }
}

export class ExerciseUnlocksCriteria implements ICriteria {
    public exerciseId: string;
    public unlocks = 0;
    public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        // TODO: this criterion /note SPELLING/ is number of unlocked islands/planets?
        // Seems to be used in #intro / regular pairs, for locking #intro,
        // but at the same moment the regular uses ExerciseRunsCriteria to unlock..?
        return MagnitudeComparer.compare(this.magnitudeComparison,
            stats.getGameStats(this.exerciseId).numRuns,
            // Object.keys(stats.getExerciseStatsById(this.exerciseId)).length,
            // Object.keys(stats.tests).filter(o => o.substr(0, this.exerciseId.length) == this.exerciseId).length,
            this.unlocks);
    }
}

export class TimeCriteria implements ICriteria {
    public time = 0;
    public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        return MagnitudeComparer.compare(
            this.magnitudeComparison, Date.now() - GameState.trainingTimeStartTime, this.time * 1000);
        // TODO: GameState static reference
    }
}

export class DayCriteria implements ICriteria {
    public day = 0;
    public magnitudeComparison: MagnitudeComparisonType = MagnitudeComparisonType.EqualOrGreater;

    public isFulfilled(stats: ExerciseStats): boolean {
        // TODO: GameState static reference
        return MagnitudeComparer.compare(this.magnitudeComparison, GameState.getTrainingDay(), this.day);
    }
}

export class FulfilledCriteria implements ICriteria {
    public isFulfilled(): boolean {
        return true;
    }
}

export class RejectedCriteria implements ICriteria {
    public isFulfilled(): boolean {
        return false;
    }
}
