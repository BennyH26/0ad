RMS.LoadLibrary("rmgen");

var tGrass = ["temp_grass", "temp_grass", "temp_grass_d"];
var tGrassPForest = "temp_plants_bog";
var tGrassDForest = "temp_plants_bog";
var tGrassA = "temp_grass_plants";
var tGrassB = "temp_plants_bog";
var tGrassC = ["temp_grass_b", "temp_grass_c"];
var tDirt = ["temp_plants_bog", "temp_mud_a"];
var tRoad = "temp_road";
var tRoadWild = "temp_road_overgrown";
var tShoreBlend = "temp_grass_plants";
var tShore = "temp_plants_bog";
var tWater = "temp_mud_a";

// gaia entities
var oBeech = "gaia/flora_tree_euro_beech";
var oOak = "gaia/flora_tree_oak";
var oBerryBush = "gaia/flora_bush_berry";
var oChicken = "gaia/fauna_chicken";
var oDeer = "gaia/fauna_deer";
var oHorse = "gaia/fauna_horse";
var oWolf = "gaia/fauna_wolf";
var oFish = "gaia/fauna_fish";
var oSheep = "gaia/fauna_rabbit";
var oStoneLarge = "gaia/geology_stonemine_temperate_quarry";
var oStoneSmall = "gaia/geology_stone_temperate";
var oMetalLarge = "gaia/geology_metal_temperate_slabs";

// decorative props
var aGrass = "actor|props/flora/grass_soft_small_tall.xml";
var aGrassShort = "actor|props/flora/grass_soft_large.xml";
var aRockLarge = "actor|geology/stone_granite_med.xml";
var aRockMedium = "actor|geology/stone_granite_med.xml";
var aReeds = "actor|props/flora/reeds_pond_lush_a.xml";
var aLillies = "actor|props/flora/water_lillies.xml";
var aBushMedium = "actor|props/flora/bush_medit_me.xml";
var aBushSmall = "actor|props/flora/bush_medit_sm.xml";

var pForestD = [tGrassDForest + TERRAIN_SEPARATOR + oBeech, tGrassDForest];
var pForestP = [tGrassPForest + TERRAIN_SEPARATOR + oOak, tGrassPForest];
const BUILDING_ANGlE = -PI/4;

// initialize map

log("Initializing map...");

InitMap();

var numPlayers = getNumPlayers();
var mapSize = getMapSize();
var mapArea = mapSize*mapSize;

// create tile classes

var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();


// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = sortPlayers(playerIDs);

// place players

var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; i++)
{
	playerAngle[i] = startAngle + i*TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.35*cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.35*sin(playerAngle[i]);
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");
	
	// some constants
	var radius = scaleByMapSize(15,25);
	var cliffRadius = 2;
	var elevation = 20;
	
	// get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = round(fx);
	var iz = round(fz);
	addToClass(ix, iz, clPlayer);
	addToClass(ix+5, iz, clPlayer);
	addToClass(ix, iz+5, clPlayer);
	addToClass(ix-5, iz, clPlayer);
	addToClass(ix, iz-5, clPlayer);
	
	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, null);
	
	// get civ specific starting entities
	var civEntities = getStartingEntities(id-1);
	
	// create starting units
	createStartingPlayerEntities(fx, fz, id, civEntities, BUILDING_ANGlE)
	
	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oChicken, 5,5, 0,3)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}
	
	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oBerryBush, 5,5, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);
	
	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = radius - 4;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);
	
	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1,1, 0,2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);
	var hillSize = PI * radius * radius;
	// create starting straggler trees
	var num = hillSize / 110;
	for (var j = 0; j < num; j++)
	{
		var tAngle = randFloat(0, TWO_PI);
		var tDist = randFloat(6, radius - 2);
		var tX = round(fx + tDist * cos(tAngle));
		var tZ = round(fz + tDist * sin(tAngle));
		group = new SimpleGroup(
			[new SimpleObject(oBeech, 1,3, 0,2)],
			false, clBaseResource, tX, tZ
		);
		createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
	}
	
	// create grass tufts
	var num = hillSize / 250;
	for (var j = 0; j < num; j++)
	{
		var gAngle = randFloat(0, TWO_PI);
		var gDist = radius - (5 + randInt(7));
		var gX = round(fx + gDist * cos(gAngle));
		var gZ = round(fz + gDist * sin(gAngle));
		group = new SimpleGroup(
			[new SimpleObject(aGrassShort, 2,5, 0,1, -PI/8,PI/8)],
			false, clBaseResource, gX, gZ
		);
		createObjectGroup(group, 0);
	}
}

