var PLAYER_COUNT = 4;
var ENV_DB = 'LIVE';

var cities = [
    {"id":0,"name":"Coconut Plantation", "buildings": [] },
    {"id":1,"name":"Yanomami Tribe Village", "buildings": [] },
    {"id":2,"name":"Huli Tribe Village", "buildings": [] },
    {"id":3,"name":"Pygmy Tribe Village", "buildings": [] },
    {"id":4,"name":"Bambuti People Village", "buildings": [] },
    {"id":5,"name":"Batwa People Village", "buildings": [] },
    {"id":6,"name":"Bayaka People Village", "buildings": [] },
    {"id":7,"name":"Bagyeli People Village", "buildings": [] },
    {"id":8,"name":"Caboclos Tribe Village", "buildings": [] },
    {"id":9,"name":"Witoto Tribe Village", "buildings": [] },
    {"id":10,"name":"Manioc Tribe Village", "buildings": [] },
    {"id":11,"name":"Kayapo Tribe Village", "buildings": [] },
    {"id":12,"name":"Kitchwa Tribe Village", "buildings": [] },
    {"id":13,"name":"Papuan Tribe Village", "buildings": [] },
    {"id":14,"name":"Amazon Rainforest", "buildings": [] },
    {"id":15,"name":"Atlantic Forest", "buildings": [] },
    {"id":16,"name":"Ituri Rainforest", "buildings": [] },
    {"id":17,"name":"Kilum-Ijim Forest", "buildings": [] },
    {"id":18,"name":"Madagascar Lowlands", "buildings": [] },
    {"id":19,"name":"Harapan Rainforest", "buildings": [] },
    {"id":20,"name":"Daintree Rainforest", "buildings": [] },
    {"id":21,"name":"Hawaiian Forests", "buildings": [] },
    {"id":22,"name":"Efe People Village", "buildings": [] },
    {"id":23,"name":"Aka People Village", "buildings": [] },
    {"id":24,"name":"Twa People Village", "buildings": [] },
    {"id":25,"name":"Baka People Village", "buildings": [] },
    {"id":26,"name":"Mbuti People Village", "buildings": [] },
    {"id":27,"name":"Lumad People Village", "buildings": [] },
    {"id":28,"name":"Penan Village", "buildings": [] },
    {"id":29,"name":"Dayak People Village", "buildings": [] },
    {"id":30,"name":"Yam Field", "buildings": [] },
    {"id":31,"name":"Coffee Field", "buildings": [] },
    {"id":32,"name":"Cocoa Field", "buildings": [] },
    {"id":33,"name":"Banana Field", "buildings": [] },
    {"id":34,"name":"Mango Field", "buildings": [] },
    {"id":35,"name":"Papaya Field", "buildings": [] },
    {"id":36,"name":"Macademia Field", "buildings": [] },
    {"id":37,"name":"Avocado Field", "buildings": [] },
    {"id":38,"name":"Sugarcane Field", "buildings": [] },
    {"id":39,"name":"Macaw Reserve", "buildings": [] },
    {"id":40,"name":"Cockatoo Reserve", "buildings": [] },
    {"id":41,"name":"Grey Parrot Reserve", "buildings": [] },
    {"id":42,"name":"Gouldian Finch Reserve", "buildings": [] },
    {"id":43,"name":"Zebra Finch Reserve", "buildings": [] },
    {"id":44,"name":"Cutthroat Finch Reserve", "buildings": [] },
    {"id":45,"name":"Parakeet Reserve", "buildings": [] },
    {"id":46,"name":"Weaver Finch Reserve", "buildings": [] },
    {"id":47,"name":"Malachite Kingfisher Reserve", "buildings": [] },
    {"id":48,"name":"Toucan Reserve", "buildings": [] },
    {"id":49,"name":"Harpy Eagle Reserve", "buildings": [] },
    {"id":50,"name":"Nighthawk Reserve", "buildings": [] }
]

var citiesReset = cities;

function removeBuildingFromCity(x,y){
    for (var i=0; i<cities.length; i++){
        for (var z=0; z<cities[i].buildings.length; z++){
            if (cities[i].buildings[z].x == x && cities[i].buildings[z].y == y){
                cities[i].buildings.splice(z,1);
                console.log('splice ok at ' + x + ',' + y);
                break;
            }
        }
    }
}

function removePlayerBuildingsFromCities(o){
    for (var i=0; i<cities.length; i++){
        for (var z=0; z<cities[i].buildings.length; z++){
            if (cities[i].buildings[z].owner == o){
                cities[i].buildings.splice(z,1);
                console.log('splice ok at owner' + o + ',record ' + z);
            }
        }
    }
}

function Player(id,x,y,moves){
    this.id = id;
    this.playing = 0;
    this.clientAlive = 0;
    this.x = x;
    this.y = y;
    this.startx = x;
    this.starty = y;
    this.moves = moves;
    this.name = 'Not connected';
    this.socketId = '';
}

