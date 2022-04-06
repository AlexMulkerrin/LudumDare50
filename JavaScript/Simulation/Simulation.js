const gameStateID = {newGame:0, inGame:1, yearEnd:2, summary:3, gameOver:4, endReport:5};

const terrainTypeID = {unowned:0, field:1, plantedField:2, river:3, temple:4, residence:5, ruin:6};

const rationID = {none:0, half:1, standard:2, extra:3, double:4};
const rationName = ["none", "half", "standard", "extra", "double"];

const yieldText = ["ERROR","A flood destroyed the crop!","The crop suffered from blight.","Crop yields were poor.","The harvest was average.","A good crop this year.","A bountiful harvest!"];

function Simulation() {
	this.timer = 0;

	this.gameState = gameStateID.newGame;

	this.year = 0;
	this.month = 0;
	this.day = 0;

	this.population = 0;
	this.popIncrease = 0;
	this.popDecrease = 0;
	this.totalDeaths = 0;

	this.stored = 0;
	this.lastHarvest = 0;
	this.lastLoss = 0;

	this.totalArea = 0;
	this.lastYield = 0;

	this.landPrice = 0;

	this.isPlagued = false;
	this.rationLevel = rationID.standard;
	this.sownArea = 0;
	this.consumptionRate = 0;

	this.history = [];

	this.width = 0;
	this.height = 0;
	this.terrain = [];

	this.newGame();

}
Simulation.prototype.newGame = function() {
	this.timer = 0;

	this.gameState = gameStateID.newGame;

	this.year = 0;
	this.month = 0;
	this.day = 0;

	this.population = 100;
	this.popIncrease = 0;
	this.popDecrease = 0;
	this.totalDeaths = 0;

	this.stored = 60000; // kilos
	this.lastHarvest = 0;
	this.lastLoss = 0;

	this.totalArea = 500; //hectacres
	this.lastYield = 3; // kilos?
	this.sownArea = 0;

	this.landPrice = 750;

	this.isPlagued = false;
	this.rationLevel = rationID.standard;
	this.consumptionRate = 0.5;

	this.history = [];
	this.history[this.year] = new HistoryEntry(this);

	this.width = 48;
	this.height = 40;
	this.terrain = [];
	this.generateTerrain();

}
Simulation.prototype.generateTerrain = function() {
	for (var i=0; i<this.width; i++) {
		this.terrain[i] = [];
		for (var j=0; j<this.height; j++) {
			this.terrain[i][j] = terrainTypeID.unowned;
		}
	}

	// urban center
	var centerX = Math.floor(this.width/2);
	var centerY = Math.floor(this.height/2);

	for (var i=-1; i<=1; i++) {
		for (var j=-1; j<=1; j++) {
			this.terrain[centerX+i][centerY+j] = terrainTypeID.ruin;
		}
	}
	this.terrain[centerX][centerY] = terrainTypeID.temple;
	this.terrain[centerX+1][centerY] = terrainTypeID.residence;

	// river
	for (var i=0; i<this.height; i++) {
		this.terrain[centerX+2][i] = terrainTypeID.river;
	}

	// owned fields
	this.recalculateFields();

}
Simulation.prototype.sowFields = function (percent) {
	// clunky place to do some housekeeping
	this.popDecrease = 0;

	var amount = Math.floor(this.totalArea*percent/100);
	this.sownArea = amount;
	this.stored -= amount*20;

	var centerX = Math.floor(this.width/2);
	var centerY = Math.floor(this.height/2);

	var approxExtent = Math.ceil(Math.sqrt(this.sownArea))+1;
	var span = Math.ceil(approxExtent/2);
	var totalClaimed = 0;
	for (var i=-span; i<=span; i++) {
		for (var j=-span; j<=span; j++) {
			if (this.terrain[centerX+i][centerY+j] == terrainTypeID.field) {
				this.terrain[centerX+i][centerY+j] = terrainTypeID.plantedField;
				totalClaimed++;
			}
			if (totalClaimed >= this.sownArea) return;
		}
		if (totalClaimed >= this.sownArea) return;
	}
}
Simulation.prototype.clearFields = function() {
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			if (this.terrain[i][j] == terrainTypeID.plantedField) {
				this.terrain[i][j] = terrainTypeID.field;
			}
		}
	}
}
Simulation.prototype.recalculateFields = function() {
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			if (this.terrain[i][j] == terrainTypeID.field) {
				this.terrain[i][j] = terrainTypeID.unowned;
			}
		}
	}

	var centerX = Math.floor(this.width/2);
	var centerY = Math.floor(this.height/2);

	var approxExtent = Math.ceil(Math.sqrt(this.totalArea+14));
	var span = Math.ceil(approxExtent/2);
	var totalClaimed = 0;
	for (var i=span; i>=-span; i--) {
		for (var j=-span; j<=span; j++) {
			if (this.terrain[centerX+i][centerY+j] == terrainTypeID.unowned) {
				this.terrain[centerX+i][centerY+j] = terrainTypeID.field;
				totalClaimed++;
			}
			if (totalClaimed >= this.totalArea) return;
		}
		if (totalClaimed >= this.totalArea) return;
	}
}


