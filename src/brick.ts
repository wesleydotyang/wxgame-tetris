import GameConfig from "./gameconfig"

export enum BrickStatus{
    None = 0,
    Live = 1,
    VanishingShow,
    VanishingHide
}

export default class Brick extends PIXI.Graphics {
    constructor(){
        super()
        const blockSize = GameConfig.brickSize
        const margin = Math.ceil(blockSize*0.15)
        const innnerSize = blockSize  - margin*2
        const borderWidth = Math.round(margin/2)
        this.lineStyle(borderWidth,0x000000,1)
        this.drawRect(0,0,blockSize,blockSize)
        this.beginFill(0x000000)
        this.drawRect(margin,margin,innnerSize,innnerSize)
        this.endFill()
    }

    _bpX : number = 0
    _bpY : number = 0

    set bpX(bpx){
        this._bpX = bpx
        const blockSize = GameConfig.brickSize
        this.x = blockSize * this.bpX
    }

    get bpX(){
        return this._bpX
    }

    set bpY(bpy){
        this._bpY = bpy
        const blockSize = GameConfig.brickSize
        this.y = blockSize * this.bpY
    }

    get bpY(){
        return this._bpY
    }
}

export class BrickBg extends PIXI.Graphics {
    constructor(width,height){
        super()
        const blockSize = GameConfig.brickSize
        const margin = Math.ceil(blockSize*0.15)
        const innnerSize = blockSize  - margin*2
        const borderWidth = Math.round(margin/2)
        const blockCountW = Math.ceil(width/blockSize)
        const blockCountH = Math.ceil(height/blockSize)
        const alpha = 1
        const color = 0x999999
        this.lineStyle(borderWidth,color,alpha)

        for(let i=0; i<blockCountH; ++i) {
            for (let j=0; j<blockCountW; ++j){
                this.beginFill(0xFFFFFF,0)
                this.drawRect(j*blockSize,i*blockSize,blockSize,blockSize)
                this.endFill()
                this.beginFill(color,alpha)
                this.drawRect(margin+j*blockSize,margin+i*blockSize,innnerSize,innnerSize)
                this.endFill()
            }
        }
        this.cacheAsBitmap = true
    }
}


export class ConstructedBricks extends PIXI.Graphics {
    _dataMatrix : number[][] = []

    constructor(){
        super()        
    }

    set dataMatrix(data: number[][]){
        this._dataMatrix = data
        this.clear()
        const blockSize = GameConfig.brickSize
        const margin = Math.ceil(blockSize*0.15)
        const innnerSize = blockSize  - margin*2
        const borderWidth = Math.round(margin/2)
        const color = 0x000000

        this.lineStyle(0)
        this.beginFill(0,0)
        this.drawRect(0,0,data[0].length*blockSize,data.length*blockSize)
        this.endFill()

        for(let i=0; i<data.length; ++i) {
            const lineData = data[i]
            for (let j=0; j<lineData.length; ++j){
                let alpha
                switch(lineData[j]){
                    case BrickStatus.VanishingHide:
                        alpha = 0.1
                        break
                    case BrickStatus.VanishingShow:
                        alpha = 0.8;
                        break
                    default:
                        alpha = 1;
                        break
                }
                if (lineData[j] != BrickStatus.None){
                    this.lineStyle(borderWidth,color,alpha)
                    this.beginFill(0xFFFFFF,0)
                    this.drawRect(j*blockSize,i*blockSize ,blockSize,blockSize)
                    this.endFill()
                    this.beginFill(color,alpha)
                    this.drawRect(margin+j*blockSize,margin+i*blockSize,innnerSize,innnerSize)
                    this.endFill()
                }
            }
        }
    }

    
}
 
