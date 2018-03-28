// TODO: we need to figure out what we actually mean by the #... suffices. Repetitions of same definition or separate definitions?
// DynamicTP uses it for repetition, LinearTP *could* use it for separate definitions - or just repetition.
// Also, in DynamicTP, we have the #intro thingy - merges results into same game, but defined separately in training plan
// For now, let's say that #%d+ means repetition, all others mean separate definition
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
export class GameDefinition {
    public invisible = false;

    public id = '';
    public title = '';
    public phases: any[] = [];

    public progVisualizer = '';
    public progVisualizerData: any;

    public get localizedTitle(): string {
        if (this.title.indexOf(' ') < 0) {
            const tmp = SR.getIfExists('planettitle_' + this.title);
            if (tmp) {
                return tmp;
            }
        }
        return this.title;
    }
}
