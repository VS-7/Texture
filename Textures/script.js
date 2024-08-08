// Cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);

// Câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.staticMoving = true;

// Carregamento de Texturas
const loader = new THREE.TextureLoader();

const rockBase = loader.load('./assets/rock/Rock055_1K-JPG_Color.jpg');
const rockNormal = loader.load('./assets/rock/Rock055_1K-JPG_NormalGL.jpg');
const rockDisplacement = loader.load('./assets/rock/Rock055_1K-JPG_Displacement.jpg');

const groundBase = loader.load('./assets/ground/Ground078_1K-JPG_Color.jpg');
const groundNormal = loader.load('./assets/ground/Ground078_1K-JPG_NormalGL.jpg');
const groundDisplacement = loader.load('./assets/ground/Ground078_1K-JPG_Displacement.jpg');

const rockMaterial = new THREE.MeshStandardMaterial({
    map: rockBase,
    bumpScale: 100,
    normalScale: new THREE.Vector2(10, 10),
    displacementScale: 0.5,
    displacementBias: -0.1
});

const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundBase,
    bumpMap: groundDisplacement,
    bumpScale: 0.2,
    normalMap: groundNormal,
    normalScale: new THREE.Vector2(1, 1),
    displacementMap: groundDisplacement,
    displacementScale: 0.1
});

// Luz Direcional
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

// Esfera (rock)
const rockGeometry = new THREE.SphereGeometry(1, 64, 64);
const rock = new THREE.Mesh(rockGeometry, rockMaterial);
rock.position.y = 1; // Levanta a esfera acima do plano
scene.add(rock);

// Plano (Chão)
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const plane = new THREE.Mesh(planeGeometry, groundMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Quadrados Interativos
const boxSize = 1;
const boxPositions = [
    { position: new THREE.Vector3(-2, 0.5, 0), mapping: 'bump_mapping', text: 'Bump Mapping: Adiciona relevo baseado em textura.'},
    { position: new THREE.Vector3(0, 0.5, 0), mapping: 'normal_mapping', text: 'Normal Mapping: Simula irregularidades sem alterar a geometria.' },
    { position: new THREE.Vector3(2, 0.5, 0), mapping: 'displacement_mapping', text: 'Displacement Mapping: Modifica a geometria de acordo com a textura.' },
];

const interactionBoxes = [];

boxPositions.forEach(({ position, mapping, text }) => {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize, boxSize, boxSize),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    box.position.copy(position);
    box.userData = { mapping, text };
    scene.add(box);
    interactionBoxes.push(box);
});

function checkInteraction() {
    interactionBoxes.forEach(box => {
        const distance = rock.position.distanceTo(box.position);
        if (distance < 1.5) {
            document.getElementById('message').style.display = 'block';
            document.getElementById('messageText').textContent = box.userData.text;
        }
    });
}

// Variáveis de Movimento
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let isJumping = false;
let jumpVelocity = 0;
const moveSpeed = 0.05;
const gravity = 0.01;
const jumpStrength = 0.2;

// Listeners de Eventos de Tecla
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            moveForward = true;
            break;
        case 'a':
            moveLeft = true;
            break;
        case 's':
            moveBackward = true;
            break;
        case 'd':
            moveRight = true;
            break;
        case ' ':
            if (!isJumping) {
                isJumping = true;
                jumpVelocity = jumpStrength;
            }
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
            moveForward = false;
            break;
        case 'a':
            moveLeft = false;
            break;
        case 's':
            moveBackward = false;
            break;
        case 'd':
            moveRight = false;
            break;
    }
});

// Animação
let ang = 0;
let angIncreaseRate = 0.03;
const radius = 2;

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Atualiza a posição da esfera com base nas bandeiras de movimento
    if (moveForward) {
        rock.position.z -= moveSpeed;
        rock.rotation.x -= moveSpeed;
    }
    if (moveBackward) {
        rock.position.z += moveSpeed;
        rock.rotation.x += moveSpeed;
    }
    if (moveLeft) {
        rock.position.x -= moveSpeed;
        rock.rotation.z += moveSpeed;
    }
    if (moveRight) {
        rock.position.x += moveSpeed;
        rock.rotation.z -= moveSpeed;
    }

    // Lida com o salto
    if (isJumping) {
        rock.position.y += jumpVelocity;
        jumpVelocity -= gravity;

        if (rock.position.y <= 1) {
            rock.position.y = 1;
            isJumping = false;
            jumpVelocity = 0;
        }
    }

    directionalLight.position.x = radius * Math.cos(ang);
    directionalLight.position.z = radius * Math.sin(ang);
    ang += angIncreaseRate;

    checkInteraction();

    renderer.render(scene, camera);
}

// Listeners para Opções de Mapeamento
document.querySelectorAll('input[name="mapping"]').forEach(option => {
    option.addEventListener('change', function () {
        switch (this.value) {
            case 'none':
                rockMaterial.bumpMap = null;
                rockMaterial.normalMap = null;
                rockMaterial.displacementMap = null;

                groundMaterial.bumpMap = null;
                groundMaterial.normalMap = null;
                groundMaterial.displacementMap = null;

                break;
            case 'bump_mapping':
                rockMaterial.bumpMap = rockDisplacement;
                rockMaterial.normalMap = null;
                rockMaterial.displacementMap = null;

                groundMaterial.bumpMap = groundDisplacement;
                groundMaterial.normalMap = null;
                groundMaterial.displacementMap = null;
                break;
            case 'normal_mapping':
                rockMaterial.normalMap = rockNormal;
                rockMaterial.bumpMap = null;
                rockMaterial.displacementMap = null;

                groundMaterial.normalMap = groundNormal;
                groundMaterial.bumpMap = null;
                groundMaterial.displacementMap = null;
                break;
        }
        rock.material.needsUpdate = true;
        plane.material.needsUpdate = true;
    });
});

// Listener para Opção de Mapeamento de Deslocamento
document.getElementById('displacement_mapping').addEventListener('change', function () {
    rockMaterial.displacementMap = this.checked ? rockDisplacement : null;
    rock.material.needsUpdate = true;
    plane.material.needsUpdate = true;
});

// Listener para Slider de Velocidade da Luz
document.getElementById('lightSpeed').addEventListener('input', function () {
    angIncreaseRate = parseFloat(this.value);
});

// Lida com Redimensionamento da Janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
