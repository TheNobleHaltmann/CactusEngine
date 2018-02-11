//how often to update and draw
var DELTA_UPDATE = 150;

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

var engine = new Engine( document, document.getElementById("canvasName") );
engine.background = "./alchemyImages/whitePixel.png";

var mouseDown = false;
var arrowLeftDown = false;
var arrowRightDown = false;
var arrowUpDown = false;
var arrowDownDown = false;
var s = new Sprite( "pizza", 0, 0, gridCellSize, gridCellSize, "./pizza.png");
s.onMouseDown = setMouseDown;
s.onKeyDown["arrowdown"] = setKeyDown;
s.onKeyDown["arrowup"] = setKeyDown;
s.onKeyDown["arrowleft"] = setKeyDown;
s.onKeyDown["arrowright"] = setKeyDown;
s.update = update;
engine.addObject( s );

function setMouseDown( e ) {
  mouseDown = true;
}

function isMouseDown() {
  var bob = mouseDown;
  mouseDown = false;
  return bob;
}

function setKeyDown( e ) {
  var s = e.key.toLowerCase();
  if( s == "arrowleft" ) {
    arrowLeftDown = true;
  }
  if( s == "arrowright" ) {
    arrowRightDown = true;
  }
  if( s == "arrowup" ) {
    arrowUpDown = true;
  }
  if( s == "arrowdown" ) {
    arrowDownDown = true;
  }
}

function isKeyDown( s ) {
  if( s == "arrowleft" ) {
    var bob = arrowLeftDown;
    arrowLeftDown = false;
    return bob;
  }
  if( s == "arrowright" ) {
    var bob = arrowRightDown;
    arrowRightDown = false;
    return bob;
  }
  if( s == "arrowup" ) {
    var bob = arrowUpDown;
    arrowUpDown = false;
    return bob;
  }
  if( s == "arrowdown" ) {
    var bob = arrowDownDown;
    arrowDownDown = false;
    return bob;
  }
}

//width and height of each cell
var gridCellSize = 32;
//thickness of borders between cells
var gridCellOutlineSize = 1;
//how much room to leave for the text (score)
var textHeight = 31;

var grid = new Array();
var columns = 0;
var rows = 0;
initGrid();

var snakeLength = 1;
var snakeHead = null;
var bodyParts = new Array();
var pizzas = new Array();

var score = 0;
var highscore = 0;
var gameOn = false;

var pizzaSpr = new Sprite( "pizza", 0, 0, gridCellSize, gridCellSize, "./pizza.png");
var badPizzaSpr = new Sprite( "bad pizza", 0, 0, gridCellSize, gridCellSize, "./crapPizza.png");

//initializes the grid based on the canvas size
function initGrid() {
  columns = Math.ceil( engine.canv.width / (gridCellSize+gridCellOutlineSize) );
  rows = Math.ceil( (engine.canv.height-textHeight) / (gridCellSize+gridCellOutlineSize) );
  for(var x=0; x<columns; x++) {
	  grid[x] = [];
	  for(var y=0; y<rows; y++) {
		  grid[x][y] = new gridCell(x,y);
	  }
  }
  //grid = new Array( columns ).fill( new Array( rows ).fill( new gridCell() ) );
}

//initializes a new game of snake
function newGame() {
  score = 0;
  remove( snakeHead, engine.objects );
  snakeHead = new head();
  engine.addObject( snakeHead );
  
  for( var i = 0; i < columns; i++ ) {
    for( var j = 0; j < rows; j++ ) {
      clearCell( grid[i][j] );
    }
  }

  isKeyDown( "arrowdown" )
  isKeyDown( "arrowup" )
  isKeyDown( "arrowleft" )
  isKeyDown( "arrowright" )

  var cell = getGridCell( snakeHead );
  //putSnakeInCell( cell );

  newPizza();

  snakeLength = 1;
  bodyParts = new Array();

  gameOn = true;
}

//represents a single cell of the grid
//knows if it has something in it and, if so, what the thing in it is
function gridCell(x,y) {
 this.x = x;
 this.y = y;
 this.occupied = false;
 this.occupiedBy = null;
 this.snakeCount = 0;

}

