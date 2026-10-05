import type { CSSProperties } from "react";
import type { CareerObjectId } from "@/content/prototypes/career-objects.vi";

function Block({ w, h, d, x = 0, y = 0, z = 0, color, label }: {
  w: number; h: number; d: number; x?: number; y?: number; z?: number; color: string; label?: string;
}) {
  const style = { "--w": `${w}px`, "--h": `${h}px`, "--d": `${d}px`, "--block-color": color,
    transform: `translate3d(${x}px, ${y}px, ${z}px)` } as CSSProperties;
  return <span className="co-block" style={style}>
    <span className="co-face co-front">{label}</span><span className="co-face co-back" />
    <span className="co-face co-left" /><span className="co-face co-right" />
    <span className="co-face co-top" /><span className="co-face co-bottom" />
  </span>;
}

export function ObjectMockup({ id, label }: { id: CareerObjectId; label: string }) {
  const truck = id === "jt" || id === "ghn";
  const color = id === "jt" ? "#cc3737" : "#ed7f2c";
  return <span className={`co-model co-model-${id}`} aria-hidden="true"><span className="co-model-world"><span className="co-model-rotor">
    {id === "maersk" && <>
      <Block w={148} h={20} d={44} y={25} color="#253d48" />
      <Block w={134} h={8} d={48} y={11} color="#ccd1c8" />
      {[-43, 0, 43].map(x => <Block key={x} w={39} h={26} d={39} x={x} y={-6} color="#59a6b8" />)}
      <Block w={20} h={34} d={32} x={65} y={-10} color="#f0eee2" />
      <Block w={5} h={18} d={7} x={65} y={-36} color="#454d49" />
    </>}
    {truck && <>
      <Block w={108} h={43} d={44} x={-17} y={-8} color={color} label={label} />
      <Block w={32} h={34} d={43} x={55} y={-3} color={color} />
      <Block w={22} h={13} d={2} x={56} y={-9} z={23} color="#aac4c6" />
      <Block w={150} h={7} d={38} x={4} y={17} color="#424a46" />
      {[-47, 46].flatMap(x => [-25, 25].map(z => <Block key={`${x}-${z}`} w={17} h={20} d={9} x={x} y={24} z={z} color="#25302d" />))}
    </>}
    {id === "shopee" && <>
      <Block w={122} h={48} d={65} y={1} color="#dc7040" />
      <Block w={132} h={10} d={73} y={-28} color="#ced0c3" />
      {[-38, 0, 38].map(x => <Block key={x} w={25} h={31} d={2} x={x} y={8} z={34} color="#b8c1ba" />)}
      <Block w={58} h={12} d={3} y={-14} z={35} color="#f0e9d8" label={label} />
      <Block w={24} h={14} d={21} x={59} y={25} z={52} color="#b99b62" />
    </>}
    {id === "interdist" && <>
      <Block w={142} h={6} d={72} y={27} color="#526650" />
      <Block w={67} h={44} d={10} x={24} y={-4} z={-10} color="#263b31" />
      <Block w={55} h={31} d={2} x={24} y={-4} z={-3} color="#cee18e" />
      <Block w={24} h={42} d={27} x={-49} y={3} z={10} color="#8eaa80" />
      <Block w={27} h={26} d={27} x={-12} y={11} z={23} color="#c8b888" />
      <Block w={36} h={5} d={3} x={-29} y={17} z={12} color="#d4f236" />
      <Block w={3} h={5} d={26} x={7} y={17} z={9} color="#d4f236" />
    </>}
  </span></span></span>;
}
