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


function calculateGrayWidth() {
 //this function checks how many total items there are and makes the gray area wide enough to accommodate all the items
 
 var startX = 16;
 var startY = 16;
 var currentX = startX;
 var currentY = startY;

 for (var iter = 0; iter < sources.length; iter++) {
  currentY += 64;
  if( currentY > canvas.height ) {
   //need to go to next column instead
   currentY = startY + 64;
   currentX += 80;
  }
  currentY += 16;
 }

 return currentX + 80;
}

//used to add a sprite to the gray box at the side, from where it can be used in all further crafting
function addPermSprite( s ) {
 var currentX = 16;
 var currentY = 16;

 if( permSprites.length != 0 ) {
 
  //add the next sprite based on the position of the previous sprite
  currentX = permSprites[ permSprites.length - 1 ].x;
  currentY = permSprites[ permSprites.length - 1 ].y;
  currentY += 80;
  
  if( currentY + 64 > canvas.height ) {
   //moving down would exit the screen, need to move over
   currentY = permSprites[ 0 ].y;
   currentX += 80;
  }
  
 }
 
 permSprites.push( new Sprite( s.name, currentX, currentY, s.image.width, s.image.height, s.image.src ));
 drawListAdd( permSprites[ permSprites.length - 1 ] );
}

//creates a sprite to go over to the white area, for use in combining
function addTempSprite( s, x, y ) {
 tempSprites.push( new Sprite( s.name, x, y, s.image.width, s.image.height, s.image.src));
 drawList.push( tempSprites[ tempSprites.length - 1 ]);
}

//pass in two sprites, see if they combine
function combine( s1, s2 ) { 
  for( var i = 0; i < recipies.length; i++ ) {
    if( (s1.name == recipies[i].in1.name && s2.name == recipies[i].in2.name) || (s2.name == recipies[i].in1.name && s1.name == recipies[i].in2.name) )  {
      create( recipies[i].out, s1, s2 );
      i = recipies.length;
    }
  }
}

function Recipie(out, in1, in2) {
  this.out = out;
  this.in1 = in1;
  this.in2 = in2;
 }
 
 //creates the first thing, deletes the two inputs
 function create( out, in1, in2 ) {
  addTempSprite( out, (in1.x + in2.x)/2, (in1.y + in2.y)/2 );
  remove( in1 );
  remove( in2 );
  
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
  
  //and since we put a new thing on the field, let's see if it combined with anything
  s = tempSprites[ tempSprites.length - 1 ];
  for( var i = 0; i < tempSprites.length; i++ ) {
   if( s != tempSprites[i] && checkCollision( s, tempSprites[i] ) ) {
    combine( s, tempSprites[i] );
   }
  }
 }
 
 //removes a sprite from tempSprites and then sends it to drawListRemove
 function remove( s ) {
  var index = tempSprites.indexOf( s );
  if (index > -1) {
     tempSprites.splice(index, 1);
  }
  drawListRemove( s );
 }

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

var worldBackground = new Sprite( "worldBack", 0, 0, canvas.width, canvas.height, "./alchemyImages/whitePixel.png");
var tilesBackground = new Sprite( "tilesBack", 0, 0, calculateGrayWidth(), canvas.height, "./alchemyImages/grayPixel.png");
var borderLine = new Sprite( "borderLine", tilesBackground.image.width, 0, 4, canvas.height, "./alchemyImages/blackPixel.png");

gameInit();

function gameInit() {
 
 initRecipies();
 
 drawList.push( worldBackground );
 drawList.push( tilesBackground );
 drawList.push( borderLine );
 
 //these are the elements you start with
 addPermSprite( fireSpr );
 addPermSprite( waterSpr );
 addPermSprite( windSpr );
 addPermSprite( earthSpr );

 setDragMode( "center" );
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

function update() {
 if( isMouseDown() ) { 
  //did we click one of the elements
  for( var i = 0; i < permSprites.length; i++ ) {
   var s = permSprites[ i ];
   if( isMouseOn( s ) ) {
    addTempSprite( s, mouse.x - (s.image.width / 2), mouse.y - (s.image.height / 2));
    setDraggedSprite( tempSprites[ tempSprites.length - 1 ] );
   }
  }
  
  //ok did we click something already on the table
  for( var i = 0; i < tempSprites.length; i++ ) {
   var s = tempSprites[ i ];
   if( s.x < mouse.x && s.x + s.image.width > mouse.x && s.y < mouse.y && s.y + s.image.height > mouse.y ) {
    setDraggedSprite( tempSprites[i] );
   }
  }
 }

 if( isMouseUp() ) {
  //so firstly, did they put it back into the toolbox
  if( checkCollision( draggedSprite, tilesBackground ) || checkCollision( draggedSprite, borderLine ) ) {
   remove( draggedSprite );
  } else {
  //ok they didn't throw it away, now see if it made anything
   for( var i = 0; i < tempSprites.length; i++ ) {
    if( draggedSprite != tempSprites[i] && checkCollision(draggedSprite, tempSprites[i])) {
     combine( draggedSprite, tempSprites[i] );
    }
   }
  }
  setDraggedSprite( null );
 }
}

function draw() {
 //the engine takes care of drawing the drawList and that's all we really care about in this game
}


//this is game code so that the game developer can set the desired loop speed
setInterval(game_loop, 30);