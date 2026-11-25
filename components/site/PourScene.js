"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles, Float, Html, ContactShadows } from "@react-three/drei";

/*
  The ARYO hero: a cognac bottle tilts and pours into a brandy glass on a
  floating black-marble bar top. Everything is built from code (lathe
  geometry), so there are no heavy model files to download. The bottle label
  uses the sponsor logo uploaded in the dashboard (Sponsors → "Use on the 3D
  bottle"); without one it prints the sponsor's name.
*/

const DUR = { tilt: 1.3, pour: 4.2, back: 1.1 };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// ---------- profiles ----------
const BOTTLE = [
  [0, 0], [0.38, 0], [0.44, 0.04], [0.47, 0.14], [0.48, 0.5], [0.48, 0.95], [0.46, 1.08], [0.4, 1.2],
  [0.29, 1.32], [0.18, 1.42], [0.14, 1.52], [0.135, 1.9], [0.155, 1.93], [0.155, 2.0], [0.13, 2.02], [0, 2.02],
].map(([x, y]) => new THREE.Vector2(x, y));

// Snifter glass: base, stem, bowl. Outer wall only (thin glass reads fine with transmission).
const GLASS = [
  [0, 0], [0.5, 0], [0.52, 0.02], [0.5, 0.04], [0.1, 0.07], [0.05, 0.12], [0.045, 0.62], [0.08, 0.7],
  [0.26, 0.76], [0.44, 0.86], [0.56, 1.0], [0.6, 1.16], [0.58, 1.32], [0.52, 1.48], [0.44, 1.6], [0.42, 1.62],
].map(([x, y]) => new THREE.Vector2(x, y));
const BOWL_BOTTOM = 0.74;
const BOWL_TOP = 1.58;
// Radius of the bowl's inside at a given height (for the liquid surface disc).
function bowlRadius(y) {
  const pts = GLASS.slice(7);
  for (let i = 0; i < pts.length - 1; i++) {
    if (y >= pts[i].y && y <= pts[i + 1].y) {
      const t = (y - pts[i].y) / (pts[i + 1].y - pts[i].y);
      return THREE.MathUtils.lerp(pts[i].x, pts[i + 1].x, t) - 0.025;
    }
  }
  return 0.05;
}
const LIQUID_PROFILE = (() => {
  const out = [new THREE.Vector2(0, BOWL_BOTTOM + 0.02)];
  for (let y = BOWL_BOTTOM + 0.03; y <= BOWL_TOP; y += 0.03) out.push(new THREE.Vector2(bowlRadius(y), y));
  out.push(new THREE.Vector2(0, BOWL_TOP));
  return out;
})();

// ---------- label texture ----------
function useLabelTexture(brand) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    let alive = true;
    const W = 1024, H = 512;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const paint = (img) => {
      const grd = g.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#1a1410"); grd.addColorStop(1, "#0b0907");
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      g.strokeStyle = "#CFAA5C"; g.lineWidth = 6; g.strokeRect(22, 22, W - 44, H - 44);
      g.lineWidth = 2; g.strokeRect(38, 38, W - 76, H - 76);
      if (img) {
        // Official logo supplied by the sponsor
        const s = Math.min((W * 0.62) / img.width, (H * 0.5) / img.height);
        const w = img.width * s, h = img.height * s;
        g.drawImage(img, W / 2 - w / 2, H * 0.42 - h / 2, w, h);
      } else {
        g.fillStyle = "#E8D39C"; g.textAlign = "center"; g.textBaseline = "middle";
        g.font = "600 92px 'Cormorant Garamond', Georgia, serif";
        g.fillText((brand?.name || "ARYO").toUpperCase(), W / 2, H * 0.4);
      }
      g.fillStyle = "#CFAA5C"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = "600 30px Inter, sans-serif";
      g.fillText("C O G N A C   ·   A R Y O   N A I R O B I", W / 2, H * 0.76);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      if (alive) setTex(t);
    };
    if (brand?.logo_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => paint(img);
      img.onerror = () => paint(null);
      img.src = brand.logo_url;
    } else paint(null);
    return () => { alive = false; };
  }, [brand?.logo_url, brand?.name]);
  return tex;
}

