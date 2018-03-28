import { MetaphorManager } from '../metaphors/metaphorManager';
import { NewPhaseLogItem, PhaseEndLogItem, LeaveTestLogItem } from '../toRemove/logItem';
import { PhaseXBase } from './phase';
import { ViewResolverBase } from './viewResolverBase';
// import { PhaseXWorkingMemory } from '../../cmcontent/games/wm/phaseWM';
// import { PhaseXArrows, ExViewLevelIndicator } from '../../cmcontent/games/arrows/phaseArrows';
// import { ProblemArrows } from '../../cmcontent/games/arrows/problemArrows';
// import { ExViewWM } from '../../cmcontent/games/wm/viewWM';
// import { PhaseXMathMissingSymbol } from '../../cmcontent/games/missingSymbol/ProblemFactoryMissingSymbol';
// import { PhaseXTangram } from '../../cmcontent/games/tangram/phaseTangram';
// import { ProblemTangram } from '../../cmcontent/games/tangram/problemTangram';
// import { PhaseXNPals } from '../../cmcontent/games/npals/phaseNPals';
// import { ExViewNPals } from '../../cmcontent/games/npals/viewNPals';
// import { ProblemNPals } from '../../cmcontent/games/npals/problemNPals';
// import { PhaseXRotation } from '../../cmcontent/games/rotation/phaseRotation';
// import { PhaseXBoolean } from '../../cmcontent/games/boolean/phaseBoolean';
// import { ExViewBoolean } from '../../cmcontent/games/boolean/viewBoolean';
// import { ProblemBoolean } from '../../cmcontent/games/boolean/problemBoolean';
// import { PhaseXNBack } from '../../cmcontent/games/nback/phaseNBack';
// import { ExViewNBack } from '../../cmcontent/games/nback/ExViewNBack';
// import { ProblemNBack } from '../../cmcontent/games/nback/problemNBack';
// import { PhaseXMemoCrush, ExViewMemoCrush } from '../../cmcontent/games/wm/crush/phaseMemoCrush';
// import { ProblemMemoCrush } from '../../cmcontent/games/wm/crush/problemMemoCrush';
// import { ProblemRotation } from '../../cmcontent/games/rotation/problemRotation';

export class ViewResolverDefault extends ViewResolverBase {
    getClasses(phaseConstructor: Function) {
        const views = { phase: null, problem: null };
        switch (phaseConstructor) {
            // case PhaseXNPals:
            //     views.phase = ExViewNPals;
            //     views.problem = ProblemNPals;
            //     break;
            // // case PhaseXWISC:
            // //     views.phase = ExViewBase;
            // //     views.problem = ProblemTextMath;
            // //     break;
            // case PhaseXBase:
            // case PhaseXMathMissingSymbol:
            // // case Exercises.NVR.PhaseNVR:
            //     views.phase = ExViewLevelIndicator;
            //     break;
            // case PhaseXRotation:
            //     views.phase = ExViewLevelIndicator;
            //     views.problem = ProblemRotation;
            //     break;
            // case PhaseXTangram:
            //     views.phase = ExViewLevelIndicator;
            //     views.problem = ProblemTangram;
            //     break;
            // case PhaseXNBack:
            //     views.phase = ExViewNBack;
            //     views.problem = ProblemNBack;
            //     break;
            // case PhaseXArrows:
            //     views.phase = ExViewLevelIndicator;
            //     views.problem = ProblemArrows;
            //     break;
            // case PhaseXBoolean:
            //     views.phase = ExViewBoolean;
            //     views.problem = ProblemBoolean;
            //     break;
            // // case Exercises.Recognition.PhaseRecognition:
            // //     views.phase = ExViewBase;
            // //     views.problem = Exercises.Recognition.ProblemRecognition;
            // //     break;
            // case PhaseXWorkingMemory:
            // case PhaseXMemoCrush:
            //     if (phaseConstructor === PhaseXMemoCrush) {
            //         views.phase = ExViewMemoCrush;
            //         views.problem = ProblemMemoCrush;
            //     } else {
            //         views.phase = ExViewWM;
            //     }
            //     break;
            default:
                break;
        }
        return views;
    }
}
