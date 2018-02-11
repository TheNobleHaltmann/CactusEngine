class Sprite {
  constructor( name, x, y, width, height, src ) {
   this.name = name;
   this.x = x;
   this.y = y;
   this.image = new Image();
   this.image.width = width;
   this.image.height = height;
   this.image.src = src;
 
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
   ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
  }
 }

//how often to update and draw
var DELTA_UPDATE = 30;

var engine = new Engine( document, document.getElementById("canvasName") );
engine.background = "./alchemyImages/whitePixel.png";

var draggedSprite = null;

var sources = new Array();
//sources.push("http://www4.ncsu.edu/~adhayes2/alchemyGame/whitePixel.png");
//sources.push("http://www4.ncsu.edu/~adhayes2/alchemyGame/grayPixel.png");
//sources.push("http://www4.ncsu.edu/~adhayes2/alchemyGame/blackPixel.png");
sources.push("./alchemyImages/cactus.png");
sources.push("./alchemyImages/cloud.png");
sources.push("./alchemyImages/doubleFire.png");
sources.push("./alchemyImages/earth.png");
sources.push("./alchemyImages/fire.png");
sources.push("./alchemyImages/mud.png");
sources.push("./alchemyImages/sand.png");
sources.push("./alchemyImages/sandstorm.png");
sources.push("./alchemyImages/sun.png");
sources.push("./alchemyImages/water.png");
sources.push("./alchemyImages/wind.png");
sources.push("./alchemyImages/brownBrick.png");

//initialize
var permSprites = new Array();
var tempSprites = new Array();

var recipies = new Array();

var cactusSpr = new Sprite( "cactus", 0, 0, 64, 64, sources[0] );
var cloudSpr = new Sprite( "cloud", 0, 0, 64, 64, sources[1] );
var doubleFireSpr = new Sprite( "doubleFire", 0, 0, 64, 64, sources[2] );
var earthSpr = new Sprite( "earth", 0, 0, 64, 64, sources[3] );
var fireSpr = new Sprite( "fire", 0, 0, 64, 64, sources[4] );
var mudSpr = new Sprite( "mud", 0, 0, 64, 64, sources[5] );
var sandSpr = new Sprite( "sand", 0, 0, 64, 64, sources[6] );
var sandstormSpr = new Sprite( "sandstorm", 0, 0, 64, 64, sources[7] );
var sunSpr = new Sprite( "sun", 0, 0, 64, 64, sources[8] );
var waterSpr = new Sprite( "water", 0, 0, 64, 64, sources[9] );
var windSpr = new Sprite( "wind", 0, 0, 64, 64, sources[10] );
var brownBrickSpr = new Sprite( "brownBrick", 0, 0, 64, 64, sources[11] );

/*
var tilesBackground = new drawnObject( calculateGrayWidth(), engine.canv.height, "./alchemyImages/grayPixel.png", 0, 0 );
tilesBackground.onCollision = emptyFunction;
var borderLine = new drawnObject( 4, engine.canv.height, "./alchemyImages/blackPixel.png", tilesBackground.img.width, 0 );
borderLine.onCollision = emptyFunction;
*/

var tilesBackground = new Sprite( "tilesBack", 0, 0, calculateGrayWidth(), engine.canv.height, "./alchemyImages/grayPixel.png");
var borderLine = new Sprite( "borderLine", tilesBackground.image.width, 0, 4, engine.canv.height, "./alchemyImages/blackPixel.png");
tilesBackground.onCollision = emptyFunction;
borderLine.onCollision = emptyFunction;
engine.addObject( tilesBackground );
engine.addObject( borderLine );

initRecipies();

//these are the elements you start with
addPermSprite( fireSpr );
addPermSprite( waterSpr );
addPermSprite( windSpr );
addPermSprite( earthSpr );

//used to add a sprite to the gray box at the side, from where it can be used in all further crafting
function addPermSprite( s ) {
  var currentX = 16;
  var currentY = 16;
 
  if( permSprites.length != 0 ) {
  
   //add the next sprite based on the position of the previous sprite
   currentX = permSprites[ permSprites.length - 1 ].x;
   currentY = permSprites[ permSprites.length - 1 ].y;
   currentY += 80;
   
   if( currentY + 64 > engine.canv.height ) {
    //moving down would exit the screen, need to move over
    currentY = permSprites[ 0 ].y;
    currentX += 80;
   }
   
  }
  
  var sprite = new Sprite( s.name, currentX, currentY, s.image.width, s.image.height, s.image.src );
  sprite.onMouseDown = permSpriteClick;
  permSprites.push( sprite );
  engine.addObject( sprite );
}

function addTempSprite( s, x, y ) {
  var sprite = new Sprite( s.name, x, y, s.image.width, s.image.height, s.image.src);
  tempSprites.push( sprite );
  engine.addObject( sprite );
  return sprite;
}

