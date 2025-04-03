import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

// Splash particles system
class SplashSystem {
    constructor() {
        this.particles = [];
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            color: 0x55aaff,
            size: 0.4,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.points = new THREE.Points(geometry, material);
        scene.add(this.points);
    }

    addParticles(position, direction) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5) * 2,
                    position.y + Math.random() * 0.5,
                    position.z + (Math.random() - 0.5) * 2
                ),
                velocity: new THREE.Vector3(
                    direction.x * (Math.random() + 0.5) * 0.3,
                    Math.random() * 0.2,
                    direction.z * (Math.random() + 0.5) * 0.3
                ),
                life: 1.0
            });
        }
    }

    update() {
        // Filter out dead particles
        this.particles = this.particles.filter(p => p.life > 0);
        
        if (this.particles.length === 0) {
            this.points.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            return;
        }

        const positions = new Float32Array(this.particles.length * 3);
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // Update position
            particle.position.add(particle.velocity);
            particle.velocity.y -= 0.01; // Gravity
            particle.life -= 0.02; // Fade out
            
            // Set position in buffer
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;
        }

        this.points.geometry.dispose();
        this.points.geometry = new THREE.BufferGeometry();
        this.points.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.points.material.opacity = 0.8;
    }
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);

// Add spotlight for the boat
const boatLight = new THREE.SpotLight(0xffffff, 2);
boatLight.position.set(0, 20, 0);
boatLight.angle = Math.PI / 4;
boatLight.penumbra = 0.5;
boatLight.decay = 1;
boatLight.distance = 50;
scene.add(boatLight);

// Sky
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 10;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

const parameters = {
    elevation: 2,
    azimuth: 180
};

const sun = new THREE.Vector3();
const pmremGenerator = new THREE.PMREMGenerator(renderer);

// Water
const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
const water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', function(texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    }
);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// Update sun position
function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    directionalLight.position.copy(sun);

    const renderTarget = pmremGenerator.fromScene(sky);
    scene.environment = renderTarget.texture;
}

updateSun();

// Boat
let boat;
const objLoader = new OBJLoader();
const textureLoader = new THREE.TextureLoader();

objLoader.load('/models/boat.obj', (object) => {
    boat = object;
    boat.scale.set(5, 5, 5);
    boat.position.y = 0;
    scene.add(boat);

    // Load and apply texture
    textureLoader.load('/models/boat.png', (texture) => {
        boat.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({
                    map: texture,
                    shininess: 30
                });
            }
        });
    });
});

// Camera position
camera.position.set(0, 10, 30);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 10.0;
controls.maxDistance = 100.0;
controls.target.set(0, 2, 0);
controls.update();

// Movement controls
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = false;
    }
});

// Animation
const moveSpeed = 0.5;
const turnSpeed = 0.02;

// Create splash system
const splashSystem = new SplashSystem();

function animate() {
    requestAnimationFrame(animate);

    if (boat) {
        // Movement
        let isMoving = false;
        let moveDirection = new THREE.Vector3();

        if (keys.w) {
            boat.position.z += Math.cos(boat.rotation.y) * moveSpeed;
            boat.position.x += Math.sin(boat.rotation.y) * moveSpeed;
            moveDirection.set(-Math.sin(boat.rotation.y), 0, -Math.cos(boat.rotation.y));
            isMoving = true;
        }
        if (keys.s) {
            boat.position.z -= Math.cos(boat.rotation.y) * moveSpeed;
            boat.position.x -= Math.sin(boat.rotation.y) * moveSpeed;
            moveDirection.set(Math.sin(boat.rotation.y), 0, Math.cos(boat.rotation.y));
            isMoving = true;
        }
        if (keys.a) {
            boat.rotation.y += turnSpeed;
        }
        if (keys.d) {
            boat.rotation.y -= turnSpeed;
        }

        // Add splash particles when moving
        if (isMoving) {
            const behindBoat = new THREE.Vector3(
                boat.position.x + moveDirection.x * 2,
                0.5,
                boat.position.z + moveDirection.z * 2
            );
            splashSystem.addParticles(behindBoat, moveDirection);
        }

        // Update spotlight position to follow boat
        boatLight.position.x = boat.position.x;
        boatLight.position.z = boat.position.z;
        boatLight.target = boat;

        // Update camera to follow boat
        controls.target.copy(boat.position);
        controls.update();
    }

    // Update splash particles
    splashSystem.update();

    water.material.uniforms['time'].value += 1.0 / 60.0;
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 