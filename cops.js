var engine = new Engine( document, document.getElementById("canvasName") );
var DELTA_UPDATE = 30;
var gridCellSize = 64;
var gridSize = 11;
var outlineSize = 1;
//how many frames are in the character animations
var animationFrames = 2;
//is the player a cop or a robber
var playerType = null;
//the player character
var playerChar = null;
//array for all agents, human and ai
var agents = [];
//how many turns before game ends?
var MAX_TURNS = 100;
//1s are walls and 0s are walkables
var GRID_LAYOUT = [
  [ 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1 ],
  [ 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1 ],
  [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 ],
  [ 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0 ],
  [ 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0 ],
  [ 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0 ],
  [ 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0 ],
  [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
]

var currentTurn = 0;
var currentAgent = 0;
var gameStarted = false;
var firstGame = true;

//image sources
var copSrc = "./cops/cop.png";
var robSrc = "./cops/robber.png";
var walkSrc = "./cops/walk.png";
var noWalkSrc = "./cops/noWalk.png";

//draw back blackground
var backgroundSrc = "./cops/background.png";
var background = new drawnObject( "back", engine.canv.width, engine.canv.height, engine.canv.width/2, engine.canv.height/2, backgroundSrc  );
engine.addObject( background );

class Character extends drawnObject {
	constructor( type, width, height, x, y, imgRel, numImages ) {
    var ss = new SpriteSheet( imgRel, width, height);
    var ani = new Animation( ss, 0, numImages, 200);
		super( type, width, height, x, y, ani );
		this.xLoc = x;
    this.yLoc = y;
    
    //true if this is a human controlled character
    this.human = false;
	}
}

/*
//just making sure i understand the animation syntax
var sportaflop = new Character( "cop", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, copSrc, 2 );
engine.addObject( sportaflop );
var robbie = new Character( "robber", gridCellSize, gridCellSize, engine.canv.width/2-64, engine.canv.height/2-64, robSrc, 2 );
engine.addObject( robbie );
*/

class gridCell {

  //takes i and j coordinates
  //i is position in first array (left/right)
  //j is position in inner array (up/down)
  constructor( i, j ){
    this.i = i;
    this.j = j;
    //where is this grid cell on the canvas
    this.x = i*(gridCellSize+outlineSize) + gridCellSize/2;
    this.y = j*(gridCellSize+outlineSize) + gridCellSize/2;
    //used for pathing and also drawing
    this.walkable = true;
    this.image = new Image();
    this.image.width = gridCellSize;
    this.image.height = gridCellSize;
    this.image.src = walkSrc;
    //if a player/ai is in the cell, this will be them, otherwise null
    this.occupiedBy = null;
  }

  //make this a walkable square
  setWalkable() {
    this.image.src = walkSrc;
    this.walkable = true;
  }

  //make this an unwalkable square
  setUnwalkable() {
    this.image.src = noWalkSrc;
    this.walkable = false;
  }

  draw( ctx ) {
    ctx.drawImage(this.image, this.x - (this.image.width / 2), this.y - (this.image.height / 2), this.image.width, this.image.height);
  }
}

//draw grid thing and also the bit over on the right that will say the score
var grid = [];
for( var i = 0; i < gridSize; i++ ) {
  grid.push( [] );
  for( var j = 0; j < gridSize; j++ ) {
    grid[i].push( new gridCell( i, j ) );
    engine.addObject( grid[i][j] );
    //set walls and stuff
    //i and j are backwards because i did something wrong somewhere
    if( GRID_LAYOUT[j][i] == 1 ) {
      grid[i][j].setUnwalkable();
    }
  }
}

//put a white bit to write the score on
var scoreAreaWidth = engine.canv.width - (gridCellSize+outlineSize)*gridSize;
engine.addObject( new drawnObject( "back", scoreAreaWidth, engine.canv.height, engine.canv.width-(scoreAreaWidth/2), engine.canv.height/2, walkSrc ) );
//place "choose your character" buttons
var copButton = new Character( "copButton", gridCellSize, gridCellSize, engine.canv.width - 2*scoreAreaWidth/3, engine.canv.height/2, copSrc, animationFrames );
var robberButton = new Character( "robberButton", gridCellSize, gridCellSize, engine.canv.width - scoreAreaWidth/3, engine.canv.height/2, robSrc, animationFrames );
engine.addObject( copButton );
engine.addObject( robberButton );
//only the cop button gets an on mouse down, it will check collision with both buttons
copButton.onMouseDown = newGame;
engine.bindEvents( copButton );
//write the words "choose a character"
//hardcoded the coordinates because i don't really feel like figuring out equations for it
var characterSelectText = new Text( "Choose a character:", 820, 300 );
engine.addObject( characterSelectText );

//this stuff will be used later:
//write how many turns remain
var currentTurnText = new Text( "turn 4 of 20", 835, 100 );
//write whos turn it is
var whoseTurnText = new Text( "bob's turn", 830, 200 );


//checks if the mouse is over either the cop or the robber.  if so, starts a game with the player as the character they chose. otherwise does nothing
function newGame( e ) {
  if( checkCollisionPoint( copButton, e.clientX, e.clientY ) ) {
    //player is a cop
    playerType = "cop";
    playerChar = new Character( "Cop 1", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, copSrc, animationFrames );

    //put two robbers, the player, and the other cop into the agents array so turn order is correct
    agents.push( new Character( "Robber 1", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, robSrc, animationFrames ) );
    agents.push( new Character( "Robber 2", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, robSrc, animationFrames ) );
    agents.push( playerChar );
    agents.push( new Character( "Cop 2", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, copSrc, animationFrames ) );

  } else if ( checkCollisionPoint( robberButton, e.clientX, e.clientY ) ) {
    //player is a robber
    playerType = "robber";
    playerChar = new Character( "Robber 1", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, robSrc, animationFrames );

    //put the player, the other robber, and two cops into the agents array so turn order is correct
    agents.push( playerChar );
    agents.push( new Character( "Robber 1", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, robSrc, animationFrames ) );
    agents.push( new Character( "Cop 1", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, copSrc, animationFrames ) );
    agents.push( new Character( "Cop 2", gridCellSize, gridCellSize, engine.canv.width/2, engine.canv.height/2, copSrc, animationFrames ) );

  } else {
    //didn't click on either button
    return;
  }

  if( firstGame == false ) {
    //clear out the dancers
    for( var i = 0; i < gridSize; i++ ) {
      for( var j = 0; j < gridSize; j++ ) {
        engine.removeObject( danceArray[i][j] );
        danceArray[i][j] = null;
        grid[i][j].occupiedBy = null;
      }
    }
    engine.removeObject( winnerText );
  }

  gameStarted = true;
  //the player is human and uses controls
  playerChar.human = true;
  playerChar.onKeyDown["arrowdown"] = playerMove;
  playerChar.onKeyDown["arrowup"] = playerMove;
  playerChar.onKeyDown["arrowleft"] = playerMove;
  playerChar.onKeyDown["arrowright"] = playerMove;
  //space lets you pass your turn to prevent getting stuck
  playerChar.onKeyDown[" "] = playerMove;

  //the player clicked on a button.  remove the buttons and start the game and stuff
  engine.removeObject( copButton );
  engine.removeObject( robberButton );
  engine.removeObject( characterSelectText );

  for( var i = 0; i < agents.length; i++ ) {
    engine.addObject( agents[i] );
    randomlyPlace( agents[i] );
  }
  //true if the agent is a cop
  agents[0].cop = false;
  agents[1].cop = false;
  agents[2].cop = true;
  agents[3].cop = true;

  //start writing the turn number and whose turn it is
  engine.addObject( whoseTurnText );
  engine.addObject( currentTurnText );
  //start the turn based cycle thing going
  currentAgent = agents.length;
  currentTurn = 0;
  incrementCurrentAgent();

}

//randomly place a given object somewhere on the grid that is walkable and isn't already occupied
function randomlyPlace( obj ) {
  var i = Math.floor( Math.random() * gridSize );
  var j = Math.floor( Math.random() * gridSize );

  //if we picked an unwalkable/occupied cell, reroll
  while( grid[i][j].walkable == false || grid[i][j].occupiedBy != null ) {
    var i = Math.floor( Math.random() * gridSize );
    var j = Math.floor( Math.random() * gridSize );
  }

  grid[i][j].occupiedBy = obj;
  obj.x = grid[i][j].x;
  obj.y = grid[i][j].y;
  obj.i = i;
  obj.j = j;
}

//increments the current agent number.  if the agent is an ai, does their ai and increments again.  if the agent is a human,
//sets the agent's controls and waits for input
function incrementCurrentAgent() {
  if( gameStarted ) {
    currentAgent++;
    if( currentAgent >= agents.length ) {
      //loop around
      currentAgent = 0;
      currentTurn++;
      //write what turn it is
      currentTurnText.text = "Turn " + currentTurn + " of " + MAX_TURNS;

      //have the robbers won
      if( currentTurn > MAX_TURNS ) {
        endGame( "robber" );
        return;
      }
    }
    //have the cops caught a robber
    checkForCatchRobber();
    if( gameStarted == false ) {
      return;
    }
    
    //write whose turn it is
    whoseTurnText.text = agents[currentAgent].type + "'s turn!";

    if( agents[currentAgent].human ) {
      //agent is a human, set controls and wait for input
      engine.bindEvents( agents[currentAgent] );
    } else {
      //agent is an ai, do ai things
      doAI( agents[currentAgent] );
    }
  }
}

//arrow keys move player into walkable unoccupied square
function playerMove( e, obj ) {
  var s = e.key.toLowerCase();
  //move left
  if( s == "arrowleft" ) {
    if( gridCellEmpty( obj.i-1, obj.j ) ) {
      putObjInCell( obj, obj.i-1, obj.j );
      //don't want to get input again until it's our turn again
      engine.unbindEvents( agents[currentAgent] );
      incrementCurrentAgent();
    }
  }
  //move right
  else if ( s == "arrowright" ) {
    if( gridCellEmpty( obj.i+1, obj.j ) ) {
      putObjInCell( obj, obj.i+1, obj.j );
      //don't want to get input again until it's our turn again
      engine.unbindEvents( agents[currentAgent] );
      incrementCurrentAgent();
    }
  }
  //move up
  else if ( s == "arrowup" ) {
    if( gridCellEmpty( obj.i, obj.j-1 ) ) {
      putObjInCell( obj, obj.i, obj.j-1 );
      //don't want to get input again until it's our turn again
      engine.unbindEvents( agents[currentAgent] );
      incrementCurrentAgent();
    }
  }
  //move down
  else if ( s == "arrowdown" ) {
    if( gridCellEmpty( obj.i, obj.j+1 ) ) {
      putObjInCell( obj, obj.i, obj.j+1 );
      //don't want to get input again until it's our turn again
      engine.unbindEvents( agents[currentAgent] );
      incrementCurrentAgent();
    }
  }
  else if ( s == " " ) {
    //pass your turn
    //don't want to get input again until it's our turn again
    engine.unbindEvents( agents[currentAgent] );
    incrementCurrentAgent();
  }
}

//return true if the grid square is empty, false otherwise
function gridCellEmpty( i, j , occ=false) {
  //if we're not even on the grid, return false
  if( i < 0 || i >= gridSize || j < 0 || j >= gridSize || isNaN( i ) || isNaN( j ) ) {
    return false;
  }

  //if the cell is occupied already, false
  if( occ ) {
    //doing cop ai pathing - ignore robbers but don't ignore cops to prevent cop pileups
    if( grid[i][j].occupiedBy != null ) {
      if( grid[i][j].occupiedBy.cop ) {
        return false;
      }
    }
  } else {
    //not doing cop ai pathing
    if( grid[i][j].occupiedBy != null ) {
      return false;
    }
  }

  //if the cell is walkable return true, otherwise false
  return grid[i][j].walkable;
}

//puts a given object into a given grid cell and cleans up after itself
function putObjInCell( obj, i, j ) {
  var tempI = obj.i;
  var tempJ = obj.j;
  obj.i = i;
  obj.j = j;
  grid[i][j].occupiedBy = obj;
  obj.x = grid[i][j].x;
  obj.y = grid[i][j].y;
  grid[tempI][tempJ].occupiedBy = null;
}

class Place {
    constructor(x,y,w,parent) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.next = parent;
    }
}

