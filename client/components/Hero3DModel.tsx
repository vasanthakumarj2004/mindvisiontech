"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function Hero3DModel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 5.8);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Prevent trapping page scroll
    controls.enablePan = false;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 1.2;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.85;

    // ─── Lighting ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainKeyLight.position.set(5, 8, 5);
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0x0b2b6b, 1.5);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    // Brand Orange point light directly above the circuit board
    const orangeGlow = new THREE.PointLight(0xef7e20, 2.8, 8);
    orangeGlow.position.set(0, 1.2, 0);
    scene.add(orangeGlow);

    // Cyan/Blue tech rim point light
    const blueRim = new THREE.PointLight(0x38bdf8, 1.6, 6);
    blueRim.position.set(2, 0.5, 2);
    scene.add(blueRim);

    // ─── Model Group: Stylized Microchip / PCB ────────────────────────────────
    const pcbGroup = new THREE.Group();

    // 1. PCB Substrate Board (Deep brand navy)
    const boardWidth = 4.0;
    const boardHeight = 0.16;
    const boardDepth = 3.0;
    const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x081d4a,
      roughness: 0.3,
      metalness: 0.35,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    pcbGroup.add(boardMesh);

    // PCB Outer Silkscreen Border
    const borderGeo = new THREE.BoxGeometry(boardWidth - 0.2, 0.02, boardDepth - 0.2);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.4,
      metalness: 0.6,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.y = boardHeight / 2 + 0.01;
    pcbGroup.add(borderMesh);

    // 2. Central Microcontroller IC (Dark Matte Package)
    const icWidth = 1.4;
    const icHeight = 0.22;
    const icDepth = 1.4;
    const icGeo = new THREE.BoxGeometry(icWidth, icHeight, icDepth);
    const icMat = new THREE.MeshStandardMaterial({
      color: 0x121e36,
      roughness: 0.18,
      metalness: 0.55,
    });
    const icMesh = new THREE.Mesh(icGeo, icMat);
    icMesh.position.y = boardHeight / 2 + icHeight / 2;
    pcbGroup.add(icMesh);

    // Pin 1 Index Dot (Orange Accent)
    const dotGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16);
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0xef7e20,
      emissive: 0xef7e20,
      emissiveIntensity: 0.9,
    });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.position.set(-icWidth / 2 + 0.2, icMesh.position.y + icHeight / 2 + 0.01, -icDepth / 2 + 0.2);
    pcbGroup.add(dotMesh);

    // Core Silkscreen Badge on IC Top
    const badgeGeo = new THREE.BoxGeometry(0.7, 0.01, 0.7);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(0, icMesh.position.y + icHeight / 2 + 0.01, 0);
    pcbGroup.add(badgeMesh);

    // 3. Metallic IC Silver Pins
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.15,
    });

    const pinsPerSide = 6;
    const pinSpacing = (icWidth - 0.2) / (pinsPerSide - 1);
    for (let i = 0; i < pinsPerSide; i++) {
      const offset = -icWidth / 2 + 0.1 + i * pinSpacing;
      // Left side pins
      const pinLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.08), pinMat);
      pinLeft.position.set(-icWidth / 2 - 0.12, boardHeight / 2 + 0.03, offset);
      pcbGroup.add(pinLeft);

      // Right side pins
      const pinRight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.08), pinMat);
      pinRight.position.set(icWidth / 2 + 0.12, boardHeight / 2 + 0.03, offset);
      pcbGroup.add(pinRight);
    }

    // 4. Glowing Brand Orange Circuit Traces (#ef7e20)
    const traceMat = new THREE.MeshStandardMaterial({
      color: 0xef7e20,
      emissive: 0xef7e20,
      emissiveIntensity: 0.95,
      metalness: 0.85,
      roughness: 0.2,
    });

    // Helper for trace segments
    const addTrace = (w: number, d: number, x: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, 0.03, d);
      const mesh = new THREE.Mesh(geo, traceMat);
      mesh.position.set(x, boardHeight / 2 + 0.015, z);
      pcbGroup.add(mesh);
    };

    // Branching circuit lines from IC pins
    addTrace(0.8, 0.06, -1.3, -0.4);
    addTrace(0.06, 0.7, -1.7, -0.05);
    addTrace(0.6, 0.06, -1.4, 0.3);

    addTrace(0.8, 0.06, 1.3, -0.3);
    addTrace(0.06, 0.6, 1.7, 0.0);
    addTrace(0.5, 0.06, 1.45, 0.3);

    // Diagonal corner traces
    addTrace(0.06, 0.6, -0.6, -1.0);
    addTrace(0.7, 0.06, -0.25, -1.3);
    addTrace(0.06, 0.5, 0.6, -0.95);
    addTrace(0.6, 0.06, 0.9, -1.2);

    addTrace(0.06, 0.5, -0.4, 0.95);
    addTrace(0.06, 0.5, 0.4, 0.95);

    // 5. Gold Edge Connector Contact Fingers (Bottom edge)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 0.2,
    });

    const numFingers = 12;
    const fingerSpacing = 0.22;
    const fingerStart = -((numFingers - 1) * fingerSpacing) / 2;
    for (let i = 0; i < numFingers; i++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.45), goldMat);
      finger.position.set(fingerStart + i * fingerSpacing, boardHeight / 2 + 0.012, boardDepth / 2 - 0.24);
      pcbGroup.add(finger);
    }

    // 6. Secondary SMD Components (Capacitors, Resistors, Crystal Oscillator)
    const smdMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.3,
      roughness: 0.4,
    });

    // Small capacitor blocks
    const cap1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.14), smdMat);
    cap1.position.set(-1.2, boardHeight / 2 + 0.06, 0.8);
    pcbGroup.add(cap1);

    const cap2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.14), smdMat);
    cap2.position.set(-0.85, boardHeight / 2 + 0.06, 0.8);
    pcbGroup.add(cap2);

    const cap3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), smdMat);
    cap3.position.set(1.15, boardHeight / 2 + 0.06, 0.8);
    pcbGroup.add(cap3);

    // Metallic Quartz Crystal Oscillator Can
    const crystalGeo = new THREE.BoxGeometry(0.55, 0.16, 0.26);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.18,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.set(1.15, boardHeight / 2 + 0.08, -0.9);
    pcbGroup.add(crystalMesh);

    // 7. Pulsing Status LEDs (Green, Orange & Vibrant Yellow)
    const ledGreenMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 1.5,
    });
    const ledGreen = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), ledGreenMat);
    ledGreen.position.set(-1.5, boardHeight / 2 + 0.04, -1.0);
    pcbGroup.add(ledGreen);

    const ledYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 1.6,
    });
    const ledYellow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), ledYellowMat);
    ledYellow.position.set(-1.3, boardHeight / 2 + 0.04, -1.0);
    pcbGroup.add(ledYellow);

    const ledOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xef7e20,
      emissive: 0xef7e20,
      emissiveIntensity: 1.4,
    });
    const ledOrange = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), ledOrangeMat);
    ledOrange.position.set(-1.1, boardHeight / 2 + 0.04, -1.0);
    pcbGroup.add(ledOrange);

    // Set initial isometric aesthetic tilt
    pcbGroup.rotation.x = 0.28;
    pcbGroup.rotation.y = -0.42;
    scene.add(pcbGroup);

    // ─── Animation Loop ───────────────────────────────────────────────────────
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Gentle floating bob
      if (!prefersReducedMotion) {
        pcbGroup.position.y = Math.sin(elapsedTime * 1.6) * 0.07;
      }

      // Pulse LED status lights
      const pulse = 1.0 + Math.sin(elapsedTime * 4) * 0.6;
      ledGreenMat.emissiveIntensity = pulse * 1.5;
      ledYellowMat.emissiveIntensity = (1.4 + Math.cos(elapsedTime * 3.5) * 0.6) * 1.6;
      ledOrangeMat.emissiveIntensity = (2.2 - pulse) * 1.4;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // ─── Responsive Resize Handler ────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      controls.dispose();
      renderer.dispose();

      // Dispose all geometries and materials in pcbGroup
      pcbGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-full w-full cursor-grab active:cursor-grabbing overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#061535] via-[#081d4a] to-[#040e24]"
      aria-label="Interactive 3D Embedded Microchip and PCB Model. Drag to rotate."
    >
      {/* Subtle background tech grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Interactive Indicator Badge with yellow accents */}
      <div className="pointer-events-none absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-yellow-400/40 bg-black/60 px-3.5 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-md shadow-xs">
        <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="uppercase text-[10px] text-yellow-300 font-extrabold tracking-wider">
          {isHovered ? "Drag to rotate" : "Interactive 3D Hardware"}
        </span>
      </div>
    </div>
  );
}
