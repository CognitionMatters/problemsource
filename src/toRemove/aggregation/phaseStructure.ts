import { LogItem, NewPhaseLogItem, NewProblemLogItem, AnswerLogItem } from '../logItem';

export class Node {
    untypedLogItem: LogItem;

    static toString(nodes: Node[]): string {
        return nodes.map(n => {
            if ((<any>n).logItem) {
                const ph = <Phase>n;
                return '\n' + JSON.stringify(ph.logItem)
                    + ph.problems.map(pr => '\n  ' + JSON.stringify(pr.logItem)
                        + pr.answers.map(a => '\n    ' + JSON.stringify(a.logItem)).join('')
                        ).join('');
            } else {
                return '\n' + JSON.stringify(n.untypedLogItem);
            }
        }).join(''); // "\n");
    }
//    static constructFromLog(logItems: PixelMagic.LogItem[], tryToFix: boolean): Node[] { //LogVerificationResult { //zNode[]
//        //var result = new LogVerificationResult(); //: zNode[] = [];
//        var result: Node[] = [];
//        var warnings: string[] = [];
//        var currPha: Phase = null;
//        var currProb: Problem = null;

//        var toInsert = new KeyValMap<number, PixelMagic.LogItem>();
//        var toRemove: number[] = [];

//        var ignoreErrors: boolean = false;
//        //try {
//        logItems.forEach((_, i) => {
//            if (_.isOfType(PixelMagic.SyncLogStateLogItem)) {
//                ignoreErrors = (<PixelMagic.SyncLogStateLogItem>_).syncedUpToHere;
//            }
//            if (ignoreErrors) {
//                return;
//            }
//            if (_.isOfType(PixelMagic.NewPhaseLogItem)) {
//                if (currPha) {
//                    warnings.push("NewPhase w/o PhaseEnd");
//                    if (tryToFix) {
//                        toInsert.addPair(i, PixelMagic.PhaseEndLogItem.create(<PixelMagic.PhaseEndLogItem>{ phase: "FAKE" }))
//                    }
//                }
//                currProb = null;
//                currPha = new Phase();
//                currPha.logItem = <PixelMagic.NewPhaseLogItem>_;
//                result.push(currPha); //structure

//            } else if (_.isOfType(PixelMagic.NewProblemLogItem)) {
//                if (currPha == null) {
//                    throw Error("No phase for " + JSON.stringify(_));
//                }
//                currProb = new Problem();
//                currProb.logItem = <PixelMagic.NewProblemLogItem>_;
//                currProb.phase = currPha;
//                currPha.problems.push(currProb);

//            } else if (_.isOfType(PixelMagic.AnswerLogItem)) {
//                if (currProb == null) {
//                    throw Error("No problem for " + JSON.stringify(_));
//                }
//                var answ = new Answer();
//                answ.logItem = <PixelMagic.AnswerLogItem>_;
//                answ.problem = currProb;
//                currProb.answers.push(answ);

//            } else if (_.isOfType(PixelMagic.PhaseEndLogItem)) {
//                if (currPha == null) {
//                    var tmpWarning = "N/A";
//                    for (var backCnt: number = i - 1; backCnt >= 0; backCnt--) {
//                        if (logItems[backCnt].isOfType(PixelMagic.PhaseEndLogItem)) {
//                            var sliced = logItems.slice(backCnt, i + 1);
//                            var comp = PixelMagic.ObjectUtils.merge({}, sliced[0]);
//                            var comp2 = PixelMagic.ObjectUtils.merge({}, _);
//                            comp.time = comp2.time;
//                            if (PixelMagic.ObjectUtils.equals(comp, comp2)) {
//                                toRemove.push(i);
//                            } else {
//                                toRemove.push(i);
//                            }
//                            tmpWarning = "\n\n" + PixelMagic.LogItem.serializeList(sliced);
// toInsert.addPair(i + 1, ErrorLogItem.create(<ErrorLogItem>{ level: "WARN", messages: [LogItem.serializeList(sliced)] }));
//                            break;
//                        }
//                    }
//                    warnings.push("Duplicate PhaseEnd: " + tmpWarning);
//                }
//                currPha = null;
//                currProb = null;
//            } else if (_.isOfType(PixelMagic.LeaveTestLogItem)) {
//                if (currPha != null) {
//                    warnings.push("PhaseEnd not null at LeaveTest");
//                }
//            } else {
//                var other = new Node();
//                other.untypedLogItem = _;
//                result.push(other); //structure
//            }
//        });
//        //} catch (err) {
//        //    result.errors.push(err);
//        //}
//        //var tmp = zNode.toString(result.structure);
//        //result.warnings = warnings;
//        if (warnings.length) {
//            //Logger.warn("Log verification: " + warnings.join(", "));
//        }
//        for (var i: number = toInsert.keys.length - 1; i >= 0; i--) {
//            var index = toInsert.keys[i];
//            toRemove = toRemove.map(_ => _ >= index ? _ + 1 : _);
//            logItems.splice(index, 0, toInsert.values[i]);
//        }
//        if (toRemove.length > 0) {
//            toRemove.sort((a, b) => b - a).forEach(_ => logItems.splice(_, 1));
//        }
//        return result;
//    }
}
export class Phase extends Node {
    // logItem: PixelMagic.NewPhaseLogItem;
    get logItem(): NewPhaseLogItem {
        return <NewPhaseLogItem>this.untypedLogItem;
    }
    problems: Problem[] = [];
}
export class Problem extends Node {
    phase: Phase;
    // logItem: PixelMagic.NewProblemLogItem;
    get logItem(): NewProblemLogItem {
        return <NewProblemLogItem>this.untypedLogItem;
    }
    answers: Answer[] = [];
}
export class Answer extends Node {
    problem: Problem;

    // logItem: PixelMagic.AnswerLogItem;
    get logItem(): AnswerLogItem {
        return <AnswerLogItem>this.untypedLogItem;
    }
}
