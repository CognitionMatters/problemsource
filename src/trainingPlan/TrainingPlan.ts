import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { ExerciseStats } from '../dataStructs';
import { GameDefinition } from './gameDefinition';
import { TriggerData, TriggerTimeType, TriggerManager } from '../triggerManager';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';

export interface ITrainingPlanData {
    // public isPreProcessed:boolean=false;
    metaphor: string;
    isTraining?: boolean;
    // public autoConnectType: string = "THREE-WAY";
    // public tests: GameDefinition[];
    triggers?: TriggerData[];
    allowFreeChoice?: boolean;
    targetTrainingDays?: number;
}

export type TModifyPhase = (gameDef: GameDefinition, phaseDef: any) => void;

export abstract class TrainingPlan implements ITrainingPlanData {
    public static staticModifiers: ((tp: TrainingPlan) => void)[] = null;
    public static latestCreated: TrainingPlan;

    public triggers: TriggerData[];
    public targetTrainingDays = 40;
    public metaphor = 'Magical';
    public isTraining = true; // Is this necessary?
    public allowFreeChoice = false;


    public static create(tpSource: any = null,
        stats: ExerciseStats = null,
        runTriggerTime: TriggerTimeType = null,
        modifiers: ((tp: TrainingPlan) => void)[] = null
    ): TrainingPlan {
        let tp = TrainingPlan._create(tpSource, stats, modifiers);
        if (runTriggerTime) {
            const mapTriggers = TriggerManager.instance.checkTriggers(runTriggerTime,
                'TrainingPlanModTriggerAction'); // ObjectUtils.getClassNameFromConstructor(TrainingPlanModTriggerAction));
            if (mapTriggers.length) {
                const numTpChangesBefore = ExerciseStats.instance.trainingPlanSettings.changes.length;
                TriggerManager.instance.activateList(mapTriggers, null, true);
                const numTpChangesAfter = ExerciseStats.instance.trainingPlanSettings.changes.length;
                if (numTpChangesAfter > numTpChangesBefore) {
                    tp = TrainingPlan._create(tpSource, stats, modifiers);
                }
            }
        }
        return tp;
    }

    public static onGetTrainingPlanData: () => ITrainingPlanData;
    private static _create(tpSource: any = null,
        stats: ExerciseStats = null,
        modifiers: ((tp: TrainingPlan) => void)[] = null
    ): TrainingPlan {
        if (!tpSource) {
            tpSource = TrainingPlan.onGetTrainingPlanData();
        }
        // Copy so we don't make any changes in original:
        tpSource = JSON.parse(JSON.stringify(tpSource));

        // To delete: tp change for linear use
        // var allX = tpSource.groups.map(g => g.exercises.map(x => x.data));
        // allX = [].concat.apply([], allX);
        // allX.forEach(_ => delete _.isTest);
        // allX.forEach(_ => _.phases.forEach(p => p.medalMode = "ONE_WIN"));
        // var introIds = allX.map(_ => _.id).filter(_ => _.indexOf("#intro") > 0).map(_ => _.split("#")[0]);
        // allX = allX.filter(_ => introIds.indexOf(_.id) < 0);
        // JSON.stringify(allX);

        // JSONTypeSerializer.objectify(trainingPlanDef, true, "__type", "PixelMagic");
        if (!tpSource.__type) {
            tpSource.__type = 'LinearTrainingPlan'; // ObjectUtils.getClassNameFromConstructor(LinearTrainingPlan);
        }
        const tp = <TrainingPlan>Instantiator.i.typify(tpSource, { 'DynamicTrainingPlanGenerator': 'DynamicTrainingPlan', '': '' });
        if (!stats) {
            stats = ExerciseStats.instance;
        }
        if (!stats.trainingPlanSettings.changes) {
            stats.trainingPlanSettings.changes = [];
        }
        tp.init(stats);
        if (stats.trainingPlanSettings.changes.length) {
            stats.trainingPlanSettings.changes.forEach(_ => tp.applyChange(_));
        }

        const allMods = (TrainingPlan.staticModifiers || []).concat(modifiers || []);
        allMods.forEach(mod => mod(tp));
        TrainingPlan.latestCreated = tp;

        return tp;
    }

    public static createPhaseModFunctions(def: string | any): TModifyPhase[] {
        if (typeof def === 'string') {
            // tslint:disable-next-line:no-eval
            def = eval('tmp = ' + def);
        }
        return Object.keys(def).map(k => {
            const rx = new RegExp(k);
            return (gameDef: GameDefinition, p: any) => {
                const x = rx.exec(gameDef.id);
                if (x && x.length && x[0].toString() === gameDef.id) {
                    ObjectUtils.merge(p, def[k]);
                }
            };
        });
    }
    public static overridePhaseData(def: string) {
        const fs = TrainingPlan.createPhaseModFunctions(def);
        fs.forEach(f => TrainingPlan.staticModifiers.push((tp: TrainingPlan) => TrainingPlan.modifyPhases(tp, f)));
    }

    public static modifyPhases(tp: TrainingPlan, modify: TModifyPhase) {
        tp.getDefinedGames().forEach(g => g.phases.forEach(p => {
            modify(g, p);
        }));
    }
    public static modifyEndCriteriaTarget(endCriteriaData: any, value: number) {
        if (!endCriteriaData || !endCriteriaData.target) {
            return;
        }
        const endCriteriaDataTarget = endCriteriaData.target;
        if (endCriteriaDataTarget.dynamicValue) {
            endCriteriaDataTarget.dynamicValue.values = [1];
        } else {
            endCriteriaDataTarget.value = 1;
        }
    }
    public static changeTargetEndCriteriaForTesting(tp: TrainingPlan) {
        tp.getDefinedGames().forEach(g => g.phases.forEach(p => {
            TrainingPlan.modifyEndCriteriaTarget(p.endCriteriaData.target, 1);
        }));
    }

    public abstract init(stats: ExerciseStats);

    // Unlocked - and also non-unlocked but pre-defined upcoming..?
    // public abstract getAvailableGames(stats: ExerciseStats, selectionParameters: any): GameDefinition[];
    public abstract getProposedGames(Ids: string[], stats: ExerciseStats): ProposedGameInfo[];
    public abstract getAvailableGames(stats: ExerciseStats): GameDefinition[];
    public abstract getDefinedGames(): GameDefinition[];
    public getDefinedGame(id: string): GameDefinition {
        const games = this.getDefinedGames();
        return games.find(_ => _.id === id);
    }

    public applyChange(changeInfo: { type: string, change: any }) {
        this.NEW_applyChange(changeInfo.change);
        // const classConstr = changeInfo.type ? Instantiator.i.getClass(changeInfo.type) : TrainingPlan;
        // if (classConstr && (<any>classConstr).applyToTrainingPlan) {
        //     (<any>classConstr).applyToTrainingPlan(this, changeInfo.change);
        // }
    }
    protected NEW_applyChange(change: any) {
        const val = change['phases'];
        if (val) {
            const fs = TrainingPlan.createPhaseModFunctions(val);
            fs.forEach(f => TrainingPlan.modifyPhases(this, f));
        }
    }
}

export class ProposedGameInfo {
    constructor(public id: string, public unlocked: boolean = false) {
    }
}

export class EmptyTrainingPlan extends TrainingPlan {
    public getProposedGames(Ids: string[], stats: ExerciseStats): ProposedGameInfo[] {
        return [];
    }
    public getAvailableGames(stats: ExerciseStats): GameDefinition[] {
        return [];
    }
    public getDefinedGames(): GameDefinition[] {
        return [];
    }
    public init(stats: ExerciseStats) {
    }
}
