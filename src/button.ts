export default class Button extends PIXI.Sprite {
    private _textSprite : PIXI.Text
    private _isTouching = false
    private _touchingTimer : number | null = null

    private normalTexture : PIXI.Texture
    private highlightTexture : PIXI.Texture

    constructor({
        width = 100,
        height = 44,
        text = "",
        interactive = true,
        cornerRadius = 0
    } = {}){
        super()
        this.width = width
        this.height = height

        const bg = new PIXI.Graphics()
        bg.beginFill(0xFFFFFF,0)
        bg.lineStyle(1,0x000000,0)
        bg.drawRoundedRect(0,0,width,height,cornerRadius)
        bg.endFill()
        this.texture = this.normalTexture= bg.generateCanvasTexture()

        const bg2 = new PIXI.Graphics()
        bg2.beginFill(0xFFFFFF,0.2)
        bg2.lineStyle(1,0x000000,0)
        bg2.drawRoundedRect(0,0,width,height,cornerRadius)
        bg2.endFill()
        this.highlightTexture = bg2.generateCanvasTexture()


        this._textSprite = new PIXI.Text(text)
        this._textSprite.style.fontSize = 13
        this._textSprite.anchor.set(0.5);
        this._textSprite.position = new PIXI.Point(width/2,height/2)
        this.addChild(this._textSprite)

        this.buttonMode = true
        this.interactive = interactive
    }

    

    set text(t){
        this._textSprite.text = t
    }

    get text(){
        return this._textSprite.text
    }

    set isTouching(touching: boolean){
        this._isTouching = touching
        this.texture = touching ? this.highlightTexture : this.normalTexture
    }

    get isTouching(){
        return this._isTouching
    }

    bindTapping(callback, callbackInterval=200){
        this.on('pointerdown', () => {
            this.isTouching = true
            callback(this)

            if(this._touchingTimer){
                clearInterval(this._touchingTimer)
            }

            this._touchingTimer = setInterval( () => {
                callback(this)
            },callbackInterval)
        })

        const cancel = () => {
            this.isTouching = false
            if(this._touchingTimer){
                clearInterval(this._touchingTimer)
            }
        }

        this.on('pointerup', () => {
            cancel()
        })
        this.on('pointercancel', () => {
            cancel()
        })
        this.on('pointerupoutside', () => {
            cancel()
        })
        
    }
}