function emptyFunction( g ) {
  
}

function permSpriteClick( e ) {
  console.log( this.name );
  if( checkCollisionPoint( this, e.clientX, e.clientY ) && draggedSprite == null ) {
    var sprite = addTempSprite( this, e.clientX - (this.image.width / 2), e.clientY - (this.image.height / 2));
    sprite.onMouseMove = draggedSpriteClick;
    sprite.onMouseDown = null;
    sprite.onMouseUp = draggedSpriteUp;
    sprite.onCollision = null;
    draggedSprite = sprite;
  }
}

function draggedSpriteClick ( e ) {
  this.x = e.clientX - (this.image.width / 2);
  this.y = e.clientY - (this.image.height / 2);
}

function tempSpriteDown( e ) {
  if( checkCollisionPoint( this, e.clientX, e.clientY ) && draggedSprite == null ) {
   this.onMouseMove = draggedSpriteClick;
   this.onMouseDown = null;
   this.onMouseUp = draggedSpriteUp;
   this.onCollision = null;
   draggedSprite = this;
  }
}

function draggedSpriteUp( e ) {
  this.onMouseMove = null;
  this.onMouseDown = tempSpriteDown;
  this.onMouseUp = null;
  this.onCollision = tempSpriteCollide;
  draggedSprite = null;
}

function tempSpriteCollide( other ) {
  console.log( "debob" );
  if( other.name == "tilesBack" || other.name == "borderLine" ) {
    remove( this, tempSprites );
    remove( this, engine.objects );
  } else {
    combine( this, other );
  }
}

function combine( s1, s2 ) { 
  for( var i = 0; i < recipies.length; i++ ) {
    if( (s1.name == recipies[i].in1.name && s2.name == recipies[i].in2.name) || (s2.name == recipies[i].in1.name && s1.name == recipies[i].in2.name) )  {
      create( recipies[i].out, s1, s2 );
      i = recipies.length;
    }
  }
}

function create( out, in1, in2 ) {

  in1.onCollision = null;
  in2.onCollision = null;
  remove( in1, tempSprites );
  remove( in2, tempSprites );
  remove( in1, engine.objects );
  remove( in2, engine.objects );

  var sprite = addTempSprite( out, (in1.x + in2.x)/2, (in1.y + in2.y)/2 );

  sprite.onMouseMove = null;
  sprite.onMouseDown = tempSpriteDown;
  sprite.onMouseUp = null;
  sprite.onCollision = tempSpriteCollide;
  draggedSprite = null;
  
  var notFound = true;
  for( var i = 0; i < permSprites.length; i++ ) {
   if( permSprites[i].name == out.name ) {
    notFound = false;
   }
  }
  if( notFound ) {
   //unlock the new element to combine with
   addPermSprite( out );
  }
  
  /*
  //and since we put a new thing on the field, let's see if it combined with anything
  s = tempSprites[ tempSprites.length - 1 ];
  for( var i = 0; i < tempSprites.length; i++ ) {
   if( s != tempSprites[i] && checkCollision( s, tempSprites[i] ) ) {
    combine( s, tempSprites[i] );
   }
  }
  */
 }

function calculateGrayWidth() {
  //this function checks how many total items there are and makes the gray area wide enough to accommodate all the items
  
  var startX = 16;
  var startY = 16;
  var currentX = startX;
  var currentY = startY;
 
  for (var iter = 0; iter < sources.length; iter++) {
   currentY += 64;
   if( currentY > engine.canv.height ) {
    //need to go to next column instead
    currentY = startY + 64;
    currentX += 80;
   }
   currentY += 16;
  }
 
  return currentX + 80;
 }

 function Recipie(out, in1, in2) {
  this.out = out;
  this.in1 = in1;
  this.in2 = in2;
 }

 function initRecipies() {
  recipies.push( new Recipie(doubleFireSpr, fireSpr, fireSpr));
  recipies.push( new Recipie(mudSpr, waterSpr, earthSpr));
  recipies.push( new Recipie(cloudSpr, waterSpr, windSpr));
  recipies.push( new Recipie(sandSpr, earthSpr, fireSpr));
  recipies.push( new Recipie(sandstormSpr, sandSpr, cloudSpr));
  recipies.push( new Recipie(sunSpr, doubleFireSpr, doubleFireSpr));
  recipies.push( new Recipie(cactusSpr, sunSpr, sandSpr));
  recipies.push( new Recipie(brownBrickSpr, mudSpr, fireSpr));
 }

engine.start( DELTA_UPDATE );

function checkCollisionPoint( s, x, y ) {
  return ( s.x < x && s.x + s.image.width > x && s.y < y && s.y + s.image.height > y );
 }