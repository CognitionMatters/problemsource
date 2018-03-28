import { Signal0 } from '@jwmb/signal';
import { ITrainingPlanData } from './trainingPlan/TrainingPlan';
import { ExerciseStats, TrainingSettings } from './dataStructs';
import { App } from '@jwmb/pixelmagic/lib/app/app';
import { TriggerManager } from './triggerManager';
import { CognitionMattersApp } from './app';
import { PhaseXBase } from './phasing/phase';
import { PhaseEndLogItem, UserStatePushLogItem } from './toRemove/logItem';
import { StateLog } from './toRemove/stateLog';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';

export interface GameStateSessionVars {
    hasPlayedIntro: boolean;
    hasGottenReward: boolean;
    // runsToday: number;
    currentTestId: string;
}
export class GameState {
    public static sessionVars: GameStateSessionVars;
    public static resetSessionVars() {
        GameState.sessionVars = {
            hasPlayedIntro: false,
            hasGottenReward: false,
            // runsToday: 0,
            currentTestId: ''
        };
        GameState.sessionResetted.dispatch();
    }
    public static sessionResetted = new Signal0();

    // private static _trainingPlans:Array<TrainingPlanData>=[];
    // public static get trainingPlans():Array<TrainingPlanData>{return GameState._trainingPlans}
    // public static set trainingPlans(value:Array<TrainingPlanData>){
    private static _trainingPlanData: ITrainingPlanData;
    public static getCurrentTrainingPlanData(): ITrainingPlanData {
        return GameState._trainingPlanData; // s[GameState.trainingPlanIndex];
    }
    public static onSetTrainingPlanData: (value: ITrainingPlanData) => void;
    public static set trainingPlanData(value: ITrainingPlanData) {
        GameState._trainingPlanData = value;
        // GameState.trainingPlanIndex = 0;
        GameState.trainingTimeStartTime = Date.now();

        // setup triggers
        const triggers = GameState._trainingPlanData.triggers || []; // TODO: different triggers for secondary training plan?
        TriggerManager.instance.loadTriggers(triggers);
        GameState.onSetTrainingPlanData(value);
    }

    public static userId = '';

    private static _userData: any = null;
    // public static get userData(): any { return GameState._userData; } // TODO: type userData
    // public static set userData(value: any) {
    //     GameState._userData = value;
    //     // TODO: trigger save
    // }

    private static _exerciseStats: ExerciseStats = new ExerciseStats();
     // {trainingDay: 0, lastTimeStamp: 0, tests: {}, triggerData: {}, metaphorData: {} }; //TODO: refactor create class for stats
    // public static get exerciseStats(): ExerciseStats { return GameState._exerciseStats; }
    public static set exerciseStats(value: ExerciseStats) {
        GameState._exerciseStats = value || new ExerciseStats();
        if (value.constructor !== ExerciseStats) {
            value = <ExerciseStats>ObjectUtils.merge(new ExerciseStats(), value);
            GameState._exerciseStats = value;
            // throw Error("ExerciseStats not typed");
        }
        value.init();
    }
    public static get exerciseStats() {
        return GameState._exerciseStats;
    }

    public static getIsTraining(): boolean {
        return GameState.getCurrentTrainingPlanData().isTraining !== false;
         // GameState.trainingPlans[GameState.trainingPlanIndex].isTraining!=false;
    }

    private static _trainingSettings: TrainingSettings;
     // = { timeLimits: [] }; // TODO: refactor type trainingSettings
    public static get trainingSettings(): TrainingSettings { return GameState._trainingSettings; }
    public static set trainingSettings(value: TrainingSettings) {
        GameState._trainingSettings = value;

        if (GameState._trainingSettings.idleTimeout > 0) {
            (<CognitionMattersApp>App.instance).idleTimeout = GameState._trainingSettings.idleTimeout;
        }

        GameState.addAccountTriggers();
    }

