import { MetaphorManager } from './metaphors/metaphorManager';
import { GameState } from './gameState';
import { ExerciseStats } from './dataStructs';
import { ITrainingPlanData } from './trainingPlan/TrainingPlan';
import { TestStatistics } from './toRemove/testStatistics';

export class GameStateAvoidCircular {
    public static setTrainingPlanData(value: ITrainingPlanData) {
        TestStatistics.testPhaseLoggers = [];
        // setup metaphor
        MetaphorManager.initFromString(value.metaphor, ExerciseStats.instance.metaphorData);
        // TODO: different metaphor for secondary training plan?
        if (GameState.getCurrentTrainingPlanData() && !(<any>GameState.getCurrentTrainingPlanData()).overrideMetaphorTrigger) {
            MetaphorManager.instance.addTriggers();
            // var tp = GameState.getCurrentTrainingPlan();
            // var tpMinVer = ObjectUtils.getByPath(tp, ["clientRequirements", "version", "min"], null);
            // if (tpMinVer && ObjectUtils.isOfType(MetaphorManager.instance, MagicalMetaphor)) {
            //    if (new Version(tpMinVer).compare(new Version("1.4.0")) >= 0) {
            //        (<MagicalMetaphor>MetaphorManager.instance).addMedalTriggers();
            //    }
            // }
        }
    }
}
