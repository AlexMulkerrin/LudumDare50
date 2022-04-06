const colourID = {background:"#eeeeff", textWhite:"#ffffff", textBlack:"#000000", sliderEmpty:"#eeeeee", sliderFill:"#B6FF00", sliderBorder:"#aaaaaa", sliderMarker:"#7F0000",highlight:"#bbccff", button:"#cccccc", select:"#aaaaaa", unknownTerrain:"#ff00ff", road:"#A0A0A0",
unowned:"#EADCD1", field:"#B6B99C", plantedField:"#669865", river:"#9FC7EB", temple:"#FF6A00", residence:"#914B2B", ruin:"#696365"
};

function Display(inSimulation) {
	this.targetSimulation = inSimulation;
	this.targetControl = {};

	this.c = document.getElementById("canvas");
	this.ctx = this.c.getContext("2d");
	this.c.width = 770; //window.innerWidth;
	this.c.height = 640; //window.innerHeight;

	this.sqSize = 16;
}
Display.prototype.update = function() {
	this.clearCanvas();
	this.refresh();
}
Display.prototype.clearCanvas = function() {
	this.ctx.fillStyle = colourID.background;
	this.ctx.fillRect(0, 0, this.c.width, this.c.height);
}
Display.prototype.refresh = function() {
	this.drawTerrain();
	this.drawRoads();

	this.drawTextBox();
	this.drawInterface();
	this.drawButtons();

	if (this.targetSimulation.gameState != gameStateID.endReport) {
		this.drawStats();
	} else {
		this.drawChart();
	}
}
Display.prototype.drawTerrain = function() {
	var sim = this.targetSimulation;

	for (var i=0; i<sim.width; i++) {
		for (var j=0; j<sim.height; j++) {
			switch(sim.terrain[i][j]) {
				case terrainTypeID.unowned:
					this.ctx.fillStyle = colourID.unowned;
					break;
				case terrainTypeID.field:
					this.ctx.fillStyle = colourID.field;
					break;
				case terrainTypeID.plantedField:
					this.ctx.fillStyle = colourID.plantedField;
					break;
				case terrainTypeID.river:
					this.ctx.fillStyle = colourID.river;
					break;
				case terrainTypeID.temple:
					this.ctx.fillStyle = colourID.temple;
					break;
				case terrainTypeID.residence:
					this.ctx.fillStyle = colourID.residence;
					break;
				case terrainTypeID.ruin:
					this.ctx.fillStyle = colourID.ruin;
					break;

				default:
					this.ctx.fillStyle = colourID.unknownTerrain;
			}
			this.ctx.fillRect(i*this.sqSize, j*this.sqSize, this.sqSize, this.sqSize);

		}
	}
}
Display.prototype.drawRoads = function() {
	var sim = this.targetSimulation;

	this.ctx.fillStyle = colourID.road;
	this.ctx.fillRect(0, sim.height/2*this.sqSize+this.sqSize/2-1, this.sqSize*sim.width, 2);
	this.ctx.fillRect((sim.width/2+1)*this.sqSize+this.sqSize/2-1, 0, 2, this.sqSize*sim.height);

	for (var i=0; i<3; i++) {
		this.ctx.fillRect((sim.width/2-1)*this.sqSize, (sim.height/2+i-1)*this.sqSize+this.sqSize/2-1, this.sqSize*3, 2);
		this.ctx.fillRect((sim.width/2+i-1)*this.sqSize+this.sqSize/2-1, (sim.height/2-1)*this.sqSize-1, 2, this.sqSize*3);
	}


}
Display.prototype.drawTextBox = function() {
	var sim = this.targetSimulation;

	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colourID.textBlack;

	if (sim.gameState == gameStateID.newGame) {
		this.ctx.fillText("Welcome High Priestess to the city of Larak. May you govern well.", 150,20);

		/*
		The city of Larak has fallen on hard times after the great flood and has been abandoned. Your king has appointed you as it's high priestess and tasked you with rebuilding the city.

		Arriving by barge with temple attendants, 100 labourers and 60 tonnes of food you must now oversee the reconstruction efforts.

		As chief administrator I shall assist you in setting ration levels,  buying and selling land and planning each years harvest.

		You have been granted 500 hectacres of land to farm. How many hectacres shall I inform the labourers to plant with seeds?*/

	} else if (sim.gameState == gameStateID.inGame) {
		this.ctx.fillText("Time Passes", 200,20);
	} else if (sim.gameState == gameStateID.summary) {
		this.ctx.fillText("Your yearly report is ready", 200,20);

		this.ctx.fillText("Last year "+sim.popDecrease+" people starved, "+sim.popIncrease+" came to the city.",100,150);
		if (sim.isPlagued==true) {
			this.ctx.fillText("A horrible plague struck! Half the people died.",100,170);
		}

		if (sim.lastLoss>0) {
			this.ctx.fillText("Rats ate "+Math.floor(sim.lastLoss/1000)+" tonnes",100,190);
		}
		this.ctx.fillText(yieldText[sim.lastYield]+" "+Math.floor(sim.lastHarvest/1000)+" tonnes collected.",100,210);
	} else if (sim.gameState == gameStateID.endReport) {
		this.ctx.fillText("Game over: Your city lies in ruins... Your reign lasted "+sim.year+" years."+, 200,20);
	}
}
Display.prototype.drawInterface = function() {
	var sim = this.targetSimulation;
	var control = this.targetControl;

	if (sim.gameState == gameStateID.newGame || sim.gameState == gameStateID.summary) {

		var  y = 400;
		this.ctx.fillStyle = colourID.sliderBorder;
		this.ctx.fillRect(92, y-8, 416, 66);
		this.ctx.fillStyle = colourID.sliderEmpty;
		this.ctx.fillRect(100, y, 400, 50);

		this.ctx.fillStyle = colourID.sliderFill;
		this.ctx.fillRect(100, y, control.sliderPosition*4, 50);

		var seedMax = sim.stored/20;
		if (seedMax < sim.totalArea) {
			this.ctx.fillStyle = colourID.sliderMarker;
			var percentage = seedMax/sim.totalArea;
			this.ctx.fillRect(100+Math.floor(400*percentage), y, 4, 50);
		}

		var labourMax = sim.population*10;
		if (labourMax < sim.totalArea) {
			this.ctx.fillStyle = colourID.sliderMarker;
			var percentage = labourMax/sim.totalArea;
			this.ctx.fillRect(100+Math.floor(400*percentage), y, 4, 50);
		}

		this.ctx.font = "bold 16px Verdana";
		this.ctx.fillStyle = colourID.textBlack;

		this.ctx.fillText("Sowing on "+control.sliderPosition+"% of available land.", 200,y-20);

		var requiredSeed = control.sliderPosition/100*sim.totalArea*20;
		var requiredLabour = control.sliderPosition/100*sim.totalArea/10;

		this.ctx.fillText("using: "+Math.ceil(requiredSeed/1000)+"/"+Math.floor(sim.stored/1000)+" tonnes, "+Math.ceil(requiredLabour)+"/"+sim.population+" labourers", 200,y+80);

		this.ctx.fillText("Expected yield: "+Math.floor(sim.lastYield*20*control.sliderPosition/100*sim.totalArea/1000)+" tonnes", 200,y+100);

	}
	if (sim.gameState != gameStateID.endReport) {
		this.ctx.font = "bold 16px Verdana";
		this.ctx.fillStyle = colourID.textBlack;

		this.ctx.fillText("Rations: "+rationName[sim.rationLevel], 10,556);

		this.ctx.fillText("Trade land: "+sim.landPrice+" kilos/hectacre", 474,556);
	}
}
Display.prototype.drawButtons = function() {
	var sim = this.targetSimulation;
	var ctrl = this.targetControl;
	for (var i=0; i<ctrl.button.length; i++){
		var b = ctrl.button[i];
		if (ctrl.mouse.hoveredButton == i) {
			this.ctx.fillStyle = colourID.highlight
		} else if (ctrl.selected == i){
			this.ctx.fillStyle = colourID.select;
		} else {
			this.ctx.fillStyle = colourID.button;
		}

		if (b.isTransparent ==  false) {
			this.ctx.fillRect(b.x, b.y, b.width, b.height);
		} else if (ctrl.mouse.hoveredButton == i) {
			this.ctx.fillRect(b.x, b.y, 5, b.height);
			this.ctx.fillRect(b.x+b.width-5, b.y, 5, b.height);
			this.ctx.fillRect(b.x, b.y, b.width, 5);
			this.ctx.fillRect(b.x, b.y+b.height-5, b.width, 5);
		}

		if (b.text !== "") {
			var textSize = 24;//Math.floor(b.width/b.text.length);
			var textHeight = Math.floor((b.height-textSize)/2);
			this.ctx.font = "bold "+textSize+"px Verdana";
			this.ctx.fillStyle = colourID.textBlack;
			this.ctx.fillText(b.text, b.x+16,b.y+textHeight+18);
		}
	}
}
Display.prototype.drawStats = function() {
	var sim = this.targetSimulation;

	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colourID.textBlack;

	//this.ctx.fillText(Math.floor(sim.timer/60)+"s", 10,40);

	this.ctx.fillText("Year: "+sim.year+", Month: "+sim.month+", Day: "+sim.day, 10,60);

	this.ctx.fillText("Population: "+sim.population+" (Increase: "+sim.popIncrease+", Deaths: "+sim.popDecrease+", Total Deaths: "+sim.totalDeaths+")", 10,80);

	this.ctx.fillText("Stored food: "+Math.floor(sim.stored/1000)+" tonnes (harvested:  "+Math.floor(sim.lastHarvest/1000)+" tonnes, Lost: "+Math.floor(sim.lastLoss/1000)+")", 10,100);

	this.ctx.fillText("Owned land: "+sim.totalArea+" hectacres, Average yield: "+sim.lastYield*20+"kg, Area Sown: "+sim.sownArea, 10,120);

	// tooltips
	this.ctx.font = "bold 16px Verdana";
	var ctrl = this.targetControl;
	if (ctrl.mouse.hoveredButton>=0) {
		var b = ctrl.button[ctrl.mouse.hoveredButton];

		var textLength = this.ctx.measureText(b.tooltip).width;

		this.ctx.fillStyle = colourID.textBlack;
		this.ctx.fillRect(this.c.width-this.c.width/2-115,225, 30+textLength, 35);

		this.ctx.fillStyle = colourID.textWhite;
		this.ctx.fillText(b.tooltip, this.c.width-this.c.width/2-100,250);


	}
}
Display.prototype.drawChart = function() {


	this.ctx.fillStyle = colourID.background;
	this.ctx.fillRect(170, 50, 500, 300);

	this.plotAttribute("population","#E69F00",1);
	this.plotAttribute("stored","#56B4E9",1000);
	this.plotAttribute("totalArea","#009E73",3);


}
Display.prototype.plotAttribute = function(attributeKey, colour, scaleFactor) {
	var sim = this.targetSimulation;

	this.ctx.font = "bold 12px Verdana";

	var w = 500/(sim.history.length-1);



	for (var i=0; i<sim.history.length; i++) {
		var h = sim.history[i];
		this.ctx.fillStyle = colour;
		this.ctx.fillRect(170+i*w-2, 50+(300-h[attributeKey]/scaleFactor)-2, 4, 4);

	}

	var h0 = sim.history[0];
	this.ctx.fillText(attributeKey, 170+10, 40+(300-h0[attributeKey]/scaleFactor)-2);

	for (var i=0; i<sim.history.length-1; i++) {
		var h1 = sim.history[i];
		var h2 = sim.history[i+1];
		this.ctx.strokeStyle = colour;
		this.ctx.beginPath();
		this.ctx.moveTo(170+i*w, 50+(300-h1[attributeKey]/scaleFactor));
		this.ctx.lineTo(170+(i+1)*w, 50+(300-h2[attributeKey]/scaleFactor));
		this.ctx.stroke();
	}
}
