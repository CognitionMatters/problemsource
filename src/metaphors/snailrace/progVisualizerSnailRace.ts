import { ProgVisualizerBase } from '../../games/progVisualizerBase';
import { SimpleBitmap } from '@jwmb/pixelmagic/lib/ui/SimpleBitmap';
import { GameState } from '../../gameState';
import { SnailCharacter } from './snailCharacter';
import { CountDown } from '../../ui/countDown';
import { Tweener, TweenerOptions } from '@jwmb/pixelmagic/lib/utility/tweener';
import { DoLater } from '@jwmb/pixelmagic/lib/utility/DoLater';
import { SnailWinDialog } from './snailWinDialog';
import { RaceBackgroundItem } from '../raceBackgroundItem';
import { RendererManager } from '@jwmb/pixelmagic/lib/app/rendererManager';
import { UpdateManager } from '@jwmb/pixelmagic/lib/app/updateManager';
import { Styles } from '../../ui/styles';

export class ProgVisualizerSnails extends ProgVisualizerBase {
    public data: any; // ProgVisualizerSpaceRaceData;

    public vehicleTypes = 'AIR/LAND';
    public backgroundPrefix = '';
    public player: SnailCharacter;
    public opponent: SnailCharacter;
    public backgroundObjects: Array<RaceBackgroundItem> = [];

    public speed = 0;
    public speedFactor = 1;

    public challengePlayerStartX = 70;
    public challengeOpponentStartX: number = this.challengePlayerStartX + 60;
    public challengeGoalX: number = RendererManager.instance.renderSettings.width - 50;

    public opponentPosition = -0.55;
    public opponentGoalPosition = -0.55;
    public playerPosition = -0.55;
    public playerGoalPosition = -0.55;

    public useExponential = true;
    public opponentGoalScreenPosition = 0.7;

    public wasLastCorrect = true;
    public isPlayerControlled = true;

    constructor(testId: string, data: any) { // ProgVisualizerSpaceRaceData
        super(testId);

        this.data = data;
    }

    public getAssetToLoad(): Array<string> {

        return [
            'assets/snailrace/snailrace.json'
        ];
    }

    public onStartCountDown(): Promise<any> {
        return new Promise<any>((res, rej) => {
            const countDown = new CountDown(5, () => res(null));
            countDown.position.x = RendererManager.instance.renderSettings.width * 0.5;
            countDown.position.y = RendererManager.instance.renderSettings.height * 0.2;
            this.addChild(countDown);
        });
    }


    public setupProblemRect() {
        // measurements // TODO: move this to metafor?
        const problemAreaWidth = 768;
        const problemAreaHeight = 680;

        this.problemRect = new PIXI.Rectangle(
            RendererManager.instance.renderSettings.width * 0.5 - problemAreaWidth * 0.5,
            RendererManager.instance.renderSettings.height - problemAreaHeight - Styles.defaultBuffer,
            problemAreaWidth,
            problemAreaHeight
        );
    }

    public init() {
        this.createScene();
        this.setupProblemRect();
        this.setupProgressIndicator();


        if (this.isDisposed === false) {
            UpdateManager.instance.updated.add(this.update, this);
            this.lastUpdateTime = Date.now();
        }
    }

    public createScene() {
        const background = new SimpleBitmap('snail_background01.png');
        background.width = RendererManager.instance.stageWidth;
        background.height = RendererManager.instance.stageHeight;
        this.addChild(background);

        const startline = new SimpleBitmap('snail_startline01.png');
        startline.uniformScale = 0.5;
        startline.x = 100;
        startline.y = 200;
        this.addChild(startline);


        // let playerProps = GameState.userData;
        // if (playerProps == null) {
        //     playerProps = CharacterComponent.getRandomAvatarProps();
        // }
        // const opponentSettings = CharacterComponent.getRandomOpponentProps(playerProps);

        this.opponent = new SnailCharacter(false);
        this.opponent.position.x = -300;
        this.opponent.position.y = 220;
        this.addChild(this.opponent);

        this.player = new SnailCharacter(true);
        this.player.position.x = -300;
        this.player.position.y = 290;
        this.addChild(this.player);
    }


