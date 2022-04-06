const NONE = -1;
const mouseClickID = {leftClick:1, middleClick:2, rightClick:3};

function Control(inSimulation) {
	this.c = document.getElementById("canvas");
	this.targetSimulation = inSimulation;
	
	this.sliderPosition = 100;
	this.selected = NONE;
	
	this.button = [];
	this.createButtons();
	
	this.mouse = new Mouse();
	
	var t = this;
	this.c.onmousemove = function(e){t.handleMouseMove(e)};
	this.c.onmousedown = function(e){t.handleMouseDown(e)};
	
	// dummy functions to avoid rightclicking bringing up edit menu
    this.c.oncontextmenu = function(event) {return false;};
    this.c.onselectstart = function(event) {return false;};
	
	//this.c.onmousewheel = function (e) {t.handleMouseWheel(e.wheelDelta); return false; };
    // special case for Mozilla...
    //this.c.onwheel = function (e) {t.handleMouseWheel(e); return false; };
	
	//this.keyCodes = [];
	//document.onkeydown = function(e){t.handleKeyDown(e)};
	//document.onkeyup = function(e){t.handleKeyUp(e)};
}

function Mouse() {
	this.x = -100;
	this.y = -100;
	
	this.whichClick = NONE;
	this.isDown = false;
	
	this.hoveredButton = -1;
}

Control.prototype.createButtons = function() {
	this.button = [];
	
	switch (this.targetSimulation.gameState) {
		case gameStateID.newGame:
			this.makeSlider();
			break;
		case gameStateID.inGame:
			this.makeInterface();
			break;
		case gameStateID.summary:
			this.makeSlider();
			break;
		case gameStateID.endReport:
			this.makeResults();
			break;
	} 
}
Control.prototype.makeSlider = function() {
	var y = 400;
	this.button.push(new Button(100, y, 400,50, true, "", "click to set slider","setSlider"));
	
	this.button.push(new Button(550, y-8, 128,64, false, "Submit", "confirm allocation", "submit"));
	
	this.makeInterface();
}
//" ⏸️▶️💀🌱🌾🐀🤢"
Control.prototype.makeInterface = function() {
	
	//this.button.push(new Button(698, 100, 64,64, false, "⏸️", "toggle pause","togglePause"));
	this.button.push(new Button(698, 44, 64,64, false, "💀", "resign","resign"));
	//this.button.push(new Button(698, 248, 64,64, false, "🎵", "toggle sounds","toggleSound"));
	
	// rations
	this.button.push(new Button(8, 566, 64,64, false, "0", "no rations","setRations",0));
	this.button.push(new Button(82, 566, 64,64, false, "1/2", "half rations","setRations",1));
	this.button.push(new Button(156, 566, 64,64, false, "1", "standard rations","setRations",2));
	this.button.push(new Button(230, 566, 64,64, false, "3/2", "extra rations","setRations",3));
	this.button.push(new Button(304, 566, 64,64, false, "2", "double rations","setRations",4));
	
	// market
	this.button.push(new Button(474, 566, 64,64, false, "-10", "sell 10 hectacres","tradeLand",-10));
	this.button.push(new Button(548, 566, 64,64, false, "-1", "sell a hectacre","tradeLand",-1));
	this.button.push(new Button(622, 566, 64,64, false, "+1", "buy a hectacre","tradeLand",1));
	this.button.push(new Button(696, 566, 64,64, false, "+10", "buy 10 hectacres","tradeLand",10));
}
Control.prototype.makeResults = function() {
	var y = 400;
	this.button.push(new Button(150, y-8, 128,64, false, "Retry", "let me try again", "retry"));

	//this.button.push(new Button(550, y-8, 128,64, false, "Share", "share results as screencap", "share"));
}
function Button( inX, inY, inWidth, inHeight, isTransparent, inText, inTooltip, inFunction, inFuncArgs) {
	this.x = inX;
	this.y = inY;
	this.width = inWidth;
	this.height = inHeight;
	this.isTransparent = isTransparent;
	
	this.text = inText;
	this.tooltip = inTooltip;
	this.function = inFunction;
	this.functionArguments = inFuncArgs;
	
	this.isToggle = false;
}
Button.prototype.mouseIsInBounds = function(x, y) {
	if (x >= this.x && x <= this.x+this.width &&
		y >= this.y && y <= this.y+this.height) {
			return true;
		} else {
			return false;
		}
}

