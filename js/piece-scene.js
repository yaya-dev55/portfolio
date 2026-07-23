import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PIECES, getPiece } from './pieces-data.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   Resolve which piece this page is for
   ------------------------------------------------------------ */
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const piece = getPiece(id) || PIECES[0];
const index = PIECES.findIndex((p) => p.id === piece.id) + 1;

document.getElementById('pageTitle').textContent = `${piece.name} — Yinqi Li`;
document.getElementById('pageDesc').setAttribute('content', piece.tagline);
document.getElementById('pieceEyebrow').textContent =
  `01 — 3D MODELING  /  SPEC.0${index}`;
document.getElementById('pieceTitle').textContent = piece.name;
document.getElementById('pieceTagline').textContent = piece.tagline;
document.getElementById('pieceMedium').textContent = piece.medium;
document.getElementById('pieceStatus').textContent = piece.status;

/* ------------------------------------------------------------
   Viewer
   ------------------------------------------------------------ */
const frame = document.getElementById('viewerFrame');
const canvas = document.getElementById('viewerCanvas');

if (frame && canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  function size() {
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(6, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fa2b3, 1.0);
  rim.position.set(-8, -3, -6);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const rig = new THREE.Group();
  scene.add(rig);

  let fitDistance = 6;
  let camDistance = 6;
  let camTargetDistance = 6;
  let minDist = 3, maxDist = 11;

  new GLTFLoader().load(`../assets/${piece.file}`, (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();
        child.geometry.center();
        child.material = new THREE.MeshStandardMaterial({
          color: 0xdfe1e4, metalness: 1.0, roughness: 0.32, envMapIntensity: 1.3,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const boxSize = new THREE.Vector3();
    box.getSize(boxSize);
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z) || 1;
    model.scale.setScalar(3.4 / maxDim);
    model.rotation.x = Math.PI / 2 + (piece.flip ? Math.PI : 0);
    model.rotation.y = piece.yaw || 0;

    rig.add(model);

    const radius = 2.6;
    const vfov = (camera.fov * Math.PI) / 180;
    fitDistance = (radius / Math.sin(vfov / 2)) * 1.05;
    camDistance = fitDistance;
    camTargetDistance = fitDistance;
    minDist = fitDistance * 0.5;
    maxDist = fitDistance * 1.6;
    camera.position.set(0, 0, camDistance);
  });

  size();
  window.addEventListener('resize', size);

  /* drag to rotate */
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let velocity = 0.15;
  let velocityX = 0;

  canvas.style.cursor = 'grab';

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
    canvas.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    rig.rotation.y += dx * 0.008;
    rig.rotation.x += dy * 0.008;
    velocity = dx * 0.008;
    velocityX = dy * 0.008;
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camTargetDistance = THREE.MathUtils.clamp(camTargetDistance + e.deltaY * 0.01, minDist, maxDist);
  }, { passive: false });

  function animate() {
    requestAnimationFrame(animate);
    if (!reduceMotion) {
      if (!dragging) {
        rig.rotation.y += velocity;
        velocity *= 0.94;
        rig.rotation.x += velocityX;
        velocityX *= 0.94;
        rig.rotation.y += 0.0015;
      }
      camDistance += (camTargetDistance - camDistance) * 0.08;
      camera.position.z = camDistance;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }
  animate();
}
