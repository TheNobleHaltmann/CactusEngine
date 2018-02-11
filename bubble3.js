/* just thinking out loud here
each bubble is 32 pixels wide
let's give 1 pixel of room on each side
and how about 15-16 bubbles per row
the game area width should be (1 + 32 + 1) * (16)
which is 544 wide
i don't think we need a side display, but the bottom should have score and stuff
how about 15 rows down + some room for text
snake used 31 pixels for text and that worked pretty good
height should be 34*15 + 31 = 541
at that rate let's just make it a square and the text gets a 34 tall box*/

var engine = new Engine( document, document.getElementById("canvasName") );
engine.background = "./alchemyImages/whitePixel.png";

//CONSTANTS
//how often to update and draw
var DELTA_UPDATE = 30;
//each bubble has a width and heighth of 32 pixels
var BUBBLE_SIZE = 32;
//how much space between bubbles horizontally
var HORIZ_CLEARANCE = 2;
//how much space between bubbles vertically
var VERT_CLEARANCE = 0;
//the dimensions and source of the logo
var LOGO_WIDTH = 272;
var LOGO_HEIGHT = 128;
var LOGO_SOURCE = "./bubbleImages/logo.png";
var LOSE_SOURCE = "./bubbleImages/youLose.png";
//how many rows and columns should the playfield have
//for columns, put the larger number here - rows above and below will have one less bubble
var COLUMNS = 16;
var ROWS = 15;
//how many rows should start filled in
var STARTING_ROWS = 5;
//how many shots do you get before a new line appears
var SHOTS = 5;
//how long should the guideline be
var GUIDELINE_LENGTH = 150;
//use to tweak how fast the bubbles go
var BUBBLE_SPEED = 8;
//how many points per bubble popped
var SCORE_INCREMENT = 10;

//null bubbles fill all the slots of the grid that aren't occupied by bubbles
//their type is -1, do not draw an image, and do not collide with other bubbles
class NullBubble {
  constructor( centerX, centerY, row = -1, col = -1 ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = BUBBLE_SIZE/2;
    this.type = -1;

    this.row = row;
    this.col = col;
  }
}

//this class defines one of the matchable bubbles
//each bubble knows its own X and Y coordinates for drawing, and its own array position for calculations
//each bubble also knows what type it is, represented by an integer value
class Bubble {
  constructor( centerX, centerY, type, row = -1, col = -1 ) {
   this.centerX = centerX;
   this.centerY = centerY;
   this.radius = BUBBLE_SIZE / 2;
   this.type = type;

   this.row = row;
   this.col = col;

   this.image = new Image();
   this.image.width = BUBBLE_SIZE;
   this.image.height = BUBBLE_SIZE;
   this.image.src = bubbleImages[type];
 
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
    ctx.drawImage(this.image, this.centerX - this.radius, this.centerY - this.radius, this.image.width, this.image.height);
  }

  setType( type ) {
    this.type = type;
    this.image.src = bubbleImages[type];
  }
}

