import weapp = require('./libs/weapp-adapter')
weapp
import * as PIXI from "pixi.js"
import GameConfig from "./gameconfig"
import {BrickBg, ConstructedBricks, BrickStatus} from "./brick"
import BrickGroup from "./brick_group"
import {createRandomBrickGroupData} from "./brick_constructor"
import {bs2point, Size, create2DArray, isValid2DIndex, descriptionOfSprite, setValuesFor2DArray, arrayByRemoveLinesFor2DArray, windowWidth, windowHeight, pixelRatio, safeAreaTop, safeAreaBottom, createRect} from "./util"
import * as Hit from "./hittest"
import Button from "./button"
import { PopUp } from './popup';



interface GameStore{
    isPlaying: boolean,
    activeBrick?: BrickGroup,
    nextBrickView? : BrickGroup
    brickArea: PIXI.Container,
    constructedBricks: ConstructedBricks,
    brickMatrixData : number[][],
    brickSizeInBp : Size,
    lastUserActionTime: number,
    score : number,
    clearLines : number,
    scoreView? : PIXI.Text,
}


export class Tetris{

    app : PIXI.Application
    game : GameStore
    gameWidth : number
    gameHeight : number
    sharedCanvasSprite: PIXI.Sprite | null = null

    constructor(){

        this.gameWidth = windowWidth
        this.gameHeight = windowHeight
        this.app = new PIXI.Application({
            width: windowWidth,
            height: windowHeight,
            resolution: pixelRatio,
            view: canvas,
            backgroundColor: GameConfig.backgroundColor
        })

       
        GameConfig.brickSize =  Math.floor(this.gameWidth * 0.6 / GameConfig.bricksHorizontal)


        this.game = this.createGameManager()
        this.setupUI()
        this.startGame()

    }

    showRanklist(){
        
        const openDataContext = wx.getOpenDataContext()
        const sharedCanvas = openDataContext.canvas
        sharedCanvas.width = this.gameWidth
        sharedCanvas.height = this.gameHeight
        const texture = PIXI.Texture.fromCanvas(sharedCanvas)
        texture.update()
        this.sharedCanvasSprite = new PIXI.Sprite(texture)
        this.sharedCanvasSprite.buttonMode = true
        this.sharedCanvasSprite.interactive = true
        this.app.stage.addChild(this.sharedCanvasSprite)

        openDataContext.postMessage({
            action: 'fetchFriend',
        })

        this.sharedCanvasSprite.on("pointertap",() => {
            console.log('dismiss ranklist')
            this.app.stage.removeChild(this.sharedCanvasSprite!)
            this.sharedCanvasSprite = null
        })
    }


    createGameManager(): GameStore{

        const brickSizeInBp = new Size(GameConfig.bricksHorizontal,GameConfig.bricksVertical)
        const brickMatrixData = create2DArray(GameConfig.bricksVertical,GameConfig.bricksHorizontal)

        // for(let j=19;j>10;--j){
        //     for(let i=0;i<10;++i){
        //         if(i == 5)continue
        //         brickMatrixData[j][i] = 1
        //     }
        // }

        const constructedBricks = new ConstructedBricks()
        constructedBricks.dataMatrix = brickMatrixData

        const brickArea = this.createPlayArea(bs2point(brickSizeInBp.width),bs2point(brickSizeInBp.height))
        
        return {
            isPlaying:true,
            brickSizeInBp,
            brickMatrixData,
            constructedBricks,
            brickArea,
            lastUserActionTime: new Date().getTime(),
            score : 0,
            clearLines: 0,
        }
    }