//reduces the snakeCount of grid cells, if the snake count is 0 it stops drawing the tail in that cell annd stops being occupied
function decrementSnakeCount( c ) {
  c.snakeCount--;
  if( c.snakeCount <= 0 ) {
	if( c.occupiedBy != null && c.occupiedBy.name == "pizza" ) {
		//console.log(c);
		remove( c.occupiedBy, engine.objects );
		c.occupiedBy = new Sprite( "badPizza", c.x*33, c.y*33, gridCellSize, gridCellSize, "./crapPizza.png");
		engine.addObject( c.occupiedBy );
		newPizza();
	} else {
		clearCell( c );
	}
	return true;
  }
  return false;
}

//emptys a cell
function clearCell( c ) {
  c.occupied = false;
  remove( c.occupiedBy, engine.objects );
  c.occupiedBy = null;
  c.snakeCount = 0;
}

//plops a pizza somewhere that isn't already occupied by a pizza or by the snake
function newPizza() {
 var x = Math.floor( Math.random() * columns );
 var y = Math.floor( Math.random() * rows );
 
 //console.log( x + " " + y );
 if( grid[x][y].occupied == false ) {
  grid[x][y].occupied = true;
  grid[x][y].occupiedBy = new Sprite( "pizza", x*33, y*33, gridCellSize, gridCellSize, "./pizza.png");
  // Kinda hacky spoiled pizza option
  pizzas.push(grid[x][y]);
  grid[x][y].snakeCount = 40;
  engine.addObject( grid[x][y].occupiedBy );
 } else {
  //picked a cell that was already occupied, try again
  newPizza();
 }
}

//knows important things about the head of the snake
//works as a sprite so it can be added to drawList
class head {
  constructor() {
   this.x = Math.ceil(columns/2) * (gridCellSize+gridCellOutlineSize) ;
   this.y = Math.ceil(rows/2) * (gridCellSize+gridCellOutlineSize) ;
   this.xChange = 0;
   this.yChange = 0;
   this.isMoving = false;
  
   this.image = new Image();
   this.image.width = gridCellSize;
   this.image.height = gridCellSize;
   this.image.src = "./cactusSmall.png";
  }

  draw( ctx ) {
    ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
  }
}

function putSnakeInCell( cell ) {
  cell.occupied = true;
  cell.occupiedBy = new Sprite( "snake", snakeHead.x, snakeHead.y, gridCellSize, gridCellSize, "./cactusSmall.png");
  engine.addObject( cell.occupiedBy );
  cell.snakeCount = snakeLength+1;
  bodyParts.push( cell );
}

function update() {

 //if the game is currently not running, wait for a click to start the game
 //if the game is currently running, do the game updatey stuff
 if( gameOn == false ) {
  if( isMouseDown() ) {
    newGame();
  } 
 } else {

  //check this to reset the value
  isMouseDown();

  //movement
  if( isKeyDown( "arrowdown" ) && snakeHead.yChange == 0 ) {
   snakeHead.xChange = 0;
   snakeHead.yChange = gridCellSize+gridCellOutlineSize;
   snakeHead.isMoving = true;
  }
  
  if( isKeyDown( "arrowup" ) && snakeHead.yChange == 0 ) {
   snakeHead.xChange = 0;
   snakeHead.yChange = -(gridCellSize+gridCellOutlineSize);
   snakeHead.isMoving = true;
  }
  
  if( isKeyDown( "arrowleft" ) && snakeHead.xChange == 0 ) {
   snakeHead.yChange = 0;
   snakeHead.xChange = -(gridCellSize+gridCellOutlineSize);
   snakeHead.isMoving = true;
  }
  
  if( isKeyDown( "arrowright" ) && snakeHead.xChange == 0 ) {
   snakeHead.yChange = 0;
   snakeHead.xChange = gridCellSize+gridCellOutlineSize;
   snakeHead.isMoving = true;
  }
  
  snakeHead.x += snakeHead.xChange;
  snakeHead.y += snakeHead.yChange;
   
  //can't run into anything if we haven't started moving yet
  if( snakeHead.isMoving ) {

    //did we run into something
   var cell = getGridCell( snakeHead );

   if( cell == null ) {
    return;
   }
   
   if( cell.occupied ) {
     //was it a snake, pizza, or badPizza?

     //occupied by snake
     if( cell.occupiedBy.name == "snake" ) {
      lose();
      //don't want to continue the update method since the game ended anyway
      return;
      //occupied by pizza
     } else if ( cell.occupiedBy.name == "pizza" ) {
       score++;
       if( score > highscore){
           highscore = score;
           highScoreText.text = "High Score: " + highscore;
       }
	   //Remove pizza from pizza decrementation
	   var index = pizzas.indexOf( cell );
	   if( index >= 0 ) {
		 pizzas.splice(index,1);
	   }
	   
       snakeLength++;
       clearCell( cell );
       newPizza();
       //increase the snakeCount of all currently on-screen body parts
       for( var i = 0; i < bodyParts.length; i++ ) {
         bodyParts[i].snakeCount++;
       }
	   
     } else if ( cell.occupiedBy.name == "badPizza" ) {
	   if( score > 0 ) {
		 score--;
         snakeLength--;
	   }
       clearCell( cell );
       //increase the snakeCount of all currently on-screen body parts
       for( var i = 0; i < bodyParts.length-1; i++ ) {
         bodyParts[i].snakeCount--;
       }
     }

   }

   putSnakeInCell( cell );

  }

  for( var i = 0; i < bodyParts.length; i++ ) {
    if(decrementSnakeCount( bodyParts[i] )) {
      bodyParts.splice( i, 1 );
	  i--;
	  //console.log(bodyParts);
	}
  }

  for( var i = 0; i < pizzas.length; i++ ) {
   if(decrementSnakeCount( pizzas[i] )) {
      pizzas.splice( i, 1 );
	  i--;
	  //console.log(pizza);
	}
  }
 }
}

