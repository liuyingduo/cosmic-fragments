import * as THREE from "three";
import "./style.css";
import { createCamera } from "./core/camera.js";
import { addLights } from "./core/lights.js";
import { createRenderer } from "./core/renderer.js";
import { setupResize } from "./core/resize.js";
import { createScene } from "./core/scene.js";
import { createComposer } from "./effects/composer.js";
import { createBackgroundShapes } from "./objects/createBackgroundShapes.js";
import { createFrames } from "./objects/createFrames.js";
import { createGround } from "./objects/createGround.js";
import { createShards } from "./objects/createShards.js";
import { setupClickExplosion } from "./interactions/clickExplosion.js";
import { createMouseTracker } from "./interactions/mouse.js";
import { createScrollTracker } from "./interactions/scroll.js";
import { loadAstronaut } from "./loaders/loadAstronaut.js";
import { loadEnvironment } from "./loaders/loadEnvironment.js";
import { loadMetalTextures, loadMoonTextures } from "./loaders/loadTextures.js";
import { loadAssetManifest } from "./utils/assetPaths.js";
import { lerp } from "./utils/lerp.js";

const canvas = document.querySelector("#webgl");
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(canvas);
const { composer } = createComposer(renderer, scene, camera);
const clock = new THREE.Clock();

addLights(scene);

const mouse = createMouseTracker();
const scroll = createScrollTracker();
const cleanupResize = setupResize({ camera, renderer, composer });

const root = new THREE.Group();
root.name = "CosmicFragmentsRoot";
scene.add(root);

let astronaut = new THREE.Group();
let frames = new THREE.Group();
let shardGroup = new THREE.Group();
let backgroundShapes = new THREE.Group();
let shards = [];
let cleanupClick = () => {};

animate();
init();

async function init() {
  const manifest = await loadAssetManifest();
  const [moonMaps, metalMaps, loadedAstronaut] = await Promise.all([
    loadMoonTextures(manifest),
    loadMetalTextures(manifest),
    loadAstronaut(),
    loadEnvironment(scene, renderer),
  ]);

  astronaut = loadedAstronaut;
  frames = createFrames(metalMaps);
  const shardResult = createShards(145);
  shardGroup = shardResult.group;
  shards = shardResult.shards;
  backgroundShapes = createBackgroundShapes();

  const ground = createGround(moonMaps);
  astronaut.position.set(0, -0.28, 0.4);
  root.add(ground, frames, shardGroup, backgroundShapes, astronaut);
  cleanupClick = setupClickExplosion(shards);
}

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();
  const mouseState = mouse.update();
  const scrollProgress = scroll.update();

  updateCamera(mouseState, scrollProgress);
  updateAstronaut(mouseState, elapsed, scrollProgress);
  updateSceneGroups(mouseState, elapsed, delta, scrollProgress);

  if (composer) {
    composer.render(delta);
  } else {
    renderer.render(scene, camera);
  }
}

function updateCamera(mouseState, scrollProgress) {
  camera.position.x = lerp(camera.position.x, mouseState.x * 0.55, 0.06);
  camera.position.y = lerp(camera.position.y, 1.45 + mouseState.y * 0.32, 0.06);
  camera.position.z = lerp(camera.position.z, 10 - scrollProgress * 5.2, 0.055);
  camera.lookAt(0, 0.1 + scrollProgress * 0.65, -1.2 - scrollProgress * 2.3);
}

function updateAstronaut(mouseState, elapsed, scrollProgress) {
  astronaut.position.y = -0.28 + Math.sin(elapsed * 1.25) * 0.12 + scrollProgress * 0.16;
  astronaut.rotation.x = lerp(astronaut.rotation.x, mouseState.y * 0.12, 0.05);
  astronaut.rotation.y = lerp(astronaut.rotation.y, mouseState.x * 0.28, 0.05);
  astronaut.rotation.z = Math.sin(elapsed * 0.7) * 0.025;
}

function updateSceneGroups(mouseState, elapsed, delta, scrollProgress) {
  frames.position.x = lerp(frames.position.x, mouseState.x * -0.28, 0.05);
  frames.position.y = lerp(frames.position.y, mouseState.y * -0.14, 0.05);
  frames.position.z = -4 + scrollProgress * 2.2;

  backgroundShapes.rotation.z = mouseState.x * 0.03 + elapsed * 0.015;
  backgroundShapes.position.y = mouseState.y * 0.16 + scrollProgress * 0.4;

  shardGroup.rotation.y = mouseState.x * 0.08 + scrollProgress * 0.45;
  shardGroup.rotation.x = mouseState.y * -0.04;

  shards.forEach((shard) => {
    shard.mesh.rotation.x += shard.rotationSpeed.x * delta;
    shard.mesh.rotation.y += shard.rotationSpeed.y * delta;
    shard.mesh.rotation.z += shard.rotationSpeed.z * delta;
    shard.mesh.position.y += Math.sin(elapsed * shard.orbit + shard.basePosition.x) * 0.0008;
  });
}

window.addEventListener("beforeunload", () => {
  cleanupClick();
  cleanupResize();
  mouse.dispose();
  scroll.dispose();
});
