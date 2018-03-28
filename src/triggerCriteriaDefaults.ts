import { GameState } from './gameState';
import { MetaphorManager } from './metaphors/metaphorManager';
import { PlanetBundler } from './trainingPlan/PlanetBundler';
import { ExerciseStats } from './dataStructs';

export class TriggerCriteriaDefaults {
    public static get() {
        // Todo: Move these elsewhere;
        return [
            { name: 'trainingDay', evaluator: (val) => GameState.getTrainingDay() >= val.value },
            { name: 'numGold', evaluator: (val) => PlanetBundler.getTotalPlanetsCompleted() >= val.value },
            { name: 'wonRacesTotal',
                evaluator: (val) => MetaphorManager.instance.getPropValue('wonRacesTotal') >= val.value
            },
            // TODO: should be completedPlanet, not completedExercise
            { name: 'completedExercise', evaluator: (val) => PlanetBundler.getIsPlanetComplete(val.value) },
            { name: 'progress', evaluator: (val) => GameState.getTrainingProgression() >= val.value },
            { name: 'dayProgress', evaluator: (val) => GameState.getTrainingDayProgression() >= val.value },
            { name: 'language', evaluator: (val) => GameState.trainingSettings.cultureCode === val.value },
            {
                name: 'exerciseLevel',
                evaluator: (val) => ExerciseStats.instance.getGameStatsSharedId(val.exercise).highestLevel >= val.value
            }
        ];
    }
}
