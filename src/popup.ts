import { descriptionOfSprite, createRect } from "./util";

interface PopUpButtonOptions {
    title: string,
    onTap : Function,

}

interface PopUpOptions {
    width : number,
    height : number,
    title : string,
    detail : string,
    buttons : PopUpButtonOptions[]
}

export class PopUp extends PIXI.Sprite {
    constructor(options: PopUpOptions){
        super()
        let gf = new PIXI.Graphics()
        gf.lineStyle(0)
        gf.beginFill(0x000000,0.6)
        gf.drawRect(0,0,options.width,options.height)
        gf.endFill()
        this.texture = gf.generateCanvasTexture()


        const container = new PIXI.Container()
        const containerWidth = options.width * 0.8
        let accY = 0

        this.addChild(container)
        console.log(`container: ${descriptionOfSprite(container)}`)
        console.log(`position: ${container.position.x} ${container.position.y}`)

        //title text
        const titleView = new PIXI.Text(options.title)
        titleView.style = new PIXI.TextStyle({
            fontSize: 20,
            fontWeight: 'bold',
            fill: 0xCCCCCC
        })
        titleView.y = 25
        titleView.x = containerWidth/2 - titleView.width/2

        container.addChild(titleView)
        accY += titleView.y + titleView.height

        //detail text
        const detailText = new PIXI.Text(options.detail)
        detailText.style = new PIXI.TextStyle({
            fontSize: 22,
            fill: 0xFFFFFF
        })
        accY += 20
        detailText.y = accY
        detailText.x = containerWidth/2 - detailText.width/2
        container.addChild(detailText)
        accY += detailText.height

        accY += 10

        //buttons
        for(let i=0; i<options.buttons.length; ++i){
            accY += 10
            const buttonData = options.buttons[i]
            const button = new PopUpButton(this,containerWidth*0.5,44,buttonData)
            container.addChild(button)
            button.y = accY
            button.x = containerWidth/2 - button.width/2
            accY += button.height
        }

        accY += 20

        const containerBg = createRect(containerWidth,accY,0xAA0000,10)
        container.addChildAt(containerBg,0)
        container.position = new PIXI.Point(options.width/2 - containerWidth/2,options.height/2 - accY/2)
        console.log(`container: ${descriptionOfSprite(container)}`)
        console.log(`position: ${container.position.x} ${container.position.y}`)
    }

    dismiss(){
        this.parent.removeChild(this)
    }
}

class PopUpButton extends PIXI.Sprite {
    _textSprite : PIXI.Text
    _isTouching = false

    constructor(popup: PopUp,width,height,options: PopUpButtonOptions){
        super()
        this.width = width
        this.height = height

        const bg = new PIXI.Graphics()
        bg.beginFill(0xFFFFFF,0)
        bg.lineStyle(2,0xFFFFFF,0.7)
        bg.drawRoundedRect(0,0,width,height,height/2)
        bg.endFill()
        this.texture = bg.generateCanvasTexture()

        this._textSprite = new PIXI.Text(options.title)
        this._textSprite.style.fontSize = 18
        this._textSprite.style.fill = 0xCCCCCC
        this._textSprite.anchor.set(0.5);
        this._textSprite.position = new PIXI.Point(width/2,height/2)
        this.addChild(this._textSprite)

        this.buttonMode = true
        this.interactive = true

        this.on('pointertap', () => {
            options.onTap(popup)
        }) 
    }

    set text(t){
        this._textSprite.text = t
    }

    get text(){
        return this._textSprite.text
    }

  
}