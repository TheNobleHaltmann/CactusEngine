canvas = document.getElementById("canvasName");
context = canvas.getContext('2d');

//images stuff ----------------------

//a sprite holds an image and various details about it
function Sprite(name, x, y, width, height, src) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.image = new Image();
  this.image.width = width;
  this.image.height = height;
  this.image.src = src;
}

//if a sprite is in the drawList, it gets drawn
var drawList = new Array();

//adds a sprite to the draw list to be drawn
function drawListAdd( s ) {
  drawList.push( s );
}

//removes a sprite from the draw list so it stops being drawn
//returns true if remove successful
function drawListRemove( s ) {
  var index = drawList.indexOf( s );
  if (index > -1) {
     drawList.splice(index, 1);
     return true;
  }
  return false;
 }


//input stuff ----------------------

//mouse stuff:
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousemove", handleMouseMove);
var mouse = new Mouse();

//knows stuff about the mouse
function Mouse() {
 this.x = 0;
 this.y = 0;
 this.down = false;
 this.held = false;
 this.up = false;
}

//pass in a sprite, returns true if mouse position is within sprite
function isMouseOn( s ) {
 return checkCollisionPoint( s, mouse.x, mouse.y );
 //return (s.x < mouse.x && s.x + s.image.width > mouse.x && s.y < mouse.y && s.y + s.image.height > mouse.y);
}

//returns true if mouse has been clicked down, then sets mouse.down to false to ensure only one down event
function isMouseDown() {
  var q = mouse.down;
  mouse.down = false;
  return q;
}

//returns true if mouse has been unclicked, then sets mouse.up to false to ensure only one up event
function isMouseUp() {
  var q = mouse.up;
  mouse.up = false;
  return q;
}

//returns true if mouse has been clicked down but not unclicked back up yet
function isMouseHeld() {
  return mouse.held
}

function handleMouseDown(e) {
  mouse.down = true;
  mouse.held = true;
}

function handleMouseUp(e) {
  mouse.up = true;
  mouse.held = false;
}

function handleMouseMove(e) {
 mouse.x = e.clientX;
 mouse.y = e.clientY;
}



//keyboard stuff:
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
var keyboard = new Keyboard();

//this array system is like stupidly inefficent since every check requires searching the whole array
//a better approach would be arrays of boolean values but i'm too lazy to do that right now
function Keyboard() {
 this.keysDown = new Array();
 this.keysUp = new Array();
 this.keysHeld = new Array();
}

//when a key is pressed down, it is both down and held
function handleKeyDown(e) {
  var x = e.key;
  x = x.toLowerCase();
  if( keyboard.keysDown.indexOf( x ) == -1 ) {
   keyboard.keysDown.push( x );
  }
  if( keyboard.keysHeld.indexOf( x ) == -1 ) {
   keyboard.keysHeld.push( x );
  }
}

//when a key is released, it is both up and not held
function handleKeyUp(e) {
 var x = e.key;
 x = x.toLowerCase();
 if( keyboard.keysUp.indexOf( x ) == -1 ) {
  keyboard.keysUp.push( x );
 }
 var index = keyboard.keysHeld.indexOf( x );
 if( index >= 0 ) {
  keyboard.keysHeld.splice( index, 1 );
 }
}

//keyDown is a one-time event, so checking it removes the key from the array
function isKeyDown( k ) {
 k = k.toLowerCase();
 var index = keyboard.keysDown.indexOf( k );
 if( index >= 0 ) {
  keyboard.keysDown.splice( index, 1 );
  return true;
 }
 return false;
}

//keyUp is a one-time event, so checking it removes the key from the array
function isKeyUp( k ) {
  k = k.toLowerCase();
  var index = keyboard.keysUp.indexOf( k );
  if( index >= 0 ) {
    keyboard.keysUp.splice( index, 1 );
   return true;
  }
  return false;
 }

//keyHeld is not a one time event, so checking it does not remove it from the array
function isKeyHeld( k ) {
 k = k.toLowerCase();
 if( keyboard.keysHeld.indexOf( k ) >= 0 ) {
  return true;
 }
 return false;
}

//utility stuff ----------------------

//pass in a sprite and a point and see if they overlap
function checkCollisionPoint( s, x, y ) {
 return ( s.x < x && s.x + s.image.width > x && s.y < y && s.y + s.image.height > y );
}

//pass in two sprites and see if they overlap
function checkCollision( s1, s2 ) {
 if( s1 == null || s2 == null ) {
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

var draggedSprite = null;
var dragMode = "center";
var offsetX = 0;
var offsetY = 0;

//sets the given sprite as the draggedSprite
function setDraggedSprite( s ) {
  draggedSprite = s;
}

//allows for setting dragMode to only the available options
//all other strings will do nothing and return false
function setDragMode( m ){
  if( m == "center" || m == "offset" || m == "cornerUL" || m == "cornerUR" || m == "cornerLL" || m == "cornerLR" ) {
    dragMode = m;
    return true;
  } else {
    return false;
  }
}

//if the dragMode "offset" is being used, this function allows the offset to be set
function setDragOffset( x, y ) {
  offsetX = x;
  offsetY = y;
}

//updates draggedSprite
function engineUpdate() {
  if( draggedSprite != null ) {
    if( dragMode == "center" ) {
      draggedSprite.x = mouse.x - (draggedSprite.image.width / 2);
      draggedSprite.y = mouse.y - (draggedSprite.image.height / 2);
    } else if ( dragMode == "offset" ) {
      draggedSprite.x = mouse.x - offsetX;
      draggedSprite.y = mouse.y - offsetY;
    } else if ( dragMode == "cornerUL" ) {
      draggedSprite.x = mouse.x;
      draggedSprite.y = mouse.y;
    } else if ( dragMode == "cornerUR" ) {
      draggedSprite.x = mouse.x - draggedSprite.image.width;
      draggedSprite.y = mouse.y;
    } else if ( dragMode == "cornerLL" ) {
      draggedSprite.x = mouse.x;
      draggedSprite.y = mouse.y - draggedSprite.image.height;
    } else if ( dragMode == "cornerLR" ) {
      draggedSprite.x = mouse.x - draggedSprite.image.width;
      draggedSprite.y = mouse.y - draggedSprite.image.height;
    }
  }
}

//draws all Sprites in drawList automatically
function engineDraw() {
  canvas.width = canvas.width;
  
  for (var iter = 0; iter < drawList.length; iter++) {
    context.drawImage(drawList[iter].image, drawList[iter].x, drawList[iter].y, drawList[iter].image.width, drawList[iter].image.height);
  }
}

function game_loop() {
  engineUpdate();
  update();
  engineDraw();
  draw();
}