    public resetPlayer() {
        this.isPlayerControlled = true;
        this.player.rotation = 0;
        this.opponent.rotation = 0;
    }

    public lastUpdateTime: number;

    public update() {
        if (this.endCriteriaManager == null) {
            // console.log("endCriteriaManager not active yet..");
            return;
        }
        const updateTime = Date.now();
        let timeDelta = updateTime - this.lastUpdateTime;
        timeDelta = Math.min(timeDelta, 1000 / 10);
        const adjustedSpeed: number = this.speed * (timeDelta / (1000 / 40));
        this.lastUpdateTime = updateTime;


        if (this.isPlayerControlled) {
            if (this.isChallenge) {
                this.opponentGoalPosition = this.endCriteriaManager.getEndPercentage();
                if (this.useExponential) {
                    this.playerGoalPosition = this.easeGoal(this.endCriteriaManager.getTargetPercentage() * 0.8, 0, 1, 1);
                } else {
                    this.playerGoalPosition = this.endCriteriaManager.getTargetPercentage();
                }

                if (this.playerGoalPosition > this.opponentGoalPosition) {
                    this.opponentGoalPosition += (this.playerGoalPosition - this.opponentGoalPosition) * 0.5;
                }
            } else {
                this.playerGoalPosition = this.endCriteriaManager.getTargetPercentage();
            }

            const accelerationFactor = 0.05; // used to define how fast players move to new goal position
            const visibleOpponentGoalRatio = this.opponentGoalScreenPosition;
            this.opponentPosition = this.opponentGoalPosition * accelerationFactor + this.opponentPosition
                * (1 - accelerationFactor); // update player positions
            this.opponent.position.x = this.challengeOpponentStartX
                + (this.challengeGoalX - this.challengeOpponentStartX) * visibleOpponentGoalRatio
                * this.opponentPosition;

            this.playerPosition = this.playerGoalPosition * accelerationFactor + this.playerPosition * (1 - accelerationFactor);
            this.player.position.x = this.challengePlayerStartX + (this.challengeGoalX - this.challengePlayerStartX) * this.playerPosition;
        }

        this.opponent.update(adjustedSpeed);
        this.player.update(adjustedSpeed);
    }

    private easeGoal(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b; // out cubic
    }

    public onShowProblem(): Promise<any> {
        return super.onShowProblem();
        // TODO: add bonus star functionality (from metaphor)
    }

    public onCorrectAnswer(): Promise<any> {
        return new Promise<any>((res, rej) => {
            const delay = 0;
            this.wasLastCorrect = true;

            const completePercentage: number = this.endCriteriaManager.getTargetPercentage();
            const animationDuration = 0;

            // Tweener.addTween(this, {time: 0.6, speed: -8}); // speed up
            if (this.isChallenge) {
                this.playerGoalPosition = this.endCriteriaManager.getTargetPercentage();
                this.player.onSpeedBoost(3);

            } else {
                if (completePercentage >= 1) { // go out of screen when phase is complete
                    this.isPlayerControlled = false;
                    Tweener.addTween(this.player.position, <TweenerOptions>{
                        time: 2.48,
                        x: RendererManager.instance.renderSettings.width + this.player.getBounds().width
                    });

                    this.playerGoalPosition = 1;
                    this.player.onSpeedBoost(4);
                    this.player.addSound();

                    DoLater.resolvePromise(this, res, 2.5);
                } else {
                    this.playerGoalPosition = completePercentage;
                    this.player.onSpeedBoost(3);
                }
            }
            // Tweener.addTween(this, {delay: 0.9, time: 1.0, speed: 0, transition: "easeOutQuad"}); // delayed speed down

            //            // add random voiceover //TODO: implement sound
            //            if (Math.random()>0.85) {
            //                var reinforcerSounds:Array =["general_reinforcer_bingo","general_reinforcer_katjing"
            // , "general_reinforcer_tjitjing", "general_reinforcer_wihaa", "general_reinforcer_wohoo"];
            //                var soundInstance:SoundInstance = PopCode.instance.playSound(reinforcerSounds
            // [Misc.randomRange(0,reinforcerSounds.length-1)]);
            //                soundInstance.volume=0.2;
            //            }

            this.player.addSound();

            // this.onStarAnimation();

            res(null);
        });
    }

