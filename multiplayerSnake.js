class gridCell {
  constructor( x=0, y=0 ) {
   this.x = x;
   this.y = y;
   this.occupied = false;
   this.occupiedBy = null;
   this.count = 0;
  }

  draw( ctx ) {
    if( this.occupied ) {
      ctx.drawImage(this.occupiedBy.img, (gridCellSize+gridCellOutlineSize) * this.x, (gridCellSize+gridCellOutlineSize) * this.y, this.occupiedBy.img.width, this.occupiedBy.img.height);
    }
  }
 }

//how often to update and draw
var DELTA_UPDATE = 150;
var engine = new Engine( document, document.getElementById("canvasName") );
//possible states: waiting, playing
var gameState = "waiting";

//width and height of each cell
var gridCellSize = 32;
//thickness of borders between cells
var gridCellOutlineSize = 1;
//how much room to leave for the text (score)
var textHeight = 31;

var numSnakes = 2;
var snakeHeads = [];
var pizzas = [];
var pizzaTime = 30;

var highScore = 0;
var gameOn = false;

var pizzaSpr = new drawnObject( "pizza", gridCellSize, gridCellSize, 0, 0, "./pizza.png");
var badPizzaSpr = new drawnObject( "bad pizza", gridCellSize, gridCellSize, 0, 0, "./crapPizza.png");
var cactusSpr = new drawnObject( "snake", gridCellSize, gridCellSize, 0, 0, "./cactusSmall.png" );
var doubleFireSpr = new drawnObject( "snake", gridCellSize, gridCellSize, 0, 0, "./doubleFireSmall.png" );

var grid = new Array();
var columns = 0;
var rows = 0;

//add score displays to engine
var scoreTexts = [];

function scoreTextUpdate(){
  this.text = this.string + snakeHeads[this.number].length;
  if( snakeHeads[this.number].length > highScore ) {
    highScore = snakeHeads[this.number].length;
    highScoreText.text = "High Score: " + highScore;
  }
}


var highScoreText = new Text( "High Score: " + highScore, 2 * ( engine.canv.width / 3 ), engine.canv.height - 9 );
//add "click to start game" to engine
var clickToStart = new Text( "Click to start game.", engine.canv.width / 3 + gridCellSize/2, engine.canv.height / 2, "50px Papyrus" );
engine.addObject( clickToStart );
clickToStart.draw = clickToStartDraw;
function clickToStartDraw( ctx ) {
  if( gameState != "waiting" )
    return;
  ctx.font = this.font;
  ctx.fillText( this.text, this.x, this.y );
}
clickToStart.onMouseDown = gameStartHandler;
engine.bindEvents( clickToStart );

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
}

//moves a snake by its x and y change
function snakeUpdate() {
  this.x += this.xChange;
  this.y += this.yChange;

  //what grid cell are we in
  var i = Math.floor( this.x / ( gridCellOutlineSize+gridCellSize ) );
  var j = Math.floor( this.y / ( gridCellOutlineSize+gridCellSize ) );

  //did we got outside the bounds of the universe
  if( i < 0 || i >= grid.length || j < 0 || j >= grid[0].length ) {
    //we went outside the boundaries of the universe
    this.x -= this.xChange;
    this.y -= this.yChange;
    gameOver( this );
  } else {

  //did we move
    if( this.xChange != 0 || this.yChange != 0 ) { 
      //did we hit anything
      if( grid[i][j].occupied == false ) {
        grid[i][j].occupied = true;
        grid[i][j].occupiedBy = this;
        grid[i][j].count = this.length;
        this.body.push( grid[i][j] );
        engine.addObject( grid[i][j] );
        decrementBodyCount( this );
      } else {
        //what did we hit
        if( grid[i][j].occupiedBy.img.src == pizzaSpr.img.src ) {
          //hit a pizza - longify and place a new pizza

          //longify snake by not calling decrement body count
          grid[i][j].occupiedBy = this;
          grid[i][j].count = this.length;
          this.body.push( grid[i][j] );
          this.length++;

          //new pizza
          remove( grid[i][j], pizzas );
          pizzaTimer.count = 1;
        } else if ( grid[i][j].occupiedBy.img.src == this.img.src ) {
          //hit self
          gameOver( this );
        } else if ( grid[i][j].occupiedBy.img.src == badPizzaSpr.img.src ) {
          //hit bad pizza
          decrementBodyCount( this );
          decrementBodyCount( this );

          if( this.length == 1 ) {
            //gameOver( this );
          } else {
            this.length--;
          }

          remove( grid[i][j], pizzas );

          grid[i][j].occupiedBy = this;
          grid[i][j].count = this.length - 1;
          this.body.push( grid[i][j] );

        } else {
          //hit the other snake
          this.x -= this.xChange;
          this.y -= this.yChange;
          gameOver( this );

          for( var q = 0; q < snakeHeads.length; q++ ) {
            if( snakeHeads[q].img.src == grid[i][j].occupiedBy.img.src ) {
              gameOver( snakeHeads[q] );
            }
          }

        }
      }
    }

  }

  //move snake tail around
}