function getGridCell( s ) {
 var x = Math.ceil(s.x/(gridCellSize+gridCellOutlineSize));
 var y = Math.ceil(s.y/(gridCellSize+gridCellOutlineSize));
 if( x < 0 || x >= columns || y < 0 || y >= rows ) {
  snakeHead.x -= snakeHead.xChange;
  snakeHead.y -= snakeHead.yChange;
  lose();
  return null;
 }
 return grid[x][y];
}

//makes the game stop updating and displays the "click to begin" message again, but doesn't clear the score
function lose() {
 gameOn = false;
}

function draw() { 
 //draw the vertical gridlines
 /*for( var i = gridCellSize; i < engine.canv.width; i+=(gridCellSize+gridCellOutlineSize) ) {
  engine.ctx.fillRect( i, 0, gridCellOutlineSize, engine.canv.height-textHeight );
 }
 //draw the sideways gridlines
 for( var i = gridCellSize; i < engine.canv.height; i+=(gridCellSize+gridCellOutlineSize) ) {
  engine.ctx.fillRect( 0, i, engine.canv.width, gridCellOutlineSize );
 }*/

 //tell the player to click to start the game
 if( gameOn == false ) {
  engine.ctx.font = "20px Papyrus";
  //these random numbers are to make the text appear in the lower right
  engine.ctx.fillText("Click to start game.",engine.canv.width - 180,engine.canv.height-9);

 }
/*
 //write the score
 engine.ctx.font = "20px Papyrus";
 engine.ctx.fillText("Score: " + score, 0, engine.canv.height - 9);
 engine.ctx.fillText("High Score: " + highscore, 300, engine.canv.height - 9);*/
}

//add vertical lines to engine
for( var i = gridCellSize; i < engine.canv.width; i+=(gridCellSize+gridCellOutlineSize) ) {
  var vertLine = new Line( i, 0, i, engine.canv.height-textHeight );
  engine.addObject( vertLine );
}
//add horizontal lines to engine
for( var i = gridCellSize; i < engine.canv.height; i+=(gridCellSize+gridCellOutlineSize) ) {
  var horizLine = new Line( 0, i, engine.canv.width, i );
  engine.addObject( horizLine );
}
//add score display to engine
var scoreText = new Text( "Score: 0", 0, engine.canv.height - 9 );
scoreText.update = scoreTextUpdate;
function scoreTextUpdate(){
  scoreText.text = "Score: " + score;
}
engine.addObject( scoreText );
//add high score display
var highScoreText = new Text( "High Score: 0", 300, engine.canv.height - 9 );
engine.addObject( highScoreText );
//add "click to start game" to engine
var clickToStart = new Text( "Click to start game.", engine.canv.width - 180, engine.canv.height - 9 );
clickToStart.draw = clickToStartDraw;
function clickToStartDraw( ctx ) {
  if( gameOn )
    return;
  ctx.font = this.font;
  ctx.fillText( this.text, this.x, this.y );
}
engine.addObject( clickToStart );


//this is game code so that the game developer can set the desired loop speed
//setInterval(game_loop, 150);

engine.start( DELTA_UPDATE );