    public onWrongAnswer(): Promise<any> {
        return new Promise<any>((res, rej) => {
            this.wasLastCorrect = false;
            const completePercentage: number = this.endCriteriaManager.getEndPercentage();
            if (this.isChallenge) {
                this.opponent.onSpeedBoost(3);
            } else {
                this.playerGoalPosition = completePercentage;
            }
            this.speed = 0;
            res(null);
        });
    }

    public onPrepareModel(): Promise<any> {
        return new Promise<any>((res, rej) => {
            Tweener.addTween(this, { time: 0.5, speed: 0 });

            this.playerPosition = -0.55;
            this.playerGoalPosition = -0.55;
            this.player.position.x = -this.player.getBounds().width;

            this.opponentPosition = -0.55;
            this.opponentGoalPosition = -0.55;
            this.opponent.position.x = -this.opponent.getBounds().width;

            this.isPlayerControlled = false;

            this.speed = 0;

            res(null);
        });
    }

    public onPrepareGuide(): Promise<any> {
        return new Promise<any>((res, rej) => {
            this.resetPlayer();
            const delay = 0;
            this.playerPosition = -0.3;
            this.playerGoalPosition = 0;
            this.opponentPosition = -0.55;
            this.opponentGoalPosition = -0.55;
            this.speed = -7;
            Tweener.addTween(this, { delay: 1, time: 1.5, speed: 0 });
            DoLater.resolvePromise(this, res, delay + 1);
        });
    }

    public onPrepareChallenge(targetScoreOverride: number = 0): Promise<any> {
        return new Promise<any>((res, rej) => {
            this.resetPlayer();

            const delay = 1.5;

            this.playerPosition = -0.3;
            this.playerGoalPosition = 0;
            this.opponentPosition = -0.3;
            this.opponentGoalPosition = 0;

            this.speed = -7;
            Tweener.addTween(this, { delay: 1.5, time: 2.2, speed: 0 });
            // PopCode.instance.playSound("level_start"); //TODO: implement sound
            this.onStartCountDown().then(() => {
                res(null);
            });
        });
    }

    public onStartChallenge(): Promise<any> {
        return new Promise<any>((res, rej) => {
            this.isPlayerControlled = true;
            this.isChallenge = true;

            res(null);
        });
    }

    public onStopChallenge(): Promise<any> {
        this.isChallenge = false;
        this.isPlayerControlled = false;
        return this.showWinDialog();
    }

    public onFailChallenge(): Promise<any> {
        this.isChallenge = false;
        this.isPlayerControlled = false;
        return this.showWinDialog();
    }

    public onStarAnimation() {
    }

    public showWinDialog(): Promise<any> {
        return new Promise<any>((res, rej) => {
            const closeCallback = () => {
                console.log('close');
                res(null);
            };
            const wonDialog = new SnailWinDialog(closeCallback, true, 0, 0);
        });
    }

    public getStarTargetPos(): PIXI.Point {
        const point = new PIXI.Point(this.player.position.x, this.player.position.y);
        // TODO: implement tracking logic to star animation
        // var point:Point=new PIXI.Point(this.challengePlayerStartX +
        // (this.challengeGoalX-this.challengePlayerStartX)*this.playerGoalPosition +this.player.body.position.x
        // + player.head.position.x, player.position.y + player.body.position.y+player.head.position.y);
        return point;
    }

    public dispose() {
        super.dispose();

        UpdateManager.instance.updated.remove(this.update, this);
    }
}