// ---------- the scene ----------
function Bar({ brand, replay, onPhase }) {
  const root = useRef();
  const pivot = useRef();
  const mouth = useRef();
  const stream = useRef();
  const liquid = useRef();
  const surface = useRef();
  const drops = useRef();
  const bottleLiquid = useRef();
  const start = useRef(null);
  const lastPhase = useRef("");
  const label = useLabelTexture(brand);
  const { pointer, viewport } = useThree();
  const scale = viewport.width < 5 ? 0.72 : 1;

  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const bottleGeo = useMemo(() => new THREE.LatheGeometry(BOTTLE, 64), []);
  const bottleInner = useMemo(() => new THREE.LatheGeometry(BOTTLE.slice(0, 9).map((v) => new THREE.Vector2(Math.max(0, v.x - 0.035), v.y + 0.03)).concat([new THREE.Vector2(0, 1.2)]), 48), []);
  const glassGeo = useMemo(() => new THREE.LatheGeometry(GLASS, 72), []);
  const liquidGeo = useMemo(() => new THREE.LatheGeometry(LIQUID_PROFILE, 64), []);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const DROPS = 26;
  const dropState = useMemo(() => Array.from({ length: DROPS }, () => ({ p: new THREE.Vector3(0, -99, 0), v: new THREE.Vector3(), life: 0 })), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => { start.current = null; }, [replay]);

  // ?pour=3.2 freezes the pour at that second (handy for previews/screenshots)
  const freeze = useMemo(() => { try { const v = parseFloat(new URLSearchParams(window.location.search).get("pour")); return isNaN(v) ? null : v; } catch { return null; } }, []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const t0 = state.clock.elapsedTime;
    if (start.current === null) start.current = t0 + 0.6;
    const t = freeze ?? t0 - start.current;
    const tilt = t < DUR.tilt ? ease(clamp01(t / DUR.tilt)) : t < DUR.tilt + DUR.pour ? 1 : 1 - ease(clamp01((t - DUR.tilt - DUR.pour) / DUR.back));
    const pouring = t > DUR.tilt * 0.85 && t < DUR.tilt + DUR.pour + 0.15;
    const fillT = clamp01((t - DUR.tilt) / DUR.pour);
    const phase = t < 0 ? "ready" : t < DUR.tilt ? "tilt" : t < DUR.tilt + DUR.pour ? "pour" : "served";
    if (phase !== lastPhase.current) { lastPhase.current = phase; onPhase?.(phase); }

    // gentle parallax towards the pointer
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, pointer.x * 0.35 - 0.12, 3, dt);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.y * 0.08 + 0.04, 3, dt);

    // bottle lifts and tips over the glass
    pivot.current.rotation.z = -tilt * 1.92;
    pivot.current.position.y = 1.07 + tilt * 1.33;
    pivot.current.position.x = -0.95 + tilt * 0.42;
    if (bottleLiquid.current) bottleLiquid.current.scale.y = 1 - fillT * 0.35;

    // glass fills (clip plane rises), tiny swirl once served
    const level = BOWL_BOTTOM + 0.03 + ease(fillT) * 0.42;
    const r = bowlRadius(level);
    surface.current.position.y = level;
    surface.current.getWorldPosition(worldPos);
    clip.constant = worldPos.y; // clipping planes live in world space
    surface.current.scale.setScalar(Math.max(0.001, r));
    surface.current.visible = fillT > 0.01;
    liquid.current.visible = fillT > 0.01;
    const swirl = phase === "served" ? Math.sin(t0 * 1.6) * 0.03 : Math.sin(t0 * 9) * 0.012 * (pouring ? 1 : 0);
    surface.current.rotation.set(-Math.PI / 2 + swirl, 0, swirl * 0.6);

    // stream from the bottle mouth to the liquid surface, in the glass group's space
    mouth.current.getWorldPosition(tmpA);
    surface.current.parent.worldToLocal(tmpA);
    tmpB.set(0.02, level, 0);
    const len = tmpA.distanceTo(tmpB);
    const on = pouring && tilt > 0.8 ? 1 : 0;
    stream.current.scale.x = THREE.MathUtils.damp(stream.current.scale.x, on, 10, dt);
    stream.current.scale.z = stream.current.scale.x;
    stream.current.visible = stream.current.scale.x > 0.02;
    stream.current.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
    stream.current.scale.y = len;
    stream.current.lookAt(surface.current.parent.localToWorld(tmpB.clone()));
    stream.current.rotateX(Math.PI / 2);
    stream.current.material.opacity = 0.75 + Math.sin(t0 * 40) * 0.08;

    // splash droplets where the stream lands
    dropState.forEach((d, i) => {
      if (d.life <= 0 && on && Math.random() < 0.35) {
        d.p.set(tmpB.x, level + 0.01, tmpB.z);
        const a = Math.random() * Math.PI * 2, s = 0.25 + Math.random() * 0.45;
        d.v.set(Math.cos(a) * s * 0.5, 0.6 + Math.random() * 0.9, Math.sin(a) * s * 0.5);
        d.life = 0.35 + Math.random() * 0.3;
      }
      if (d.life > 0) {
        d.life -= dt; d.v.y -= 6 * dt; d.p.addScaledVector(d.v, dt);
        if (d.p.y < level) d.life = 0;
      }
      dummy.position.copy(d.life > 0 ? d.p : tmpA.set(0, -99, 0));
      dummy.scale.setScalar(d.life > 0 ? 0.012 + d.life * 0.03 : 0.0001);
      dummy.updateMatrix();
      drops.current.setMatrixAt(i, dummy.matrix);
    });
    drops.current.instanceMatrix.needsUpdate = true;
  });

  // Thin "fake" glass (reflections + low opacity) reads clearer than transmission and is cheap on phones.
  const glassMat = (
    <meshPhysicalMaterial color="#ffffff" transparent opacity={0.16} roughness={0} metalness={0} clearcoat={1} clearcoatRoughness={0}
      specularIntensity={1} envMapIntensity={2.4} depthWrite={false} side={THREE.DoubleSide} />
  );
  const amber = <meshPhysicalMaterial color="#7a3508" roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} emissive="#3a1502" emissiveIntensity={0.55} envMapIntensity={1.3} />;

  return (
    <group ref={root} scale={scale} position={[0, -1.25, 0]}>
      <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.35} floatingRange={[-0.04, 0.06]}>
        {/* floating black marble bar top with a gold rim */}
        <group position={[0, -0.12, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[2.25, 2.1, 0.22, 96]} />
            <meshPhysicalMaterial color="#0c0b0d" roughness={0.18} metalness={0.2} clearcoat={1} clearcoatRoughness={0.08} />
          </mesh>
          <mesh position={[0, 0.112, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.13, 2.25, 128]} />
            <meshStandardMaterial color="#CFAA5C" metalness={1} roughness={0.25} emissive="#5a451f" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -0.55, 0]}>
            <coneGeometry args={[2.05, 1.0, 96, 1, true]} />
            <meshStandardMaterial color="#141014" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>
        </group>

        {/* glass */}
        <group position={[0.62, 0, 0.1]}>
          <mesh geometry={glassGeo} castShadow renderOrder={2}>{glassMat}</mesh>
          <mesh ref={liquid} geometry={liquidGeo} renderOrder={1}>
            <meshPhysicalMaterial color="#8a3c0a" roughness={0.1} clearcoat={1} emissive="#4a1a02" emissiveIntensity={0.6} clippingPlanes={[clip]} side={THREE.DoubleSide} envMapIntensity={1.2} />
          </mesh>
          <mesh ref={surface} renderOrder={1}>
            <circleGeometry args={[1, 48]} />
            <meshPhysicalMaterial color="#b35f12" roughness={0.05} metalness={0.1} clearcoat={1} emissive="#3a1502" emissiveIntensity={0.5} />
          </mesh>
          <instancedMesh ref={drops} args={[null, null, DROPS]}>
            <sphereGeometry args={[1, 8, 8]} />
            {amber}
          </instancedMesh>
          <Html position={[0.62, 1.05, 0]} center distanceFactor={7} zIndexRange={[20, 0]}><Hotspot n="02" label="Signature cocktails" /></Html>
        </group>

        {/* bottle, rotating about its middle */}
        <group ref={pivot} position={[-0.95, 1.07, -0.05]}>
          <group position={[0, -1.05, 0]}>
            <mesh geometry={bottleGeo} castShadow renderOrder={3}>
              <meshPhysicalMaterial transmission={1} roughness={0.05} thickness={0.25} ior={1.5} color="#ffffff" attenuationColor="#d9b98a" attenuationDistance={2.5} clearcoat={1} specularIntensity={1} envMapIntensity={1.6} />
            </mesh>
            <group ref={bottleLiquid}>
              <mesh geometry={bottleInner}>{amber}</mesh>
            </group>
            {/* label wrapped on the front */}
            {label && (
              <mesh position={[0, 0.62, 0]} rotation={[0, Math.PI * 0.12, 0]}>
                <cylinderGeometry args={[0.488, 0.488, 0.62, 48, 1, true, -0.95, 1.9]} />
                <meshStandardMaterial map={label} roughness={0.45} metalness={0.15} side={THREE.FrontSide} />
              </mesh>
            )}
            {/* gold neck foil + cap */}
            <mesh position={[0, 1.82, 0]}>
              <cylinderGeometry args={[0.15, 0.142, 0.32, 40]} />
              <meshStandardMaterial color="#CFAA5C" metalness={1} roughness={0.22} />
            </mesh>
            <mesh ref={mouth} position={[0, 2.06, 0]} />
            <Html position={[0.35, 1.7, 0]} center distanceFactor={7} zIndexRange={[20, 0]}><Hotspot n="01" label={brand?.name ? `${brand.name} on the pour` : "Premium cognac"} /></Html>
          </group>
        </group>

        {/* pour stream */}
        <group position={[0.62, 0, 0.1]}>
          <mesh ref={stream} renderOrder={1}>
            <cylinderGeometry args={[0.022, 0.03, 1, 16, 1, true]} />
            <meshPhysicalMaterial color="#c0670f" emissive="#5a2203" emissiveIntensity={0.6} roughness={0.05} transparent opacity={0.85} clearcoat={1} />
          </mesh>
        </group>

        <Html position={[-1.7, 0.25, 0.9]} center distanceFactor={7} zIndexRange={[20, 0]}><Hotspot n="03" label="Live DJs nightly" /></Html>
      </Float>
      <ContactShadows position={[0, -1.25, 0]} opacity={0.55} scale={7} blur={2.6} far={2} color="#000" />
    </group>
  );
}

