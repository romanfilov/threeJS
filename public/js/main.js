var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.up.set(0, 0, 1);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls( camera );


var horPlaneGeometry = new THREE.PlaneBufferGeometry(6, 6, 10, 10);
var horPlaneMaterial = new THREE.MeshLambertMaterial({color: 0x4553c1, transparent:true, opacity:.1, side: THREE.DoubleSide});
var horPlane = new THREE.Mesh(horPlaneGeometry, horPlaneMaterial);

scene.add(horPlane);

// var verPlaneGeometry = new THREE.PlaneGeometry(6000, 6000, 10, 10);
// var verPlaneMaterial = new THREE.MeshLambertMaterial({color: 0x454545, transparent: true, side: THREE.DoubleSide});
// var verPlane = new THREE.Mesh(verPlaneGeometry, verPlaneMaterial);
// verPlane.rotation.y = Math.PI / 2;

//scene.add(verPlane);

//var planes = [horPlane, verPlane];

var axes = new THREE.AxesHelper( 5 );
scene.add( axes  );






var light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );
var loader = new THREE.OBJLoader();
var models = [];
var point = null;
var curModel;
var obj;
loader.load(

 'models/cube.obj',

 function (object) {
    object.traverse( function( model ) {
        if( model instanceof THREE.Mesh ) {

            model.material.side = THREE.DoubleSide;
            model.material.color = new THREE.Color(0xcccccc);
            model.material.wireframe = true;
            var geometry = new THREE.Geometry ();
            geometry.fromBufferGeometry (model.geometry);
            geometry.mergeVertices();
            //geometry.computeVertexNormals ();
            models.push(model);
            model.geometry = geometry;
            curModel = model;
        }
        scene.add(object);
    });
    
    
 });




var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var geometry;
var index;
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
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( models );
    console.log(intersects);
    if( intersects.length !== 0 && intersects[0].object.name == 'point' ) {
        controls.enabled = false;
        var vector = new THREE.Vector3();
        var ray = new THREE.Raycaster();
        var crossing;
        window.onmousemove = function(e) {
            vector.x = ( e.clientX / window.innerWidth ) * 2 - 1;
            vector.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
            vector.z = 0.5;

            ray.setFromCamera(vector, camera);

            horPlane.position.copy(intersects[0].object.position);
            horPlane.lookAt(camera.position);
            crossing = ray.intersectObject(horPlane);
            point.position.copy(crossing[0].point);
            
            geometry.vertices[index].copy(point.position);

            geometry.verticesNeedUpdate = true;
            //this.console.log(point.position);
        }

        window.onmouseup = function(e) {
            this.onmousemove = null;
            this.onmouseup = null;
            geometry.verticesNeedUpdate = false;
        }
        controls.enabled = true;
        return;
    }
    
    
    if( intersects.length !== 0 ){
        
        var face = intersects[0].face.clone();
        geometry = intersects[0].object.geometry;
        var pointCoords = intersects[0].point;
        var faceVertices = [];
        var distance;
        geometry.vertices.forEach(function(item, i) {
            if(i == face.a || i == face.b || i == face.c) {
                var selItem = item.clone();
                selItem.index = i;
                faceVertices.push(selItem); 
            }
        })
        faceVertices.forEach(function(item, i) {
            distance = pointCoords.distanceTo(item);
            item.distance = distance;
        })
        faceVertices.sort(function(a, b) {
            return a.distance - b.distance;
        })
        point = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x404040}));
        point.name = 'point';
        point.position.copy(faceVertices[0]);
        index = faceVertices[0].index;
        models.push(point);
        scene.add(point);
    }

}

// function onDrag(mouse) {

//     mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//     mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

//     return mouse;

// }

function render() {

    
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);

}


window.addEventListener( 'mousedown', onMouseClick, false );
//window.addEventListener('mousedown', onMouseMove, false);

render();
