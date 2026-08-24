"use client";
/* ---------------------------------------------------------------------------
   HeroLattice — vật thể 3D ở hero, thay cho mascot.
   Vì sao hình này chứ không phải một vật thể đẹp bất kỳ: đây là hình dạng của
   chính công việc — ma trận chỉ tiêu theo hàng (hub) × cột (ngày), ô nào đạt
   ngưỡng thì sáng. Cùng một hình, nhưng nó nói về nội dung thay vì trang trí.

   KHÔNG có nhãn, KHÔNG có con số nào trên vật thể: nó là hình trừu tượng lấy
   cảm hứng từ bảng thật, không phải một biểu đồ dữ liệu thật. Đặt số vào đây
   là bịa số.

   Motion gắn với cuộn (yêu cầu của Vinh): tiến độ cuộn qua hero điều khiển
   (1) độ cao các cột dựng lên theo một đợt sóng chạy chéo qua lưới, và
   (2) góc xoay + độ nghiêng của cả khối. Không cuộn thì không có gì chuyển
   động ngoài một nhịp trôi rất chậm.
   prefers-reduced-motion: dựng sẵn ở trạng thái cuối, không animate, không
   bind vào cuộn.
--------------------------------------------------------------------------- */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 10;
const ROWS = 6;
const GAP = 0.44;
const BAR = 0.3;

/** PRNG có seed: hình dạng phải giống nhau mọi lần tải, không nhảy mỗi lần render. */
function seeded(i: number) {
  let t = (i + 1) * 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

type Cell = {
  x: number;
  z: number;
  /** Chiều cao đích, 0..1. */
  h: number;
  /** Thứ tự dựng lên: sóng chạy chéo từ góc gần tới góc xa. */
  order: number;
  /** Ô "đạt ngưỡng" — dùng màu lime, giống cách bảng thật tô ô đạt target. */
  hot: boolean;
};

function buildCells(): Cell[] {
  const cells: Cell[] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const i = c * ROWS + r;
      // Hai tần số sin lệch pha + một chút nhiễu: có cấu trúc rõ (nhìn ra là
      // ma trận) nhưng không lặp lại đều đặn như hình trang trí sinh máy.
      const wave =
        0.5 +
        0.28 * Math.sin(c * 0.52 + r * 0.31) +
        0.16 * Math.sin(c * 0.19 - r * 0.74);
      const h = Math.min(1, Math.max(0.06, wave * 0.82 + seeded(i) * 0.3));
      cells.push({
        x: (c - (COLS - 1) / 2) * GAP,
        z: (r - (ROWS - 1) / 2) * GAP,
        h,
        order: (c / (COLS - 1)) * 0.75 + (r / (ROWS - 1)) * 0.25,
        hot: h > 0.78,
      });
    }
  }
  return cells;
}

function Lattice({
  progress,
  reducedMotion,
}: {
  progress: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const cells = useMemo(buildCells, []);
  const group = useRef<THREE.Group>(null);
  const cool = useRef<THREE.InstancedMesh>(null);
  const hot = useRef<THREE.InstancedMesh>(null);

  const split = useMemo(
    () => ({
      cool: cells.filter((c) => !c.hot),
      hot: cells.filter((c) => c.hot),
    }),
    [cells],
  );

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const scl = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const p = reducedMotion ? 1 : progress.current;
    const t = state.clock.elapsedTime;

    for (const [mesh, list] of [
      [cool, split.cool],
      [hot, split.hot],
    ] as const) {
      if (!mesh.current) continue;
      list.forEach((cell, i) => {
        // Sóng dựng: ô có `order` nhỏ mọc trước. Chia 0.55 để đợt sóng kết thúc
        // trước khi hero cuộn hết, không phải mọc dở rồi biến mất khỏi màn hình.
        const local = Math.min(1, Math.max(0, (p - cell.order * 0.45) / 0.55));
        const ease = local * local * (3 - 2 * local);
        const idle = reducedMotion ? 0 : Math.sin(t * 0.6 + cell.order * 6) * 0.02;
        const h = Math.max(0.02, cell.h * ease + idle);
        pos.set(cell.x, (h * 1.35) / 2, cell.z);
        scl.set(1, Math.max(0.001, (h * 1.35) / BAR), 1);
        m.compose(pos, q, scl);
        mesh.current!.setMatrixAt(i, m);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }

    if (group.current) {
      // Cuộn điều khiển góc xoay; biên độ nhỏ để vật thể không quay lông lốc.
      const spin = reducedMotion ? 0.42 : -0.62 + p * 1.25;
      const drift = reducedMotion ? 0 : Math.sin(t * 0.18) * 0.05;
      group.current.rotation.y = spin + drift;
      group.current.rotation.x = reducedMotion ? 0.06 : 0.1 - p * 0.08;
    }
  });

  return (
    <group ref={group}>
      {/* Mặt sàn: cho khối cột có chỗ đứng, viền lime rất mờ để bắt đúng hệ màu. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[COLS * GAP + 0.5, ROWS * GAP + 0.5]} />
        <meshStandardMaterial color="#14140f" roughness={0.95} metalness={0} />
      </mesh>
      <gridHelper
        args={[Math.max(COLS, ROWS) * GAP, Math.max(COLS, ROWS), "#26261f", "#1e1e1c"]}
        position={[0, 0.001, 0]}
      />

      <instancedMesh ref={cool} args={[undefined, undefined, split.cool.length]}>
        <boxGeometry args={[BAR, BAR, BAR]} />
        <meshStandardMaterial color="#63635a" roughness={0.5} metalness={0.2} />
      </instancedMesh>

      <instancedMesh ref={hot} args={[undefined, undefined, split.hot.length]}>
        <boxGeometry args={[BAR, BAR, BAR]} />
        <meshStandardMaterial
          color="#d4f236"
          emissive="#d4f236"
          emissiveIntensity={0.35}
          roughness={0.35}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  );
}

export function HeroLattice() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      progress.current = 1;
      return;
    }
    // Tiến độ = đã cuộn qua bao nhiêu phần của chính khối hero. Ở đầu trang
    // phải gần 0, nếu không thì cột dựng sẵn và mất hẳn phần "cuộn để dựng".
    // Ghi vào ref chứ không vào state: rAF của r3f cần giá trị mới nhất, còn
    // state thì re-render mỗi frame cuộn.
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      // 150px: đúng bằng quãng vật thể còn nằm gọn trong khung. Dài hơn thì
      // cột dựng dở đã trôi khỏi màn hình, người xem không thấy trạng thái cuối.
      const span = 150;
      const scrolled = window.scrollY;
      const f = Math.min(1, Math.max(0, scrolled / span));
      // Chừa một nền 0.16: lúc chưa cuộn vẫn có khối thấp để nhìn, không phải
      // một mặt phẳng trống trông như canvas lỗi.
      progress.current = 0.1 + f * 0.9;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        camera={{ position: [2.1, 3.3, 6.3], fov: 32 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight intensity={0.5} groundColor="#141410" />
        <directionalLight position={[3, 6, 4]} intensity={1.5} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#d4f236" />
        <Lattice progress={progress} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
