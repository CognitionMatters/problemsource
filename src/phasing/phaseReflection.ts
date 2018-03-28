import { KeyValMap } from '@jwmb/pixelmagic/lib/toReplace/keyValMap';
import { ObjectUtils } from '@jwmb/pixelmagic/lib/toReplace/objectUtils';


export module Reflection {
    export enum ClassType {
        Problem,
        Phase
    }
    export interface IClassInfo {
        class_: Function;
    }
    export interface IProblemInfo extends IClassInfo {
        canNuArch: boolean;
        canOldArch: boolean;
        canStandAlone: boolean;
        typeStrings: string[];
        responseAnalyzer: any;
        defaultSettings?: any;
        problemFactory: any;
    }
    // export interface IPhaseInfo extends IClassInfo {
    //     // typeString: string;
    //     // responseAnalyzer: any;
    //     // defaultSettings?: any;
    // }

    export class LookUp {
        private static _classes: KeyValMap<ClassType, KeyValMap<string, IClassInfo>>;
        // private static _problemClasses = new KeyValMap<string, boolean>();
        static getProblemInfoByType(type: string): IProblemInfo {
            const kvs = LookUp.classes.getValue(ClassType.Problem);
            const found = <IProblemInfo>kvs.values.find(_ => (<IProblemInfo>_).typeStrings.indexOf(type) >= 0);
            return found ? ObjectUtils.merge({}, found, true) : null;
        }
        private static classOrClassNameToStringProp(obj: any, prop: string) {
            const val = obj[prop];
            const type = typeof val;
            if (type === 'string') {
                obj[prop] = { _class: val };
            } else if (type === 'function') {
                obj[prop] = { _class: ObjectUtils.getClassNameFromConstructor(val) };
            }
        }
        static registerProblem(info: IProblemInfo) {
            LookUp.classOrClassNameToStringProp(info, 'responseAnalyzer');
            LookUp.classOrClassNameToStringProp(info, 'problemFactory');
            LookUp.registerClass(ClassType.Problem, info);
        }

        static getPhaseInfo(type: string): IClassInfo {
            const kvs = LookUp.classes.getValue(ClassType.Phase);
            const found = kvs.getValueOrDefault(type, null);
            return found ? ObjectUtils.merge({}, found, true) : null;
        }
        static registerPhase(info: IClassInfo) {
            LookUp.registerClass(ClassType.Phase, info);
        }

        private static get classes() {
            if (!LookUp._classes) {
                LookUp._classes = new KeyValMap<ClassType, KeyValMap<string, IClassInfo>>();
                Object.keys(ClassType).map(v => parseInt(v, 10)).filter(v => !isNaN(v)).forEach(v =>
                    // filter(v => isNaN(parseInt(v, 10))).forEach(_ =>
                    LookUp._classes.addPair(<ClassType>v, new KeyValMap<string, IClassInfo>()
                    ));
            }
            return LookUp._classes;
        }
        static registerClass(type: ClassType, info: IClassInfo) {
            // if (!LookUp._classes) {
            //     LookUp._classes = new KeyValMap<ClassType, KeyValMap<string, IClassInfo>>();
            //     Object.keys(ClassType).map(v => parseInt(v, 10)).filter(v => !isNaN(v)).forEach(v =>
            //         // filter(v => isNaN(parseInt(v, 10))).forEach(_ =>
            //         LookUp._classes.addPair(<ClassType>v, new KeyValMap<string, IClassInfo>()
            //         ));
            // }
            const name = ObjectUtils.getClassNameFromConstructor(info.class_);
            LookUp.classes.getValue(type).addPair(name, info);
        }
    }
}

export class PhaseReflection {
    static recConstructorToClassName(obj: any) {
        Object.keys(obj).forEach(p => {
            const val = obj[p];
            const t = typeof val;
            if (t === 'object' && val) {
                PhaseReflection.recConstructorToClassName(val);
            } else if (t === 'function') {
                obj[p] = ObjectUtils.getClassNameFromConstructor(<Function>val);
            }
        });
    }
    static problemTypeToInfo(ptype: string) {
        if (!ptype) {
            throw Error('Problem type undefined');
        }
        const info = Reflection.LookUp.getProblemInfoByType(ptype);
        if (!info) {
            return null;
        }
        const result = <any>{
            _class: ObjectUtils.getClassNameFromConstructor(info.class_),
            responseAnalyzer: info.responseAnalyzer,
            problemFactory: info.problemFactory
        };
        return result;
    }
}
