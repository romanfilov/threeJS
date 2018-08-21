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
var points = [];
var geometry;
var index;
var dragControls;
function onMouseClick(e) {
    var point = null;
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    if(geometry) {
        geometry.boundingBox = null;
        geometry.boundingSphere = null;
    }
    var modelIntersects = raycaster.intersectObjects(models);
    var pointIntersects = raycaster.intersectObjects(points);
    if(pointIntersects.length > 0) {
        dragControls.addEventListener('drag', function() {
            point = pointIntersects[0].object;
            geometry.vertices[point.index].copy(point.position);
            geometry.verticesNeedUpdate = true;
        })
    } else if (points.length > 0 && pointIntersects.length === 0) {
        scene.remove(scene.getObjectByName('point'));
        points.pop();
    }  
    
    if (points.length == 0 && modelIntersects.length > 0) {
        point = getPoint(modelIntersects);
        if(point) {
            dragControls = new THREE.DragControls(points, camera, renderer.domElement);
            dragControls.addEventListener('dragstart', function () {
                controls.enabled = false;
            });
            dragControls.addEventListener('dragend', function () {
                controls.enabled = true;
            });
            points.push(point);
            scene.add(point);
        }
    }
}

function getPoint(modelIntersects) {
    
    var face = modelIntersects[0].face.clone();
    geometry = modelIntersects[0].object.geometry;
    var pointCoords = modelIntersects[0].point;
    var faceVertices = [];
    geometry.vertices.forEach(function(item, i) {
        if(i == face.a || i == face.b || i == face.c) {
            var selItem = item.clone();
            selItem.index = i;
            faceVertices.push(selItem); 
        }
    })
    faceVertices.forEach(function(item) {
        item.distance = pointCoords.distanceTo(item);
    })
    faceVertices.sort(function(a, b) {
        return a.distance - b.distance;
    })
    point = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x404040}));
    point.name = 'point';
    point.position.copy(faceVertices[0]);
    point.index = faceVertices[0].index;
    return point;
    // isExisting = checkExistingPoint(point.index);
    // if(!isExisting){
    //     return point;
    // }
}

// function checkExistingPoint(index) {
//     var findPoint  = points.find(function(point) {
//         return point.index === index;
//     })
//     if(findPoint) {
//         return true;
//     }
//     return false;
// }

var saveButton = document.createElement('button');
saveButton.className = 'save';
saveButton.innerHTML = 'Save';
document.body.appendChild(saveButton);

saveButton.onclick = function(e) {
    e.preventDefault();
    var save = new THREE.OBJExporter();
    var parse = save.parse( curModel );
    console.log(parse);
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    
    renderer.render(scene, camera);
}

window.addEventListener('mousedown', onMouseClick, false);

render();