Simulation.prototype.losses = function() {
	if (Math.random()<0.5) {
		this.lastLoss = Math.floor(this.stored/(Math.floor(Math.random()*3+1)*2));
		this.stored -= this.lastLoss;
	} else {
		this.lastLoss = 0;
	}
}
Simulation.prototype.immigration = function() {
	var chance = Math.floor(Math.random()*6+1);
	this.popIncrease = Math.floor(chance*(40*this.totalArea+this.stored/20)/this.population/100+1);
	//console.log(Math.floor(1*(40*this.totalArea+this.stored/20)/this.population/100+1));
	//console.log(Math.floor(6*(40*this.totalArea+this.stored/20)/this.population/100+1))
	this.population += this.popIncrease;
}
Simulation.prototype.harvest = function() {
	this.clearFields();
	this.lastYield = Math.floor(Math.random()*6+1);
	this.lastHarvest = this.sownArea*this.lastYield*20;
	this.stored += this.lastHarvest;

}
Simulation.prototype.plagueChance = function() {
	if (Math.random()<0.15) {
		this.isPlagued = true;
		this.population = Math.floor(this.population/2);
	} else {
		this.isPlagued = false;
	}
}
Simulation.prototype.updateLandPrice = function() {
	this.landPrice = Math.floor(Math.random()*10+10)*50

}

Simulation.prototype.tradeLand = function(amount) {
	if (amount>0) { //buy
		if (this.stored>=this.landPrice*amount) {
			this.totalArea += amount;
			this.stored -= this.landPrice*amount;
			this.recalculateFields();
		}
	} else { //sell
		if (this.totalArea+amount>=0 && this.sownArea<=this.totalArea+amount) {
			this.totalArea += amount;
			this.stored -= this.landPrice*amount;
			this.recalculateFields();
		}
	}
}

Simulation.prototype.update = function() {
	this.timer++;

	if (this.gameState == gameStateID.inGame) {
		// deplete food stores
		var consumption = this.rationLevel*this.consumptionRate*this.population;
		var nextStored = this.stored - consumption;
		if (nextStored>0) {
			this.stored = nextStored;
		} else { // starvation!
			this.stored = 0;
			//this.rationLevel = rationID.none;

			this.population--;
			this.popDecrease++;
			this.totalDeaths++;
			if (this.population<=0) {
				this.gameState = gameStateID.gameOver;
				this.year++;

				this.history[this.year] = new HistoryEntry(this);
			}
		}
		if (this.rationLevel == rationID.none) {
			this.population--;
			this.popDecrease++;
			this.totalDeaths++;
			if (this.population<=0) {
				this.gameState = gameStateID.gameOver;
				this.year++;

				this.history[this.year] = new HistoryEntry(this);
			}
		}

		// time passes
		this.day++;
		if (this.day>=30) {
			this.day = 0;
			this.month++;
			if (this.month>=12) {
				this.year++;
				this.month = 0;

				this.yearEndUpdate();

			}
		}
	}
}
Simulation.prototype.yearEndUpdate = function() {
	this.gameState = gameStateID.yearEnd;
	this.losses();
	this.immigration();
	this.harvest();
	this.plagueChance();
	this.updateLandPrice();

	this.history[this.year] = new HistoryEntry(this);

	this.sownArea = 0;

}

function HistoryEntry(inState) {
	this.population = inState.population;
	this.popIncrease = inState.popIncrease;
	this.popDecrease = inState.popDecrease;
	this.totalDeaths = inState.totalDeaths;

	this.stored = inState.stored;
	this.lastHarvest = inState.lastHarvest;
	this.lastLoss = inState.lastLoss;

	this.totalArea = inState.totalArea;
	this.lastYield = inState.lastYield;
	this.sownArea = inState.sownArea;

	this.landPrice = inState.landPrice;

	this.isPlagued = inState.isPlagued;
	this.rationLevel = inState.rationLevel;
}