Control.prototype.handleMouseMove = function(event) {
	this.mouse.x = event.layerX;
	this.mouse.y = event.layerY;
	
	this.mouse.hoveredButton = -1;
	for (var i=0; i<this.button.length; i++) {
		var b = this.button[i];
		if (b.mouseIsInBounds(this.mouse.x, this.mouse.y)) {
			this.mouse.hoveredButton = i;
		}
	}
}
Control.prototype.handleMouseDown = function(event) {
	//var sim = this.targetSimulation;
	//sim.totalClicks ++;
	
	this.mouse.whichClick = event.which;
	this.mouse.isDown = true;
	
	switch (this.mouse.whichClick) {
		case mouseClickID.leftClick:
			if (this.mouse.hoveredButton>=0) {
				var b = this.button[this.mouse.hoveredButton];
				this[b.function](b.functionArguments);
			} else {
				// rotate commands go here
			}
			break;
		case mouseClickID.middleClick:
			this.togglePause();
			break;
		case mouseClickID.rightClick:
			if (this.selected>=0) {
				var b = this.button[this.selected];
				this[b.function](b.functionArguments);
			} else {
				// spin commands go here
			}
			break;	
	}
}
Control.prototype.handleMouseUp = function(event) {
	this.mouse.whichClick = NONE;
	this.mouse.isDown = false;
}
Control.prototype.setSlider = function() {	
	this.sliderPosition = Math.floor((this.mouse.x-100)/4);
	this.checkSliderBounds();
}
Control.prototype.checkSliderBounds = function() {
	var sim = this.targetSimulation;
	
	var seedMax = 100*(sim.stored/20)/sim.totalArea;
	var labourMax = 100*(sim.population*10)/sim.totalArea;
	
	if (this.sliderPosition<0) this.sliderPosition = 0;
	if (this.sliderPosition>seedMax) this.sliderPosition = seedMax;
	if (this.sliderPosition>labourMax) this.sliderPosition = labourMax;
	if (this.sliderPosition>100) this.sliderPosition = 100;
}
Control.prototype.submit = function() {
	var sim = this.targetSimulation;
	sim.gameState = gameStateID.inGame;
	
	this.createButtons();
	this.mouse.hoveredButton = NONE;
	this.selected = NONE;
	
	sim.sowFields(this.sliderPosition);
}
Control.prototype.setRations = function(value) {
	var sim = this.targetSimulation;
	sim.rationLevel = value;
}
Control.prototype.tradeLand = function(value) {
	var sim = this.targetSimulation;
	sim.tradeLand(value);
	this.checkSliderBounds();
}
Control.prototype.retry = function() {
	var sim = this.targetSimulation;
	sim.gameState = gameStateID.newGame;
	
	this.createButtons();
	this.mouse.hoveredButton = NONE;
	this.selected = NONE;
	
	sim.newGame();
}
Control.prototype.resign = function() {
	var sim = this.targetSimulation;
	sim.gameState = gameStateID.gameOver;
}
Control.prototype.share = function() {
	// TODO
}
Control.prototype.togglePause = function() {
	// TODO
}
Control.prototype.toggleSound = function() {
	// TODO
}
Control.prototype.update = function() {
	var sim = this.targetSimulation;
	if (sim.gameState == gameStateID.yearEnd) {
		sim.gameState = gameStateID.summary;
		this.createButtons();
		this.checkSliderBounds();
	} else if (sim.gameState == gameStateID.gameOver) {
		sim.gameState = gameStateID.endReport;
		this.createButtons();
	}
}