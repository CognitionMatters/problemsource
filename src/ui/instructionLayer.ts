import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';

export class InstructionLayer extends ContainerBase {
    public static instance: InstructionLayer;
    public static getCurrentDurationLeft(): number {
        if (InstructionLayer.instance) {
            return Math.max(0, InstructionLayer.instance.soundLength - (Date.now() - InstructionLayer.instance.soundStartTime) / 1000);
        }
        return 0;
    }

    // private id:String;
    // 		private soundInstanceQueue:Vector.<SoundInstance>=new Vector.<SoundInstance>(); //TODO: implement
    private soundStartTime: number;
    private soundLength: number;
    // 		private teacher:TeacherBase; //TODO: implement
    private showTeacher: boolean;
    public isSkippable: boolean;
    public delayBetween = 0.2;

    // public soundPartCompleted: Signal = new Signal();

    constructor(instructionId: string, blockInput: boolean = true, showText: boolean = false,
        showTeacher: boolean = true, isSkippable: boolean = true) {
        super();

        console.log('InstructionLayer: ' + instructionId);
        // TODO: implement InstructionLayer
    }

    public dispose() {
        // TODO: implement
    }
}
