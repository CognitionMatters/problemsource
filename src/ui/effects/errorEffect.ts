import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { UpdateManager } from '@jwmb/pixelmagic/lib/app/updateManager';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';

export class ErrorEffect {
    private errorClone: SimpleBitmap;
    private startFilters = [];
    private startTint = 0;

    constructor(private target: PIXI.DisplayObject, private duration: number = 0.7) {

        this.startFilters = target.filters;

        //            PopCode.instance.playSound("memory_wrong"); //TODO: sounds

        if (RendererManager.instance.renderer instanceof PIXI.CanvasRenderer) {
            if (this.target instanceof SimpleBitmap) {
                this.startTint = (<SimpleBitmap>this.target).tint;
                (<SimpleBitmap>this.target).tint = 0xff0000;

            } else if (this.target instanceof ContainerBase) {
                const container = <ContainerBase>this.target;
                const texture = Misc.snapShot(this.target);
                console.log('texture:');
                console.log(texture);
                this.errorClone = new SimpleBitmap(texture);
                this.errorClone.tint = 0xff0000;
                container.addChild(this.errorClone);
                const containerBounds = container.getLocalBounds();
                const errorBounds = this.errorClone.getLocalBounds();
                console.log(containerBounds);
                this.errorClone.position.x = containerBounds.x;
                this.errorClone.position.y = containerBounds.y;
                console.log(errorBounds);
            } else if (this.target.parent) {
                const parent = this.target.parent;
                const cloneContainer = new ContainerBase();
                cloneContainer.addChild(this.target);

                const texture = Misc.snapShot(cloneContainer);
                console.log('texture:');
                console.log(texture);
                this.errorClone = new SimpleBitmap(texture);

                parent.addChild(this.target);
                this.target.parent.addChild(this.errorClone);
                console.log('this.errorClone:');
                console.log(this.errorClone);
                this.target.updateTransform();
                this.updateErrorPosition();
                UpdateManager.instance.updated.add(this.updateErrorPosition, this);
            }
        } else {
            const colorMatrix = [
                1, 0, 0, 1.5,
                0, 0.8, 0, 0,
                0, 0, 0.6, 0,
                0, 0, 0, 1
            ];
            const filter = new PIXI.filters.ColorMatrixFilter();
            filter.matrix = colorMatrix;
            this.target.filters = [filter];
        }
        // var errorSound = ["error_sound"];
        // SoundManager.instance.playEffect(Misc.randomItem(errorSound));

        const delay: number = duration;
        DoLater.execute(this, this.errorHiliteComplete, delay);
        //            MouseController.instance.isMouseEventsInactivated=true; // TODO: add global mouse deactivation
    }

    public updateErrorPosition() {
        this.errorClone.pivot.x = this.target.pivot.x;
        this.errorClone.pivot.y = this.target.pivot.y;
        if ((<any>this.target).anchor != null) {
            this.errorClone.anchor.x = (<any>this.target).anchor.x;
            this.errorClone.anchor.y = (<any>this.target).anchor.y;
        }
        this.errorClone.position.x = this.target.position.x;
        this.errorClone.position.y = this.target.position.y;
        this.errorClone.scale.x = this.target.scale.x;
        this.errorClone.scale.y = this.target.scale.y;
        this.errorClone.rotation = this.target.rotation;
        this.errorClone.tint = 0xff0000;
    }

    public errorHiliteComplete() {
        if (this.errorClone) {
            // this.errorClone.texture.destroy( true );
            this.errorClone.dispose();
            UpdateManager.instance.updated.remove(this.updateErrorPosition, this);
        }
        this.target.filters = this.startFilters;
        if (this.target instanceof SimpleBitmap) {
            (<SimpleBitmap>this.target).tint = this.startTint;
        }

        //            MouseController.instance.isMouseEventsInactivated=false; // TODO: add global mouse deactivation

        this.target = null;
        this.startFilters = null;
    }
}
