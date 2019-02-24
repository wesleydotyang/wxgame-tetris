import GameConfig from "./gameconfig"
import Brick from "./brick"
import { rotateArray } from "./util";

class BrickGroup extends PIXI.Container {
    _shapeData : number[][]

    _bricks : Brick[] = []
    _bpX : number = 0
    _bpY : number = 0
    _additionalOffsetY = 0


    constructor(shapeData:number[][]){
        super()
        this._shapeData = shapeData
        this.shapeData = shapeData
    }

    set shapeData(data:number[][]){
        this._shapeData = data
        this.rebuild()
    }

    get shapeData(){
        return this._shapeData
    }

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
        this.updateY()
    }

    updateY(){
        const blockSize = GameConfig.brickSize
        this.y = blockSize * (this.bpY - 1) + this._additionalOffsetY
    }

    get bpY(){
        return this._bpY
    }

    get bpWidth(){
        return this.shapeData[0].length
    }

    set additionalOffsetY(offsetY){
        this._additionalOffsetY = offsetY
        this.updateY()
    }

    get additionalOffsetY(){
        return this._additionalOffsetY
    }

    get bricks(){
        return this._bricks
    }


    rebuild(){
        this._bricks = []
        this.removeChildren()
        const blockSize = GameConfig.brickSize
        for(let i = 0;i<this.shapeData.length; ++i){
            let lineData = this.shapeData[i]
            for(let j = 0;j<lineData.length; ++j){
                let data = lineData[j]
                if(data != 0){
                    let block = new Brick()
                    block.bpX = j - Math.floor(lineData.length/2) 
                    block.bpY = i - this.shapeData.length + 1
                    this.addChild(block)
                    this._bricks.push(block)
                }
            }
        }
    }

    rotate(clockwise = true){
        this.shapeData = rotateArray(this.shapeData,clockwise ? 1 : 3)
    }


}

export default BrickGroup