    setupUI(){
        const game = this.game
        const app = this.app

        const borderWidth = 8
        const brickContainer = this.createPlayAreaContainer(bs2point(game.brickSizeInBp.width),bs2point(game.brickSizeInBp.height),borderWidth) 

        brickContainer.x = 50
        brickContainer.y = 44 + safeAreaTop

        brickContainer.addChild(game.brickArea)
        app.stage.addChild(brickContainer)
        game.brickArea.addChild(game.constructedBricks)
        
        const overlay = createRect(bs2point(game.brickSizeInBp.width),80,GameConfig.backgroundColor)
        overlay.x = brickContainer.x
        overlay.y = brickContainer.y - overlay.height - borderWidth
        app.stage.addChild(overlay)

        const nextView = this.createNextBrickView()
        nextView.x =  brickContainer.x + brickContainer.width + 10
        nextView.y = brickContainer.y
        app.stage.addChild(nextView)

        const scoreView = this.createScoreView()
        scoreView.x = nextView.x
        scoreView.y = nextView.y + 100
        app.stage.addChild(scoreView)

        this.createControls(app.stage)

    }

  
    startGame(){
        this.createNextBrickGroup()
        this.spawnBrickGroup()
        this.game.isPlaying = true
        this.app.ticker.add(this.gameloop.bind(this))
    }

    restart(){
        this.app.stage.removeChildren()
        this.game = this.createGameManager()
        this.setupUI()
        this.createNextBrickGroup()
        this.spawnBrickGroup()
        this.game.isPlaying = true
    }

    get gameSpeed(){
        const perSpeedPx = GameConfig.brickSize / 10.0
        return (GameConfig.gameSpeed + this.game.clearLines/20) * perSpeedPx 
    }

    gameloop(delta){

        if(this.sharedCanvasSprite){
            this.sharedCanvasSprite.texture.update()
        }
        if(!this.game.isPlaying){
            return
        }
        this.onAutoDropDown()
    }

