/*
	Author... Stuffs...
*/

class Engine {
	constructor(doc, canvas) {
		// Elements for drawing
		this.canv = canvas;
		this.ctx = canvas.getContext('2d');
		// Elements to be drawn
		this.background = null;
		this.objects = [];
        // Rate at which things occur - Defaults to 1/30th of a second
        this.delta_update = 1000 / 30;
		// Handler for events
		this.handler = new EventHandler(doc, canvas, this);
	}
    
    start( t=this.delta_update ) {
        var e = this;
        this.delta_update = t;
        setInterval(function() { e.tick(e) }, t);
    }
    
    tick(self) {
        self.update();
        self.draw();
    }
    
	update() {
		for (var i=0; i<this.objects.length; i++) {
			if (this.objects[i].update != null) {
				this.objects[i].update();
			}
		}
		// Collision checking
		for (var i=0; i<this.objects.length; i++) {
			for (var j=i+1; j<this.objects.length; j++) {
				var objA = this.objects[i];
				var objB = this.objects[j];
				if (objA.onCollision == null || objB.onCollision == null) {
					continue;
				}
				//var xMatch = ( (objA.x > objB.x && objA.x < objB.x + objB.width) || (objA.x + objA.width > objB.x && objA.x + objA.width < objB.x + objB.width) || (objB.x > objA.x && objB.x < objA.x + objA.width) || (objB.x + objB.width > objA.x && objB.x + objB.width < objA.x + objA.width) );
				//var yMatch = ( (objA.y > objB.y && objA.y < objB.y + objB.width) || (objA.y + objA.width > objB.y && objA.y + objA.width < objB.y + objB.width) || (objB.y > objA.y && objB.y < objA.y + objA.width) || (objB.y + objB.width > objA.y && objB.y + objB.width < objA.y + objA.width) );
				//if (xMatch && yMatch) {
        if( this.checkCollision( objA, objB ) ) {
					objA.onCollision(objB);
					objB.onCollision(objA);
				}
			}
		}
  }
  
  checkCollision( s1, s2 ) {
    if( s1 == null || s2 == null ) {
     return false;
    }

    if( s1 === s2 ) {
      return false;
    }
   
      if( s1.x < s2.x ) {
       //s1 is further left 
       if( s1.x + s1.image.width < s2.x ) {
        //s1 is completely to the left of s2
        return false;
        //otherwise they could be overlappin
       }
      } else {
        //s2 is further left
        if( s2.x + s2.image.width < s1.x ) {
         //s2 is completely to the left of s1
         return false;
         //otherwise they could be overlappin
        }
      }
      
     if( s1.y < s2.y ) {
       //s1 is further up 
       if( s1.y + s1.image.height < s2.y ) {
        //s1 is completely above s2
        return false;
        //otherwise they be overlappin
       }
     } else {
       //s2 is further up
       if( s2.y + s2.image.height < s1.y ) {
         //s2 is completely above s1
         return false;
         //otherwise they be overlappin
       }
     }
      
     return true;
   }
	
	draw() {
		this.canv.width = this.canv.width;
		this.drawBackground();
		for (var i=0; i<this.objects.length; i++) {
			this.objects[i].draw(this.ctx);
		}
	}
	
	drawBackground() {
		if (this.background == null || this.background.typeof != "string") {
			return;
		}
		if (this.background.match(/^#([0-9]{3}){1,2}$/) != null) {
			this.ctx.fillStyle = this.background;
			this.ctx.fillRext(0,0,this.canvas.width,this.canvas.height);
		} else {
			var bgImg = new Image(this.canvas.width,this.canvas.height);
			bgImg.src = this.background;
			this.ctx.drawImage(bgImg,0,0);
		}
	}
	
	addObject(obj) {
		this.objects.push(obj);
	}
}

class drawnObject {
	constructor(type="undefined",width, height, x=0, y=0, imgRel) {
		// Image to be drawn
		if (typeof imgRel == "string") {
            this.img = new Image(width, height);
			this.img.src = imgRel;
            this.animated = false;
		} else { // Assume its an animation object
            this.img = imgRel;
            this.img.width = width;
            this.img.height = height;
            this.animated = true;
        }
        // Typing for object comparisons
        this.type = type;
		// Draw location
		this.x = x;
		this.y = y;
		// Angle of rotation in degrees
		this.rotation = 0;
		// Function for updating
		this.update = null;
		// Function for when object colides with another
		this.onCollision = null;
		// Function for onclick events
		this.onClick = null;
		// Function for when mouse is pressed
		this.onMouseDown = null;
		// Function for when mouse is released
		this.onMouseUp = null;
		// Function for mouse moved
		this.onMouseMove = null;
		// Array of functions for keyinputs
		this.onKeyDown = [];
	}
	
	draw(ctx) {
        if (this.animated) {
            this.img.draw(ctx, this.x, this.y,);
        } else {
            if (this.rotation != 0) {
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2, this.img.width, this.img.height);
                ctx.rotate(-this.rotation);
                ctx.translate(-this.x, -this.y);
            } else {
                ctx.drawImage(this.img, this.x - (this.img.width / 2), this.y - (this.img.height / 2), this.img.width, this.img.height);
            }
        }
	}
}