//Hueristic weight
function weight(tp,tx,ty) {
  var ret = 0;
  ret += Math.abs(tp.x - tx);
  ret += Math.abs(tp.y - ty);
  ret *= 2;
  return ret;
}

function futureAdd(tp,future,tx,ty) {
  for(var x=0; x<future.length; x++) {
    if(tp.w+weight(tp,tx,ty) < future[x].w+weight(future[x],tx,ty)) {
      future.splice(x,0,tp);
      return;
    }
  }
  future.push(tp);
}

function arrayHas(target,arr,index=false) {
  for(var x=0; x<arr.length; x++) {
    // if(arr[x].x == target.x)
      // console.log(arr[x].x+","+arr[x].y+" vs "+target.x+","+target.y);
    if(arr[x].x == target.x && arr[x].y == target.y) {
      return index ? x : true;
    }
  }
  return index ? -1 : false;
}

//checks the object's type (cop or robber) and does arcane ai majycks on it
//or at least, it's supposed to, right now it just moves in a random direction
function doAI( obj ) {
  // Setup pathing arrays
  var past = [];
  var future = [];
  var target;
  future.push(new Place(obj.i,obj.j,0,null));
  past.push(future[0]);
  
  // Set target
  if (obj.cop) {
    var dist1 = Math.abs(agents[0].i - obj.i) + Math.abs(agents[0].j - obj.j);
    var dist2 = Math.abs(agents[1].i - obj.i) + Math.abs(agents[1].j - obj.j);
    if (agents[1].cop) { dist2 = 999; } 
    target = dist1 < dist2 ? agents[0] : agents[1];
    target = new Place(target.i,target.j,0,null);
  } else {
    // Robbers full move logic
    var dist1 = Math.abs(agents[agents.length-2].i - obj.i) + Math.abs(agents[agents.length-2].j - obj.j);
    var dist2 = Math.abs(agents[agents.length-1].i - obj.i) + Math.abs(agents[agents.length-1].j - obj.j);
    target = dist1 < dist2 ? agents[agents.length-2] : agents[agents.length-1];
    var xDif = target.i - obj.i;
    var yDif = target.j - obj.j;
    var xDirec = xDif == 0 ? 1 : xDif / Math.abs(xDif);
    var yDirec = yDif == 0 ? 1 : yDif / Math.abs(yDif);
    
    if (Math.abs(xDif) >= Math.abs(yDif)) {
      if (gridCellEmpty(obj.i - xDirec,obj.j)) {
        putObjInCell(obj,obj.i - xDirec,obj.j);
      } else if (gridCellEmpty(obj.i,obj.j - yDirec)) {
        putObjInCell(obj,obj.i,obj.j - yDirec);
      } else if (gridCellEmpty(obj.i,obj.j + yDirec)) {
        putObjInCell(obj,obj.i,obj.j + yDirec);
      } else if (gridCellEmpty(obj.i + xDirec,obj.j)) {
        putObjInCell(obj,obj.i + xDirec,obj.j);
      }
    } else {
      if (gridCellEmpty(obj.i,obj.j - yDirec)) {
        putObjInCell(obj,obj.i,obj.j - yDirec);
      } else if (gridCellEmpty(obj.i - xDirec,obj.j)) {
        putObjInCell(obj,obj.i - xDirec,obj.j);
      } else if (gridCellEmpty(obj.i + xDirec,obj.j)) {
        putObjInCell(obj,obj.i + xDirec,obj.j);
      } else if (gridCellEmpty(obj.i,obj.j + yDirec)){
        putObjInCell(obj,obj.i,obj.j + yDirec);
      }
    }
    
    incrementCurrentAgent();
    return;
  }
  
  // Find shortest path to criminal
  while (future.length > 0 && !arrayHas(target,past)) {
    // Take first from the horizon
    var p = future.shift();
    var tp;
    
    // Add all 4 directions if possible
    tp = new Place(p.x-1,p.y,p.w+1,p);
    if (gridCellEmpty(tp.x,tp.y,true) && !arrayHas(tp,past)) {
      futureAdd(tp,future,target.x,target.y);
      past.push(tp);
    }
    tp = new Place(p.x+1,p.y,p.w+1,p);
    if (gridCellEmpty(tp.x,tp.y,true) && !arrayHas(tp,past)) {
      futureAdd(tp,future,target.x,target.y);
      past.push(tp);
    }
    tp = new Place(p.x,p.y-1,p.w+1,p);
    if (gridCellEmpty(tp.x,tp.y,true) && !arrayHas(tp,past)) {
      futureAdd(tp,future,target.x,target.y);
      past.push(tp);
    }
    tp = new Place(p.x,p.y+1,p.w+1,p);
    if (gridCellEmpty(tp.x,tp.y,true) && !arrayHas(tp,past)) {
      futureAdd(tp,future,target.x,target.y);
      past.push(tp);
    }
  }
  
  // Take next move from found path
  target = past[arrayHas(target,past,true)];
  while (target != null && target.next != null && target.next.next != null) {
      target = target.next;
  }
  if( target != undefined ) {
    if( gridCellEmpty( target.x, target.y ) ) {
      putObjInCell(obj,target.x,target.y);
    }
  }
  incrementCurrentAgent();
  return;
    
  // var direction = 0;
  // var hasMoved = false;
  // var numLoops = 0;

  // do {
    // //randomly choose a direction
    // direction = Math.floor( Math.random() * 4 );
    // //move left
    // if( direction == 0 ) {
      // if( gridCellEmpty( obj.i-1, obj.j ) ) {
        // putObjInCell( obj, obj.i-1, obj.j );
        // hasMoved = true;
      // }
    // }
    // //move right
    // else if ( direction == 1 ) {
      // if( gridCellEmpty( obj.i+1, obj.j ) ) {
        // putObjInCell( obj, obj.i+1, obj.j );
        // hasMoved = true;
      // }
    // }
    // //move up
    // else if ( direction == 2 ) {
      // if( gridCellEmpty( obj.i, obj.j-1 ) ) {
        // putObjInCell( obj, obj.i, obj.j-1 );
        // hasMoved = true;
      // }
    // }
    // //move down
    // else if ( direction == 3 ) {
      // if( gridCellEmpty( obj.i, obj.j+1 ) ) {
        // putObjInCell( obj, obj.i, obj.j+1 );
        // hasMoved = true;
        
      // }
    // }

    // //don't want to loop forever if stuck
    // numLoops++
  // } while ( hasMoved == false && numLoops < 6);

  // incrementCurrentAgent();
}

