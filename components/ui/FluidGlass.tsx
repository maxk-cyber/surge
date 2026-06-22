/* eslint-disable react/no-unknown-property */
"use client";

import * as THREE from "three";
import { Suspense, useRef, useState, useEffect, memo } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text,
} from "@react-three/drei";
import { easing } from "maath";

type FluidGlassProps = {
  mode?: "lens" | "bar" | "cube";
  lensProps?: Record<string, unknown>;
  barProps?: Record<string, unknown>;
  cubeProps?: Record<string, unknown>;
  imageUrls?: string[];
  title?: string;
};

const DEFAULT_AVATAR_IMAGES = [
  "/avatars/skullmic.png",
  "/avatars/skullbunny.png",
  "/avatars/gaperskull.png",
  "/avatars/nachomancer.png",
  "/avatars/burgerlich.png",
];

function absUrl(path: string) {
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (typeof window !== "undefined") return `${window.location.origin}${path}`;
  return path;
}

function pickImageUrls(urls?: string[]) {
  const pool = urls?.length ? urls : DEFAULT_AVATAR_IMAGES;
  return Array.from({ length: 5 }, (_, i) => absUrl(pool[i % pool.length]!));
}

export default function FluidGlass({
  mode = "lens",
  lensProps = {},
  barProps = {},
  cubeProps = {},
  imageUrls,
  title = "Snack Surge",
}: FluidGlassProps) {
  const Wrapper = mode === "bar" ? Bar : mode === "cube" ? Cube : Lens;
  const rawOverrides = mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps;

  const {
    navItems = [
      { label: "Globe", link: "#globe" },
      { label: "Cards", link: "#cards" },
      { label: "Glass", link: "#glass" },
    ],
    ...modeProps
  } = rawOverrides as {
    navItems?: { label: string; link: string }[];
    [key: string]: unknown;
  };

  const images = pickImageUrls(imageUrls);

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 15 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x5227ff, 1);
        gl.autoClear = true;
      }}
    >
      <Suspense fallback={null}>
        <ScrollControls damping={0.2} pages={3} distance={0.4}>
          {mode === "bar" && <NavItems items={navItems} />}
          <Wrapper modeProps={modeProps}>
            <Scroll>
              <Typography title={title} />
              <Images urls={images} />
            </Scroll>
            <Scroll html />
            <Preload all />
          </Wrapper>
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: {
  children?: React.ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: Record<string, unknown>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF(glb) as unknown as {
    nodes: Record<string, { geometry: THREE.BufferGeometry }>;
  };
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    if (!geo) return;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom
      ? -v.height / 2 + 0.2
      : followPointer
        ? (pointer.y * v.height) / 2
        : 0;

    if (ref.current) {
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

      if (modeProps.scale == null) {
        const maxWorld = v.width * 0.9;
        const desired = maxWorld / geoWidthRef.current;
        ref.current.scale.setScalar(Math.min(0.15, desired));
      }
    }

    gl.setRenderTarget(buffer);
    gl.setClearColor(0x5227ff, 1);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x5227ff, 1);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} toneMapped={false} />
      </mesh>
      <mesh
        ref={ref}
        scale={(scale as number) ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={nodes[geometryKey]?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={(ior as number) ?? 1.15}
          thickness={(thickness as number) ?? 5}
          anisotropy={(anisotropy as number) ?? 0.01}
          chromaticAberration={(chromaticAberration as number) ?? 0.1}
          samples={8}
          resolution={512}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function Lens({
  modeProps,
  ...p
}: {
  modeProps?: Record<string, unknown>;
  children?: React.ReactNode;
}) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Cube({
  modeProps,
  ...p
}: {
  modeProps?: Record<string, unknown>;
  children?: React.ReactNode;
}) {
  return (
    <ModeWrapper
      glb="/assets/3d/cube.glb"
      geometryKey="Cube"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Bar({
  modeProps = {},
  ...p
}: {
  modeProps?: Record<string, unknown>;
  children?: React.ReactNode;
}) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: "#ffffff",
    attenuationColor: "#ffffff",
    attenuationDistance: 0.25,
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }: { items: { label: string; link: string }[] }) {
  const group = useRef<THREE.Group>(null);
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.035 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.035 },
  };
  type DeviceKey = "mobile" | "tablet" | "desktop";
  const getDevice = (): DeviceKey => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? "mobile" : w <= DEVICE.tablet.max ? "tablet" : "desktop";
  };

  const [device, setDevice] = useState<DeviceKey>(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link: string) => {
    if (!link) return;
    if (link.startsWith("#")) {
      document.querySelector(link)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = link;
    }
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

type ImageMaterial = THREE.Material & { zoom?: number };

function Images({ urls }: { urls: string[] }) {
  const group = useRef<THREE.Group>(null);
  const data = useScroll();
  const { height } = useThree((s) => s.viewport);

  useFrame(() => {
    const children = group.current?.children;
    if (!children?.[0]) return;
    const mat = (i: number) => (children[i] as THREE.Mesh)?.material as ImageMaterial | undefined;
    if (mat(0)) mat(0)!.zoom = 1 + data.range(0, 1 / 3) / 3;
    if (mat(1)) mat(1)!.zoom = 1 + data.range(0, 1 / 3) / 3;
    if (mat(2)) mat(2)!.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    if (mat(3)) mat(3)!.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    if (mat(4)) mat(4)!.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
  });

  return (
    <group ref={group}>
      <Image
        position={[-2, 0, 0]}
        scale={[3, height / 1.1, 1] as unknown as [number, number]}
        url={urls[0]!}
      />
      <Image position={[2, 0, 3]} scale={3} url={urls[1]!} />
      <Image
        position={[-2.05, -height, 6]}
        scale={[1, 3, 1] as unknown as [number, number]}
        url={urls[2]!}
      />
      <Image
        position={[-0.6, -height, 9]}
        scale={[1, 2, 1] as unknown as [number, number]}
        url={urls[3]!}
      />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url={urls[4]!} />
    </group>
  );
}

function Typography({ title }: { title: string }) {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 },
  };
  type DeviceKey = "mobile" | "tablet" | "desktop";
  const getDevice = (): DeviceKey => {
    const w = window.innerWidth;
    return w <= 639 ? "mobile" : w <= 1023 ? "tablet" : "desktop";
  };

  const [device, setDevice] = useState<DeviceKey>(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      position={[0, 0, 12]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {title}
    </Text>
  );
}

useGLTF.preload("/assets/3d/lens.glb");
useGLTF.preload("/assets/3d/cube.glb");
useGLTF.preload("/assets/3d/bar.glb");
