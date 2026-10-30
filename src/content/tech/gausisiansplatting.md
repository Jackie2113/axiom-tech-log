---
title: "3D Gaussian Splatting"
date: 2026-10-30
category: "Computer Graphics"
maturity: "Production-Ready"
summary: "Real-time radiance field rendering using 3D Gaussians instead of neural networks or triangle meshes."
architectureImage: "https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/content/images/teaser.png"
architectureCaption: "SfM sparse point cloud initialization to adaptive density control and tile-based rasterization pipeline."
youtubeId: "T_kXY43VZnk"
references:
  - title: "SIGGRAPH 2023 Original Paper (Kerbl et al.)"
    url: "https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/"
  - title: "Awesome 3D Gaussian Splatting Repository"
    url: "https://github.com/MrNeRF/awesome-3D-gaussian-splatting"
---

## Purpose
Solves the slow rendering speed of NeRFs while capturing photorealistic real-world scenes from 2D photos far more accurately than traditional photogrammetry meshes.

## Capability
* Renders complex captured scenes at 100+ FPS at 1080p resolution.
* Represents scenes as millions of anisotropic 3D Gaussians with position, covariance, opacity, and spherical harmonics for view-dependent lighting.
* Handles reflections, glass, and fine structures (foliage, wires, hair) without explicit polygon geometry.

## Industrial Use
* **VFX & Virtual Production:** Rapidly scanning real-world locations for digital background plates.
* **Simulation & Robotics:** Building photorealistic training environments for autonomous navigation.
* **Interactive Web 3D:** Streaming real-world captures directly inside WebGL and WebGPU viewers.