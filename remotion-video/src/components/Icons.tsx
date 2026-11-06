import React from "react";
import { C, HEAD } from "../theme";

/**
 * Minimal line icons on a 100x100 grid, all with hand-drawn line reveal:
 * `draw` 0..1 draws the strokes, fills fade in at the end.
 * Render inside an <svg>; position with x/y (centre) and size (px).
 */
export type IconProps = {
  x?: number;
  y?: number;
  size?: number;
  draw?: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
  color?: string;
  accent?: string;
};

const SW = 6;

export const Stroke: React.FC<{
  d: string;
  draw: number;
  color?: string;
  width?: number;
  fill?: string;
  fillOpacity?: number;
}> = ({ d, draw, color = C.ink, width = SW, fill = "none", fillOpacity }) => (
  <path
    d={d}
    pathLength={1}
    strokeDasharray="1 1"
    strokeDashoffset={1 - Math.min(1, Math.max(0, draw))}
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    fill={fill}
    fillOpacity={fillOpacity ?? (fill === "none" ? 0 : Math.max(0, (draw - 0.6) / 0.4))}
  />
);

const Frame: React.FC<IconProps & { children: (draw: number) => React.ReactNode }> = ({
  x = 0,
  y = 0,
  size = 100,
  draw = 1,
  rotate = 0,
  scale = 1,
  opacity = 1,
  children,
}) => (
  <g
    opacity={opacity}
    transform={`translate(${x} ${y}) rotate(${rotate}) scale(${(size / 100) * scale}) translate(-50 -50)`}
  >
    {children(draw)}
  </g>
);

export const CarIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M10 64 V52 Q10 46 16 45 L26 43 L36 28 Q38 25 42 25 H64 Q68 25 70 28 L80 43 L86 45 Q91 47 91 53 V64 Z" draw={d} fill={p.accent ?? C.blue} />
        <Stroke d="M38 43 L44 31 H62 L68 43 Z" draw={d} color={C.ink} fill={C.bg} fillOpacity={1} width={5} />
        <Stroke d="M30 64 a9 9 0 1 0 0.1 0" draw={d} fill={C.bg} fillOpacity={1} />
        <Stroke d="M72 64 a9 9 0 1 0 0.1 0" draw={d} fill={C.bg} fillOpacity={1} />
      </>
    )}
  </Frame>
);

export const BillIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M24 12 H62 L78 28 V88 H24 Z" draw={d} fill={C.bg} fillOpacity={1} />
        <Stroke d="M62 12 V28 H78" draw={d} />
        <Stroke d="M34 44 H66 M34 56 H66 M34 68 H52" draw={d} color={p.accent ?? C.blue} width={5} />
      </>
    )}
  </Frame>
);

export const BagIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M22 36 H78 L84 88 H16 Z" draw={d} fill={p.accent ?? C.blue} />
        <Stroke d="M36 44 V30 Q36 14 50 14 Q64 14 64 30 V44" draw={d} />
      </>
    )}
  </Frame>
);

export const FoodIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M12 54 H88 Q86 84 50 86 Q14 84 12 54 Z" draw={d} fill={p.accent ?? C.blue} />
        <Stroke d="M30 54 Q30 36 50 36 Q70 36 70 54" draw={d} fill={C.bg} fillOpacity={1} />
        <Stroke d="M38 28 q-5 -6 0 -12 M50 26 q-5 -6 0 -12 M62 28 q-5 -6 0 -12" draw={d} width={4.5} />
      </>
    )}
  </Frame>
);

export const PhoneIcon: React.FC<IconProps & { screen?: React.ReactNode }> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M30 6 H70 Q78 6 78 14 V86 Q78 94 70 94 H30 Q22 94 22 86 V14 Q22 6 30 6 Z" draw={d} fill={C.bg} fillOpacity={1} />
        <Stroke d="M44 14 H56" draw={d} width={4} />
        {p.screen}
      </>
    )}
  </Frame>
);

export const BanknoteIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M6 28 H94 V72 H6 Z" draw={d} fill={C.blue} width={5} />
        <Stroke d="M50 38 a12 12 0 1 0 0.1 0" draw={d} color={C.bg} width={4.5} />
        <Stroke d="M16 38 V62 M84 38 V62" draw={d} color={C.bg} width={4} />
      </>
    )}
  </Frame>
);

export const CoinIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M50 10 a40 40 0 1 0 0.1 0" draw={d} fill={C.gold} />
        <Stroke d="M50 24 a26 26 0 1 0 0.1 0" draw={d} width={4} />
      </>
    )}
  </Frame>
);

export const CheckIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => <Stroke d="M18 52 L40 74 L84 26" draw={d} color={p.color ?? C.blue} width={12} />}
  </Frame>
);

export const CalendarIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M10 18 H90 V92 H10 Z" draw={d} fill={C.bg} fillOpacity={1} />
        <Stroke d="M10 18 H90 V36 H10 Z" draw={d} fill={C.blue} />
        <Stroke d="M30 8 V26 M70 8 V26" draw={d} />
      </>
    )}
  </Frame>
);

