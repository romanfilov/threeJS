var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.up.set(0, 0, 1);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls( camera );


var planeGeometry = new THREE.PlaneGeometry(60, 40, 10, 10);
var planeMaterial = new THREE.MeshLambertMaterial({color: 0x4553c1, side: THREE.DoubleSide, wireframe: true});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(plane);

var axes = new THREE.AxesHelper( 5 );
scene.add( axes  );






var light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );
var loader = new THREE.OBJLoader();
var models = [];
var geometry;
var vertices = [];
var distance = [];
var point = null;
loader.load(

 'models/cube.obj',

 function (object) {
    object.traverse( function( model ) {
        if( model instanceof THREE.Mesh ) {
            model.material.side = THREE.DoubleSide;
            model.material.color = new THREE.Color(0xcccccc);
            model.material.wireframe = true;
            models.push(model);
            geometry = new THREE.Geometry().fromBufferGeometry(model.geometry);
            vertices = geometry.vertices;
        }
    });
    scene.add(object);
 });




var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


// function onMouseMove(e) {
//     e.preventDefault();
//     window.onmousemove = function() {
//         this.removeEventListener('click', onMouseClick);
//     }
//     window.onmouseup = function() {
//         this.onmousemove = null;
//     }
//     window.addEventListener('click', onMouseClick);
// }

function onMouseClick( e ) {
    controls.enabled = true;
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( models );
    if(intersects.length !== 0 && intersects[0].object.name === 'point') {
        controls.enabled = false;
        var newCoords = new THREE.Vector2();
        window.onmousemove = function() {
            newCoords = onDrag(newCoords);
            raycaster.setFromCamera(newCoords, camera);
            // var raycaster = new THREE.Raycaster(camera.position,
            // newCoords.sub(camera.position).normalize());
            console.log(newCoords.sub(camera.position).normalize());
        }

        window.onmouseup = function(e) {
            this.onmousemove = null;
            this.onmouseup = null;
            
        }
    }
    if( point !== null && intersects.length !== 0){
        scene.remove(point);
        point = null;
        models.pop();
    }
    if (point == null && intersects.length !== 0) {
        vertices.forEach(function(item, i){
           vertices[i].distance = intersects[0].point.distanceTo(item);
        })

        vertices.sort(function(a, b) {
            return a.distance - b.distance;
        });

        point = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial( { color: 0xff0000} ));
        point.position.set(vertices[0].x, vertices[0].y, vertices[0].z);
        point.name = 'point';
        models.push(point);
        scene.add(point);        
    }

}

function onDrag(mouse) {

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    return mouse;

}

function render() {

    
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);

}


window.addEventListener( 'mousedown', onMouseClick, false );
//window.addEventListener('mousedown', onMouseMove, false);

render();