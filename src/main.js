import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { gsap } from 'gsap';

let scene, camera, renderer, controls;
let raycaster, pointer;
const interactable = [];

const DEFAULT_COLOR = 0x36a9c8;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(150, 120, 120);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    pointer = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    initLighting();
    initControls();
    loadModel();
    addCyberpunkText();
    createNeonSignBoard('Projects', -50, 90, 90);
    createNeonSignBoard('About Me', -50, 80, 90);

    animate();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
}

function initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(10, 10, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(hemiLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3);
    spotLight.position.set(15, 30, 15);
    spotLight.castShadow = true;
    scene.add(spotLight);
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.screenSpacePanning = false;
    controls.minDistance = 0;
    controls.maxDistance = 300;
    controls.maxPolarAngle = Math.PI / 2;


    renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());
}

function loadModel() {
    const loader = new GLTFLoader();
    loader.load('./models/room/scene.gltf', 
        function (gltf) {
            const object = gltf.scene;
            object.scale.set(0.5, 0.5, 0.5);
            object.position.set(0, 0, 50);
            scene.add(object);
        }, 
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, 
        function (error) {
            console.error(error);
        }
    );
}

function addCyberpunkText() {
  const fontLoader = new FontLoader();
  fontLoader.load('./fonts/cyberpunk.json', (font) => { // Adjust path to your font file
      const textParams = [
          { text: 'Kan Htet Myat San', color: 0xffffff, positionZ: 0},
          { text: 'Software Engineer', color: 0xd40055, positionZ: 10},
          { text: 'Game and VR Developer', color: 0xd40055, positionZ: 20},
          { text: 'Social Media Marketing', color: 0xd40055, positionZ: 30}
      ];

      textParams.forEach((param, index) => {
          const textGeometry = new TextGeometry(param.text, {
              font: font,
              size: 5,
              height: 1,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 0.1,
              bevelSize: 0.1,
              bevelSegments: 1
          });

          const textMaterial = new THREE.MeshStandardMaterial({
              color: param.color,
              emissive: param.color,
              emissiveIntensity: 2.5
          });

          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.set(60, 0, param.positionZ); // Adjust the z position to spread text across the floor
          textMesh.rotation.x = -Math.PI / 2; // Lay text flat on the floor
          textMesh.castShadow = true;
          scene.add(textMesh);
      });
  });
}

function createNeonSignBoard(s, x, y, z) {
  const fontLoader = new FontLoader();
  fontLoader.load('./fonts/cyberpunk.json', (font) => {  // Adjust path to your font file
      const neonMaterial = new THREE.MeshStandardMaterial({ color: 0x36a9c8, emissive: 0xff00ff, emissiveIntensity: 1.5 });

      // Create the 3D text for the signboard
      const textGeometry = new TextGeometry(s, {
          font: font,
          size: 4,
          height: 2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelSegments: 5
      });

      const textMesh = new THREE.Mesh(textGeometry, neonMaterial);
      textMesh.position.set(x, y, z); // Position the text
      textMesh.rotation.y = Math.PI / 2; // Lay the text flat
      textMesh.name = s;
      scene.add(textMesh);
      interactable.push(textMesh);
  });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    function flip(i) {
        interactable.forEach((interactable) => {
            if (interactable === i) {
                interactable.material.color.set(0xffffff);
            } else {
                interactable.material.color.set(DEFAULT_COLOR);
            }
        })
    }

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        flip(intersects[0].object);
    }
}

function onClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        if (interactable.includes(intersects[0].object)) {
            console.log("Projects");
            // Define target camera position
            const targetPosition = { x: 20, y: 20, z: 20}; // Customize target position
            const targetRotation = { x: 10, y: 50, z: 30};
            const duration = 2;

            console.log(intersects[0].object)

            // Animate camera to new position
            gsap.to(camera.position, {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                ease: 'power3.inOut',
                duration: duration, // Animation duration in seconds
                onUpdate: () => {
                    camera.lookAt(targetRotation);
                    camera.updateProjectionMatrix();
                },
                onComplete: () => {
                    console.log("Camera moved!");
                },
            });

            gsap.to(targetRotation, {
                x: targetRotation.x,
                y: targetRotation.y,
                z: targetRotation.z,
                duration: 2,
                onUpdate: () => {
                    camera.lookAt(targetRotation);
                    camera.updateProjectionMatrix();
                },
                onComplete: () => {
                    let text = intersects[0].object.name;
                    console.log(text)
                    transitionToHTMLPage(text);
                }
            });
        }
    }
}

function transitionToHTMLPage(s) {
    if (s === "Projects") {
        // Fade out the canvas
        renderer.domElement.style.transition = "opacity 1s";
        renderer.domElement.style.opacity = 0;

        // Wait for the fade-out animation to complete
        setTimeout(() => {
            // Navigate to a new HTML page
            window.location.href = "./projects.html";
        }, 1000); // Match the transition duration
    } else if (s === "About Me") {
        // Fade out the canvas
        renderer.domElement.style.transition = "opacity 1s";
        renderer.domElement.style.opacity = 0;

        // Wait for the fade-out animation to complete
        setTimeout(() => {
            // Navigate to a new HTML page
            window.location.href = "./about.html";
        }, 1000); // Match the transition duration
    }
}

function onTouchStart(event) {
    const touch = event.touches[0]; // Get the first touch point
    pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const touchedObject = intersects[0].object;
        if (interactable.includes(touchedObject)) {
            handleObjectInteraction(touchedObject);
        }
    }
}

function onTouchMove(event) {
    const touch = event.touches[0]; // Get the first touch point
    pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        highlightObject(hoveredObject);
    }
}

function highlightObject(object) {
    interactable.forEach((item) => {
        if (item === object) {
            item.material.color.set(0xffffff);
        } else {
            item.material.color.set(DEFAULT_COLOR);
        }
    });
}

function handleObjectInteraction(object) {
    const objectName = object.name;
    console.log(`Interacting with: ${objectName}`);
    transitionToHTMLPage(objectName);
}

init();
