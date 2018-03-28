import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { Signal1 } from '@jwmb/signal';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { CircleEffect } from './effects/CircleEffect';

export class TouchAnimation extends ContainerBase {
    public static instance: TouchAnimation;
    private hand: SimpleBitmap;
    private dragItem: SimpleBitmap;
    private commandList: Array<any> = [];
    public completed = new Signal1<TouchAnimation>();

    constructor(private lockInput: Boolean = false) {
        super();
        if (TouchAnimation.instance) {
            TouchAnimation.instance.dispose();
        }
        TouchAnimation.instance = this;

        this.hand = SimpleBitmap.create('icon_touch.png');
        this.hand.pivot = new PIXI.Point(33 * 1, 11 * 1);
        this.visible = false;
        this.addChild(this.hand);

        //            if (this.lockInput) { //TODO: implement mouse lock
        //                MouseController.instance.isMouseEventsInactivated=true;
        //            }
    }

    public addSetPositionCommand(targetX: number = 0, targetY: number = 0) {
        this.commandList.push({ type: 'POSITION', x: targetX, y: targetY });
    }

    public addMoveCommand(duration: number = 1, targetX: number = 0, targetY: number = 0, transition: string = 'easeInOutExpo') {
        this.commandList.push({ type: 'MOVE', duration: duration, x: targetX, y: targetY, transition: transition });
    }

    public addCurveCommand(duration: number = 1, targetX: number = 0, targetY: number = 0, transition: string = 'easeInOutExpo') {
        this.commandList.push({ type: 'CURVE', duration: duration, x: targetX, y: targetY, transition: transition });
    }

    public addCurveToTargetCommand(target: PIXI.DisplayObject, duration: number = 1, offsetX: number = 0,
        offsetY: number = 0, transition: string = 'easeInOutExpo') {
        this.commandList.push({
            type: 'CURVE_TARGET', duration: duration,
            target: target, offsetX: offsetX, offsetY: offsetY, transition: transition
        });
    }

    public addMoveToTargetCommand(target: PIXI.DisplayObject, duration: number = 1, offsetX: number = 0,
        offsetY: number = 0, transition: string = 'easeInOutExpo') {
        this.commandList.push({
            type: 'MOVE_TARGET', duration: duration,
            target: target, offsetX: offsetX, offsetY: offsetY, transition: transition
        });
    }

    public addTouchCommand() {
        this.commandList.push({ type: 'TOUCH' });
    }

    public addStartDrag(target: PIXI.DisplayObject) {
        this.commandList.push({ type: 'START_DRAG', target: target });
    }

    public addStopDrag() {
        this.commandList.push({ type: 'STOP_DRAG' });
    }

    public addWaitCommand(duration: number = 0.5) {
        this.commandList.push({ type: 'WAIT', duration: duration });
    }

    public addCallbackCommand(callback: () => void) {
        this.commandList.push({ type: 'CALLBACK', callback: callback });
    }

    public start() {
        //            PopCode.instance.playSound("explain_mascot_popup"); //TODO: sound

        DoLater.execute(this, this.startNextCommand, 0);
    }

