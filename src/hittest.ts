import BrickGroup from "./brick_group";
import { Size, isValid2DIndex } from "./util";

enum HitType{
    NotHit,
    HitTop,
    HitRight,
    HitBottom,
    HitLeft
}


export function willBlockHitContainer(brickGroup:BrickGroup,containerSize:Size,otherBricks:number[][]){
    const bricks = brickGroup.bricks
    for(let i=0; i<bricks.length; ++i){
        const brick = bricks[i]
        const absBpX = brickGroup.bpX + brick.bpX
        if (absBpX < 0 || absBpX >= containerSize.width){
            console.log("hit")
            return true
        }

        const absBpY = brickGroup.bpY + brick.bpY
        if (absBpY >= containerSize.height){
            console.log("hit")
            return true
        }

        if (isValid2DIndex(otherBricks,absBpX,absBpY)
            && otherBricks[absBpY][absBpX] > 0){
            console.log(`hit other block by ${absBpX} ${absBpY}`)
            return true
        }
    }
    return false
}

function rectsHitContainer(rects,container){
    rects.forEach(rect => {
        let hit = hitContainer(rect,container)
        if(hit != HitType.NotHit){
            return hit
        }
    });
    return HitType.NotHit
}

function hitContainer(sprite, container) {

    let collision = HitType.NotHit;
  
    //Left
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision = HitType.HitLeft;
    }
  
    //Top
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision = HitType.HitTop;
    }
  
    //Right
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision = HitType.HitRight;
    }
  
    //Bottom
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision = HitType.HitBottom;
    }
  
    //Return the `collision` value
    return collision;
  }

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  
    //hit will determine whether there's a collision
    hit = false;
  
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;
  
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
  
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
  
      //A collision might be occuring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {
  
        //There's definitely a collision happening
        hit = true;


      } else {
  
        //There's no collision on the y axis
        hit = false;
      }
    } else {
  
      //There's no collision on the x axis
      hit = false;
    }
  
    //`hit` will be either `true` or `false`
    return hit;
};

export {HitType,hitContainer,hitTestRectangle,rectsHitContainer}