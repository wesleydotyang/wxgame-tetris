import GameConfig from "./gameconfig"

let _pixelRatio, _windowWidth,_windowHeight,_safeAreaTop = 0,_safeAreaBottom = 0

if(IS_WX){
    const sysInfo = wx.getSystemInfoSync()
    _pixelRatio = sysInfo.pixelRatio
    _windowWidth = sysInfo.windowWidth
    _windowHeight = sysInfo.windowHeight

    _safeAreaTop = sysInfo.statusBarHeight
    const isX = sysInfo.model.indexOf("iPhone X") != -1
    if(isX){
        _safeAreaBottom = 34
    }

}else{
    _pixelRatio = 1
    _windowWidth = document.body.clientWidth 
    _windowWidth = document.body.clientHeight
}

export var pixelRatio = _pixelRatio, windowWidth = _windowWidth, windowHeight = _windowHeight, safeAreaTop = _safeAreaTop,safeAreaBottom = _safeAreaBottom


function px(p:number){

}

function px2bs(p:number){
    return Math.round(p / GameConfig.brickSize)
}

function bs2px(bs:number){
    return bs * GameConfig.brickSize
}


//* rotate */
function rotateArray(arr: any[][],rotate:number) : any[][]{
    rotate = rotate % 4
    let resArr : any[][] = []
    switch(rotate){
        case 1:
            forEach2DArray(arr,function(val,i,j,ilen,jlen){
                if(resArr[j] == undefined){
                    resArr[j] = []
                }
                resArr[j][ilen-1-i] = val
            })
        break;
        case 2:
            forEach2DArray(arr,function(val,i,j,ilen,jlen){
                if(resArr[ilen-1-i] == undefined){
                    resArr[ilen-1-i] = []
                }
                resArr[ilen-1-i][jlen-1-j] = val
            })
            break;
        case 3:
            forEach2DArray(arr,function(val,i,j,ilen,jlen){
                if(resArr[jlen-1-j] == undefined){
                    resArr[jlen-1-j] = []
                }
                resArr[jlen-1-j][i] = val
            })
        break;
        default:
            resArr = arr
        break;
    }
    return resArr
}

function forEach2DArray(arr:any[][],callback:(val:any,i:number,j:number,ilen:number,jlen:number) => void) : void {
    for(let i = 0;i<arr.length;++i){
        let line = arr[i];
        for(let j = 0;j< line.length;++j){
            callback(line[j],i,j,arr.length,line.length)
        }
    }
}

function create2DArray(cols:number,rows:number,initialValue : any = 0){
    const res : any[][] = []
    for(let i = 0;i<cols;++i){
        const line : any[]= []
        for(let j = 0;j< rows;++j){
            line.push(initialValue)
        }
        res.push(line)
    }
    return res
}

// set value for 2d array in specified lines
function setValuesFor2DArray(data : any[][],lineIndexes:number[],value:any){
    for(let i = 0; i < lineIndexes.length; ++i){
        const lineIdx = lineIndexes[i]
        const lineData = data[lineIdx]
        for(let j = 0; j < lineData.length; ++j){
            data[lineIdx][j] = value
        }
    }
}


function arrayByRemoveLinesFor2DArray(data: any[][],lineIndexes:number[]){
    let newData = create2DArray(data.length,data[0].length,0)
    let copyToLineIdx = data.length - 1
    for(let lineIdx=data.length - 1; lineIdx>=0; --lineIdx){
        const lineData = data[lineIdx]
        if(lineIndexes.indexOf(lineIdx) >= 0){//this line is removed
            continue
        }
        // else copy line
        newData[copyToLineIdx] = data[lineIdx]
        copyToLineIdx --
    }
    return newData
}

function isValid2DIndex(array2d : any[][], x:number, y:number){
    const height = array2d.length
    const width = array2d[0].length
    return x >=0 && x<width && y>=0 && y<height
}

function descriptionOfSprite(sprite:PIXI.Container){
    return `(${sprite.x},${sprite.y},${sprite.width},${sprite.height})*${sprite.scale} `
}

export class Size{
    width: number
    height: number
    constructor(width,height){
        this.width = width
        this.height = height
    }
}


export function createRect(width:number,height:number,color:number,cornerRadius:number = 0){
    const rect = new PIXI.Graphics()
    rect.beginFill(color)
    rect.lineStyle(0)
    rect.drawRoundedRect(0,0,width,height,cornerRadius)
    rect.endFill()
    return rect
}

export {px2bs as point2bs,bs2px as bs2point,rotateArray,isValid2DIndex,descriptionOfSprite,setValuesFor2DArray,create2DArray,arrayByRemoveLinesFor2DArray} 