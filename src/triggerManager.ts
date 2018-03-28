import { Logger } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { ExerciseStats } from './dataStructs';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';

export class TriggerTimeType {
    // Post race
    public static POST_RACE = <TriggerTimeType>(<any>'POST_RACE');
    public static POST_RACE_SUCCESS = <TriggerTimeType>(<any>'POST_RACE_SUCCESS');
    public static POST_RACE_FAIL = <TriggerTimeType>(<any>'POST_RACE_FAIL');
    public static LEAVE_TEST = <TriggerTimeType>(<any>'LEAVE_TEST');
    // Map
    public static END_OF_DAY = <TriggerTimeType>(<any>'END_OF_DAY');
    public static START_OF_DAY = <TriggerTimeType>(<any>'START_OF_DAY');
    public static MAP = <TriggerTimeType>(<any>'MAP');
    public static MAP_POST_WIN = <TriggerTimeType>(<any>'MAP_POST_WIN');
}

export interface TriggerData {
    type?: string;
    triggerTime: TriggerTimeType;
    criteriaValues: any[];
    actionData: TriggerActionData;
}

export interface TriggerActionData {
    type?: string; // TODO: currently instanciates by string, possibly other solution (register classes)
    id: string;
    properties?: any;
}

export class TriggerCriteria {
    public name: string;
    public evaluator: (number) => boolean;
}

export class TriggerManager {
    private static _instance: TriggerManager;
    public static get instance(): TriggerManager {
        // if (TriggerManager._instance == null) {
        //     TriggerManager._instance = new TriggerManager();
        // }
        return TriggerManager._instance;
    }

    actionsOnlyModifyData = false; // TODO: refactor into model and view instead!
    private triggerList: Array<TriggerData> = [];
    private metaphorTriggers: Array<TriggerData> = [];
    private criterias: Array<{ name: string, evaluator: (any) => boolean }> = [];

    protected get allTriggers() {
        return this.triggerList.concat(this.metaphorTriggers);
    }

    constructor(criteria: { name: string, evaluator: (val) => boolean}[]) {
        if (TriggerManager._instance) {
            throw new Error('TriggerManager already instantiated, use instance instead');
        }
        TriggerManager._instance = this;

    }

    public loadTriggers(triggerList: Array<TriggerData>): void {
        this.triggerList = triggerList;
    }
    public addTrigger(trigger: TriggerData) {
        this.triggerList.push(trigger);
    }
    public addMetaphorTrigger(trigger: TriggerData) {
        this.metaphorTriggers.push(trigger);
    }
    public clearMetaphorTriggers() {
        this.metaphorTriggers = [];
    }

    public addCriteria(criteria: { name: string, evaluator: (any) => boolean }) {
        this.criterias.push(criteria);
    }

    public checkTriggers(triggerTimeType: TriggerTimeType, actionType: string = 'ALL'): Array<TriggerActionData> {
        const validateCriteria = (o) => {
            const last = this.criterias.findLast(o2 => o2.name === o.name);
            return last && last.evaluator(o);
        };

        return this.allTriggers.filter(o =>
            o.triggerTime === triggerTimeType &&
            (actionType === 'ALL' || o.actionData.type === actionType) &&
            !this.getIsTriggerActivated(o.actionData.id, o.actionData.type) &&
            o.criteriaValues.every(validateCriteria)).map(o => o.actionData);
    }

    public activate(action: TriggerActionData, completeCallBack: Function, actionsOnlyModifyData: boolean = false) {
        if (action.type) {
            const cls = Instantiator.i.getClass(action.type);
            // Instantiator.i.instantiate(action.type);
            // const cls = PixelMagic[action.type];
            if (!cls) {
                Logger.warn('Trigger action missing: ' + action.type);
                completeCallBack(null);
            } else {
                if (this.actionsOnlyModifyData || actionsOnlyModifyData) {
                    if ((<any>cls).modifyState) {
                        (<any>cls).modifyState(action);
                    }
                    if (completeCallBack) {
                        completeCallBack(null);
                    }
                } else {
                    const instance: Object = Object.create(cls.prototype);
                    instance.constructor.apply(instance, [action.id, action.properties, completeCallBack]);
                    // TODO: add interface describing trigger enabled actions
                }
            }
        }
        this.setTriggerAsActivated(action.id, action.type);
    }

    public checkTriggersAndActivate(triggerTimeType: TriggerTimeType, actionType: string = 'ALL', callback: Function = null) {
        const list = this.checkTriggers(triggerTimeType, actionType);
        this.activateList(list, callback);
    }

    public activateList(actions: Array<TriggerActionData>, callback: Function, actionsOnlyModifyData: boolean = false) {
        if (actionsOnlyModifyData) {
            actions.forEach(action => this.activate(action, null, true));
            actions = [];
        }
        if (actions.length > 0) {
            const action = actions.shift();
            this.activate(action, () => this.activateList(actions, callback, actionsOnlyModifyData));
            return;
        }
        if (callback) {
            callback();
        }
    }


    public setTriggerAsActivated(triggerId: string, type: string = 'AchievementTriggerAction') {
        return ExerciseStats.instance.triggerData[type + '_' + triggerId] = true;
    }

    public getIsTriggerActivated(triggerId: string, type: string = 'AchievementTriggerAction'): boolean {
        return ExerciseStats.instance.triggerData[type + '_' + triggerId] === true;
    }

    public getCollectedTriggers(type: string = 'AchievementTriggerAction'): Array<TriggerActionData> { // TODO: type this argument
        const idList = [];

        for (const i in ExerciseStats.instance.triggerData) {
            if (ExerciseStats.instance.triggerData[i]) {
                const splitId = i.split('_');
                if (splitId[0] === type) {
                    idList.push(splitId.slice(1).join('_'));
                }
            }
        }
        const dataList = [];
        idList.forEach((id: string) => {
            const trigger = this.getTriggerByActionId(id);
            if (trigger) {
                dataList.push(trigger.actionData);
            }
        });
        return dataList;
    }

    public getTriggerByActionId(id: string): TriggerData {
        for (let i = 0; i < this.allTriggers.length; i++) {
            const obj = this.allTriggers[i];
            if (obj.actionData.id === id) {
                return obj;
            }
        }
        return null;
    }
}