//checks for collision between a point and an image, returns true if there was a collision
function checkCollisionPoint( s, x, y ) {
  return ( s.x - s.img.width/2 < x && s.x + s.img.width/2 > x && s.y - s.img.height/2 < y && s.y + s.img.height/2 > y );
}

//checks if the robbers are surrounded
function checkForCatchRobber() {
  if( agents.length == 4 ) {
    //no robbers caught yet
    checkSurrounding( agents[0], 0 );
    checkSurrounding( agents[1], 1 );
  } else {
    //one robber already caught
    checkSurrounding( agents[0], 0 );
  }

  if( agents.length == 2 ) {
    //both robbers have been caught
    endGame( "cop" );
  }
}

//checks if a given robber is surrounded
function checkSurrounding( rob, index ) {
  var surroundedCount = 0;
  if( rob.i > 0 && grid[rob.i-1][rob.j].occupiedBy != null && grid[rob.i-1][rob.j].occupiedBy.cop ) {
    //cop to left
    surroundedCount++;
  }
  if( rob.i < gridSize - 1 && grid[rob.i+1][rob.j].occupiedBy != null && grid[rob.i+1][rob.j].occupiedBy.cop ) {
    //cop to right
    surroundedCount++;
  }
  if( rob.j > 0 && grid[rob.i][rob.j-1].occupiedBy != null && grid[rob.i][rob.j-1].occupiedBy.cop ) {
    //cop above
    surroundedCount++;
  }
  if( rob.j < gridSize - 1 && grid[rob.i][rob.j+1].occupiedBy != null && grid[rob.i][rob.j+1].occupiedBy.cop ) {
    //cop above
    surroundedCount++;
  }

  if( surroundedCount >= 2 ) {
    //surrounded by cops, remove from play
    grid[rob.i][rob.j].occupiedBy = null;
    engine.removeObject( rob );
    remove( rob, agents );
    if( index < currentAgent ) {
      currentAgent--;
    }
  }
}