class EventHandler {	
	constructor(doc, canv, engine) {
		// The engine hosting the handler
		this.engine = engine;
		canv.addEventListener("click", this.mouse_click);
    canv.addEventListener("mousemove", this.mouse_move);
    canv.addEventListener("mousedown", this.mouse_down);
    canv.addEventListener("mouseup", this.mouse_up);
		doc.addEventListener("keydown", this.key_down);
	}
	
	mouse_click(e) {
		for (var i=0; i<engine.objects.length; i++) {
			if (engine.objects[i].onClick != null) {
				engine.objects[i].onClick(e);
			}
		}
  }
  
  mouse_down(e) {
		for (var i=0; i<engine.objects.length; i++) {
			if (engine.objects[i].onMouseDown != null) {
				engine.objects[i].onMouseDown(e);
			}
		}
  }
  
  mouse_up(e) {
		for (var i=0; i<engine.objects.length; i++) {
			if (engine.objects[i].onMouseUp != null) {
				engine.objects[i].onMouseUp(e);
			}
		}
	}
	
	mouse_move(e) {
		for (var i=0; i<engine.objects.length; i++) {
			if (engine.objects[i].onMouseMove != null) {
				engine.objects[i].onMouseMove(e);
			}
		}
	}
	
	key_down(e) {
		for (var i=0; i<engine.objects.length; i++) {
			//if (e.key.toLowerCase() in engine.objects[i].onKeyDown && engine.objects[i].engine.objects[i].onKeyDown != null) {
      if( engine.objects[i].onKeyDown != null && engine.objects[i].onKeyDown[e.key.toLowerCase()] != null ) {
				engine.objects[i].onKeyDown[e.key.toLowerCase()](e);
			}
		}
	}
}

class SpriteSheet {
    constructor(imgRel, sprHeight, sprWidth) {
        this.sprSheet = new Image();
        this.sprSheet.src = imgRel;
        this.sprHeight = sprHeight;
        this.sprWidth = sprWidth;
        this.collumns = 0;
        this.rows = 0;
        var ss = this;
        
        this.sprSheet.onload = function() {
            ss.collumns = Math.floor(ss.sprSheet.naturalWidth / ss.sprWidth);
            ss.rows = Math.floor(ss.sprSheet.naturalHeight / ss.sprHeight);
        }
    }
    
    draw(currentSpr, ctx, xLoc, yLoc, width=0, height=0) {
        var sprX = (currentSpr % this.collumns) * this.sprWidth;
        var sprY = Math.floor(currentSpr / this.collumns) * this.sprHeight;
        if (width == 0 || height == 0) {
            width = this.sprWidth;
            height = this.sprHeight;
        }
        ctx.drawImage(this.sprSheet, sprX, sprY, this.sprWidth, this.sprHeight, xLoc - (width / 2), yLoc - (height / 2), width, height);
    }
}

class Animation {
    constructor(sprSheet, startSpr, stopSpr, duration) {
        this.height = 0;
        this.width = 0;
        this.sprSheet = sprSheet;
        this.startSpr = startSpr;
        this.stopSpr = stopSpr;
        this.currentSpr = startSpr;
        var a = this;
        setInterval(function() { a.cycleAnim() }, duration);
    }
    
    cycleAnim() {
        this.currentSpr++;
        if (this.currentSpr >= this.stopSpr) {
            this.currentSpr = this.startSpr;
        }
    }
    
    draw(ctx, xLoc, yLoc) {
        this.sprSheet.draw(this.currentSpr,ctx, xLoc, yLoc, this.width, this.height);
    }
}

//general function/class library

//removes an object from an array if the object is in the array
function remove( obj, arr ) {
  var index = arr.indexOf( obj );
  if( index > -1 ) {
    arr.splice( index, 1 );
  }
}

//creates a solid black line of 1 px width from one point to another when drawn
class Line {
  constructor( baseX, baseY, endX, endY ) {
    this.baseX = baseX;
    this.baseY = baseY;
    this.endX = endX;
    this.endY = endY;
 
    // angle of rotation in degrees
    this.rotation = 0;
    // Function for updating
    this.update = null;
    // Function for when object colides with another
    this.onCollision = null;
    // Function for onclick events
    this.onClick = null;
    // Function for when mouse is pressed
    this.onMouseDown = null;
    // Function for when mouse is released
    this.onMouseUp = null;
    // Function for mouse moved
    this.onMouseMove = null;
    // Array of functions for keyinputs
    this.onKeyDown = [];
  }
 
  draw( ctx ) {
    ctx.beginPath();
    ctx.moveTo(this.baseX, this.baseY);
    ctx.lineTo(this.endX, this.endY);
    ctx.stroke();
  }

  length() {
    return distance( this.baseX, this.baseY, this.endX, this.endY );
  }
}

//writes a string onto the screen at a certain point in a certain font when drawn
class Text {
  constructor( text, x, y, font = "20px Papyrus" ) {
    this.x = x;
    this.y = y
    this.text = text;
    this.font = font;
 
    // angle of rotation in degrees
    this.rotation = 0;
    // Function for updating
    this.update = null;
    // Function for when object colides with another
    this.onCollision = null;
    // Function for onclick events
    this.onClick = null;
    // Function for when mouse is pressed
    this.onMouseDown = null;
    // Function for when mouse is released
    this.onMouseUp = null;
    // Function for mouse moved
    this.onMouseMove = null;
    // Array of functions for keyinputs
    this.onKeyDown = [];
  }
 
  draw( ctx ) {
    ctx.font = this.font;
    ctx.fillText( this.text, this.x, this.y );
  }
}