function TurnHandler(){

    this.playersConnected = 0;
    this.playerHasTurn = 0;
    this.playerJustMoved = 0;

    this.infoTurn = function(){
        var nextTurnPlayerName = players.players[this.playerHasTurn].name;
        var infoObj = {playerInTurn:this.playerHasTurn, playerInTurnName: nextTurnPlayerName}
        return infoObj;
    }

    this.changeTurn = function(){
        var tryplayer = this.playerHasTurn;
        this.playerJustMoved = this.playerHasTurn;

        for (var i=0;i<4;i++){
            if (tryplayer == 3) {tryplayer = 0;} else {tryplayer++;}
            if (players.players[tryplayer].playing == 1){
                this.playerHasTurn = tryplayer;
                break;
            }
        }
        var nextTurnPlayerName = players.players[this.playerHasTurn].name;
        var infoObj = {playerInTurn:this.playerHasTurn, playerInTurnName: nextTurnPlayerName}
        return infoObj;
    }

}

function Players(){

    this.players = [];
    this.lastMover = -1;
    this.numberConnected = 0;

    this.nextTurnPlayer = function(){
        var tryplayer =  players.lastMover;
        var nextTurn = players.lastMover;

        for (var i=0;i<4;i++){
             if (tryplayer == 3) {tryplayer = 0;} else {tryplayer++;}
             if (players.players[tryplayer].playing == 1){
                 this.nextTurn = tryplayer;
                 break;
             }
         }
        if (nextTurn == -1) nextTurn = 0;
        return nextTurn;
    }

    this.addPlayer = function(a){
	    this.players.push(a);
    }

    this.nextFreePlayer = function(){
        var nextfree = -1;
        for (var i=0;i<this.players.length;i++){
            if (this.players[i].playing == 0){
                nextfree = i;
                break;
            }
	    }
	    return nextfree;
    }
}

var players = new Players();
var turnHandler = new TurnHandler();

players.addPlayer(new Player(1,32,32,2));
players.addPlayer(new Player(2,33,32,2));
players.addPlayer(new Player(3,34,32,2));
players.addPlayer(new Player(4,35,32,2));

function deleteAllBlocks() {
    var mysql = require('mysql');
    var client  = mysql.createConnection({
        host     : '',
        user     : '',
        password : '',
        database : '',
        insecureAuth: true
    });

    client.connect();

    var sql = "delete from Blocks_" + ENV_DB;
    client.query(sql, function(err, res) {
        client.end();
        console.log('blocks deleted');
    });

    return true;
}

