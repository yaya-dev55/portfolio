import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PIECES } from './pieces-data.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   DOM
   ------------------------------------------------------------ */
const frame = document.getElementById('pieceViewerFrame');
const canvas = document.getElementById('pieceViewerCanvas');
const loadingEl = document.getElementById('viewerLoading');
const loadingLabel = document.getElementById('viewerLoadingLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pieceIndexEl = document.getElementById('pieceIndex');
const pieceNameEl = document.getElementById('pieceName');
const pieceDescEl = document.getElementById('pieceDesc');
const pieceViewBtn = document.getElementById('pieceViewBtn');
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');

if (frame && canvas) {

  /* --------------------------------------------------------
     RENDERER / SCENE / CAMERA
     -------------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

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

  size();
  window.addEventListener('resize', size);

  /* --------------------------------------------------------
     PIECE LOADING (one at a time, full detail, swapped on demand)
     -------------------------------------------------------- */
  const gltfLoader = new GLTFLoader();
  let currentIndex = 0;
  let currentModel = null;
  let loadToken = 0;

  let fitDistance = 6;
  let camDistance = 6;
  let camTargetDistance = 6;
  let minDist = 3, maxDist = 10;

  function disposeCurrent() {
    if (!currentModel) return;
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    });
    rig.remove(currentModel);
    currentModel = null;
  }

  function updateInfo(piece) {
    pieceIndexEl.textContent = `SPEC.${String(currentIndex + 1).padStart(2, '0')}  /  ${String(PIECES.length).padStart(2, '0')}`;
    pieceNameEl.textContent = piece.name;
    pieceDescEl.textContent = piece.tagline;
    pieceViewBtn.setAttribute('href', `work/collection.html#piece-${piece.id}`);
  }

  function loadPiece(index, opts = {}) {
    currentIndex = ((index % PIECES.length) + PIECES.length) % PIECES.length;
    const piece = PIECES[currentIndex];
    updateInfo(piece);

    const token = ++loadToken;
    loadingEl.classList.add('is-visible');
    loadingLabel.textContent = 'LOADING 0%';

    gltfLoader.load(
      `assets/${piece.file}`,
      (gltf) => {
        if (token !== loadToken) return; // a newer load superseded this one
        disposeCurrent();

        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();
            child.geometry.center();
            child.material = new THREE.MeshStandardMaterial({
              color: 0xdfe1e4, metalness: 1.0, roughness: 0.34, envMapIntensity: 1.3,
            });
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const boxSize = new THREE.Vector3();
        box.getSize(boxSize);
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z) || 1;
        model.scale.setScalar(3.2 / maxDim);
        model.rotation.x = Math.PI / 2 + (piece.flip ? Math.PI : 0);
        model.rotation.y = piece.yaw || 0;

        rig.rotation.y = 0;
        rig.add(model);
        currentModel = model;

        const radius = 2.4;
        const vfov = (camera.fov * Math.PI) / 180;
        fitDistance = (radius / Math.sin(vfov / 2)) * 1.1;
        camDistance = opts.keepZoom ? camDistance : fitDistance;
        camTargetDistance = fitDistance;
        minDist = fitDistance * 0.5;
        maxDist = fitDistance * 1.6;

        loadingEl.classList.remove('is-visible');

        if (!initialLoaded) {
          initialLoaded = true;
          bumpMainLoader();
        }
      },
      (xhr) => {
        if (token !== loadToken) return;
        if (xhr.total) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          loadingLabel.textContent = `LOADING ${pct}%`;
          if (!initialLoaded) loaderFill.style.width = pct + '%';
        }
      },
      (err) => {
        console.error('Failed to load', piece.file, err);
        loadingEl.classList.remove('is-visible');
        if (!initialLoaded) { initialLoaded = true; bumpMainLoader(); }
      }
    );
  }

  let initialLoaded = false;
  function bumpMainLoader() {
    loaderFill.style.width = '100%';
    setTimeout(() => loader.classList.add('is-hidden'), 250);
  }

  loadPiece(0);

  /* --------------------------------------------------------
     NAV
     -------------------------------------------------------- */
  prevBtn.addEventListener('click', () => loadPiece(currentIndex - 1));
  nextBtn.addEventListener('click', () => loadPiece(currentIndex + 1));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') loadPiece(currentIndex - 1);
    if (e.key === 'ArrowRight') loadPiece(currentIndex + 1);
  });

  /* --------------------------------------------------------
     DRAG TO ROTATE + CLICK TO VIEW
     -------------------------------------------------------- */
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let dragDistance = 0;
  let velocity = 0.15;
  let velocityX = 0;

  canvas.style.cursor = 'grab';

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    dragDistance = 0;
    canvas.style.cursor = 'grabbing';
    canvas.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    dragDistance += Math.abs(dx) + Math.abs(dy);
    rig.rotation.y += dx * 0.008;
    rig.rotation.x += dy * 0.008;
    velocity = dx * 0.008;
    velocityX = dy * 0.008;
  });
  window.addEventListener('pointerup', () => {
    if (dragging && dragDistance < 6) {
      window.location.href = `work/collection.html#piece-${PIECES[currentIndex].id}`;
    }
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  /* wheel zoom */
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camTargetDistance = THREE.MathUtils.clamp(camTargetDistance + e.deltaY * 0.01, minDist, maxDist);
  }, { passive: false });

  /* --------------------------------------------------------
     ANIMATE
     -------------------------------------------------------- */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!reduceMotion) {
      if (!dragging) {
        rig.rotation.y += velocity;
        velocity *= 0.94;
        rig.rotation.x += velocityX;
        velocityX *= 0.94;
        rig.rotation.y += 0.0018; // gentle ambient turn
      }
      camDistance += (camTargetDistance - camDistance) * 0.08;
      camera.position.z = camDistance;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }
  animate();

  /* Fallback: hide the page loader after 10s even if a load never resolves */
  setTimeout(() => { if (!initialLoaded) bumpMainLoader(); }, 10000);
}
