# Cosmic Fragments

An interactive Three.js learning project featuring an astronaut, floating glass fragments, moon surface material, EXR environment lighting, mouse parallax, click interactions, scroll-driven camera movement, and cinematic post-processing.

Cosmic Fragments is a Vite + Vanilla JavaScript project for learning how to build a polished WebGL hero scene. It is inspired by high-end interactive WebGL motion design, but it does not use Lusion branding, logos, text, or official assets.

## Features

- Full-screen fixed WebGL canvas with HTML UI overlay
- Astronaut GLB loading with a simple fallback placeholder
- EXR environment lighting through `PMREMGenerator`
- Moon surface plane with optional diffuse, normal, roughness, AO, and displacement maps
- Procedural metal frame tunnel with fallback metal material
- Procedural transparent glass shards
- Mouse parallax with eased movement
- Click-triggered shard burst animation using GSAP
- Scroll-driven camera push across a `300vh` page
- EffectComposer, RenderPass, UnrealBloomPass, and a subtle custom ShaderPass
- Friendly warnings and fallbacks when assets are missing

## Tech Stack

- Vite
- Vanilla JavaScript
- Three.js
- GSAP
- Three.js addons:
  - `GLTFLoader`
  - `EXRLoader`
  - `EffectComposer`
  - `RenderPass`
  - `UnrealBloomPass`
  - `ShaderPass`

## Install

```bash
npm install
```

## Organize Assets

Put source assets in the project root or anywhere inside the workspace, then run:

```bash
npm run organize-assets
```

The script scans the workspace and copies known files into `public/`:

```txt
public/
  models/
    astronaut.glb
  hdr/
    moon_lab_1k.exr
  textures/
    moon_01/
    metal_plate_02/
```

It also writes `public/asset-manifest.json`, which the app uses to find the best matching texture maps without relying on one exact filename.

## Run

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Asset Placement

Recommended source assets:

```txt
astronaut.glb
moon_lab_1k.exr
moon_01_1k.blend.zip
metal_plate_02_1k.blend.zip
```

Already extracted folders are also supported when they contain image texture files. Texture matching checks common names:

- diffuse, albedo, color, basecolor -> `map`
- normal, nor_gl, normalgl -> `normalMap`
- rough, roughness -> `roughnessMap`
- ao, ambientocclusion -> `aoMap`
- disp, displacement, height -> `displacementMap`
- metallic, metalness, metal -> `metalnessMap`

If a texture map is missing, the app skips that map and continues with a fallback material.

## FAQ

### Why can't Three.js load `.blend` directly?

`.blend` is Blender's native project format. Three.js runs in the browser and cannot directly load Blender material files. Export models as `.glb` or `.gltf`, and download texture packs as JPG, PNG, WebP, EXR, or similar browser-loadable image files.

### Why use `.glb`?

`.glb` is a compact binary glTF format. It is well supported by Three.js, works in browsers, and can include geometry, materials, animation, and embedded textures.

### What is `.exr`?

`.exr` is a high dynamic range image format often used for environment lighting. In this project, `moon_lab_1k.exr` is processed through `PMREMGenerator` and assigned to `scene.environment`, so objects receive realistic lighting without showing the HDR image as the background.

### Why put textures in `public/textures/`?

Vite serves files from `public/` at the site root. A texture at `public/textures/moon_01/moon_01_diff_1k.jpg` can be loaded in Three.js as `/textures/moon_01/moon_01_diff_1k.jpg`.

## License And Credits

This repository is an open-source learning project. It does not include Lusion official assets, branding, logos, or text.

External assets must be used according to their original licenses. Poly Haven assets are commonly CC0, but you should still confirm the license for each asset you download and include.
