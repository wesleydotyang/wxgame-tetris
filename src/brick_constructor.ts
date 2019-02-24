import BrickGroup from "./brick_group";

function createBrickGroupData(type: number,rotate:number) : number[][]{
    const datas = [
        [[1,0,0],[1,1,1]],
        [[0,0,1],[1,1,1]],
        [[0,1,0],[1,1,1]],
        [[1,1,1,1]],
        [[1,1,0],[0,1,1]],
        [[0,1,1],[1,1,0]],
        [[1,1],[1,1]],
    ]
    let finalType = type % datas.length
    let data = datas[finalType]
    data = rotateArray(data,rotate)
   return data
}

function createRandomBrickGroupData(){
    let rand = Math.floor(Math.random() * 100)
    let rand2 = Math.floor(Math.random() * 100)
    let data = createBrickGroupData(rand,rand2)
    return data
}

function createRandomBrickGroup() : BrickGroup{
    return new BrickGroup( createRandomBrickGroupData())
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



export {createRandomBrickGroup,createRandomBrickGroupData}