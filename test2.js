import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import starsTexture from '/textures/stars.jpg';
import sunTexture from '/textures/sun.jpg';
import mercuryTexture from '/textures/mercury.jpg';
import venusTexture from '/textures/venus.jpg';
import earthTexture from '/textures/earth.jpg';
import marsTexture from '/textures/mars.jpg';
import jupiterTexture from '/textures/jupiter.jpg';
import saturnTexture from '/textures/saturn.jpg';
import saturnRingTexture from '/textures/saturn ring.png';
import uranusTexture from '/textures/uranus.jpg';
import neptuneTexture from '/textures/neptune.jpg';

// Setting up renderer, scene, and camera
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000000);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-90, 300, 800);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Starry background
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture, starsTexture, starsTexture,
    starsTexture, starsTexture, starsTexture
]);

const earthRadius = 10;
// Sun
const textureLoader = new THREE.TextureLoader();
const sunGeo = new THREE.SphereGeometry(120, 128, 128);
const sunMat = new THREE.MeshBasicMaterial({ map: textureLoader.load(sunTexture) });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Array to hold all planets
let planets = [];
planets.push(sun); // Add the Sun to the planets array for raycasting

// Raycaster for detecting clicked objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to create planet orbits
function createOrbit(radius) {
    const path = new THREE.Path().absarc(0, 0, radius, 0, Math.PI * 2, false);
    const pts = path.getPoints(90); 

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const orbitLine = new THREE.LineLoop(geometry, material);
    orbitLine.rotation.x = Math.PI / 2;
    return orbitLine;
}

// Creating the planets
function createPlanet(size, texture, position, ring) {
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({ map: textureLoader.load(texture) });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    if (ring) {
        const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
        const ringMat = new THREE.MeshBasicMaterial({ map: textureLoader.load(ring.texture), side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        obj.add(ringMesh);
        ringMesh.position.x = position;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    scene.add(obj);
    mesh.position.x = position;
    planets.push(mesh);
    return { mesh, obj };
}

// Create planets and their orbits
const mercuryOrbit = createOrbit(267);
mercuryOrbit.material.color.set(0x7D7B6C); 
const mercury = createPlanet(earthRadius * 0.382, mercuryTexture, 267);
const venusOrbit = createOrbit(312);
venusOrbit.material.color.set(0xE5CDAF);
const venus = createPlanet(earthRadius * 0.948, venusTexture, 312);
const earthOrbit = createOrbit(353);
earthOrbit.material.color.set(0x2E86C1);
const earth = createPlanet(earthRadius, earthTexture, 353);
const marsOrbit = createOrbit(431);
marsOrbit.material.color.set(0xC1440E);
const mars = createPlanet(earthRadius * 0.531, marsTexture, 431);
const jupiterOrbit = createOrbit(959);
jupiterOrbit.material.color.set(0xD19A6B );
const jupiter = createPlanet(earthRadius * 11.209, jupiterTexture, 959);
const saturnOrbit = createOrbit(1647);
saturnOrbit.material.color.set(0xE6C59A);
const saturn = createPlanet(earthRadius * 9.449, saturnTexture, 1647, {
    innerRadius: earthRadius * 9.449,
    outerRadius: earthRadius * 21.95,
    texture: saturnRingTexture
});
const uranusOrbit = createOrbit(3130);
uranusOrbit.material.color.set(0x7FBFFF);
const uranus = createPlanet(earthRadius * 4.007, uranusTexture, 3130);
const neptuneOrbit = createOrbit(4675);
neptuneOrbit.material.color.set(0x4B6EAF);
const neptune = createPlanet(earthRadius * 3.882, neptuneTexture, 4675);

// Add orbit lines to the scene
scene.add(mercuryOrbit);
scene.add(venusOrbit);
scene.add(earthOrbit);
scene.add(marsOrbit);
scene.add(jupiterOrbit);
scene.add(saturnOrbit);
scene.add(uranusOrbit);
scene.add(neptuneOrbit);

// Point Light
const addPointLight = (x, y, z, helperColor) => {
    const color = 0xffffff;
    const intensity = 4;
    const distance = 0;
    const decay = 0;

    const pointLight = new THREE.PointLight(color, intensity, distance, decay);
    pointLight.position.set(x, y, z);

    scene.add(pointLight);

    const pointLightHelper = new THREE.PointLightHelper(pointLight, 10, helperColor);
    scene.add(pointLightHelper);
};

addPointLight(0, 0, 0);

// Set the initial focus on the Sun
orbit.target.copy(sun.position);
orbit.update();

// Function to handle clicking on planets
window.addEventListener('click', (event) => {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        orbit.target.copy(clickedPlanet.position);
        orbit.update();
    }
});

// Earth revolution speed variable
let earthRevolveSpeed = 0.0;

// Add a slider dynamically to control the revolution speed
const sliderContainer = document.createElement('div');
sliderContainer.style.position = 'absolute';
sliderContainer.style.bottom = '20px'; // Move the slider to the bottom
sliderContainer.style.left = '50%';    // Center the slider horizontally
sliderContainer.style.transform = 'translateX(-50%)'; // Center the slider precisely
sliderContainer.style.color = 'white';
sliderContainer.style.textAlign = 'center'; // Align text and elements to the center
sliderContainer.innerHTML = `
    <label for="speedSlider">Speed:</label><br>
    <input type="range" id="speedSlider" min="-0.01" max="0.01" step="0.0001" value="0"> <!-- Set default value to 0 for middle position -->
    <span id="speedValue">0.0000</span> <!-- Display the default value as 0 -->
`;
document.body.appendChild(sliderContainer);

// Get the slider and span elements
const speedSlider = document.getElementById('speedSlider');
const speedValueDisplay = document.getElementById('speedValue');

// Update earthRevolveSpeed when the slider is changed
speedSlider.addEventListener('input', () => {
    earthRevolveSpeed = parseFloat(speedSlider.value);
    speedValueDisplay.textContent = parseFloat(speedSlider.value).toFixed(4); // Display the speed to 4 decimal places
});


// Animate function for camera following the selected planet
function animate() {
    // Self-rotation
    sun.rotateY(earthRevolveSpeed * 1);
    mercury.mesh.rotateY(earthRevolveSpeed * 88);
    venus.mesh.rotateY(earthRevolveSpeed * 255);
    earth.mesh.rotateY(earthRevolveSpeed * 365.25);
    mars.mesh.rotateY(earthRevolveSpeed * 687);
    jupiter.mesh.rotateY(earthRevolveSpeed * 4332);
    saturn.mesh.rotateY(earthRevolveSpeed * 10756);
    uranus.mesh.rotateY(earthRevolveSpeed * 30687);
    neptune.mesh.rotateY(earthRevolveSpeed * 60190);

    // Around-sun-rotation
    mercury.obj.rotateY(earthRevolveSpeed * 4.14);
    venus.obj.rotateY(earthRevolveSpeed * 1.62);
    earth.obj.rotateY(earthRevolveSpeed);
    mars.obj.rotateY(earthRevolveSpeed * 0.53);
    jupiter.obj.rotateY(earthRevolveSpeed * 0.08);
    saturn.obj.rotateY(earthRevolveSpeed * 0.033);
    uranus.obj.rotateY(earthRevolveSpeed * 0.0118);
    neptune.obj.rotateY(earthRevolveSpeed * 0.0060);

    orbit.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Resize event listener
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
