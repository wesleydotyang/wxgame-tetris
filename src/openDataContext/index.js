const ScoreKey = 'score'

const PAGE_SIZE = 8;
const ITEM_HEIGHT = 70;

const ActionFetchFriend = 'fetchFriend'
const ActionFetchGroup = 'fetchGroup'
const ActionUpdateScore = 'updateScore'


const sysInfo = wx.getSystemInfoSync()
const pixelRatio = sysInfo.pixelRatio
const windowWidth = sysInfo.windowWidth
const windowHeight = sysInfo.windowHeight
const canvasPadding = 40

const dataSorter = (gameDatas, field = ScoreKey) => {
    return gameDatas.sort((a, b) => {
        const kvDataA = a.KVDataList.find(kvData => kvData.key === ScoreKey);
        const kvDataB = b.KVDataList.find(kvData => kvData.key === ScoreKey);
        const gradeA = kvDataA ? parseInt(kvDataA.value || 0) : 0;
        const gradeB = kvDataB ? parseInt(kvDataB.value || 0) : 0;
        return gradeA > gradeB ? -1 : gradeA < gradeB ? 1 : 0;
    });
}




class RankListRenderer
{
    constructor()
    {
        this.totalPage = 0;
        this.currPage = 0;
        this.gameDatas = [];    //https://developers.weixin.qq.com/minigame/dev/document/open-api/data/UserGameData.html
        this.init();
    }

    init()
    {
        this.canvas = wx.getSharedCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = "high";
    }

    listen()
    {
        //msg -> {action, data}
        wx.onMessage(msg => {
            console.log("ranklist wx.onMessage", msg);
            switch(msg.action)
            {
                case ActionFetchFriend:
                    this.fetchFriendData();
                    break;

                case ActionFetchGroup:
                    if(!msg.data)
                    {
                        return;
                    }
                    this.fetchGroupData(msg.data);
                    break;

                case ActionUpdateScore:
                    this.updateUserMaxScore(msg.score);
                    break;

                default:
                    console.log(`未知消息类型:msg.action=${msg.action}`);
                    break;
            }
        });
    }

    fetchGroupData(shareTicket)
    {
        //取出群同玩成员数据
        wx.getGroupCloudStorage({
            shareTicket,
            keyList:[
                ScoreKey,
            ],
            success:res => {
                console.log("wx.getGroupCloudStorage success", res);
                const dataLen = res.data.length;
                this.gameDatas = dataSorter(res.data);
                this.currPage = 0;
                this.totalPage = Math.ceil(dataLen / PAGE_SIZE);
                if(dataLen)
                {
                    this.showPagedRanks(0);
                }
            },
            fail:res => {
                console.log("wx.getGroupCloudStorage fail", res);
            },
        });
    }

    fetchFriendData()
    {
        //取出所有好友数据
        wx.getFriendCloudStorage({
            keyList:[
                ScoreKey,
            ],
            success:res => {
                console.log("wx.getFriendCloudStorage success", res);
                const dataLen = res.data.length;
                this.gameDatas = dataSorter(res.data);
                this.currPage = 0;
                this.totalPage = Math.ceil(dataLen / PAGE_SIZE);
                if(dataLen)
                {
                    this.showPagedRanks(0);
                }
            },
            fail:res => {
                console.log("wx.getFriendCloudStorage fail", res);
            },
        });
    }


    updateUserMaxScore(newScore){
      this.getUserScore((score) => {
        var scoreVal = 0
        if(score){
          scoreVal = parseInt(score)
        }
        var newScoreVal = parseInt(newScore)
        if(newScoreVal <= scoreVal){
          console.log('below max score.')
          return
        }
        this.saveUserScore(newScoreVal)
      })
    }
    
    saveUserScore(score){
      wx.setUserCloudStorage({
        KVDataList: [{ key:ScoreKey, value: String(score) }],
        success: res => {
            console.log(res);
        },
        fail: res => {
            console.log('updateUserScore failed:' + JSON.stringify(res));
        }
      });
    }
    
