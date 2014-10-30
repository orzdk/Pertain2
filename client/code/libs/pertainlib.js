// -------------------------------------------------------------------------------------------
// Not touched much
//
// -------------------------------------------------------------------------------------------

function diceRoll() {
    var d1 = Math.floor(Math.random() * 6) + 1;
    var d2 = Math.floor(Math.random() * 6) + 1;

    return {d1:d1,d2:d2}
}

// -------------------------------------------------------------------------------------------
// Isometric
//
// -------------------------------------------------------------------------------------------

var TILE_ZEROZERO_X = 360;
var TILE_ZEROZERO_Y = 20;
var TILE_WIDTH = 20;
var TILE_HEIGHT =10;
var GRID_X_OFFSET = 360;
var GRID_Y_OFFSET = 20;

function screen2iso(m_x, m_y){
    var iso_x = Math.floor(((m_x + (2 * m_y) - TILE_ZEROZERO_X - (2*TILE_ZEROZERO_Y))/TILE_WIDTH));
    var iso_y = Math.floor(((m_x - (2 * m_y) - TILE_ZEROZERO_X + (2*TILE_ZEROZERO_Y))/(-TILE_WIDTH)));

    return {
        x: iso_x,
        y: iso_y
    };
}

function iso2screen(iso_x, iso_y){
    var iso2screen_x = (iso_x * (0.5*TILE_WIDTH)) - (iso_y * (0.5*TILE_WIDTH)) + GRID_X_OFFSET ;
    var iso2screen_y = (iso_x * (0.5*TILE_HEIGHT)) + (iso_y * (0.5*TILE_HEIGHT)) + GRID_Y_OFFSET ;

    return {
        x: iso2screen_x,
        y: iso2screen_y
    };
}

function iso2cityiso(iso){

     var a =  iso - (iso % 4);
     return a;

}


// -------------------------------------------------------------------------------------------
// Utils
//
// -------------------------------------------------------------------------------------------