exports.actions = function(req, res, ss) {

    req.use('session');

    return {

        turnEnded : function(clientId) {
               var infoObj = turnHandler.changeTurn();
               ss.publish.all('MESSAGE_TURN_INFO', JSON.stringify(infoObj));
        },

        turnInfo : function() {
               var infoObj = turnHandler.infoTurn();
               res(JSON.stringify(infoObj));
        },

        ping : function(clientId) {
          players.players[clientId].clientAlive = 1;
        },

        chatmessage : function(playerid, message) {
            ss.publish.all('MESSAGE_CHAT', players.players[playerid].name + ': ' + message)

        },

        connect: function(playerName) {
          var nfp = players.nextFreePlayer();
          var nfpp = nfp+1;
          if (nfp>-1) {
              if (playerName == '') playerName = 'Player' + nfpp;
              players.players[nfp].playing = 1;
              players.players[nfp].name = playerName;
              players.players[nfp].socketId = req.socketId;
          }

          ss.publish.all('MESSAGE_PLAYER_REFRESH', JSON.stringify(players.players));
          var connectres = {assignedPlayerId: nfp}
          return res(JSON.stringify(connectres));
      },

        cityinfo: function() {
            res(JSON.stringify(cities));
        },

        disconnect: function(id) {

          players.players[id].playing = 0;
          players.players[id].x = players.players[id].startx;
          players.players[id].y = players.players[id].starty;

          ss.publish.all('MESSAGE_PLAYER_REFRESH', JSON.stringify(players.players));

          removePlayerBuildingsFromCities(id);
          ss.publish.all('MESSAGE_CITY_UPDATE', JSON.stringify(cities));

          var mysql = require('mysql');
          var client  = mysql.createConnection({
              host     : '',
              user     : '',
              password : '',
              database : '',
              insecureAuth: true
          });

          client.connect();

          var sql = "delete from Blocks_" + ENV_DB + " where blockOwner=" + id;
          client.query(sql, function(err, res) {

              var sql = "select BlockScreenX,BlockScreenY,BlockOwner, BlockType from Blocks_" + ENV_DB;
              client.query(sql, function(err, rows, fields) {
                  var objstring="[";
                  for (var i = 0; i < rows.length; i++) {
                      objstring += "{\"x\":" + rows[i].BlockScreenX + ",\"y\":" + rows[i].BlockScreenY + ",\"owner\":\"" + rows[i].BlockOwner + "\"" + ",\"blocktype\":\"" + rows[i].BlockType + "\"},";
                  }
                  objstring = objstring.substring(0, objstring.length-1) + "]";
                  if (objstring != ']') {
                      ss.publish.all('MESSAGE_BLOCK_REFRESH', objstring);
                  } else { ss.publish.all('MESSAGE_BLOCK_REFRESH', "[]"); }
                  client.end();


              });
          });
      },

        playermoved: function(playerid, tox, toy) {
            players.players[playerid].x = tox;
            players.players[playerid].y = toy;

            var a = '{"message":"move","id":' + playerid + ',"x":' + tox + ',"y":' + toy + '}';
            ss.publish.all('MESSAGE_PLAYER_MOVED', a);
        },

        publishNewBlock: function(message) {
              if (message && message.length > 0) {
                ss.publish.all('MESSAGE_BLOCK_ADDED', message);
                return res(true);
              }
              else {
                return res(false);
              }
        },

        playerInfo: function() {
	        res(JSON.stringify(players.players));
        },

        saveBlockToMySQL : function(message) {
          var mysql = require('mysql');
          var messageObj = JSON.parse(message);
          var x = messageObj.x;
          var y = messageObj.y;
          var owner = messageObj.owner;
          var client  = mysql.createConnection({
              host     : '',
              user     : '',
              password : '',
              database : '',
              insecureAuth: true
          });

          client.connect();

          var sql = "insert into Blocks_" + ENV_DB + " (BlockScreenX,BlockScreenY,blockOwner,blockType) VALUES (" + x + "," + y + "," + owner + ",'" + messageObj.blocktype + "');";
          client.query(sql, function(err, res) {
              client.end();
          });

          ss.publish.all('MESSAGE_BLOCK_ADDED', message);

          return true;
    },

        saveMapToMySQL : function(message) {
            var mysql = require('mysql');
            var client  = mysql.createConnection({
                host     : '',
                user     : '',
                password : '',
                database : '',
                insecureAuth: true
            });

            client.connect();

            var sql = "update Map_" + ENV_DB + " set MapString = '" + message + "';";
            client.query(sql, function(err, res) {
                client.end();
            });

            ss.publish.all('MESSAGE_MAP', message);

            return true;
        },

        explodeBlock : function(x,y) {

            var mysql = require('mysql');
            var client  = mysql.createConnection({
                host     : '',
                user     : '',
                password : '',
                database : '',
                insecureAuth: true
            });

            client.connect();

            var sql = "delete from Blocks__" + ENV_DB + " where BlockScreenX = " + x + " AND BlockScreenY = " + y;
            client.query(sql, function(err, res) {
                client.end();
            });

            var explodeMessageObject = '{"x":' + x + ', "y":' + y + '}';
            ss.publish.all('MESSAGE_BLOCK_EXPLODE', explodeMessageObject);

            removeBuildingFromCity(x,y);

            ss.publish.all('MESSAGE_CITY_UPDATE', JSON.stringify(cities));
            return true;

    },

        publishAllBlocks : function(message,cb) {
              var mysql = require('mysql');
              var objstring = "[";

              var client  = mysql.createConnection({
                host     : '',
                user     : '',
                password : '',
                database : '',
                insecureAuth: true
          });

              client.connect();

              var sql = "select BlockScreenX,BlockScreenY,BlockOwner, BlockType from Blocks_" + ENV_DB;

              client.query(sql, function(err, rows, fields) {
              for (var i = 0; i < rows.length; i++) {
                  objstring += "{\"x\":" + rows[i].BlockScreenX + ",\"y\":" + rows[i].BlockScreenY + ",\"owner\":\"" + rows[i].BlockOwner + "\"" + ",\"blocktype\":\"" + rows[i].BlockType + "\"},";
              }
              objstring = objstring.substring(0, objstring.length-1) + "]";
              if (objstring != ']') {
                  ss.publish.socketId(req.socketId,'MESSAGE_BLOCK_REFRESH', objstring);
              }
          });
        },

        mapInfo : function() {
            var mysql = require('mysql');

            var client  = mysql.createConnection({
                host     : '',
                user     : '',
                password : '',
                database : '',
                insecureAuth: true
            });

            client.connect();

            var sql = "select MapString from Map_" + ENV_DB;

            client.query(sql, function(err, rows, fields) {
                    res(rows[0].MapString);
        });
    },

        playerstatus : function() {
            ss.publish.all('MESSAGE_PLAYER_REFRESH', JSON.stringify(players.players));
        },

        shotFired : function(message) {
            ss.publish.all('MESSAGE_SHOT_FIRED', message);
        },

        addBuilding : function(city,obj){

            cities[city].buildings.push(JSON.parse(obj));
            ss.publish.all('MESSAGE_CITY_UPDATE', JSON.stringify(cities));

        }

   };



};

deleteAllBlocks();

