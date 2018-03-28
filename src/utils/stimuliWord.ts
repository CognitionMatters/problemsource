export class StimuliWord {

    public hasSound: boolean;
    public hasImage: boolean;

    constructor(public word: string = '', public difficultyLevel: number = -1,
        public soundPath: string = '', public imagePath: string = '') {
        this.validatePaths();
    }

    public getImage(lod: number = 0): PIXI.Sprite {
        if (!this.hasImage) {
            return null;
        }
        return PIXI.Sprite.fromImage(this.imageLodPath(lod));
    }

    public imageLodPath(lod: number = 0): string {
        if (!this.hasImage) {
            return null;
        }
        let prefix = 'assets/wordpic/';
        switch (lod) {
            case 0:
            default:
                prefix += 'large/';
                break;
            case 1:
                prefix += 'medium/';
                break;
            case 2:
                prefix += 'small/';
                break;
        }

        return prefix + this.imagePath;
    }

    public getSound(): any { // Todo: Sound
        if (!this.hasSound) {
            return null;
        }
        return null; // Todo: preLoad from soundPath;
    }

    public validatePaths() {
        // Todo: better validation
        // Temporary hack, yes it works.
        this.hasSound = !!this.soundPath;
        this.hasImage = !!this.imagePath;
    }

    /*public dispose(){
    this.word = null;
    this.difficultyLevel = null;
    this.soundPath = null;
    this.imagePath = null;
    this.hasSound = null;
    this.hasImage = null;
    }*/
}