class Sprite {
  constructor( x, y, width, height, src ) {
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

class HexGrid {
  //columns is the larger number the value can have
  constructor( rows, columns, cellSize, horizOffset, vertOffset ) {
    this.rows = rows;
    this.columns = columns;
    this.cellSize = cellSize;
    this.horizOffset = horizOffset;
    this.vertOffset = vertOffset;

    this.grid = new Array();
  }

  initGrid() {

    var currentX = this.cellSize/2 + this.horizOffset/2;
    var currentY = this.cellSize/2 + this.vertOffset + 1;

    for( var i = 0; i < this.rows; i++ ) {
      this.grid[i] = [];
      for( var j = 0; j < this.columns - Math.round( i % 2 ); j++ ) {
        if( i < STARTING_ROWS ) {
          //put a real bubble here
          this.grid[i][j] = new Bubble( currentX, currentY, rand( 0, bubbleImages.length ), i, j );
          engine.addObject( this.grid[i][j] );
        } else {
          //this will just remember the coordinates
          this.grid[i][j] = new NullBubble( currentX, currentY, i, j );
        }

        currentX += this.cellSize + this.horizOffset;
      }

      if( Math.round( i % 2 ) == 0 ) {
        //just did a long row, now do a short row
        currentX = this.cellSize + this.horizOffset/2;
      } else {
        //just did a short row, now do a long row
        currentX = this.cellSize/2 + this.horizOffset/2;
      }
      currentY += this.cellSize + this.vertOffset;
    }

  }

  //puts the given bubble into the grid at nearest open slot
  //checks if the bubble made any 3+es, deletes if so
  //otherwise decreases the shotCounter
  addBubble( bub, row, col ) {
    bub.update = null;
    if( this.grid[row][col].type != -1 ) {
      //this space was already occupied
      //therefore this must be at the very bottom of the screen
      gameOver();
      return;
    }
    bub.centerX = this.grid[row][col].centerX;
    bub.centerY = this.grid[row][col].centerY;
    bub.row = row;
    bub.col = col;
    this.grid[row][col] = bub;

    activeBubble = new Bubble( engine.canv.width/2, engine.canv.height - BUBBLE_SIZE/2 - VERT_CLEARANCE, nextBubble.type );
    activeBubble.onMouseDown = shootBubble;
    engine.addObject( activeBubble );
    engine.bindEvents( activeBubble );

    nextBubble.setType( rand( 0, bubbleImages.length ) );
    //console.log( "row: " + row + " col: " + col );

    //now: pop bubbles or don't
    //if don't pop any bubbles, decrement shots remaining
    //if shots remaining = 0, increase it to SHOTS and add a new row of bubbles at the top
    var arr = this.getAdjacent( row, col );
    var typeMatch = 0;
    var touchingIndex = -1;
    for( var i = 0; i < arr.length; i++ ) {
      if( bub.type == arr[i].type ) {
        //bubbles match
        typeMatch++;
        touchingIndex = i;
      }
    }

    if( typeMatch == 0 ) {
      //no matching bubbles at all
      decrementShots();
      } else if ( typeMatch >= 2 ) {
        //hit at least two other same type bubbles
        this.popBubbles(bub);
      } else {
        //only one match
        var arr2 = this.getAdjacent( arr[touchingIndex].row, arr[touchingIndex].col );
        typeMatch = 0;
        for( var i = 0; i < arr2.length; i++ ) {
          if( arr[touchingIndex].type == arr2[i].type ) {
            typeMatch++;
          }
        }
        if( typeMatch < 2 ) {
          //only two bubbles n this chain
          decrementShots();
        } else {
          //more than two bubbles in chain
          this.popBubbles( arr[touchingIndex] );
        }
      }
    }
    

  //pops the bubble in the provided grid cell and then uses arrays and stuff pop all touching bubbles of the same type
  popBubbles( b ) {
    var t = b.type;
    var todo = new Array();
    todo.push( b );
    while( todo.length > 0 ) {
      //get first thing to do
      var b = todo.shift();
      //pop the bubble
      this.grid[b.row][b.col] = new NullBubble( b.centerX, b.centerY, b.row, b.col );
      score += SCORE_INCREMENT;
      engine.removeObject( b );
      //find the bubble's friends and add them to the array
      var adj = this.getAdjacent( b.row, b.col );
      for( var i = 0; i < adj.length; i++ ) {
        if( adj[i].type == t ) {
          adj[i].type = -2;
          todo.push( adj[i] );
        }
      }

    }
  }


  //adds a new randomly generated row of bubbles to the top of the grid
  //also checks for game overs when pushing other rows down
  addNewRow() {

    //first check if bottom row is empty
    for( var i = 0; i < this.grid[this.rows-1].length; i++ ) {
      if( this.grid[this.rows-1][i].type != -1 ) {
        //there is a real bubble on the bottom row
        gameOver();
        return;
      }
    }
    this.grid.pop();

    //increment y position of all bubbles
    for( var i = 0; i < this.grid.length; i++ ) {
      for( var j = 0; j < this.grid[i].length; j++ ) {
        this.grid[i][j].centerY += this.cellSize + this.vertOffset;
        this.grid[i][j].row += 1;
      }
    }

    if( this.grid[0].length == this.columns ) {
      //top row is a long row, new top should be a short row

      var currentX = this.cellSize + this.horizOffset/2;
      var currentY = this.cellSize/2 + this.vertOffset + 1;

      var r = new Array();
      for( var i = 0; i < this.columns - 1; i++ ) {
        var debob = new Bubble( currentX, currentY, rand( 0, bubbleImages.length ), 0, i );
        engine.addObject( debob );
        r.push( debob );
        currentX += this.cellSize + this.horizOffset;
      }

      this.grid.unshift( r );
    } else {
      //top row is short, need a long row
      var currentX = this.cellSize/2 + this.horizOffset/2;
      var currentY = this.cellSize/2 + this.vertOffset + 1;

      var r = new Array();
      for( var i = 0; i < this.columns; i++ ) {
        var debob = new Bubble( currentX, currentY, rand( 0, bubbleImages.length ), 0, i );
        engine.addObject( debob );
        r.push( debob );
        currentX += this.cellSize + this.horizOffset;
      }

      this.grid.unshift( r );
    }
  }

  //sees if the bubble is hitting another bubble in the grid
  //using the magic of the grid it only checks the slot the bubble is in and the surrounding 6 slots
  checkCollision( bub ) {
    //first find out which grid cell the bubble is mostly in
    var rowHeight = this.cellSize + this.vertOffset;
    var gridRow = Math.floor( bub.centerY / rowHeight );
    if( gridRow < 0 ) {
      gridRow = 0;
    } else if ( gridRow >= this.rows ) {
      gridRow = this.rows - 1;
    }

    var colWidth = this.cellSize + this.horizOffset;
    var gridCol = 0;

    if( this.grid[gridRow].length == this.columns ) {
      //long row, don't need to adjust for space on left side
      gridCol = Math.floor( bub.centerX / colWidth );
    } else {
      //short row, need to adjust for space on left side
      gridCol = Math.floor( (bub.centerX-colWidth/2) / colWidth );
    }

    if( gridCol < 0 ) {
      gridCol = 0;
    } else if ( gridCol >= this.grid[gridRow].length ) {
      gridCol = this.grid[gridRow].length - 1;
    }
    
    //first check if we hit the back wall.  if we did, stop the bubble
    if( bub.centerY - bub.radius <= 0 ) {
      //hit back wall
      console.log( "back wall" );
      console.log( "row: " + gridRow + " col: " + gridCol );
      this.addBubble( bub, gridRow, gridCol );
      return;
    }

    if( this.grid[gridRow][gridCol].type != -1 ) {
      //then we're inside another bubble
      //which means yes we collided
      console.log( "inside bubble" );
      console.log( "row: " + gridRow + " col: " + gridCol );
      this.addBubble( bub, gridRow, gridCol );
      return;
    } else { 
      //well we're not on top of anything but we should check the adjacent cells
      var adj = this.getAdjacent( gridRow, gridCol );
      for( var i = 0; i < adj.length; i++ ) {
        if( adj[i].type != -1 ) {
          //real bubble in that slot, are they touching
          if( distance( bub.centerX, bub.centerY, adj[i].centerX, adj[i].centerY ) <= bub.radius + adj[i].radius ) {
            //collison confirmed
            console.log( "adjacent bubble" );
            console.log( "row: " + gridRow + " col: " + gridCol );
            this.addBubble( bub, gridRow, gridCol );
            return;
          }
        }
      }
      //we got through the array without any collisions
      //means that the bubble hasn't stopped yet
    }

  }

  //returns an array of the stuff in adjacent cells
  getAdjacent( row, col ) {
    var adj = new Array();
    //thing on left side
    if( col - 1 >= 0 ) {
      adj.push( this.grid[row][col-1] );
    }
    
    //thing on right side
    if( col + 1 < this.grid[row].length ) {
      adj.push( this.grid[row][col+1] );
    }

    //so for up and down we need to know if we're on a long row or not
    if( this.grid[row].length == this.columns ) {
      //long row
      
      //check spots below
      if( row + 1 < this.rows ) {
        //row below this one exists
        if( col < this.grid[row+1].length ) {
          //spot down and right exists
          adj.push( this.grid[row+1][col] );
        }

        if( col - 1 >= 0 ) {
          //spot down and left exists
          adj.push( this.grid[row+1][col-1] );
        }
      }

      //check spots above
      if( row - 1 >= 0 ) {
        //row above this one exists
        if( col - 1 >= 0 ) {
          //spot up and left exists
          adj.push( this.grid[row-1][col-1] );
        }

        if( col < this.grid[row-1].length ) {
          //spot up and right exists
          adj.push( this.grid[row-1][col] );
        }
      }

    } else {
      //short row

      //check spots below
      if( row + 1 < this.rows ) {
        //if the row exists both spots have to exist since this row is shorter
        adj.push( this.grid[row+1][col] );
        adj.push( this.grid[row+1][col+1] );
      }

      //check spots above
      if( row - 1 >= 0 ) {
        //if the row exists both spots have to exist since this row is shorter
        adj.push( this.grid[row-1][col] );
        adj.push( this.grid[row-1][col+1] );
      }
    }
    return adj;
  }

  clearAllRows() {
    for( var i = 0; i < this.grid.length; i++ ) {
      for( var j = 0; j < this.grid[i].length; j++ ) {
        engine.removeObject( this.grid[i][j] );
      }
    }
    engine.removeObject( activeBubble );
  }
}

//------------------------------------------------------------------------------------------------------------------------------------------
//end classes and stuff

//the images what go in the bubbles
var bubbleImages = new Array();
bubbleImages.push("./bubbleImages/brownBrick.png");
bubbleImages.push("./bubbleImages/cactus.png");
bubbleImages.push("./bubbleImages/cloud.png");
bubbleImages.push("./bubbleImages/doubleFire.png");
bubbleImages.push("./bubbleImages/sun.png");
bubbleImages.push("./bubbleImages/water.png");

//decreases shots remaining or adds new row if no shots remain
function decrementShots() {
  shotsRemaining -= 1;
  if( shotsRemaining == 0 ) {
    shotsRemaining = SHOTS;
    hexGrid.addNewRow();
  }
}

//this function returns the distance between two points
function distance( x1, y1, x2, y2 ) {
  return Math.sqrt( Math.pow( x1 - x2, 2) + Math.pow( y1 - y2, 2 ) );
}

//this function generates a random number between the given parameters, including the first but not the second
function rand( low, high ) {
  var r = Math.floor( Math.random() * ( high - low ) ) + low;
  if ( r == high ) {
    r = r - 1;
  }
  return r;
}

//this function does nothing, it's used so the engine doesn't draw stuff i don't care about
function emptyFunction() {

}

//possible values: "start" (game just started), "play" (game is in play) and "over" (game is overed)
var gameState = "start";

//how many shots you get before a new row is added
var shotsRemaining = SHOTS;

//increases by 1 per bubble popped
var score = 0;
//this will write out the score or other messages
var scoreText = new Text( "Click to start!", 2, engine.canv.height - 8 );
engine.addObject( scoreText );

//this line separates the score from the play area
var scoreLine = new Line( 0, engine.canv.height - BUBBLE_SIZE*1.5 - VERT_CLEARANCE, engine.canv.width, engine.canv.height - BUBBLE_SIZE*1.5 - VERT_CLEARANCE );
engine.addObject( scoreLine );

//this will keep track of all the bubbles
var hexGrid = new HexGrid( ROWS, COLUMNS, BUBBLE_SIZE, HORIZ_CLEARANCE, VERT_CLEARANCE );

startGameListener = new Sprite( engine.canv.width/2 - LOGO_WIDTH/2, engine.canv.height/2 - LOGO_HEIGHT/2, LOGO_WIDTH, LOGO_HEIGHT, LOGO_SOURCE );
startGameListener.onMouseUp = newGame;
engine.addObject( startGameListener );
engine.bindEvents( startGameListener );

//the bubble that will be fired
var activeBubble = new Bubble( 0, 0, 0 );
//this bubble will show you what you're going to get next
var nextBubble = new Bubble( 0, 0, 0 );
//the line what tells you where you're aiming
var guideLine = new Line( 0, 0, 0, 0 );
//the direction the activeBubble is moving
var xChange = 0;
var yChange = 0;

var firstGame = true;

//this function clears out everything from any old games and creates everything to start a new game
function newGame() {
  //the game is now playing
  gameState = "play";

  //get rid of the startGameListener
  engine.removeObject( startGameListener );

  //if this is a reset we need a fresh grid
  if( firstGame == false ) {
    hexGrid.clearAllRows();
  }

  //initialize variables for the new game
  score = 0;
  scoreText.text = "Score: " + score;
  scoreText.update = updateScore;

  hexGrid = new HexGrid( ROWS, COLUMNS, BUBBLE_SIZE, HORIZ_CLEARANCE, VERT_CLEARANCE );
  hexGrid.initGrid();

  guideLine = new Line( engine.canv.width/2, engine.canv.height - BUBBLE_SIZE/2 - VERT_CLEARANCE, engine.canv.width/2, engine.canv.height - BUBBLE_SIZE/2 - VERT_CLEARANCE - GUIDELINE_LENGTH );
  guideLine.onMouseMove = guideLineAim;
  engine.addObject( guideLine );
  engine.bindEvents( guideLine );
  nextBubble = new Bubble( engine.canv.width - BUBBLE_SIZE/2 - HORIZ_CLEARANCE, engine.canv.height - BUBBLE_SIZE/2 - VERT_CLEARANCE, rand(0, bubbleImages.length ) );
  engine.addObject( nextBubble );
  activeBubble = new Bubble( engine.canv.width/2, engine.canv.height - BUBBLE_SIZE/2 - VERT_CLEARANCE, rand(0, bubbleImages.length) );
  activeBubble.onMouseDown = shootBubble;
  engine.addObject( activeBubble );
  engine.bindEvents( activeBubble );

  firstGame = false;

}

//ends the game
function gameOver() {
  gameState = "over";
  activeBubble.update = null;
  engine.removeObject( guideLine );

  startGameListener = new Sprite( engine.canv.width/2 - LOGO_WIDTH/2, engine.canv.height/2 - LOGO_HEIGHT/2, LOGO_WIDTH, LOGO_HEIGHT, LOSE_SOURCE );
  startGameListener.onMouseDown = newGame;
  engine.addObject( startGameListener );
  engine.bindEvents( startGameListener );

}

//updates the score displayed by the scoreText
function updateScore() {
  this.text = "Score: " + score;
}

//makes guide line point at mouse
function guideLineAim( e ) {
  if( e.clientY < this.baseY ) {
    this.endX = e.clientX;
    this.endY = e.clientY;
  }
}

//makes bubble fire when mouse clicked
function shootBubble( e ) {
 xChange = ( guideLine.endX - guideLine.baseX ) / guideLine.length() * BUBBLE_SPEED;
 yChange = ( guideLine.endY - guideLine.baseY ) / guideLine.length() * BUBBLE_SPEED;
 this.onMouseDown = null;
 this.update = activeBubbleUpdate;
 engine.unbindEvents( this );
 engine.bindEvents( this );
}

//asks the hexgrid if it's hit anything
function activeBubbleUpdate() {
 this.centerX += xChange;
 this.centerY += yChange;

 //if the bubble hits the side, bounce it
 if ( this.centerX - this.radius <= 0 ) {
   xChange *= -1;
 }if ( this.centerX + this.radius >= engine.canv.width ) {
   xChange *= -1;
 }

 //now ask the grid to see if we hit anything
 hexGrid.checkCollision( this );

}

/*
bob = new Line( 0, 0, 100, 100 );
bob.onMouseMove = bobMouseMove;
engine.addObject( bob );
function bobMouseMove( e ) {
  this.endX = e.clientX;
  this.endY = e.clientY;
}
*/

engine.start( DELTA_UPDATE );
