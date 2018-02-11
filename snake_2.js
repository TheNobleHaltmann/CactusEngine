// SnakeHead object
class SnakeHead extends drawnObject {
	constructor(xLoc,yLoc) {
		var w = canvas.width/gSize;
		var h = canvas.height/gSize;
		super("snake",w,h,xLoc*w,yLoc*h,"./cactusSmall.png");
		this.xLoc = xLoc;
		this.yLoc = yLoc;
		this.xDir = 0;
		this.yDir = 0;
		this.body = [];
		
		this.onKeyDown["arrowup"] = this.turnUp();
		this.onKeyDown["arrowdown"] = this.turnDown();
		this.onKeyDown["arrowleft"] = this.turnLeft();
		this.onKeyDown["arrowright"] = this.turnRight();
	}
	
	update() {
		this.xLoc += this.xDir;
		this.yLoc += this.yDir;
		this.x = this.xLoc*(canvas.width/gSize);
		this.y = this.yLoc*(canvas.height/gSize);
	}
	
	draw( ctx ) {
		ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
	}
	
	turnUp() {
		this.yDir = -1;
		this.xDir = 0;
	}
	turnDown() {
		this.yDir = 1;
		this.xDir = 0;
	}
	turnLeft() {
		this.yDir = 0;
		this.xDir = -1;
	}
	turnRight() {
		this.yDir = 0;
		this.xDir = 1;
	}
}

// SnakeBody object
class SnakeBody extends drawnObject {
	constructor(xLoc,yLoc) {
		var w = canvas.width/gSize;
		var h = canvas.height/gSize;
		super("snake",w,h,xLoc*w,yLoc*h,"cactusSmall.png");
		this.xLoc = xLoc;
		this.yLoc = yLoc;
	}
}

// Grid size
const gSize = 20;

// Grid value definitions
const tEmpty = 0;
const tSnake = 1;
const tPizza = 2;
const tBadPizza = 3;

// Grid for snake
var grid = [];
for (var x=0; x<gSize; x++) {
	grid[x] = [];
	for (var y=0; y<gSize; y++) {
		grid[x][y] = tEmpty;
	}
}

// Engine bootup
var canvas = document.getElementById("canvasName");
var engine = new Engine(document, canvas);
setInterval(game_loop, 200);

function game_loop() {
	engine.update();
	engine.draw();
}

// Game Events
var sHead = new SnakeHead(10, 10);
engine.addObject(sHead);