function getMousePos(evt) {
    var rect = $("#gamecanvas")[0].getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function browsercheck(){
    var a;

    if (navigator.userAgent.indexOf('Firefox') > -1){
        a = false;
    }
    else if (navigator.userAgent.indexOf('Chrome' > -1|| navigator.userAgent.indexOf('IE') > -1)){
        a = true;
    }
    return a;
}

function log(control,b,clear){
    if(clear == 1)  $("#" + control).val('');
    var a = $("#" + control).val();
    $("#" + control).val(a + ' : ' + b);
}

var cityFinderArray =  new Array();

cityFinderArray["0,0"]=1;
cityFinderArray["4,0"]=2;
cityFinderArray["8,0"]=3;
cityFinderArray["12,0"]=4;
cityFinderArray["16,0"]=5;
cityFinderArray["20,0"]=6;
cityFinderArray["24,0"]=7;
cityFinderArray["28,0"]=8;
cityFinderArray["32,0"]=9;
cityFinderArray["0,4"]=10;
cityFinderArray["32,4"]=11;
cityFinderArray["0,8"]=12;
cityFinderArray["32,8"]=13;
cityFinderArray["0,12"]=14;
cityFinderArray["32,12"]=15;
cityFinderArray["0,16"]=16;
cityFinderArray["4,16"]=17;
cityFinderArray["8,16"]=18;
cityFinderArray["12,16"]=19;
cityFinderArray["16,16"]=20;
cityFinderArray["20,16"]=21;
cityFinderArray["24,16"]=22;
cityFinderArray["28,16"]=23;
cityFinderArray["32,16"]=24;
cityFinderArray["0,20"]=25;
cityFinderArray["32,20"]=26;
cityFinderArray["0,24"]=27;
cityFinderArray["32,24"]=28;
cityFinderArray["0,28"]=29;
cityFinderArray["32,28"]=30;
cityFinderArray["0,32"]=31;
cityFinderArray["4,32"]=32;
cityFinderArray["8,32"]=33;
cityFinderArray["12,32"]=34;
cityFinderArray["16,32"]=35;
cityFinderArray["20,32"]=36;
cityFinderArray["24,32"]=37;
cityFinderArray["28,32"]=38;
cityFinderArray["32,32"]=39;

function cityfinder(cityCoordinates){
    return cityFinderArray[cityCoordinates];
}

var Boid = function() {

    var vector = new THREE.Vector3(),
        _acceleration, _width = 500, _height = 500, _depth = 200, _goal, _neighborhoodRadius = 100,
        _maxSpeed = 1.8, _maxSteerForce = 0.1, _avoidWalls = false;

    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    _acceleration = new THREE.Vector3();

    this.setGoal = function ( target ) {

        _goal = target;

    }

    this.setAvoidWalls = function ( value ) {

        _avoidWalls = value;

    }

    this.setWorldSize = function ( width, height, depth ) {

        _width = width;
        _height = height;
        _depth = depth;

    }

    this.run = function ( boids ) {

        if ( _avoidWalls ) {

            vector.set( - _width, this.position.y, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( _width, this.position.y, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, - _height, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, _height, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, this.position.y, - _depth );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, this.position.y, _depth );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

        }/* else {

         this.checkBounds();

         }
         */

        if ( Math.random() > 0.5 ) {

            this.flock( boids );

        }

        this.move();

    }

    this.flock = function ( boids ) {

        if ( _goal ) {

            _acceleration.add( this.reach( _goal, 0.005 ) );

        }

        _acceleration.add( this.alignment( boids ) );
        _acceleration.add( this.cohesion( boids ) );
        _acceleration.add( this.separation( boids ) );

    }

    this.move = function () {

        this.velocity.add( _acceleration );

        var l = this.velocity.length();

        if ( l > _maxSpeed ) {

            this.velocity.divideScalar( l / _maxSpeed );

        }

        this.position.add( this.velocity );
        _acceleration.set( 0, 0, 0 );

    }

    this.checkBounds = function () {

        if ( this.position.x >   _width ) this.position.x = - _width;
        if ( this.position.x < - _width ) this.position.x =   _width;
        if ( this.position.y >   _height ) this.position.y = - _height;
        if ( this.position.y < - _height ) this.position.y =  _height;
        if ( this.position.z >  _depth ) this.position.z = - _depth;
        if ( this.position.z < - _depth ) this.position.z =  _depth;

    }

    //

    this.avoid = function ( target ) {

        var steer = new THREE.Vector3();

        steer.copy( this.position );
        steer.sub( target );

        steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

        return steer;

    }

    this.repulse = function ( target ) {

        var distance = this.position.distanceTo( target );

        if ( distance < 150 ) {

            var steer = new THREE.Vector3();

            steer.subVectors( this.position, target );
            steer.multiplyScalar( 0.5 / distance );

            _acceleration.add( steer );

        }

    }

    this.reach = function ( target, amount ) {

        var steer = new THREE.Vector3();

        steer.subVectors( target, this.position );
        steer.multiplyScalar( amount );

        return steer;

    }

    this.alignment = function ( boids ) {

        var boid, velSum = new THREE.Vector3(),
            count = 0;

        for ( var i = 0, il = boids.length; i < il; i++ ) {

            if ( Math.random() > 0.6 ) continue;

            boid = boids[ i ];

            distance = boid.position.distanceTo( this.position );

            if ( distance > 0 && distance <= _neighborhoodRadius ) {

                velSum.add( boid.velocity );
                count++;

            }

        }

        if ( count > 0 ) {

            velSum.divideScalar( count );

            var l = velSum.length();

            if ( l > _maxSteerForce ) {

                velSum.divideScalar( l / _maxSteerForce );

            }

        }

        return velSum;

    }

    this.cohesion = function ( boids ) {

        var boid, distance,
            posSum = new THREE.Vector3(),
            steer = new THREE.Vector3(),
            count = 0;

        for ( var i = 0, il = boids.length; i < il; i ++ ) {

            if ( Math.random() > 0.6 ) continue;

            boid = boids[ i ];
            distance = boid.position.distanceTo( this.position );

            if ( distance > 0 && distance <= _neighborhoodRadius ) {

                posSum.add( boid.position );
                count++;

            }

        }

        if ( count > 0 ) {

            posSum.divideScalar( count );

        }

        steer.subVectors( posSum, this.position );

        var l = steer.length();

        if ( l > _maxSteerForce ) {

            steer.divideScalar( l / _maxSteerForce );

        }

        return steer;

    }

    this.separation = function ( boids ) {

        var boid, distance,
            posSum = new THREE.Vector3(),
            repulse = new THREE.Vector3();

        for ( var i = 0, il = boids.length; i < il; i ++ ) {

            if ( Math.random() > 0.6 ) continue;

            boid = boids[ i ];
            distance = boid.position.distanceTo( this.position );

            if ( distance > 0 && distance <= _neighborhoodRadius ) {

                repulse.subVectors( this.position, boid.position );
                repulse.normalize();
                repulse.divideScalar( distance );
                posSum.add( repulse );

            }

        }

        return posSum;

    }

}

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var camera, scene, renderer, birds, bird;

var boid, boids;
var stats;

function init() {

    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
    camera.position.z = 450;

    scene = new THREE.Scene();

    birds = [];
    boids = [];

    for ( var i = 0; i < 70; i ++ ) {

        boid = boids[ i ] = new Boid();
        boid.position.x = Math.random() * 400 - 200;
        boid.position.y = Math.random() * 400 - 200;
        boid.position.z = Math.random() * 400 - 200;
        boid.velocity.x = Math.random() * 2 - 1;
        boid.velocity.y = Math.random() * 2 - 1;
        boid.velocity.z = Math.random() * 2 - 1;
        boid.setAvoidWalls( true );
        boid.setWorldSize( 500, 500, 400 );

        bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
        bird.phase = Math.floor( Math.random() * 62.83 );
        bird.position = boids[ i ].position;
        scene.add( bird );


    }

    renderer = new THREE.CanvasRenderer();
    // renderer.autoClear = false;
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    //document.body.appendChild( renderer.domElement );
    document.getElementById('container').appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    //document.getElementById( 'container' ).appendChild(stats.domElement);

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    var vector = new THREE.Vector3( event.clientX - SCREEN_WIDTH_HALF, - event.clientY + SCREEN_HEIGHT_HALF, 0 );

    for ( var i = 0, il = boids.length; i < il; i++ ) {

        boid = boids[ i ];

        vector.z = boid.position.z;

        boid.repulse( vector );

    }

}

function animate() {

    requestAnimationFrame( animate );
    render();
    stats.update();

}

function render() {

    for ( var i = 0, il = birds.length; i < il; i++ ) {

        boid = boids[ i ];
        boid.run( boids );

        bird = birds[ i ];

        color = bird.material.color;
        color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

        bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
        bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

        bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
        bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;

    }

    renderer.render( scene, camera );

}