    gameover(){
        this.game.isPlaying = false
        console.log("gameover")

        this.app.stage.addChild(new PopUp({
            title : "GameOver",
            width:windowWidth,
            height:windowHeight,
            detail: `您的得分是 \n ${this.game.score}`,
            buttons: [
                {
                    title:'再来一局',
                    onTap: this.onTapRestart.bind(this)
                },
                {
                    title:'查看排行榜',
                    onTap: this.showRanklist.bind(this)
                }
            ],

        }))

        const openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
          action: 'updateScore',
          score: String(this.game.score)
        })
        
    }


    createNextBrickGroup(){
        const brickData = createRandomBrickGroupData()
        this.game.nextBrickView!.shapeData = brickData
        this.game.nextBrickView!.x =  bs2point(brickData[0].length)/2 * this.game.nextBrickView!.scale.x
        this.game.nextBrickView!.y = bs2point(brickData.length) * this.game.nextBrickView!.scale.y + 10
    }

    spawnBrickGroup(){
        const game = this.game
        const brick = new BrickGroup(game.nextBrickView!.shapeData)
        brick.bpX = Math.round(game.brickSizeInBp.width/2)
        brick.bpY = -1
        brick.additionalOffsetY = GameConfig.brickSize
        game.brickArea.addChild(brick)
        game.activeBrick = brick
        this.createNextBrickGroup()
    }


    createPlayAreaContainer(width:number,height:number,borderWidth:number){
        let container = new PIXI.Container()

        let border = new PIXI.Graphics()
        let bw = borderWidth;
    
        border.lineStyle(bw,0x000000,1)
        border.drawRect(-bw/2,-bw/2,width+bw,height+bw)

        let bg = new BrickBg(width,height)
        container.addChild(border)
        container.addChild(bg)

        return container
    }

    createPlayArea(width:number,height:number){
        let playArea = new PIXI.Container()
        return playArea
    }

  

    createNextBrickView(){
        const container = new PIXI.Container()
        const titleView = new PIXI.Text("Next")
        titleView.style = new PIXI.TextStyle({
            fontSize: 15
        })
        container.addChild(titleView)
        const brickGroup = new BrickGroup([[0]])
        brickGroup.scale = new PIXI.Point(0.5,0.5)
        brickGroup.y = 20
        container.addChild(brickGroup)
        this.game.nextBrickView = brickGroup
        return container
    }

    createScoreView(){
        const container = new PIXI.Container()
        const titleView = new PIXI.Text("Score")
        titleView.style = new PIXI.TextStyle({
            fontSize: 15
        })
        container.addChild(titleView)
        const scoreView = new PIXI.Text("0")
        scoreView.style = new PIXI.TextStyle({
            fontSize: 16,
            fontWeight: 'bold'
        })
        scoreView.y = 25
        container.addChild(scoreView)
        this.game.scoreView = scoreView

        return container
    }

    createControls(container : PIXI.Container){

        const mvButtonH = 100 + safeAreaBottom
        
        const mvLeftButton = new Button({
            width: this.gameWidth*0.3,
            height: mvButtonH
        })
        mvLeftButton.x = 0
        mvLeftButton.y = this.gameHeight - mvLeftButton.height
        mvLeftButton.text = "←"
        mvLeftButton.bindTapping(this.onMoveLeft.bind(this))
        container.addChild(mvLeftButton)

        const mvDownButton = new Button({
            width: this.gameWidth,
            height: 80
        })
        mvDownButton.x = 0
        mvDownButton.y = this.gameHeight - mvDownButton.height - mvLeftButton.height
        mvDownButton.text = ''
        mvDownButton.bindTapping(this.onMoveDown.bind(this),50)
        container.addChild(mvDownButton)

        const mvRightButton = new Button({
            width: this.gameWidth*0.3,
            height: mvButtonH
        })
        mvRightButton.x = this.gameWidth - mvRightButton.width
        mvRightButton.y = this.gameHeight - mvLeftButton.height
        mvRightButton.text = "→"
        mvRightButton.bindTapping(this.onMoveRight.bind(this))
        container.addChild(mvRightButton)


        const list = [false,true] 
        const rotateButtonW = (this.gameWidth - mvLeftButton.width*2)/2
        list.map( (clockwise,index) => {
            const rotateButton1 = new Button({
                width:rotateButtonW,
                height: mvButtonH
            })
            rotateButton1.text = ""
            rotateButton1.x = mvLeftButton.x + mvLeftButton.width + index * rotateButtonW
            rotateButton1.y = mvLeftButton.y
            rotateButton1.bindTapping(this.onRotate.bind(this,clockwise))
            container.addChild(rotateButton1)
        })
    }


    isHit(brick){
        return Hit.willBlockHitContainer(brick,this.game.brickSizeInBp,this.game.brickMatrixData)
    }

    onRotate(clockwise){
        console.log("tap" + clockwise)
        const game = this.game
        game.lastUserActionTime = new Date().getTime()

        if(!game.activeBrick){
            return
        }
        const oriData = game.activeBrick.shapeData
        const oriBpX = game.activeBrick.bpX
        game.activeBrick.rotate(clockwise)
        
        let success = false
        if (this.isHit(game.activeBrick)){
            // try move horizon
            const trys = [1,-2,3,-4]
            for(let i = 0; i < trys.length; ++i){
                const mv = trys[i]
                game.activeBrick.bpX += mv
                if(!this.isHit(game.activeBrick)){
                    success = true
                    break
                }
            }
        }else{
            success = true
        }

        if(!success){
            //restore rotate
            game.activeBrick.bpX = oriBpX
            game.activeBrick.shapeData = oriData
        }


    }

    onMoveLeft(){
        console.log('move left')
        const game = this.game
        game.lastUserActionTime = new Date().getTime()

        if(!game.activeBrick){
            return
        }
        game.activeBrick.bpX --
        if(this.isHit(game.activeBrick)){
            game.activeBrick.bpX ++
            return
        }
    }

    onMoveRight(){
        console.log('move right')
        const game = this.game
        game.lastUserActionTime = new Date().getTime()

        if(!game.activeBrick){
            return
        }

        game.activeBrick.bpX ++
        if(this.isHit(game.activeBrick)){
            game.activeBrick.bpX --
            return
        }
    }

    onMoveDown(){
        const game = this.game
        if(!game.activeBrick){
            return
        }

        game.activeBrick.bpY ++
        if(this.isHit(game.activeBrick)){
            game.activeBrick.bpY --
            return
        }
    }

    onAutoDropDown(){
        const game = this.game
        if(!game.activeBrick){
            return
        }

        const oriBpY = game.activeBrick.bpY
        const oriOffset = game.activeBrick.additionalOffsetY

        const moveY = this.gameSpeed * 0.4
        let newOffset = oriOffset + moveY

        if(newOffset > GameConfig.brickSize){
            newOffset -= GameConfig.brickSize
            game.activeBrick.bpY ++
            // console.log( game.activeBrick.bpY)
            if(this.isHit(game.activeBrick)){
                //reset bpY and set offset to maxium display offset
                game.activeBrick.bpY --
                game.activeBrick.additionalOffsetY = GameConfig.brickSize
                
                //whether this brick can settle down
                if((new Date().getTime()) > game.lastUserActionTime + 400){
                    console.log("settle down")
                    if(this.canSettleBrickDown(game.activeBrick)){
                        this.settleBrickDown(game.activeBrick)
                        game.activeBrick.parent.removeChild(game.activeBrick)
                        this.spawnBrickGroup()
                    }else{//gameover
                        this.gameover()
                    }
                }
            }else{
                game.activeBrick.additionalOffsetY = newOffset
            }
        }else{
            game.activeBrick.additionalOffsetY = newOffset
        }
    }

    onTapRestart(popUp:PopUp){
        popUp.dismiss()
        this.restart()
    }

    canSettleBrickDown(brickGroup:BrickGroup){
        const bricks = brickGroup.bricks
        for(let i=0; i<bricks.length; ++i){
            const brick = bricks[i]
            const absBpX = brickGroup.bpX + brick.bpX
            const absBpY = brickGroup.bpY + brick.bpY
            if (!isValid2DIndex(this.game.brickMatrixData,absBpX,absBpY)){
                return false
            }
        }
        return true
    }

    settleBrickDown(brickGroup:BrickGroup){
        const bricks = brickGroup.bricks
        for(let i=0; i<bricks.length; ++i){
            const brick = bricks[i]
            const absBpX = brickGroup.bpX + brick.bpX
            const absBpY = brickGroup.bpY + brick.bpY
            this.game.brickMatrixData[absBpY][absBpX] = 1
        }
        this.game.constructedBricks.dataMatrix = this.game.brickMatrixData
        this.checkFullLineBlock()
    }


    checkFullLineBlock(){
        const data = this.game.brickMatrixData
        let fullLineIndexes : number[] = []
        for(let i=0; i<data.length; ++i){
            const line = data[i]
            let isFull = true
            for(let j=0;j<line.length;++j){
                if(line[j] != BrickStatus.Live){
                    isFull = false
                    break
                }
            }
            if(isFull){
                fullLineIndexes.push(i)
            }
        }

        if(fullLineIndexes.length == 0){
            return
        }

        this.removeLinesAnimated(fullLineIndexes)
    }

    removeLinesAnimated(lineIndexes: number[]){
        const game = this.game

        const blink = function(callback : () => void){
            setValuesFor2DArray(game.brickMatrixData,lineIndexes,BrickStatus.VanishingHide)
            game.constructedBricks.dataMatrix = game.brickMatrixData
        
            setTimeout(() => {
                setValuesFor2DArray(game.brickMatrixData,lineIndexes,BrickStatus.VanishingShow)
                game.constructedBricks.dataMatrix = game.brickMatrixData
        
                setTimeout(() => {
                    callback()
        
                }, 300);
            }, 200);
        }

        setTimeout(() => {
            blink( () => blink( () => {
                setValuesFor2DArray(game.brickMatrixData,lineIndexes,BrickStatus.None)
                game.constructedBricks.dataMatrix = game.brickMatrixData
                this.updateScore(game.score + lineIndexes.length * lineIndexes.length * 10)
                game.clearLines += lineIndexes.length
                game.brickMatrixData = arrayByRemoveLinesFor2DArray(game.brickMatrixData,lineIndexes)
                game.constructedBricks.dataMatrix = game.brickMatrixData
            }))
        }, 200);

    }

    updateScore(score:number){
        this.game.score = score
        //真机无法更新文字,原因母鸡
        const lastScoreView = this.game.scoreView!
        const container = lastScoreView.parent
        container.removeChild(lastScoreView)
        const scoreView = new PIXI.Text(String(score))
        scoreView.style = new PIXI.TextStyle({
            fontSize: 16,
            fontWeight: 'bold'
        })
        scoreView.y = 25
        container.addChild(scoreView)
        this.game.scoreView = scoreView
    }
}