function Hotspot({ n, label }) {
  return (
    <div className="group relative flex items-center select-none">
      <span className="grid place-items-center h-9 w-9 rounded-full bg-white/90 text-[#0b0a08] text-[10px] font-bold shadow-[0_0_0_6px_rgba(255,255,255,.12)] animate-pulse">{n}</span>
      <span className="pointer-events-none absolute left-11 whitespace-nowrap rounded-full bg-black/70 backdrop-blur px-3 py-1 text-[11px] text-[#E8D39C] opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
    </div>
  );
}

export default function PourScene({ brand, replay = 0, onPhase }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.35, 7.2], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
    >
      <ambientLight intensity={0.25} />
      <spotLight position={[3, 6, 4]} angle={0.45} penumbra={1} intensity={60} color="#ffe2b0" castShadow />
      <spotLight position={[-5, 3, -2]} angle={0.6} penumbra={1} intensity={30} color="#CFAA5C" />
      <pointLight position={[0.6, 0.6, 1.5]} intensity={4} color="#ff9a3c" distance={4} />
      <Bar brand={brand} replay={replay} onPhase={onPhase} />
      <Sparkles count={70} scale={[8, 5, 3]} size={2.2} speed={0.35} opacity={0.7} color="#E8D39C" position={[0, 0.5, -1]} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#fff1d6" position={[0, 4, -3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#CFAA5C" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#ffd9a0" position={[0, 2, 5]} scale={2} />
      </Environment>
    </Canvas>
  );
}