RMS.SetProgress(15);

// create bumps
log("Creating bumps...");
placer = new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1);
painter = new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2);
createAreas(
	placer,
	painter, 
	avoidClasses(clPlayer, 13),
	scaleByMapSize(300, 800)
);

// create marshes
log("Creating marshes...");
for (var i = 0; i < 7; i++)
{
	placer = new ClumpPlacer(9*scaleByMapSize(50,130)*randFloat(0.6,1.4), 0.8, 0.1, 10);
	var terrainPainter = new LayeredPainter(
		[tShoreBlend, tShore, tWater],		// terrains
		[1,1]							// widths
	);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_SET, -2, 3);
	var waterAreas = createAreas(
		placer,
		[terrainPainter, elevationPainter, paintClass(clWater)], 
		avoidClasses(clPlayer, 15, clWater, round(scaleByMapSize(7,16)*randFloat(0.8,1.35))),
		scaleByMapSize(4,20)
	);
}


// create reeds
log("Creating reeds...");
group = new SimpleGroup(
	[new SimpleObject(aReeds, 5,10, 0,4), new SimpleObject(aLillies, 5,10, 0,4)], true
);
createObjectGroups(group, 0,
	stayClasses(clWater, 1),
	scaleByMapSize(400,2000), 100
);
waterAreas = [];

RMS.SetProgress(40);

// create bumps
log("Creating bumps...");
placer = new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1);
painter = new SmoothElevationPainter(ELEVATION_MODIFY, 1, 2);
createAreas(
	placer,
	painter, 
	stayClasses(clWater, 2),
	scaleByMapSize(50, 100)
);


// calculate desired number of trees for map (based on size)
const MIN_TREES = 500;
const MAX_TREES = 2500;
const P_FOREST = 0.7;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);
var numForest = totalTrees * P_FOREST;
var numStragglers = totalTrees * (1.0 - P_FOREST);

// create forests
log("Creating forests...");
var types = [
	[[tGrassDForest, tGrass, pForestD], [tGrassDForest, pForestD]],
	[[tGrassPForest, tGrass, pForestP], [tGrassPForest, pForestP]]
];	// some variation
var size = numForest / (scaleByMapSize(2,8) * numPlayers);
var num = floor(size / types.length);
for (var i = 0; i < types.length; ++i)
{
	placer = new ClumpPlacer(numForest / num, 0.1, 0.1, 1);
	painter = new LayeredPainter(
		types[i],		// terrains
		[2]											// widths
		);
	createAreas(
		placer,
		[painter, paintClass(clForest)], 
		avoidClasses(clPlayer, 15, clWater, 0, clForest, 10, clHill, 1),
		num
	);
}

RMS.SetProgress(50);

// create dirt patches
log("Creating dirt patches...");
var sizes = [scaleByMapSize(3, 21), scaleByMapSize(5, 37), scaleByMapSize(8, 50)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter(
		[[tGrass,tGrassA],[tGrassA,tGrassB], [tGrassB,tGrassC]], 		// terrains
		[1,1]															// widths
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clWater, 1, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 8),
		scaleByMapSize(15, 45)
	);
}


// create grass patches
log("Creating grass patches...");
var sizes = [scaleByMapSize(3, 21), scaleByMapSize(5, 37), scaleByMapSize(8, 40)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new TerrainPainter(tDirt);
	createAreas(
		placer,
		painter,
		avoidClasses(clWater, 1, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 8),
		scaleByMapSize(15, 45)
	);
}


log("Creating stone mines...");
// create large stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock);
createObjectGroups(group, 0,
	[avoidClasses(clWater, 0, clForest, 1, clPlayer, 15, clRock, 10, clHill, 1)],
	scaleByMapSize(4,16), 100
);