//decrements the counts of all body squares by 1
function decrementBodyCount( o ) {
  for( var i = o.body.length - 1; i >= 0; i-- ) {
    o.body[i].count--;
    if( o.body[i].count < 0 ) {
      o.body[i].count = 0;
      engine.removeObject( o.body[i] );
      o.body[i].occupied = false;
      o.body[i].occupiedBy = null;
      o.body.splice( i, 1 );
    }
  }
}

//kills a snake
function gameOver( o ) {
  engine.unbindEvents( o );
  o.xChange = 0;
  o.yChange = 0;
  o.update = null;
  o.playing = false;

  //are all the snakes done for
  var notOver = false;
  for( var i = 0; i < snakeHeads.length; i++ ) {
    notOver = notOver || snakeHeads[i].playing;
  }
  if( notOver == false ) {
    gameState = "waiting";
    engine.removeObject( clickToStart );
    engine.addObject( clickToStart );
    engine.bindEvents( clickToStart );
  }
}

//move snake up
function moveUp( e, obj ) {
  //if we are not moving vertically
  if( obj.yChange == 0 ) {
    obj.yChange = -1 * (gridCellSize + gridCellOutlineSize);
    obj.xChange = 0;
  }
}

//move snake down
function moveDown( e, obj ) {
  //if we are not moving vertically
  if( obj.yChange == 0 ) {
    obj.yChange = gridCellSize + gridCellOutlineSize;
    obj.xChange = 0;
  }
}

//move snake left
function moveLeft( e, obj ) {
  //if we are not moving vertically
  if( obj.xChange == 0 ) {
    obj.xChange = -1 * (gridCellSize + gridCellOutlineSize);
    obj.yChange = 0;
  }
}

//move snake right
function moveRight( e, obj ) {
  //if we are not moving vertically
  if( obj.xChange == 0 ) {
    obj.xChange = gridCellSize + gridCellOutlineSize;
    obj.yChange = 0;
  }
}

//randomly places the thing on the grid in an unobstructed spot
function randomlyPlace( o ) {
  var x = Math.floor( Math.random() * columns );
  var y = Math.floor( Math.random() * rows );
  
  while( grid[x][y].occupied == true ) {
    x = Math.floor( Math.random() * columns );
    y = Math.floor( Math.random() * rows );
  }

  grid[x][y].occupied = true;
  grid[x][y].occupiedBy = o;
  o.x = x * (gridCellOutlineSize+gridCellSize) + o.img.width/2 - 1;
  o.y = y * (gridCellOutlineSize+gridCellSize) + o.img.height/2 - 1;
}

//randomly places a pizza in an unoccupied space
function newPizza() {
  randomlyPlace( pizzaSpr );
  var i = Math.floor( pizzaSpr.x / ( gridCellOutlineSize+gridCellSize ) );
  var j = Math.floor( pizzaSpr.y / ( gridCellOutlineSize+gridCellSize ) );
  pizzas.push( grid[i][j] );
  engine.addObject( grid[i][j] );
}

