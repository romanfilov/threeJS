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
var obj;
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
            model.geometry = new THREE.Geometry().fromBufferGeometry(model.geometry);
            obj = model;
            vertices = model.geometry.vertices;
            //console.log(vertices);
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
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    
    
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( models );
    //console.log(obj);
    if(intersects.length !== 0 && intersects[0].object.name === 'point') {
        controls.enabled = false;
        var vector = new THREE.Vector2();
        var SELECTED = intersects[0].object;
        window.onmousemove = function(e) {
            //newCoords = onDrag(newCoords);
            vector.x = ( e.clientX / window.innerWidth ) * 2 - 1;
            vector.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
            //this.console.log(vector);
            raycaster.setFromCamera(vector, camera);

            horPlane.position.copy(point.position);
            horPlane.lookAt(camera.position);
            intersects = raycaster.intersectObject(horPlane);
            point.position.copy(intersects[0].point);
            if(obj)
            {
                obj.geometry.vertices[0].copy(point.position);
                this.console.log(obj.geometry.vertices[0])
                obj.geometry.verticesNeedUpdate=true;
            }
            //obj.geometry.vertices[0].copy(point.position);
            //SELECTED.geometry.verticesNeedUpdate=true;
            //this.console.log(point.position);
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
        obj = intersects[0].object;
        point = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial( { color: 0xff0000} ));
        point.position.set(vertices[0].x, vertices[0].y, vertices[0].z);
        point.name = 'point';
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