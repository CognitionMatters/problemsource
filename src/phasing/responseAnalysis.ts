import { AnswerLogItem, ProblemResult } from '../toRemove/logItem';
import { ISolution } from './phase';

export interface IResponseAnalyzer {
    analyze(response: any, solutionData: ISolution): IResponseAnalysisResult;
    getAnswerLogItem(response: any, solutionData: ISolution): AnswerLogItem;
    getIncorrectFullResponse(solutionData: ISolution, errorType?: string): any[];
}
export class ResponseAnalyzerSequence implements IResponseAnalyzer {
    getIncorrectFullResponse(solutionData: ISolution, errorType?: string): any[] {
        const copy = [].concat(solutionData.getProposedSolution());
        if (errorType) {
        }
        copy[0]++;
        return copy;
    }


    allowMultipleErrors = false;

    analyze(response: any, solutionData: ISolution): IResponseAnalysisResult {
        const result = <IResponseAnalysisResultSequence>{
            numCorrect: 0, isCorrectSoFar: false,
            isCorrect: false, isFinished: false, isReversed: false
        };

        const correctResponse = solutionData.getProposedSolution();
        const tmp = <number[]>response;
        for (let i = 0; i < Math.min(tmp.length, correctResponse.length); i++) {
            if (tmp[i] === correctResponse[i]) {
                result.numCorrect++;
            }
        }
        if (tmp.length > correctResponse.length) {
            result.isCorrectSoFar = false;
        } else {
            result.isCorrectSoFar = result.numCorrect === tmp.length;
            if (!result.isCorrectSoFar) {
                let reverseNumCorrect = 0;
                for (let i = 0; i < Math.min(tmp.length, correctResponse.length); i++) {
                    if (tmp[i] === correctResponse[correctResponse.length - i - 1]) {
                        reverseNumCorrect++;
                    }
                }
                if (reverseNumCorrect === tmp.length) {
                    result.isReversed = true;
                }
            }
            if (tmp.length === correctResponse.length) {
                result.isCorrect = result.isCorrectSoFar;
                result.isFinished = true;
            }
        }
        // if only allowing 1 error, stop input after first incorrect:
        if (!this.allowMultipleErrors && result.numCorrect < tmp.length) {
            result.isFinished = true;
        }
        return result;
    }
    getAnswerLogItem(response: any, correctResponse: any): AnswerLogItem {
        const analysis = <IResponseAnalysisResultSequence>this.analyze(response, correctResponse);
        const result = new AnswerLogItem();
        result.answer = (<number[]>response).toString();
        if (analysis.isFinished) {
        } else {
            if (analysis.isReversed) {
                result.errorType = ProblemResult.REVERSED.toString();
            } else {
                result.errorType = ProblemResult.INCOMPLETE.toString();
            }
        }
        result.correct = analysis.isCorrect;
        return result;
    }
}
export interface IResponseAnalysisResult {
    isFinished: boolean; // = false;
    // continueWithSameProblem: boolean;
}
export interface IResponseAnalysisResultWithCorrect extends IResponseAnalysisResult {
    isCorrect: boolean;
}
export interface IResponseAnalysisResultSequence extends IResponseAnalysisResultWithCorrect {
    numCorrect: number; // = 0;
    isCorrectSoFar: boolean; // = false;
    isReversed: boolean;
}

export interface IResponseAnalysisResultLogAnyway {
    logResultAnyway: boolean;
}
// export class ResponseAnalyzerThreshold extends ResponseAnalyzer {
//    analyze(response: any, correctResponse: any): any {
//        var result = super.analyze(response, correctResponse);
//        result.isFinished = response.length == correctResponse.length;
//        var fractCorrect = 1.0 * result.numCorrect / correctResponse.length;
//        result.isCorrect if (fractCorrect > 0.8) {
//        }
//    }
// }