// create small stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock);
createObjectGroups(group, 0,
	[avoidClasses(clWater, 0, clForest, 1, clPlayer, 15, clRock, 10, clHill, 1)],
	scaleByMapSize(4,16), 100
);

log("Creating metal mines...");
// create large metal quarries
group = new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal);
createObjectGroups(group, 0,
	[avoidClasses(clWater, 0, clForest, 1, clPlayer, 15, clMetal, 10, clRock, 5, clHill, 1)],
	scaleByMapSize(4,16), 100
);

RMS.SetProgress(60);

// create small decorative rocks
log("Creating small decorative rocks...");
group = new SimpleGroup(
	[new SimpleObject(aRockMedium, 1,3, 0,1)],
	true
);
createObjectGroups(
	group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0),
	scaleByMapSize(16, 262), 50
);

RMS.SetProgress(65);

// create large decorative rocks
log("Creating large decorative rocks...");
group = new SimpleGroup(
	[new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
	true
);
createObjectGroups(
	group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 0, clHill, 0),
	scaleByMapSize(8, 131), 50
);

RMS.SetProgress(70);

// create deer
log("Creating deer...");
group = new SimpleGroup(
	[new SimpleObject(oDeer, 5,7, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 15, clHill, 1, clFood, 13),
	6 * numPlayers, 50
);

// create horse
log("Creating horse...");
group = new SimpleGroup(
	[new SimpleObject(oHorse, 1,3, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 15, clHill, 1, clFood, 13),
	3 * numPlayers, 50
);

RMS.SetProgress(75);

// create sheep
log("Creating sheep...");
group = new SimpleGroup(
	[new SimpleObject(oSheep, 5,7, 0,2)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 15, clHill, 1, clFood, 13),
	6 * numPlayers, 50
);

// create wolf
log("Creating wolf...");
group = new SimpleGroup(
	[new SimpleObject(oWolf, 1,3, 0,4)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 15, clHill, 1, clFood, 13),
	3 * numPlayers, 50
);

RMS.SetProgress(80);

// create straggler trees
log("Creating straggler trees...");
var types = [oOak, oBeech];	// some variation
var num = floor(numStragglers / types.length);
for (var i = 0; i < types.length; ++i)
{
	group = new SimpleGroup(
		[new SimpleObject(types[i], 1,1, 0,3)],
		true, clForest
	);
	createObjectGroups(group, 0,
		avoidClasses(clForest, 1, clHill, 1, clPlayer, 13, clMetal, 1, clRock, 1, clWater, 0),
		num
	);
}

RMS.SetProgress(85);

//create small grass tufts
log("Creating small grass tufts...");
group = new SimpleGroup(
	[new SimpleObject(aGrassShort, 1,2, 0,1, -PI/8,PI/8)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 2, clHill, 2, clPlayer, 13, clDirt, 0),
	scaleByMapSize(13, 200)
);

RMS.SetProgress(90);

// create large grass tufts
log("Creating large grass tufts...");
group = new SimpleGroup(
	[new SimpleObject(aGrass, 2,4, 0,1.8, -PI/8,PI/8), new SimpleObject(aGrassShort, 3,6, 1.2,2.5, -PI/8,PI/8)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 3, clHill, 2, clPlayer, 13, clDirt, 1, clForest, 0),
	scaleByMapSize(13, 200)
);

RMS.SetProgress(95);

// create bushes
log("Creating bushes...");
group = new SimpleGroup(
	[new SimpleObject(aBushMedium, 1,2, 0,2), new SimpleObject(aBushSmall, 2,4, 0,2)]
);
createObjectGroups(group, 0,
	avoidClasses(clWater, 1, clHill, 1, clPlayer, 13, clDirt, 1),
	scaleByMapSize(13, 200), 50
);

// Set environment
setSkySet("cirrus");
setWaterTint(0.747, 0.712, 0.322);				// muddy brown
setWaterReflectionTint(0.747, 0.712, 0.322);	// muddy brown
setWaterMurkiness(1.0);
setWaterReflectionTintStrength(0.377);

ExportMap();