    private startNextCommand() {
        if (this.parent == null || this.commandList == null) {
            return;
        }
        if (this.commandList.length === 0) {
            this.dispose();
            return;
        }
        if (this.parent == null) {
            return;
        }

        this.visible = true;
        const nextCommand: any = this.commandList[0];
        this.commandList.splice(0, 1);
        switch (nextCommand.type) {
            case 'POSITION':
                this.position.x = nextCommand.x;
                this.position.y = nextCommand.y;
                this.onCommandComplete();
                break;
            case 'MOVE':
                Tweener.addTween(this, <TweenerOptions>{
                    time: nextCommand.duration, x: nextCommand.x, y: nextCommand.y,
                    transition: nextCommand.transition, onComplete: () => this.onCommandComplete()
                });
                break;
            case 'CURVE':
                Tweener.addTween(this, <TweenerOptions>{
                    time: nextCommand.duration, y: nextCommand.y,
                    transition: 'easeInCirc'
                });
                Tweener.addTween(this, <TweenerOptions>{
                    time: nextCommand.duration, x: nextCommand.x,
                    transition: 'easeOutCirc', onComplete: () => this.onCommandComplete()
                });
                break;
            case 'CURVE_TARGET':
                if (nextCommand.target) {
                    if (nextCommand.target.parent) {

                        const bounds = nextCommand.target.getLocalBounds(); // TODO: use global to local functionality
                        const localPoint: PIXI.Point = this.parent.toLocal(
                            new PIXI.Point(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5), nextCommand.target);
                        // var localPoint:PIXI.Point=new PIXI.Point(0,0)
                        // localPoint.x=(nextCommand.target.worldTransform.tx+(bounds.x+bounds.width*0.5)
                        // *nextCommand.target.worldTransform.a);
                        // localPoint.y=(nextCommand.target.worldTransform.ty+(bounds.y+bounds.height*0.5)
                        // *nextCommand.target.worldTransform.d);

                        Tweener.addTween(this, <TweenerOptions>{
                            time: nextCommand.duration, y: localPoint.y + nextCommand.offsetY,
                            transition: 'easeInCirc'
                        });
                        Tweener.addTween(this, <TweenerOptions>{
                            time: nextCommand.duration, x: localPoint.x + nextCommand.offsetX,
                            transition: 'easeOutCirc', onComplete: () => this.onCommandComplete()
                        });
                    } else {
                        console.log('nextCommand.target.parent');
                        console.log(nextCommand.target.parent);
                        this.onCommandComplete();
                    }
                }
                break;
            case 'MOVE_TARGET':
                if (nextCommand.target && nextCommand.target.parent) {
                    const bounds = nextCommand.target.getLocalBounds(); // TODO: use global to local functionality
                    // var localPoint:PIXI.Point=new PIXI.Point(0,0)
                    // localPoint.x=(nextCommand.target.worldTransform.tx+(bounds.x+bounds.width*0.5)
                    // *nextCommand.target.worldTransform.a)/Settings.appScale;
                    // localPoint.y=(nextCommand.target.worldTransform.ty+(bounds.y+bounds.height*0.5)
                    // *nextCommand.target.worldTransform.d)/Settings.appScale;
                    const localPoint: PIXI.Point = this.parent.toLocal(new PIXI.Point(bounds.x + bounds.width * 0.5,
                        bounds.y + bounds.height * 0.5), nextCommand.target);

                    Tweener.addTween(this, <TweenerOptions>{
                        time: nextCommand.duration, x: localPoint.x + nextCommand.offsetX,
                        y: localPoint.y + nextCommand.offsetY, transition: nextCommand.transition,
                        onComplete: () => this.onCommandComplete()
                    });
                } else {
                    console.log('nextCommand.target.parent');
                    console.log(nextCommand.target.parent);
                    this.onCommandComplete();
                }
                break;
            case 'TOUCH':
                this.position.y -= 8;
                Tweener.addTween(this.position, <TweenerOptions>{
                    time: 0.2, y: this.position.y + 8,
                    onComplete: () => this.onCommandComplete()
                });
                this.addChildAt(new CircleEffect(0, 0xFFFFFF), 0);
                break;

            case 'START_DRAG':
                if (nextCommand.target && nextCommand.target.parent) {
                    // if (nextCommand.target.parent) {
                    // var tmpParent: PIXI.Container = nextCommand.target.parent;
                    // var cIndex = tmpParent.children.indexOf(nextCommand.target);
                    // tmpParent.removeChild(nextCommand.target);
                    // var tmp = new ContainerBase();
                    // tmp.addChild(nextCommand.target);
                    // App.instance.pageContainer.addChild(tmp);
                    //// var targetX=nextCommand.target.worldTransform.tx/Settings.appScale;
                    //// var targetY=nextCommand.target.worldTransform.ty/Settings.appScale;
                    // var bounds = nextCommand.target.getLocalBounds();
                    // var localPoint:PIXI.Point = this.toLocal(new PIXI.Point(),nextCommand.target);

                    // var texture = Misc.snapShot(tmp, bounds);
                    // tmp.removeChild(nextCommand.target);
                    // App.instance.pageContainer.removeChild(tmp);
                    // tmpParent.addChildAt(nextCommand.target, cIndex);

                    const bounds = nextCommand.target.getLocalBounds();
                    const localPoint: PIXI.Point = this.toLocal(new PIXI.Point(), nextCommand.target);
                    const texture = Misc.snapShot(nextCommand.target, bounds);

                    this.dragItem = new SimpleBitmap(texture);
                    this.dragItem.name = 'TouchDrag_' + (nextCommand.target.name || '');
                    this.dragItem.alpha = 0.5;
                    this.dragItem.scale.x = nextCommand.target.scale.x;
                    this.dragItem.scale.y = nextCommand.target.scale.y;
                    // this.dragItem.pivot.x=-bounds.x;
                    // this.dragItem.pivot.y=-bounds.y;
                    // this.dragItem.position.x=targetX-this.position.x //+ bounds.x;
                    // this.dragItem.position.y=targetY-this.position.y //+ bounds.y;
                    this.dragItem.pivot.x = -bounds.x;
                    this.dragItem.pivot.y = -bounds.y;
                    this.dragItem.position.x = localPoint.x;
                    this.dragItem.position.y = localPoint.y;
                    this.dragItem.rotation = nextCommand.target.rotation;
                    this.addChildAt(this.dragItem, 0);
                }
                this.position.y -= 8;
                Tweener.addTween(this.position, <TweenerOptions>{
                    time: 0.2, y: this.position.y + 8,
                    onComplete: () => this.onCommandComplete()
                });
                this.addChildAt(new CircleEffect(0, 0xFFFFFF), 0);

                break;

            case 'STOP_DRAG':
                if (this.dragItem) {
                    this.removeChild(this.dragItem);
                    this.dragItem.texture.destroy(true);
                    this.dragItem = null;
                }
                this.onCommandComplete();
                break;

            case 'WAIT':
                DoLater.execute(this, this.onCommandComplete, nextCommand.duration);
                break;
            case 'CALLBACK':
                nextCommand.callback();
                this.onCommandComplete();
                break;
            default:
                break;
        }
    }

    public onCommandComplete() {
        this.startNextCommand();
    }

    public dispose() {
        super.dispose();

        if (TouchAnimation.instance === this) {
            TouchAnimation.instance = null;
        }

        DoLater.removeAllObjectFunctions(this);

        //            if (this.lockInput) { //TODO: lock input during animation
        //                MouseController.instance.isMouseEventsInactivated=false;
        //            }

        if (this.completed) {
            this.completed.dispatch(this);
            this.completed = null;
        }

        this.dragItem = null;

        this.commandList = null;
    }
}
