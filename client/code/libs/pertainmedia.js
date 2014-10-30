// -------------------------------------------------------------------------------------------
// Sound
//
// -------------------------------------------------------------------------------------------

var playMP3 = buzz.isMP3Supported();
var musicMp3;

if (playMP3){
    var plopSoundMP3 = new buzz.sound("/sound/plop.mp3");
    var plopSound2MP3 = new buzz.sound("/sound/plop.mp3");
    var expSoundMP3 = new buzz.sound("/sound/explosion.mp3");
    var expSound2MP3 = new buzz.sound("/sound/explosion.mp3");
    var disallowedSoundMP3 = new buzz.sound("/sound/disallowed.mp3");
    var disallowedSound2MP3 = new buzz.sound("/sound/disallowed.mp3");
    var diceRollSoundMP3 = new buzz.sound("/sound/dice.mp3");
    var ambientForestSoundMP3 = new buzz.sound("/sound/forest6.mp3");

} else {
    var plopSound = new buzz.sound("/sound/plop.wav");
    var plopSound2 = new buzz.sound("/sound/plop.wav");
    var expSound = new buzz.sound("/sound/explosion.wav");
    var expSound2 = new buzz.sound("/sound/explosion.wav");
    var disallowedSound = new buzz.sound("/sound/disallowed.wav");
    var disallowedSound2 = new buzz.sound("/sound/disallowed.wav");
    var diceRollSound = new buzz.sound("/sound/dice.wav");
}

function playsoundDisallowed(){
        if(playMP3){
            if (!disallowedSoundMP3.isPaused()) {
                disallowedSoundMP3.play();
            }else{
                disallowedSound2MP3.play();
            }            }
        else {
            if (!disallowedSound.isPaused()) {
                disallowedSound.play();
            }else{
                disallowedSound2.play();
            }
        }
}

function playsoundPlop(){
        if(playMP3){
            if (!plopSoundMP3.isPaused()) {
                plopSound2MP3.play();
            }else{
                plopSoundMP3.play();
            }
        }
        else {
            if (!plopSound.isPaused()) {
                plopSound2.play();
            }else{
                plopSound.play();
            }
        }
}

function playsoundExplosion(){
        if(playMP3){
            if (!expSoundMP3.isPaused()) {
                expSound2MP3.play();
            }else{
                expSoundMP3.play();
            }
        }
        else {
            if (!expSound.isPaused()) {
                expSound2.play();
            }else{
                expSound.play();
            }
         }
}

function playsoundDiceRoll(){
        if(playMP3){
            diceRollSoundMP3.play();
        }
        else {
            diceRollSound.play();
        }
}

function togglesoundAmbientForest(){
    if (ambientForestSoundMP3.isPaused())  {
        $("#toggleambientsound").val('Birds (+)');
        ambientForestSoundMP3.play();
        ambientForestSoundMP3.loop();
    } else {
        $("#toggleambientsound").val('Birds (-)');
        ambientForestSoundMP3.stop();
    }
}

function toggleMusic(){

    if (!musicMp3 || musicMp3.isPaused()){
        $("#togglemusicsound").val('Loading Music');

        musicMp3 = new buzz.sound("/sound/music.mp3");

        musicMp3.bind("canplaythrough", function(e) {
            musicMp3.play();
            musicMp3.decreaseVolume(50);
            $("#togglemusicsound").val('Music (+)');
        });
    }
    else {
        $("#togglemusicsound").val('Music (-)');
        musicMp3.stop();
    }
}


// -------------------------------------------------------------------------------------------
// Images
//
// -------------------------------------------------------------------------------------------

var NUM_TILES = 18;
var NUM_TREE1 = 4;
var NUM_BLOCKS = 4;
var NUM_PLAYERS = 4;
var NUM_POINTERS = 3;
var NUM_EXPLOSIONS = 3;
var NUM_DICE = 7;

function tileImages(){
    var tmp = [];
    for (var i = 0; i < NUM_TILES; i++){
        var a = new Image();
        a.src = 'images/f_tile' + i + '.png';
        tmp.push(a);
    }
    return tmp;
}

function treeImages(){
    var tmp = [];
    for (var i = 0; i < NUM_TREE1; i++){
        var a = new Image();
        a.src = 'images/tree_monopoly_house_1_step' + i + '.png';
        tmp.push(a);
    }
    return tmp;
}

function blockImages(){
    var tmp = [];
    for (var i = 0; i < NUM_BLOCKS; i++){
        var a = new Image();
        a.src = 'images/player' + i + 'block.png';
        tmp.push(a);
    }
    return tmp;
}

function playerImages(){
    var tmp = [];
    for (var i = 0; i < NUM_PLAYERS; i++){
        var a = new Image();
        a.src = 'images/player' + i + '.png';
        tmp.push(a);
    }
    return tmp;
}

function pointerImages(){
    var tmp = [];
    for (var i = 1; i <= NUM_POINTERS; i++){
        var a = new Image();
        a.src = 'images/pointer' + i + '.png';
        tmp.push(a);
    }
    return tmp;
}

function explosionImages(){
    var tmp = [];
    for (var i = 0; i < NUM_EXPLOSIONS; i++){
        var a = new Image();
        a.src = 'images/bum' + i + '.png';
        tmp.push(a);
    }
    return tmp;
}

function diceImages(){
    var tmp = [];
    for (var i = 0; i < NUM_DICE; i++){
        var a = new Image();
        a.src = 'images/dices' + i + '.png';
        tmp.push(a);
    }
    return tmp;
}

function miscImages(){

    cityPointerImage = new Image();
    cityPointerImage.src = 'images/citypointer2.png';

    bulletImg = new Image();
    bulletImg.src = 'images/bulletpixel3.png';

    blockMaskImage = new Image();
    blockMaskImage.src = 'images/block_mask.png';

    return {cityPointer: cityPointerImage, bullet: bulletImg, blockMask: blockMaskImage}

}