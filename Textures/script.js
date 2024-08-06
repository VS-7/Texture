//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.set(0, 0, 3);

//Controls
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.staticMoving = true;

//Materials
const loader = new THREE.TextureLoader();

const logBaseText = loader.load('./assets/Rock055_8K-JPG_Color.jpg');
const logNormalText = loader.load('./assets/Rock055_8K-JPG_NormalGL.jpg');
const logDisplacementText = loader.load('./assets/Rock055_8K-JPG_Displacement.jpg');


const logMaterial = new THREE.MeshStandardMaterial({
    map: logBaseText,
    bumpScale: 100,
    normalScale: new THREE.Vector2(10, 10),
    displacementScale: 0.5,
    displacementBias: -0.1

});


//Light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3);
scene.add(directionalLight);

const logGeometry = new THREE.SphereGeometry(1, 64, 64);
const log = new THREE.Mesh(logGeometry, logMaterial);
scene.add(log);




//Animation
let ang = 0;
const angIncreaseRate = 0.03;
const radius = 2;
animate();
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    directionalLight.position.x = radius * Math.cos(ang);
    directionalLight.position.z = radius * Math.sin(ang);
    ang += angIncreaseRate;

    renderer.render(scene, camera);
}

//DOM Manipulation
const noneOption = document.getElementById("none");
noneOption.addEventListener("change", function () {
    if (this.checked) {
        logMaterial.bumpMap = null;
        logMaterial.normalMap = null;
        log.material.needsUpdate = true;
    }
});

const bumpMappingOption = document.getElementById("bump_mapping");
bumpMappingOption.addEventListener("change", function () {
    if (this.checked) {
        logMaterial.bumpMap = logDisplacementText;
        grassMaterial.bumpMap = grassDisplacementText;
        logMaterial.normalMap = null;
        log.material.needsUpdate = true;
    }
});

const normalMappingOption = document.getElementById("normal_mapping");
normalMappingOption.addEventListener("change", function () {
    if (this.checked) {
        logMaterial.normalMap = logNormalText;
        logMaterial.bumpMap = null;
        log.material.needsUpdate = true;
    }
});

const displacementMappingOption = document.getElementById("displacement_mapping");
displacementMappingOption.addEventListener("change", function () {
    if (this.checked) {
        logMaterial.displacementMap = logDisplacementText;
        log.material.needsUpdate = true;
    } else {
        logMaterial.displacementMap = null;
        log.material.needsUpdate = true;
    }
});