    private static addAccountTriggers() {
        let triggers = GameState._trainingSettings ? GameState._trainingSettings.triggers : null;
        if (triggers) {
            triggers = triggers.filter(_ => !TriggerManager.instance.getTriggerByActionId(_.actionData.id));
            triggers.forEach(_ => TriggerManager.instance.addTrigger(_));
        }
    }

    public static getPacifistRatio() {
        return GameState._trainingSettings ? GameState._trainingSettings.pacifistRatio : new TrainingSettings().pacifistRatio;
    }

    public static trainingTimeStartTime = 0;
    public static checkIfTimeIsUp(extraTime: number = 0): boolean {
        if (GameState.trainingSettings.timeLimits.length === 0) {
            return false;
        }
        if (!GameState.getIsTraining()) {
            return false;
        }
        // if (GameState._trainingPlanIndex >GameState.trainingSettings.timeLimits.length-1){
        //    return true;
        // }

        const currentTimeLimit: number = (GameState.trainingSettings.timeLimits[0] + extraTime) * 60; // GameState.trainingPlanIndex
        if (Date.now() - currentTimeLimit * 1000 > GameState.trainingTimeStartTime) {
            return true;
        }
        return false;
    }

    public static elapsedTrainingTime() {
        return Date.now() - GameState.trainingTimeStartTime;
    }

    public static elapsedTrainingTimePrecent() {
        const currentTimeLimit = (GameState.trainingSettings.timeLimits[0]) * 60 * 1000; // GameState.trainingPlanIndex
        return GameState.elapsedTrainingTime() / currentTimeLimit;
    }

    public static logTestPhase(phase: PhaseXBase, logItem: PhaseEndLogItem) { // PhaseBase // TODO: move all this to test statistics?
        // GameState.sessionVars.runsToday++;
        ExerciseStats.instance.appVersion = (<CognitionMattersApp>App.instance).appVersion;
        ExerciseStats.instance.appBuildDate = (<CognitionMattersApp>App.instance).buildDate.toISOString();

        // update user data
        GameState.saveState();
    }

    public static getTrainingDay(): number {
        if (App.instance.urlParameters['trainingday'] && !isNaN(App.instance.urlParameters['trainingday'])) {
            return parseFloat(App.instance.urlParameters['trainingday']);
        } else if (ExerciseStats.instance.trainingDay) {
            return ExerciseStats.instance.trainingDay;
        }
        return 0;
    }

    // public static getRunsToday() {
    //     return GameState.sessionVars.runsToday;
    // }

    public static saveState() {
        // TODO: set both in GameState::saveState() and GameState::logTestPhase(), remove one of them
        ExerciseStats.instance.lastTimeStamp = Date.now(); // set timestamp

        StateLog.instance.log(UserStatePushLogItem.create(
            <UserStatePushLogItem>{ exercise_stats: ExerciseStats.instance, user_data: GameState._userData }));
             // type: "USER_STATE_PUSH", exercise_stats: GameState.exerciseStats, user_data: GameState.userData});

        // localStorage.setItem('planetjakten_state', JSON.stringify(state)); //TODO: push to server instead?

        // NewBackend.getInstance().pushUserState(_userData, GameState.exerciseStats); //TODO: refactor backend
    }

    public static getTotalTrainingDays(): number {
        if (App.instance.urlParameters['trainingdaystotal']
            && !isNaN(App.instance.urlParameters['trainingdaystotal'])) {
            return Number(App.instance.urlParameters['trainingdaystotal']);
        }
        return GameState.getCurrentTrainingPlanData().targetTrainingDays || 40;
    }

    public static getTrainingProgression(): number {
        return (GameState.getTrainingDay() + Math.min(1, GameState.elapsedTrainingTimePrecent())) / (GameState.getTotalTrainingDays() + 1);
    }

    public static getTrainingDayProgression(): number {
        return (GameState.getTrainingDay()) / (GameState.getTotalTrainingDays() + 1);
    }
}
