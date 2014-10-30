    // -------------------------------------------------------------------------------------------
	// Pertain2
	// (c) orz.dk 2013
	// -------------------------------------------------------------------------------------------

    var CANVAS_WIDTH = 800;
    var CANVAS_HEIGHT = 400;
    var BIRDS_ON = true;
    var SOUND_ON = true;

	var FPS = 60;
    var fps_measured = 0;
    var fps_lastLoop = 0;

    var my_network_player_id = -1;

    var tile_map = [];
    var citiesobj = [];

    var playerHandler = {};
    var tileHandler = {};
    var blockHandler = {};

    var bulletx = 0;
    var bullety = 0;
    var xVelocity = 0;
    var yVelocity = 0;
    var shooting = false;
    var bbulletData = {};
    var bulletData = {};
    var bulletSpeed = 4;

    var movesLeft = 0;

    var mapState = 'collapsed';
    var pointerVisible = true;
    var cityPointerVisible = true;

    var pointer = {
        x: -100,
        y: -100,
        width: 20,
        height: 20,
        lastDrawn: {x:0,y:0},
        pointerImgIdx : 0,
        setPointer: function(a){
            this.pointerImgIdx = a;
        } ,
        draw: function() {
            if (pointerVisible == true)
            $("#pointersmallcanvas")[0].getContext("2d").drawImage(pointerImageTable[this.pointerImgIdx], this.x - (0.5 * this.width), this.y - ((0.5 * this.width)));
            this.lastDrawn.x = this.x;
            this.lastDrawn.y = this.y;
        }
    };
    var citypointer = {
        x: -100,
        y: -100,
        lastDrawn: {x:0,y:0},
        width: 40,
        height: 80,
        pointerImgIdx : 1,
        draw: function() {
            if (cityPointerVisible == true){
                $("#pointercanvas")[0].getContext("2d").drawImage(miscImageObject.cityPointer, this.x - (0.5 * this.width) - 20, this.y - ((0.5 * this.width)) + 20);
                this.lastDrawn.x = this.x;
                this.lastDrawn.y = this.y;
            }
        }
    };

    var treeImageTable = [];
    var tileImageTable = [];
    var playerImageTable = [];
    var blockImageTable = [];
    var pointerImageTable = [];
    var explosionImageTable = [];
    var diceImageTable = [];
    var miscImageObject = [];

    var tInfo = {};

    var debug = true;
    var heartBeat = false;

    // -------------------------------------------------------------------------------------------
    // Handlers
    //
    // -------------------------------------------------------------------------------------------

    function TileHandler(){

        this.ready = true;
        this.draw = true;

        this.loadTileMap =function(){

            this.mm2d = [];
            for (var i = 0; i < tile_map.length; i++){
                var col = [];
                for (var j = 0; j < tile_map[i].length; j++) {
                    var tileScreenPos = iso2screen(i,j);
                    var a = new Tile(i,j,tileScreenPos.x, tileScreenPos.y,tile_map[i][j]);
                    col.push(a);
                }
                this.mm2d.push(col);
            }

        }

        this.drawTiles = function(){

            for (i = 0; i < tile_map.length; i++){
                for (var j = 0; j < tile_map[i].length; j++) {
                    this.mm2d[i][j].draw();
                }
            }
        }

    }

    function BlockHandler(){

        this.blocks2d = [];
        this.NumBlocksExploding = 0;
        this.blocksDraw = false;

        for (var i = 0; i < tile_map.length; i++){
            var col = [];
            for (var j = 0; j < tile_map[i].length +1; j++) {
                var a = new Block(i,j);
                col.push(a);
            }
            this.blocks2d.push(col);
        }

        this.drawBlocks = function(){
            if (this.blocksDraw == true){
                for (var i = 0; i < tile_map.length; i++){
                    for (var j = 0; j < tile_map[i].length +1; j++) {

                        if (this.blocks2d[i][j]){
                            this.blocks2d[i][j].tick();
                            this.blocks2d[i][j].draw();
                        }
                        var a = playerHandler.findPlayer(i,j);
                        if (a != -1 && playerHandler.players[a].playing){ playerHandler.players[a].draw();}
                    }
                }
            }
        }

        this.clearBlocks = function(){
            for (var i = 0; i < tile_map.length; i++){
                for (var j = 0; j < tile_map[i].length +1; j++) {
                    this.blocks2d[i][j].blockVisible = false;
                }
            }
        }
    }

    function PlayerHandler(){
        this.players = [];

        this.players.push(new Player(0));
        this.players.push(new Player(1));
        this.players.push(new Player(2));
        this.players.push(new Player(3));

        this.findPlayer = function(x,y){
            for (var i=0;i<this.players.length;i++){
                if (this.players[i].x == x && this.players[i].y == y) {
                    return i;
                }
            }
            return -1;
        }
    }


    // -------------------------------------------------------------------------------------------
    // Actors & Tiles
    //
    // -------------------------------------------------------------------------------------------

    function Tile(iso_x, iso_y, screen_x, screen_y, code){

        this.iso_x = iso_x;
        this.iso_y = iso_y;
        this.screen_x = screen_x;
        this.screen_y = screen_y;
        this.height = 20;
        this.width = 20;
        this.block ='';
        this.hasPlayer = -1;

        this.draw = function(){
            if(code >= 1){
                $("#tilecanvas")[0].getContext("2d").drawImage(tileImageTable[code], this.screen_x - (0.5 * this.width), this.screen_y - (0.5 * this.width));
            }
        }
    }

    function Block( isox, isoy ){
        this.type = 'block';

        this.isox = isox;
        this.isoy = isoy;

        this.owner = 0;
        this.blockVisible = false;
        this.locked = false;

        this.explosionStep = -1;
        this.explosionFramesPrStep = 5;
        this.explosionFramesRun = 0;

        this.animationStep = 0;
        this.animationFramesPrStep = 20;
        this.animationFramesRun = 0;

        this.animationDirection = 1;

        this.recalc = function(){
            var blockScreenPos = iso2screen(isox,isoy);
            this.screen_x = blockScreenPos.x;
            this.screen_y = blockScreenPos.y;

            if (this.type == 'block') {
                this.height = 20;
                this.width = 20;
            } else {
                this.height = 84;
                this.width = 46;
            }
        }

        this.recalc();

        this.tick = function(){

            if (this.animationFramesRun >= this.animationFramesPrStep){

                this.animationStep = this.animationStep + this.animationDirection;

                if (this.animationStep == 3){
                    this.animationDirection = -1;
                } else { if (this.animationStep == 0){
                    this.animationDirection = 1; }
                }

                this.animationFramesRun=0;
            }

            if (this.explosionFramesRun >= this.explosionFramesPrStep){
                if (this.explosionStep == 2){
                    this.blockVisible = false;
                    this.explosionStep = -1;
                    blockHandler.numBlocksExploding--;
                } else {
                    if (this.explosionStep != -1) {
                        this.explosionStep++;
                        this.explosionFramesRun = 0;
                    }
                }
            }
        }

        this.explode = function(){
            if (this.blockVisible) {
                this.explosionFramesRun = 0;
                this.explosionStep = 0;
                blockHandler.numBlocksExploding++;
            }
        }

        this.draw = function () {
            if (this.blockVisible) {

                if (this.type == 'block'){
                    $("#maskcanvas")[0].getContext("2d").drawImage(miscImageObject.blockMask, this.screen_x - (0.5 * this.width), this.screen_y - ((0.5 * this.width)));
                    $("#gamecanvas")[0].getContext("2d").drawImage(blockImageTable[this.owner], this.screen_x - (0.5 * this.width), this.screen_y - ((0.5 * this.width)));
                    if (this.explosionStep > -1 && this.explosionStep < 3) {
                        $("#gamecanvas")[0].getContext("2d").drawImage(explosionImageTable[this.explosionStep], this.screen_x - (0.5 * this.width), this.screen_y - ((0.5 * this.width)));
                        this.explosionFramesRun++;
                    }
                } else {
                    $("#maskcanvas")[0].getContext("2d").drawImage(blockMaskImage, this.screen_x - (0.5 * this.width) + 13, this.screen_y - ((0.5 * this.width)) +13);
                    $("#gamecanvas")[0].getContext("2d").drawImage(treeImageTable[this.animationStep], this.screen_x - (0.5 * this.width)+1, this.screen_y - ((0.5 * this.width))-52);
                    this.animationFramesRun++;
                    if (this.explosionStep > -1 && this.explosionStep < 3) {
                        $("#gamecanvas")[0].getContext("2d").drawImage(explosionImageTable[this.explosionStep], this.screen_x - (0.5 * this.width)+13, this.screen_y - ((0.5 * this.width))+13);
                        this.explosionFramesRun++;
                    }
                }
            }
        };
    }

    function Player(id){

        this.id = id;
        this.x = -1;
        this.y = -1;
        this.screenx = -1;
        this.screeny = -1;
        this.width = 20;
        this.height = 20;
        this.moves = 0;
        this.name = '';
        this.playing = 0;

        this.refreshScreenXY = function(){
            var playerScreen = iso2screen(this.x,this.y);
            this.screenx = playerScreen.x;
            this.screeny = playerScreen.y;
        }

        var tryTileInfo;

        this.trymove = function(direction){

            var moved = false;
            if (direction == 'up' && movesLeft >0) {
                tryTileInfo = tileHoverInfo('iso', {x: this.x, y: this.y-1});
                log('log2',this.x,1);
                log('log3',this.y,1);
                if (tryTileInfo.tileCode > 0 && tryTileInfo.tileBlockVisible == false)  {
                    this.y -= 1;
                    movesLeft--; moved = true;
                }
             } else if (direction == 'down' && movesLeft >0){
                tryTileInfo = tileHoverInfo('iso', {x:this.x,y:this.y+1});
                if (tryTileInfo.tileCode > 0 && tryTileInfo.tileBlockVisible == false){
                    this.y += 1;
                    movesLeft--; moved = true;
                }
            } else if (direction == 'left' && movesLeft >0){
                tryTileInfo = tileHoverInfo('iso', {x:this.x+1, y:this.y});
                if (tryTileInfo.tileCode > 0 && tryTileInfo.tileBlockVisible == false){
                    this.x +=1;
                    movesLeft--; moved = true;
                }
            } else if (direction == 'right' && movesLeft >0){
                tryTileInfo = tileHoverInfo('iso',{x:this.x-1,y:this.y});
                if (tryTileInfo.tileCode > 0 && tryTileInfo.tileBlockVisible == false){
                    this.x -=1;
                    movesLeft--; moved = true;
                }
            }

            if (moved == true){
                this.refreshScreenXY();
                $("#moveInfoLine1").val(movesLeft + " moves left");
                ss.rpc('pertain.playermoved',my_network_player_id,this.x,this.y);
                if (movesLeft == 0)
                    ss.rpc('pertain.turnEnded',my_network_player_id);
            }
        }

        this.draw = function(){
            if (this.id != -1){
                var a= iso2screen(this.x,this.y);
                $("#gamecanvas")[0].getContext("2d").drawImage(playerImageTable[this.id], a.x - (0.5 * this.width), a.y - (0.5 * this.width));
            }
        }
    }


    // -------------------------------------------------------------------------------------------
    // Misc
    //
    // -------------------------------------------------------------------------------------------

    function preloadImages(){
        treeImageTable  = treeImages();
        tileImageTable  = tileImages();
        playerImageTable = playerImages();
        blockImageTable = blockImages();
        pointerImageTable = pointerImages();
        explosionImageTable = explosionImages();
        diceImageTable = diceImages();
        miscImageObject = miscImages();

    }

    function roll() {
        var dice = diceRoll();
        movesLeft = dice.d1+dice.d2;

        $("#imgdice1").removeAttr('src').attr('src',diceImageTable[dice.d1].src );
        $("#imgdice2").removeAttr('src').attr('src',diceImageTable[dice.d2].src );
        $("#rollbutton").attr("disabled","disabled");

        $("#moveInfoLine1").val(movesLeft + " moves left");
    }

    function loadTileArray(message){
        tile_map = JSON.parse(message);
        tileHandler.loadTileMap();
        tileHandler.draw = true;
        setTimeout(function(){ tileHandler.draw = false; }, 3000);
    }

    function gotTurnInfo(message){
        var turnInfo = JSON.parse(message);
        if (turnInfo.playerInTurn == my_network_player_id){
            $("#rollbutton").removeAttr('disabled');
        }
        $("#moveInfoLine3").val('It\'s ' + turnInfo.playerInTurnName + '\'s turn');

    }

    function chatAdd(message){
        a = $("#chatroom").text();
        b = '';
        if (a != '') b = '\n';
        $("#chatroom").text($("#chatroom").text() + b + message);
    }

    function drawline(fromx, fromy, tox, toy){

        $("#pointercanvas")[0].getContext("2d").beginPath();
        $("#pointercanvas")[0].getContext("2d").moveTo(fromx, fromy);
        $("#pointercanvas")[0].getContext("2d").lineTo(tox, toy);
        $("#pointercanvas")[0].getContext("2d").strokeStyle = '#ffffff';
        $("#pointercanvas")[0].getContext("2d").lineWidth = 1;
        $("#pointercanvas")[0].getContext("2d").stroke();
    }

    function refreshPlayerStatus(infojson){
        playerss = JSON.parse(infojson);
        for(var i=0;i<playerss.length;i++){
            if (playerss[i].playing == 1){

                if(i == my_network_player_id){
                    $("#player" + i + "name").val(playerss[i].name).css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"2px"});
                } else {
                    $("#player" + i + "name").val(playerss[i].name).css({"background-color":"rgb(50,213,50)"});
                }
                playerHandler.players[i].x =  playerss[i].x;
                playerHandler.players[i].y =  playerss[i].y;
                playerHandler.players[i].refreshScreenXY();
                playerHandler.players[i].moves =  playerss[i].moves;
                playerHandler.players[i].name =  playerss[i].name;
                playerHandler.players[i].playing =  1;
                blockHandler.blocksDraw = true;
            }
            else{
                $("#player" + i + "name").val('Not connected').css({"background-color":"rgb(213,213,213)"});
                playerHandler.players[i].playing =  0;
            }
        }
    }

    function pingServer(){
        ss.rpc('pertain.ping',my_network_player_id);
    }

    function shoot(){
        xVelocity = bulletSpeed * Math.cos(bulletData.radian);
        yVelocity = bulletSpeed * Math.sin(bulletData.radian);
        shooting = true;
        bulletx = bulletData.ex;
        bullety = bulletData.ey;
    }

    function findbox(colorcode){

        var xmod;
        var ymod;
        var desc;

        var weapon = $("#weapon").find(":selected").val();

        switch(colorcode){
            case '255,255,0': //bottom - yellow
                xmod=0;ymod=0;desc='bottom - yellow';
                break;
            case '0,255,0': //right - green
                xmod=0;ymod=1;desc='right - green';
                break;
            case '0,0,255': //left - blue
                xmod=1;ymod=0;desc='left - blue';
                break;
            case '255,0,0': //top - red
                xmod=1;ymod=1;desc='top - red';
                break;
        }

        iso = screen2iso(bulletx,bullety);

        var tilex = iso.x + xmod;
        var tiley = iso.y + ymod;

        if (weapon == 'gun'){
            ss.rpc('pertain.explodeBlock', tilex, tiley);
            shooting = false;
        }

        else if (weapon == 'missile'){
            if (tilex == bulletData.targetisox && tiley == bulletData.targetisoy){
                if (SOUND_ON == true){playsoundExplosion();}
                ss.rpc('pertain.explodeBlock', tilex, tiley);
                blockHandler.blocks2d[tilex][tiley].explode();
                shooting = false;
            }
        }
    }

    function CityBuilding(type,owner,x,y){
        this.type = type;
        this.owner = owner;
        this.x = x;
        this.y = y;
    }

    function tileHoverInfo(isoOrScreen,mouseOver){

        var tileCode = -1;
        var tileCodeVillage = -1
        var tileBlockVisible = -1;
        var tileBlockOwner = -1;
        var tileBlockLocked = -1;
        var tileIsOnMap = false;
        var villageisox = -1;
        var villageisoy = -1;
        var scrn = {};
        var villagescrn = {};
        var myBlock = false;
        var iso = {};

        if (isoOrScreen == 'screen'){
            iso =  screen2iso(mouseOver.x,mouseOver.y);
        }
        else{
            iso.x = mouseOver.x;
            iso.y = mouseOver.y;
        }

        log('log1',iso.x + ',' + iso.y,1);

        if (iso.x > -1 && iso.x < 36 && iso.y > -1 && iso.y < 36){
             tileIsOnMap = true;

             if (tile_map[iso.x][iso.y]){
                tileBlockVisible =  blockHandler.blocks2d[iso.x][iso.y].blockVisible;
                tileBlockOwner =  blockHandler.blocks2d[iso.x][iso.y].owner;
                tileBlockLocked =  blockHandler.blocks2d[iso.x][iso.y].locked;
             } else {
                 tileBlockVisible = -1;
                 tileBlockOwner = -1;
             }
             scrn = iso2screen(iso.x, iso.y);

             villageisox = iso.x - (iso.x % 4);
             villageisoy = iso.y - (iso.y % 4);
             villagescrn = iso2screen(villageisox,villageisoy);

             tileCode = tile_map[iso.x][iso.y];
             tileCodeVillage = tile_map[villageisox][villageisoy];

             if (blockHandler.blocks2d[iso.x][iso.y]) {
                 tileBlockVisible = blockHandler.blocks2d[iso.x][iso.y].blockVisible;
                 tileBlockOwner = blockHandler.blocks2d[iso.x][iso.y].owner;
             } else {
                 tileBlockVisible = false;
                 tileBlockOwner = -1;
             }

             if (tileBlockOwner == my_network_player_id) myBlock = true; else myBlock = false;
        }
        else {
            tileIsOnMap = false;
        }

        log('playerBuildingInfoLine1',villagescrn.x + '.' + villagescrn.y,1);

        return {
            tileIsOnMap: tileIsOnMap,
            tileCode: tileCode, tileCodeVillage: tileCodeVillage,
            tileBlockVisible: tileBlockVisible, tileBlockOwner: tileBlockOwner,  tileBlockLocked: tileBlockLocked,
            myBlock: myBlock, iso: iso,
            villageisox: villageisox, villageisoy: villageisoy,
            villagescrnx: villagescrn.x, villagescrny:villagescrn.y,
            scrnx: scrn.x, scrny: scrn.y
        }

    }


    // -------------------------------------------------------------------------------------------
    // Formatter
    //
    // -------------------------------------------------------------------------------------------

    function formatter(){

        $("#playername").css({"font-size":"11px"}).css({"background-color":"#ffffff"});
        $("#tilecanvas").css({"z-index":"10"});
        $("#maskcanvas").css({"z-index":"15"}).css({"visibility":"hidden"});
        $("#gamecanvas").css({"z-index":"100"});
        $("#pointercanvas").css({"z-index":"20"});
        $("#pointersmallcanvas").css({"z-index":"120"});

        $("body").css({"background-color":"rgb(230,230,230)"}).css({"font-size":"11px"}).css({"position":"relative"});
        $("body").css("-webkit-user-select","none");
        $("body").css("-moz-user-select","none");
        $("body").css("-ms-user-select","none");
        $("body").css("-o-user-select","none");
        $("body").css("user-select","none");
        $("body").css('overflow', 'hidden');
        $("body").css({"background-image":"url('images/tree_bg_opaque.png')"}).css({"background-repeat":"repeat"}).css({"background-position":"center"});

        $("#gamearea").css({"position":"relative"}).css({"padding":"0px"}).css({"width":"94%"}).css({"height":"88%"})
            .css({"z-index":"5"}).css({"margin-left":"auto"}).css({"margin-right":"auto"}).css({"color":"#000000"})
            .css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"1px"});

        $("#gameareacontent").css({"position":"relative"}).css({"padding":"0px"}).css({"width":"1100px"}).css({"height":"92%"})
            .css({"z-index":"5"}).css({"margin-left":"auto"}).css({"margin-right":"auto"}).css({"color":"#000000"});

        $("disv").css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"1px"});

        $("#gameareabg").css({"position":"absolute"}).css({"opacity":"0.85"}).css({"background-color":"rgb(213,213,213)"}).css({"width":"100%"}).css({"height":"100%"})
            .css({"margin-left":"auto"}).css({"margin-right":"auto"});

        $("#rightmenudiv").css({"top":"5"}).css({"left":"74%"}).css({"top":"40px"}).css({"width":"270px"}).css({"height":"620px"}).css({"position":"absolute"})
            .css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"1px"}).css({"z-index":"50"});

        $("#rightmenudivbg").css({"width":"100%"}).css({"height":"100%"}).css({"position":"absolute"}).css({"background-color":"rgb(130,150,130)"})
            .css({"margin-left":"auto"}).css({"margin-right":"auto"}).css({"opacity":"0.50"});

        $("#headlinediv").css({"position":"absolute"}).css({"width":"100%"}).css({"height":"25px"})
            .css({"margin-left":"auto"}).css({"margin-right":"auto"}).css({"z-index":"99"}).css({"color":"#000000"});

        $("table").css({"position":"relative"}).css({"margin-left":"auto"}).css({"margin-right":"auto"});
        $("canvas, #bgimage").css({"position":"absolute"}).css({"top":"0"}).css({"left":"15"});

        $("#infodiv").css({"position":"relative"}).css({"width":"720px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#gamediv").css({"position":"relative"}).css({"width":"780px"}).css({"height":"400px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#weapondiv").css({"position":"relative"}).css({"width":"720px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});

        $("#cityinfodiv").css({"position":"absolute"}).css({"width":"250px"}).css({"height":"150px"}).css({"top":"190px"}).css({"left":"20px"})
            .css({"background-color":"#dddddd"})
            .css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"1px"});

        $("#cityInfoLine1").css({"font-size":"11px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#citytextinfo").css({"font-family":"Arial"}).css({"font-size":"11px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"}).css({"height":"80px"});

        $("input, textarea").css({"font-family":"Arial"});

        $("#moveinfodiv").css({"position":"absolute"}).css({"width":"250px"}).css({"height":"150px"}).css({"top":"190px"}).css({"left":"520px"})
            .css({"background-color":"#dddddd"})
            .css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"1px"});

        $("#moveInfoLine1").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#moveInfoLine2").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#moveInfoLine3").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});

        $("#logdiv").css({"position":"absolute"}).css({"width":"250px"}).css({"height":"150px"}).css({"top":"600px"}).css({"left":"520px"})
            .css({"background-color":"#dddddd"})
            .css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"1px"});

        $("#log1").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#log2").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#log3").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});

        $("#playerbuildingsdiv").css({"position":"absolute"}).css({"width":"250px"}).css({"height":"150px"}).css({"top":"600px"}).css({"left":"20px"})
            .css({"background-color":"#dddddd"})
            .css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"1px"});

        $("#playerBuildingInfoLine1").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#playerBuildingInfoLine2").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});
        $("#playerBuildingInfoLine3").css({"font-size":"10px"}).css({"background-color":"#ffffff"}).css({"width":"200px"}).css({"margin-left":"10px"}).css({"margin-right":"auto"});

        $("#dicediv").css({"margin-left":"auto"}).css({"margin-right":"auto"}).css({"z-index":"999"}).css({"position":"relative"}).css({"height":"50px"});
        $("#chatdiv").css({"position":"relative"}).css({"width":"240px"}).css({"height":"220px"}).css({"margin-left":"auto"}).css({"margin-right":"auto"});
        $("#rollbutton").attr('disabled','disabled').css({"font-size":"11px"}).css({"background-color":"rgb(213,213,213)"});
        $(".playername-inactive").css({"font-size":"10px"}).css({"background-color":"rgb(213,213,213)"}).css({"width":"100px"});
        $(".playerlisttd").css({"vertical-align":"bottom"}).css({"padding":"10px"});
        $(".soundbutton").css({"vertical-align":"bottom"}).css({"font-size":"11px"}).css({"background-color":"rgb(213,213,213)"}).css({"width":"70px"});
        $("#connectbutton").css({"vertical-align":"middle"}).css({"font-size":"11px"}).css({"background-color":"rgb(213,213,213)"}).css({"width":"70px"});
        $("#playertag").css({"vertical-align":"middle"});

        ////---------------------------------------------------------------

        $("#container").css({"position":"absolute"}).css({"top":"0"}).css({"left":"0"}).css({"width":"700px"}).css({"height":"400px"});

        $("#chatsubmit").css({"font-size":"11px"}).css({"background-color":"rgb(213,213,213)"}).attr('disabled','disabled');
        $("#chatmessage").css({"font-size":"11px"}).css({"width":"92%"}).css({"background-color":"rgb(213,213,213)"}).attr('disabled','disabled');
        $("#chatroom").css({"font-size":"11px"}).css({"background-color":"rgb(213,213,213)"}).css({"width":"92%"}).css({"height":"150px"})
            .css({"border-style":"solid"}).css({"border-color":"rgb(213,213,213)"}).css({"border-width":"1px"}).attr('disabled','disabled');

        $("#map").css({"font-size":"11px"}).css({"background-color":"rgb(213,213,213)"}).css({"width":"92%"}).css({"width":"92%"})
            .css({"border-style":"solid"}).css({"border-color":"rgb(213,213,213)"}).css({"border-width":"1px"}).css({"top":"-10px"})
            .css({"height":"80px"}).css({"z-index":"999"});

        $("#mapdiv").css({"position":"relative"}).css({"width":"240px"}).css({"height":"150px"}).css({"margin-left":"auto"}).css({"margin-right":"auto"}).css({"z-index":"999"});

        ////-------Events hookup-----------------------------------------------------------------

        $("#toggleambientsound").click(event_toggle_ambient_sound);
        $("#togglegamesound").click(event_toggle_game_sound);
        $("#togglemusicsound").click(event_toggle_music_sound);
        $("#togglebirds").click(event_toggle_birds);
        $("#rollbutton").click(event_roll_dice);
        $("#map").dblclick(event_mouseovermap);
        $("#chatmessage").keydown(event_chatmessage_keydown);
        $("#chatsubmit").click(event_sendChatMessage);
        $("#mapsubmit").click(event_applyMap);
        $('#connectbutton').click(event_connect);
        $('#disconnectbutton').click(event_disconnect);
        $('#deleteAllBlocksButton').click(event_deleteAllBlocks);
        $('#pointersmallcanvas').mousemove(event_canvas_mousemove).click(event_canvas_mouseclick);
        $(document).keydown(event_document_keydown);
        window.onbeforeunload = function(e){
            if (my_network_player_id != -1) event_disconnect();
        }
    }


    // -------------------------------------------------------------------------------------------
    // Remote Events
    //
    // -------------------------------------------------------------------------------------------

    ss.event.on('MESSAGE_BLOCK_REFRESH', function(message) {
        var o = JSON.parse(message);
        blockHandler.clearBlocks();
        for (var i = 0; i < o.length; i++) {
            blockHandler.blocks2d[o[i].x][o[i].y].blockVisible = true;
            blockHandler.blocks2d[o[i].x][o[i].y].owner = o[i].owner;
            blockHandler.blocks2d[o[i].x][o[i].y].type = o[i].blocktype;
            blockHandler.blocks2d[o[i].x][o[i].y].recalc();
        }
        blockHandler.blocksDraw = true;
    });

    ss.event.on('MESSAGE_BLOCK_ADDED', function(message) {
        var o = JSON.parse(message);
        blockHandler.blocks2d[o.x][o.y].blockVisible = true;
        blockHandler.blocks2d[o.x][o.y].owner = o.owner;
        blockHandler.blocks2d[o.x][o.y].type = o.blocktype;
        blockHandler.blocks2d[o.x][o.y].locked = false;
        blockHandler.blocks2d[o.x][o.y].recalc();
        blockHandler.blocksDraw = true;
    });

    ss.event.on('MESSAGE_PLAYER_MOVED', function(message) {
        var o = JSON.parse(message);
        playerHandler.players[o.id].x = o.x;
        playerHandler.players[o.id].y = o.y;
        var playerScreen = iso2screen(o.x, o.y);
        playerHandler.players[o.id].screenx = playerScreen.x;
        playerHandler.players[o.id].screeny = playerScreen.y;
        blockHandler.blocksDraw = true;
    });

    ss.event.on('MESSAGE_PLAYER_REFRESH', function(message) {
        refreshPlayerStatus(message);
    });

    ss.event.on('MESSAGE_BLOCK_EXPLODE', function(message) {
//        var obj = JSON.parse(message);
//        blockHandler.blocks2d[obj.x][obj.y].explode();
    });

    ss.event.on('MESSAGE_CHAT', function(message) {
        chatAdd(message);
    });

    ss.event.on('MESSAGE_MAP', function(message) {
        loadTileArray(message);
    });

    ss.event.on('MESSAGE_SHOT_FIRED', function(message) {

        var shotInfo = JSON.parse(message);

        bulletData.sx = shotInfo.sx;
        bulletData.sy = shotInfo.sy;
        bulletData.ex = shotInfo.ex;
        bulletData.ey = shotInfo.ey;
        bulletData.radian = shotInfo.radian;
        bulletData.targetisox = shotInfo.targetisox;
        bulletData.targetisoy = shotInfo.targetisoy;
        bulletData.local = false;

        shoot();

    });

    ss.event.on('MESSAGE_TURN_INFO', function(message) {
          gotTurnInfo(message);
    });

    ss.event.on('MESSAGE_CITY_UPDATE', function(message) {
        citiesobj = JSON.parse(message);
    });


    // -------------------------------------------------------------------------------------------
    // Local Events
    //
    // -------------------------------------------------------------------------------------------

    function event_canvas_mousemove (evt) {

        tInfo = tileHoverInfo('screen', getMousePos(evt));

        if (tInfo.tileCodeVillage > 0){
            var aa = cityfinder(tInfo.villageisox + "," + tInfo.villageisoy);
            if (citiesobj[aa]){
                var city = citiesobj[aa].name;
                var infostring = '';
                for (var i=0; i<citiesobj[aa].buildings.length; i++){
                    infostring = infostring + playerHandler.players[citiesobj[aa].buildings[i].owner].name  + '\'s ' + citiesobj[aa].buildings[i].type + '\n';
                }
                $("#cityInfoLine1").val(city);
                $("#citytextinfo").text(infostring);
            }
            cityPointerVisible = true;
        } else {
            cityPointerVisible = false;
        }

//        if (tInfo.tileCode > 0){
//            pointerVisible = true;
//        } else {
//            pointerVisible = false;
//        }

        pointer.x = tInfo.scrnx;
        pointer.y = tInfo.scrny;

        citypointer.x = tInfo.villagescrnx;
        citypointer.y = tInfo.villagescrny;
    }

    function event_canvas_mouseclick(evt){

        if (my_network_player_id > -1) {
            tInfo = tileHoverInfo('screen', getMousePos(evt));

            if(tInfo.tileIsOnMap == true && tInfo.tileCode > 0 && tInfo.tileBlockVisible == false && tInfo.tileBlockLocked == false){
                if (SOUND_ON == true){playsoundPlop();}

                var blockType =  $('input[name=buildingType]:checked').val();
                var blockObject = {x: tInfo.iso.x, y: tInfo.iso.y, owner: my_network_player_id, blocktype:blockType};
                var citySequenceNumber = cityfinder(tInfo.villageisox + "," + tInfo.villageisoy);
                var cityBuilding = new CityBuilding(blockType,my_network_player_id,tInfo.iso.x,tInfo.iso.y);

                blockHandler.blocks2d[tInfo.iso.x][tInfo.iso.y].locked = true;

                ss.rpc('pertain.saveBlockToMySQL', JSON.stringify(blockObject));
                ss.rpc('pertain.addBuilding',citySequenceNumber, JSON.stringify(cityBuilding));
            }
            else {
                if (tInfo.tileIsOnMap == true && tInfo.tileCode > 0 && tInfo.tileBlockVisible == true && tInfo.tileBlockLocked == false)  {

                    bbulletData.sx = tInfo.scrnx;
                    bbulletData.sy = tInfo.scrny + 6;
                    bbulletData.ex = playerHandler.players[my_network_player_id].screenx;
                    bbulletData.ey = playerHandler.players[my_network_player_id].screeny + 6;
                    bbulletData.radian = Math.atan2(bbulletData.sy - bbulletData.ey, bbulletData.sx - bbulletData.ex);
                    bbulletData.targetisox = tInfo.iso.x;
                    bbulletData.targetisoy = tInfo.iso.y;

                    ss.rpc('pertain.shotFired', JSON.stringify(bbulletData));
                }
                else {
                    if (SOUND_ON == true){playsoundDisallowed();}
                }
            }
        }
    }

    function event_mouseovermap(){
        if (mapState == 'collapsed') {
            $("#map").css({"left":"-300px"}).css({"top":"-300px"}).css({"position":"absolute"}).css({"width":"700px"}).css({"height":"600px"}).css({"opacity":"1"});
            mapState = 'expanded';
        }
        else {
            $("#map").css({"width":"92%"}).css({"height":"80px"}).css({"left":""}).css({"top":""}).css({"position":"relative"});
            mapState = 'collapsed';
        }
    }

    function event_document_keydown(e) {
        kc = e.keyCode;

        if (my_network_player_id > -1){
            if (kc == 38 || kc == 104){ //up
                playerHandler.players[my_network_player_id].trymove('up');
            } else if (kc == 39 || kc == 102){ //left
                playerHandler.players[my_network_player_id].trymove('left');
            } else if (kc == 37 || kc == 100){ //right
                playerHandler.players[my_network_player_id].trymove('right');
            } else if (kc == 40 || kc == 98){ //down
                playerHandler.players[my_network_player_id].trymove('down');
            }
        }
    }

    function event_chatmessage_keydown(evt){
        if (evt.keyCode == 13){
            $("#chatsubmit").trigger('click');
        }
    }

    function event_roll_dice(){
        $("#rollbutton").attr("disabled","disabled");
        $("#imgdice1").attr('src',diceImageTable[0].src);
        $("#imgdice2").attr('src',diceImageTable[0].src);
        if (SOUND_ON == true){playsoundDiceRoll();}
        setTimeout(function(){roll()}, 1000);
    }

    function event_connect(){

        $("#connectbutton").attr("disabled","disabled");

        ss.rpc('pertain.connect', $("#playertag").val(), function(response){
            ress = JSON.parse(response);
            my_network_player_id = ress.assignedPlayerId;
            if (my_network_player_id != -1){
                $("#player" + my_network_player_id + "name").css({"border-style":"solid"}).css({"border-color":"#000000"}).css({"border-width":"2px"}).val($("#player" + my_network_player_id + "name").val());
                $("#chatroom").css({"background-color":"#eeeeee"});
                $("#chatmessage").css({"background-color":"#eeeeee"});
                $("#chatsubmit").removeAttr('disabled');
                $("#chatmessage").removeAttr('disabled');

                ss.rpc('pertain.turnInfo', function(message){
                   gotTurnInfo(message);
                   if (heartBeat) setInterval(function(){pingServer()}, 1000);

                });
            }  else {
                alert('Connection failed');
            }

        });

    }

    function event_disconnect(){
        ss.rpc('pertain.disconnect', my_network_player_id, function(response){
        });
    }

    function event_deleteAllBlocks(){
        ss.rpc('pertain.deleteAllBlocks');
        ss.rpc('pertain.publishAllBlocks');
    }

    function event_sendChatMessage(){
        if (my_network_player_id != -1){
            var message = $("#chatmessage").val();
            $("#chatmessage").val('');
            ss.rpc('pertain.chatmessage',my_network_player_id, message);
        }
    }

    function event_applyMap(){
        var tile_map_string = $("#map").val();
        ss.rpc('pertain.saveMapToMySQL', tile_map_string);
    }

    function event_toggle_ambient_sound(){
        togglesoundAmbientForest();
    }

    function event_toggle_game_sound(){
        SOUND_ON = !SOUND_ON;
        if (SOUND_ON == true) {
            $("#togglegamesound").val('Game (+)');
        } else {
            $("#togglegamesound").val('Game (-)');
        }
    }

    function event_toggle_music_sound(){
        toggleMusic();
    }

    function event_toggle_birds(){
        BIRDS_ON = !BIRDS_ON;
        if (BIRDS_ON == true) {
            $("#container").css({"visibility":"visible"});
            $("#togglebirds").val('Birds (+)');
        } else {
            $("#container").css({"visibility":"hidden"});
            $("#togglebirds").val('Birds (-)');
        }
    }


    // -------------------------------------------------------------------------------------------
    // Local Events
    //
    // -------------------------------------------------------------------------------------------

    function tick(){

        if (shooting ){

            data =  $("#maskcanvas")[0].getContext("2d").getImageData(bulletx, bullety, 1, 1).data;
            var colorcode =  data[0] + ',' + data[1] + ',' + data[2];
            if (colorcode != '0,0,0' && colorcode != '255,255,255') {  //impact
                findbox(colorcode);
            }
            bulletx = bulletx + xVelocity;
            bullety = bullety + yVelocity;
        }

    }

    function draw() {

        if (tileHandler && tileHandler.ready && tileHandler.draw == true){
            $("#tilecanvas")[0].getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            tileHandler.drawTiles();
        }

        if(blockHandler && blockHandler.blocksDraw == true) {
            $("#gamecanvas")[0].getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            $("#maskcanvas")[0].getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            blockHandler.drawBlocks();
            if (blockHandler.numBlocksExploding == 0)
                blockHandler.blocksDraw = false;
        }

        $("#pointercanvas")[0].getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        $("#pointersmallcanvas")[0].getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        citypointer.draw();
        pointer.draw();

        if (shooting) {
            $("#pointercanvas")[0].getContext("2d").drawImage(miscImageObject.bullet, bulletx , bullety);
        }

    }

    function gameLoop(){

        if (true){
            var thisLoop = new Date;
            fps_measured = 1000 / (thisLoop - fps_lastLoop);
            log('playerBuildingInfoLine3','fps:' + fps_measured,1);
            fps_lastLoop = thisLoop;
        }

        tick();
        draw();
    }

    $(document).ready(function() {

        var bCheck = browsercheck();

        ss.rpc('pertain.mapInfo', function(message){
            $("#map").val(message);
            tileHandler = new TileHandler();
            loadTileArray(message);
            blockHandler = new BlockHandler();
            playerHandler = new PlayerHandler();

            preloadImages();
            ss.rpc('pertain.playerstatus');
            ss.rpc('pertain.publishAllBlocks');
            ss.rpc('pertain.cityinfo', function(f){
               citiesobj = JSON.parse(f);
            });

            formatter();

            setTimeout(function(){tileHandler.draw = false;}, 3000);
            setInterval(function(){gameLoop()}, 1000/FPS);

            init();
            animate();
            $("body").css('visibility', '');
        });

        if (!debug && bCheck) togglesoundAmbientForest();

        if (!bCheck){
            $("#toggleambientsound").css({"visibility":"hidden"});
            $("#togglemusicsound").css({"visibility":"hidden"});
        }


    });




