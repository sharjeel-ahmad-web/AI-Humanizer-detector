import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ThreeHeroSceneProps {
  onExploreClick?: () => void;
}

export const ThreeHeroScene: React.FC<ThreeHeroSceneProps> = ({ onExploreClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [explodedView, setExplodedView] = useState(0);
  const [activePreset, setActivePreset] = useState<'front' | 'isometric' | 'top'>('isometric');

  // Mutable refs to pass into the animation loop without restarting WebGL
  const animStateRef = useRef({
    rotationSpeed: 1,
    wireframe: false,
    explodedView: 0,
    targetCamPos: new THREE.Vector3(0, 3.2, 7.5),
    targetLookAt: new THREE.Vector3(0, 0.8, 0),
  });

  useEffect(() => {
    animStateRef.current.rotationSpeed = rotationSpeed;
    animStateRef.current.wireframe = wireframe;
    animStateRef.current.explodedView = explodedView;
  }, [rotationSpeed, wireframe, explodedView]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    // 1. Scene & Fog (Matching Creamy #FFF9F0 palette)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF9F0);
    scene.fog = new THREE.FogExp2(0xFFF9F0, 0.055);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);

    // 3. Renderer with PBR Pipeline
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Studio Environment via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig (3-Point Lighting)
    // Key Light: Warm directional light casting soft shadows
    const keyLight = new THREE.DirectionalLight(0xFFE8D6, 3.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isHeadless;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Fill Light: Cool sky / warm ground hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xF1F5F9, 0xFED7AA, 1.2);
    scene.add(hemiLight);

    // Rim Light: Accent light highlighting orange tones
    const rimLight = new THREE.DirectionalLight(0xFF6B35, 2.5);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // 6. Ground & Soft Radial Contact Shadow
    // Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(10, 25, 47, 0.55)');
    grad.addColorStop(0.5, 'rgba(10, 25, 47, 0.20)');
    grad.addColorStop(1, 'rgba(10, 25, 47, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    // Ground Floor plane to catch shadows
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xFFF9F0,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isHeadless;
    scene.add(floor);

    // 7. Composite Procedural Model (8 Parts Assembly: Neural Manuscript & Golden Quill)
    const mainGroup = new THREE.Group();
    mainGroup.position.set(0, 0, 0);
    scene.add(mainGroup);

    // Part 1: Heavy Architectural Beveled Base Pedestal
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F, // Deep Navy
      roughness: 0.35,
      metalness: 0.85,
    });
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.25, 48), baseMat);
    baseMesh.position.y = 0.125;
    baseMesh.castShadow = !isHeadless;
    baseMesh.receiveShadow = !isHeadless;
    mainGroup.add(baseMesh);

    // Part 2: Inner Rotating Parchment Core Cylinder (Layer 1)
    const parchmentMat = new THREE.MeshStandardMaterial({
      color: 0xFFFDF8, // Warm parchment cream
      roughness: 0.8,
      metalness: 0.05,
    });
    const coreCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 36, 1, true), parchmentMat);
    coreCylinder.position.y = 1.0;
    coreCylinder.castShadow = !isHeadless;
    mainGroup.add(coreCylinder);

    // Part 3: Middle Orbiting Kinetic Ribbon Ring (Layer 2)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xFF6B35, // Primary Vibrant Orange
      roughness: 0.22,
      metalness: 0.6,
    });
    const ribbonRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 16, 64), ringMat);
    ribbonRing.rotation.x = Math.PI / 4;
    ribbonRing.position.y = 1.0;
    ribbonRing.castShadow = !isHeadless;
    mainGroup.add(ribbonRing);

    // Part 4: Outer Counter-Rotating Ring (Layer 3)
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x1E3A8A, // Navy Blue Accent
      roughness: 0.3,
      metalness: 0.75,
    });
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.045, 16, 64), outerRingMat);
    outerRing.rotation.y = Math.PI / 3;
    outerRing.position.y = 1.0;
    mainGroup.add(outerRing);

    // Part 5: Central Glowing Neural Prism Core
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0xFF8C42,
      transmission: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      thickness: 1.0,
      clearcoat: 1.0,
    });
    const centralPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), prismMat);
    centralPrism.position.y = 1.0;
    mainGroup.add(centralPrism);

    // Part 6 & 7: The Stylus / Humanizer Quill Assembly
    const quillGroup = new THREE.Group();
    quillGroup.position.set(0.65, 1.4, 0.4);
    quillGroup.rotation.z = -Math.PI / 6;
    quillGroup.rotation.y = Math.PI / 8;
    mainGroup.add(quillGroup);

    // Quill Shaft (Navy)
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      roughness: 0.25,
      metalness: 0.9,
    });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.6, 24), shaftMat);
    shaft.position.y = 0.8;
    shaft.castShadow = !isHeadless;
    quillGroup.add(shaft);

    // Golden Nib (High metalness brushed gold)
    const goldNibMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B, // Metallic Gold
      roughness: 0.15,
      metalness: 0.95,
    });
    const nib = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 24), goldNibMat);
    nib.rotation.x = Math.PI;
    nib.position.y = -0.05;
    nib.castShadow = !isHeadless;
    quillGroup.add(nib);

    // Part 8: Orbiting Neural Tokens (InstancedMesh)
    const tokenCount = 12;
    const tokenGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const tokenMat = new THREE.MeshStandardMaterial({
      color: 0xFF6B35,
      roughness: 0.2,
      metalness: 0.8,
    });
    const instancedTokens = new THREE.InstancedMesh(tokenGeo, tokenMat, tokenCount);
    instancedTokens.castShadow = !isHeadless;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < tokenCount; i++) {
      const angle = (i / tokenCount) * Math.PI * 2;
      const radius = 1.35 + (i % 2 === 0 ? 0.2 : -0.15);
      dummy.position.set(Math.cos(angle) * radius, 0.6 + (i % 3) * 0.35, Math.sin(angle) * radius);
      dummy.rotation.set(angle, angle * 0.5, 0);
      dummy.updateMatrix();
      instancedTokens.setMatrixAt(i, dummy.matrix);
    }
    instancedTokens.instanceMatrix.needsUpdate = true;
    mainGroup.add(instancedTokens);

    // 8. Animation & Damping Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const _lookAtTarget = new THREE.Vector3(0, 0.8, 0);

    const renderLoop = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();
      const speed = animStateRef.current.rotationSpeed;
      const exploded = animStateRef.current.explodedView;
      const isWire = animStateRef.current.wireframe;

      // Update Wireframe state
      baseMat.wireframe = isWire;
      parchmentMat.wireframe = isWire;
      ringMat.wireframe = isWire;
      outerRingMat.wireframe = isWire;
      shaftMat.wireframe = isWire;
      goldNibMat.wireframe = isWire;

      // Smooth kinematic rotations
      ribbonRing.rotation.z += 0.8 * speed * delta;
      outerRing.rotation.x += 0.6 * speed * delta;
      coreCylinder.rotation.y += 0.4 * speed * delta;
      centralPrism.rotation.y += 1.2 * speed * delta;
      centralPrism.rotation.x = Math.sin(elapsedTime * 1.5) * 0.2;

      // Exploded view layer translation
      const targetRibbonY = 1.0 + exploded * 0.8;
      const targetOuterY = 1.0 + exploded * 1.4;
      const targetQuillY = 1.4 + exploded * 0.9;
      ribbonRing.position.y = THREE.MathUtils.damp(ribbonRing.position.y, targetRibbonY, 4, delta);
      outerRing.position.y = THREE.MathUtils.damp(outerRing.position.y, targetOuterY, 4, delta);
      quillGroup.position.y = THREE.MathUtils.damp(quillGroup.position.y, targetQuillY, 4, delta);

      // Rotate group gently on Y
      mainGroup.rotation.y += 0.25 * speed * delta;

      // Camera Exponential Damping
      const targetCam = animStateRef.current.targetCamPos;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCam.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCam.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCam.z, 3.5, delta);

      _lookAtTarget.x = THREE.MathUtils.damp(_lookAtTarget.x, animStateRef.current.targetLookAt.x, 3.5, delta);
      _lookAtTarget.y = THREE.MathUtils.damp(_lookAtTarget.y, animStateRef.current.targetLookAt.y, 3.5, delta);
      _lookAtTarget.z = THREE.MathUtils.damp(_lookAtTarget.z, animStateRef.current.targetLookAt.z, 3.5, delta);
      camera.lookAt(_lookAtTarget);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Pre-warm shaders
    renderer.compile(scene, camera);
    animationFrameId = requestAnimationFrame(renderLoop);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      baseGeoDispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    function baseGeoDispose() {
      baseMesh.geometry.dispose();
      coreCylinder.geometry.dispose();
      ribbonRing.geometry.dispose();
      outerRing.geometry.dispose();
      centralPrism.geometry.dispose();
      shaft.geometry.dispose();
      nib.geometry.dispose();
      shadowPlane.geometry.dispose();
      floor.geometry.dispose();
      instancedTokens.geometry.dispose();
      shadowTex.dispose();
    }
  }, []);

  const handleCameraPreset = (preset: 'front' | 'isometric' | 'top') => {
    setActivePreset(preset);
    if (preset === 'front') {
      animStateRef.current.targetCamPos.set(0, 1.4, 6.5);
      animStateRef.current.targetLookAt.set(0, 1.0, 0);
    } else if (preset === 'isometric') {
      animStateRef.current.targetCamPos.set(4.8, 3.4, 5.8);
      animStateRef.current.targetLookAt.set(0, 0.9, 0);
    } else if (preset === 'top') {
      animStateRef.current.targetCamPos.set(0, 6.8, 0.1);
      animStateRef.current.targetLookAt.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-[480px] md:h-[540px] bg-[#FFF9F0] overflow-hidden select-none border-b border-[#E8D8C5]">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Minimal Spec Badge */}
      <div className="absolute top-4 left-6 pointer-events-none z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/90 border border-[#E8D8C5] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
          <span className="text-xs font-semibold tracking-wide uppercase text-[#0A192F]">
            Procedural 3D NLP Engine &bull; ACES Film PBR
          </span>
        </div>
      </div>

      {/* Hero Headline Overlay (Left Aligned, Clear of Center 3D Focus) */}
      <div className="absolute top-16 left-6 md:left-12 max-w-md pointer-events-none z-10 hidden sm:block">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A192F] tracking-tight leading-tight">
          Write Clearly. <br />
          <span className="text-[#FF6B35]">Improve Originality.</span>
        </h1>
        <p className="mt-2 text-sm text-[#334155] leading-relaxed">
          High-cadence natural text rewriting and deep similarity verification. Built with full REST backend for web &amp; mobile apps.
        </p>
        <div className="mt-4 pointer-events-auto flex items-center gap-3">
          {onExploreClick && (
            <button
              onClick={onExploreClick}
              className="px-4 py-2 bg-[#FF6B35] hover:bg-[#E8551E] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Start Free Workspace &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Unified Bottom Control Dock (Adheres to Three.js Ergonomic Bottom Dock Specification) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[820px] z-20 transition-transform duration-300 ${
          isControlsVisible ? 'translate-y-0' : 'translate-y-[calc(100%-28px)]'
        }`}
      >
        {/* Collapse / Expand Toggle Tab */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            className="px-3 py-1 bg-white border border-[#E8D8C5] text-[#0A192F] text-[11px] font-medium rounded-t-md shadow-xs hover:bg-[#FFFDF8] transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label={isControlsVisible ? 'Collapse 3D Controls' : 'Expand 3D Controls'}
          >
            <span>{isControlsVisible ? '▾ Hide 3D Controls' : '▴ Show 3D Controls'}</span>
          </button>
        </div>

        {/* Floating Solid Control Bar */}
        <div className="bg-white/95 border border-[#E8D8C5] rounded-xl shadow-md p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#0A192F]">
          {/* Camera Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mr-1">Views:</span>
            {(['isometric', 'front', 'top'] as const).map(p => (
              <button
                key={p}
                onClick={() => handleCameraPreset(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  activePreset === p
                    ? 'bg-[#FF6B35] text-white font-semibold'
                    : 'bg-[#FFF9F0] text-[#0A192F] hover:bg-[#FCEFD9]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Exploded View Slider */}
          <div className="flex items-center gap-2">
            <label htmlFor="exploded-slider" className="text-[11px] font-medium text-[#475569]">
              Layers:
            </label>
            <input
              id="exploded-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedView}
              onChange={(e) => setExplodedView(parseFloat(e.target.value))}
              className="w-20 md:w-28 accent-[#FF6B35] cursor-pointer"
            />
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2">
            <label htmlFor="speed-slider" className="text-[11px] font-medium text-[#475569]">
              Speed:
            </label>
            <input
              id="speed-slider"
              type="range"
              min="0"
              max="2.5"
              step="0.25"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-16 md:w-24 accent-[#FF6B35] cursor-pointer"
            />
          </div>

          {/* Wireframe / PBR Surface Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                wireframe
                  ? 'bg-[#0A192F] text-white border-[#0A192F]'
                  : 'bg-[#FFF9F0] text-[#0A192F] border-[#E8D8C5] hover:bg-[#FCEFD9]'
              }`}
            >
              {wireframe ? 'Wireframe ON' : 'PBR Studio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