export const BookIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M50 26 Q32 14 8 18 V80 Q32 76 50 88 Q68 76 92 80 V18 Q68 14 50 26 Z" draw={d} fill={p.accent ?? C.blue} />
        <Stroke d="M50 26 V88" draw={d} color={C.bg} width={5} />
      </>
    )}
  </Frame>
);

export const HouseIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M18 46 V88 H82 V46" draw={d} fill={C.bg} fillOpacity={1} />
        <Stroke d="M8 52 L50 14 L92 52" draw={d} />
        <Stroke d="M42 88 V64 H58 V88" draw={d} fill={p.accent ?? C.blue} />
      </>
    )}
  </Frame>
);

export const ChartIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M10 90 H92" draw={d} />
        <Stroke d="M20 90 V66 H34 V90 M44 90 V50 H58 V90 M68 90 V30 H82 V90" draw={d} fill={C.blue} />
        <Stroke d="M14 54 L36 36 L52 42 L84 12 M70 12 H84 V26" draw={d} color={p.accent ?? C.gold} width={6} />
      </>
    )}
  </Frame>
);

export const ShopIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M16 44 V90 H84 V44" draw={d} fill={C.bg} fillOpacity={1} />
        <Stroke d="M10 44 L18 14 H82 L90 44 Q80 54 70 44 Q60 54 50 44 Q40 54 30 44 Q20 54 10 44 Z" draw={d} fill={C.blue} />
        <Stroke d="M40 90 V64 H60 V90" draw={d} />
      </>
    )}
  </Frame>
);

/** Open hand offering a gold coin: the "zakat" symbol used across the video. */
export const ZakatIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    {(d) => (
      <>
        <Stroke d="M50 8 a22 22 0 1 0 0.1 0" draw={d} fill={C.gold} />
        <Stroke d="M43 22 Q50 18 57 22 M44 38 Q50 42 56 38" draw={d} width={4} />
        <Stroke
          d="M8 70 Q20 62 34 66 L58 70 Q66 72 64 79 Q62 84 54 82 L40 80 M60 80 L82 66 Q90 62 93 68 Q95 73 88 78 L64 94 Q58 97 50 96 L22 92 L8 92"
          draw={d}
          fill={C.bg}
          fillOpacity={1}
        />
      </>
    )}
  </Frame>
);

/** Balance scale. `tilt` in degrees (+ = right pan down). */
export const ScaleIcon: React.FC<IconProps & { tilt?: number; leftLabel?: string; rightLabel?: string }> = (p) => {
  const t = p.tilt ?? 0;
  const r = (t * Math.PI) / 180;
  const lx = 50 - 38 * Math.cos(r);
  const ly = 24 - 38 * Math.sin(r);
  const rx = 50 + 38 * Math.cos(r);
  const ry = 24 + 38 * Math.sin(r);
  return (
    <Frame {...p}>
      {(d) => (
        <>
          <Stroke d="M50 24 V90 M32 92 H68" draw={d} />
          <Stroke d={`M${lx} ${ly} L${rx} ${ry}`} draw={d} />
          <Stroke d={`M${lx} ${ly} L${lx - 12} ${ly + 30} M${lx} ${ly} L${lx + 12} ${ly + 30} M${lx - 16} ${ly + 30} Q${lx} ${ly + 44} ${lx + 16} ${ly + 30} Z`} draw={d} fill={C.gold} width={4} />
          <Stroke d={`M${rx} ${ry} L${rx - 12} ${ry + 30} M${rx} ${ry} L${rx + 12} ${ry + 30} M${rx - 16} ${ry + 30} Q${rx} ${ry + 44} ${rx + 16} ${ry + 30} Z`} draw={d} fill={C.blue} width={4} />
          <circle cx={50} cy={24} r={5} fill={C.ink} opacity={d} />
        </>
      )}
    </Frame>
  );
};

/** A big hand-set question mark (Montserrat glyph, used as a graphic). */
export const QuestionMark: React.FC<IconProps> = ({ x = 0, y = 0, size = 200, rotate = 0, scale = 1, opacity = 1, color = C.ink }) => (
  <text
    x={x}
    y={y}
    fontFamily={HEAD}
    fontWeight={800}
    fontSize={size}
    fill={color}
    textAnchor="middle"
    dominantBaseline="central"
    opacity={opacity}
    transform={`rotate(${rotate} ${x} ${y}) translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}
  >
    ?
  </text>
);

/** Little motion lines around something that just moved / popped. */
export const Burst: React.FC<{ x: number; y: number; r?: number; t: number; color?: string; n?: number }> = ({
  x,
  y,
  r = 70,
  t,
  color = C.gold,
  n = 8,
}) => {
  if (t <= 0 || t >= 1) return null;
  const inner = r * (0.5 + t * 0.6);
  const outer = r * (0.7 + t * 0.9);
  return (
    <g opacity={1 - t}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * inner}
            y1={y + Math.sin(a) * inner}
            x2={x + Math.cos(a) * outer}
            y2={y + Math.sin(a) * outer}
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};