//used for victory dance at the end
var danceArray = [];
for( var i = 0; i < gridSize; i++ ) {
  danceArray.push( [] );
}
var winnerText = new Text( "bob wins", 830, 100 );

//ends the game, shows who won based on passed in string - "cop" or "robber"
function endGame( s ) {
  gameStarted = false;
  firstGame = false;
  for( var i = 0; i < agents.length; i++ ) {
    engine.removeObject( agents[i] );
  }
  engine.removeObject( currentTurnText );
  engine.removeObject( whoseTurnText );
  agents = [];

  //do victory dance
  var imgSrc = "";
  if( s == "cop" ) {
    //cops won
    winnerText.text = "Cops win!";
    imgSrc = copSrc;
  } else {
    //robbers won
    winnerText.text = "Robbers win!";
    imgSrc = robSrc;
  }
  for( var i = 0; i < gridSize; i++ ) {
    for( var j = 0; j < gridSize; j++ ) {
      danceArray[i][j] = new Character( "dancer", gridCellSize, gridCellSize, grid[i][j].x, grid[i][j].y, imgSrc, animationFrames );
      engine.addObject( danceArray[i][j] );
    }
  }
  engine.addObject( winnerText );
  
  //prep air for new game
  engine.addObject( characterSelectText );
  engine.addObject( robberButton );
  engine.addObject( copButton );
  engine.bindEvents( copButton );
}

engine.start( DELTA_UPDATE );