function pizzaGod() {
  if( gameState == "playing" ) {
    this.count--;
    if( this.count == 0 ) {
      this.count = pizzaTime;
      if( pizzas.length > 0 ) {
        pizzas[ pizzas.length - 1 ].occupiedBy = badPizzaSpr;
      }
      newPizza();
    }
  }
}

initGrid();

var pizzaTimer = new drawnObject( "pizzaTimer", 0, 0, -50, -50, pizzaSpr.img.src );
engine.addObject( pizzaTimer );
pizzaTimer.update = pizzaGod;
pizzaTimer.count = pizzaTime;
pizzaTimer.draw = doNothing;

function doNothing( ctx ) {

}

function newGame() {

  newPizza();
  
  for( var i = 0; i < numSnakes; i++ ) {
    scoreTexts[i] = new Text( "Score " + (i+1) + ": 1", i * ( engine.canv.width / 3 ), engine.canv.height - 9 );
    scoreTexts[i].number = i;
    scoreTexts[i].string = "Score " + (i+1) + ": ";
    scoreTexts[i].update = scoreTextUpdate;
    engine.addObject( scoreTexts[i] );
  }
  engine.addObject( highScoreText );

  //place and set up snake heads
  for( var i = 0; i < numSnakes; i++ ) {
    snakeHeads[i] = new drawnObject( "snake " + i, gridCellSize, gridCellSize, 0, 0, cactusSpr.img.src );
    snakeHeads[i].xChange = 0;
    snakeHeads[i].yChange = 0;
    snakeHeads[i].number = i;
    snakeHeads[i].length = 1;
    snakeHeads[i].update = snakeUpdate;
    snakeHeads[i].body = [];
    snakeHeads[i].playing = true;
    randomlyPlace( snakeHeads[i] );
    //this disaster here pushes the cell the snake starts in
    snakeHeads[i].body.push( grid[ Math.floor( snakeHeads[i].x / ( gridCellOutlineSize+gridCellSize ) ) ][ Math.floor( snakeHeads[i].y / ( gridCellOutlineSize+gridCellSize ) ) ] );
    engine.addObject( snakeHeads[i] );
    engine.addObject( snakeHeads[i].body[0] );
  }

  //hardcoded controls
  if( numSnakes >= 1 ) {
    snakeHeads[0].onKeyDown["arrowup"] = moveUp;
    snakeHeads[0].onKeyDown["arrowdown"] = moveDown;
    snakeHeads[0].onKeyDown["arrowleft"] = moveLeft;
    snakeHeads[0].onKeyDown["arrowright"] = moveRight;
    engine.bindEvents( snakeHeads[0] );
  }
  if( numSnakes >= 2 ) {
    snakeHeads[1].onKeyDown["w"] = moveUp;
    snakeHeads[1].onKeyDown["s"] = moveDown;
    snakeHeads[1].onKeyDown["a"] = moveLeft;
    snakeHeads[1].onKeyDown["d"] = moveRight;
    snakeHeads[1].img.src = doubleFireSpr.img.src;
    engine.bindEvents( snakeHeads[1] );
  }
}

//newGame();

function gameStartHandler() {
  if( gameState == "waiting" ) {
    
    for( var i = 0; i < grid.length; i++ ) {
      for( var j = 0; j < grid[0].length; j++ ) {
        engine.removeObject( grid[i][j] );
        grid[i][j].occupied = false;
      }
    }

    for( var i = 0; i < snakeHeads.length; i++ ) {
      engine.removeObject( snakeHeads[i] );
    }

    for( var i = 0; i < pizzas.length; i++ ) {
      engine.removeObject( pizzas[i] );
    }

    for( var i = 0; i < scoreTexts.length; i++ ) {
      engine.removeObject( scoreTexts[i] );
    }

    engine.removeObject( highScoreText );

    newGame();
    gameState = "playing";
  }
}

engine.start( DELTA_UPDATE );