    getUserScore(success,fail){
      wx.getUserCloudStorage({
        keyList: [ScoreKey],
        success: res => {
          console.log(JSON.stringify(res))
          var resDic = this.convertKVListToDic(res.KVDataList)
          success(resDic[ScoreKey])
        },
        fail: res => {
          console.log('getUserScore failed:' + JSON.stringify(res));
          fail(res)
        }
      })
    }
    
    deleteUserData(keys){
      wx.removeUserCloudStorage({keyList:keys})
    }

    convertKVListToDic(kvlist){
      var result = {}
      for(var i =0; i<kvlist.length; ++i){
        result[kvlist[i]['key']] = kvlist[i]['value']
      }
      return result
    }


    showPagedRanks(page)
    {
        const pageStart = page * PAGE_SIZE;
        let pagedData = this.gameDatas.slice(pageStart, pageStart + PAGE_SIZE);
        const pageLen = pagedData.length;

      //debug
      // const data = pagedData[0]
      // for(let i=0;i<5;++i){
      //   const newData = JSON.parse(JSON.stringify(data))
      // pagedData.push(pagedData[0])
      // }
      //debug

        this.ctx.clearRect(0, 0, windowWidth, windowHeight);
        this.ctx.fillStyle="black";
        this.ctx.fillRect(canvasPadding,canvasPadding,windowWidth-canvasPadding*2,windowHeight*2)
        for(let i = 0, len = pagedData.length; i < len; i++)
        {
            this.drawRankItem(this.ctx, i, pageStart + i + 1, pagedData[i], pageLen);
        }
    }

    //canvas原点在左上角
    drawRankItem(ctx, index, rank, data, pageLen)
    {
      console.log("draw item",index)
        const avatarUrl = data.avatarUrl//.substr(0, data.avatarUrl.length - 1) + "132";
        const nick = data.nickname.length <= 10 ? data.nickname : data.nickname.substr(0, 10) + "...";
        const kvData = data.KVDataList.find(kvData => kvData.key === ScoreKey);
        const grade = kvData ? kvData.value : 0;
        const itemGapY = ITEM_HEIGHT * index + canvasPadding + 20;
        const itemBaseY = itemGapY + ITEM_HEIGHT
        let currentX = canvasPadding
        //名次
        ctx.fillStyle = "#D8AD51";
        ctx.textAlign = "right";
        ctx.baseLine = "middle";
        ctx.font = "60px Helvetica";
        currentX += 50 
        ctx.fillText(`${rank}`, currentX, itemBaseY);
        currentX += 30
        
        //头像
        const avatarImg = wx.createImage();
        avatarImg.src = avatarUrl;
        avatarImg.onload = () => {
          ctx.save();
          ctx.beginPath()
          const x = canvasPadding + 50
          const y =  itemBaseY - 50
          const r = 25
          const d =2 * r;
          const cx = x + r;
          const cy = y + r;
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.clip();
          ctx.closePath()
          ctx.drawImage(avatarImg, x, y, d, d);
          ctx.restore();
        };
        currentX += 30

        //名字
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.baseLine = "middle";
        ctx.font = "15px Helvetica";
        ctx.fillText(nick, currentX, itemBaseY - 15);

        //分数
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.baseLine = "middle";
        ctx.font = "20px Helvetica";
        ctx.fillText(`${grade}分`, windowWidth-canvasPadding - 20, itemBaseY - 15);

        //分隔线
        ctx.beginPath()
        ctx.strokeStyle = 'white'
        ctx.moveTo(canvasPadding + 15,itemBaseY + 10)
        ctx.lineTo(windowWidth-canvasPadding - 15, itemBaseY + 10)
        ctx.stroke();


    }
}

const rankList = new RankListRenderer();
rankList.listen();