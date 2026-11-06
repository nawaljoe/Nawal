import React, { createContext, useContext } from "react";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  type Keyframe,
  type Line,
  brollTransform,
  center,
  clamp01,
  easeBack,
  easeInOut,
  easeOut3,
  keyframes,
  prog,
  ustazTransform,
} from "./anim";
import { FONT, RunsLine } from "./Text";

/* ------------------------------------------------------------------ data */
export type Shot = {
  id: string; type: string; start: number; end: number;
  mediaStart?: number; src?: string; zoom?: Keyframe[]; center?: number[][]; fadeIn?: number;
};
type Title = { start: number; end: number; exitAt: number; overlay?: boolean; lines: Line[] };
type Panel = { start: number; end: number; exitAt: number; top: number; bottom: number; width: number; lines: Line[]; rules?: number[] };
export type Timeline = {
  fps: number; width: number; height: number; duration: number;
  palette: Record<string, string>;
  shots: Shot[];
  hook?: { start: number; end: number; exitAt: number; lines: Line[] };
  seriesTag?: { start: number; end: number; hide: number[][]; text: string; badge: string };
  subtitles: { y: number; size: number; maxWidth: number; hide?: number[][]; chunks: { start: number; end: number; words: (string | number)[][] }[] };
  titles?: Title[];
  panels?: Panel[];
  isbat?: {
    revealAt: number; moveAt: number; end: number; exitAt: number; bigY: number; bigSize: number; labelY: number; labelScale: number;
    card: { top: number; bottom: number; width: number; at: number }; lines: Line[]; ruleY: number; ruleAt: number;
  };
  endCard?: { start: number; lines: Line[]; ruleAt: number; ruleY: number };
  gradientUntil: number;
  audio: {
    dialog: { file: string; volume: number }; music: { file: string; volume: number }; ambience: { file: string; volume: number };
    sfx: { at: number; file: string; volume: number }[];
  };
};

const Ctx = createContext<Timeline | null>(null);
const useTL = () => useContext(Ctx)!;

const f = (name: string) => staticFile(`isbat/${name}`);
loadFont({ family: FONT, url: f("fonts/InterDisplay-SemiBold.otf"), weight: "600" });
loadFont({ family: FONT, url: f("fonts/InterDisplay-ExtraBold.otf"), weight: "800" });
loadFont({ family: FONT, url: f("fonts/InterDisplay-Black.otf"), weight: "900" });

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
const inRanges = (t: number, r?: number[][]) => !!r?.some(([a, b]) => t >= a && t < b);

/* ---------------------------------------------------------------- footage */
const GRADE_USTAZ = "contrast(1.06) saturate(1.07) brightness(0.99)";
const GRADE_BROLL = "contrast(1.06) saturate(0.98) brightness(0.96)";

const ShotLayer: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { width: W, height: H } = useTL();
  const t = useT() + shot.start;
  const { fps } = useVideoConfig();
  const z = shot.zoom ? keyframes(t, shot.zoom) : 1;
  const base: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0" };

  if (shot.type === "ustaz" || shot.type === "still") {
    const style = { ...base, transform: ustazTransform(z), filter: GRADE_USTAZ };
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {shot.type === "ustaz" ? (
          <Video src={f(shot.src ?? "ustaz.mp4")} trimBefore={Math.round(shot.mediaStart! * fps)} muted style={style} />
        ) : (
          <Img src={f(shot.src!)} style={style} />
        )}
      </AbsoluteFill>
    );
  }
  if (shot.type === "broll") {
    const [cx, cy] = center(t, shot.center!);
    return (
      <AbsoluteFill style={{ overflow: "hidden", opacity: shot.fadeIn ? easeInOut((t - shot.start) / shot.fadeIn) : 1 }}>
        <Video src={f("broll.mp4")} trimBefore={Math.round(shot.mediaStart! * fps)} muted
          style={{ ...base, transform: brollTransform(z, cx, cy), filter: GRADE_BROLL }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: easeInOut((t - shot.start) / (shot.fadeIn ?? 0.3)) }}>
      <Video src={f("broll.mp4")} trimBefore={Math.round(shot.mediaStart! * fps)} muted
        style={{ ...base, transformOrigin: "50% 50%", transform: "scale(1.15)", filter: `blur(18px) ${GRADE_BROLL}` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,22,52,0.55) 0%, rgba(6,22,52,0.80) 100%)" }} />
    </AbsoluteFill>
  );
};

const Footage: React.FC = () => {
  const { shots } = useTL();
  const { fps } = useVideoConfig();
  return (
    <>
      {shots.map((s) => (
        <Sequence key={s.id} name={s.id} from={Math.round(s.start * fps)} durationInFrames={Math.round((s.end - s.start) * fps)}>
          <ShotLayer shot={s} />
        </Sequence>
      ))}
    </>
  );
};

/* -------------------------------------------------------- look overlays */
const LookOverlays: React.FC = () => {
  const t = useT();
  const { gradientUntil } = useTL();
  const fade = 1 - clamp01((t - gradientUntil) / 0.3);
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      <AbsoluteFill style={{
        opacity: fade,
        background: "linear-gradient(180deg, rgba(6,22,52,0.43) 0px, rgba(6,22,52,0) 360px, rgba(6,22,52,0) 980px, rgba(6,22,52,0.69) 1920px)",
      }} />
    </>
  );
};

/* ------------------------------------------------------------------ hook */
const Hook: React.FC = () => {
  const t = useT();
  const { hook } = useTL();
  if (!hook || t >= hook.end) return null;
  const out = 1 - prog(t, hook.exitAt, 0.16);
  return (
    <>
      {hook.lines.map((l, i) => {
        if (t < l.at) return null;
        if (l.pop) {
          const p = prog(t, l.at, 0.24);
          return <RunsLine key={i} runs={l.runs} size={l.size} y={l.y}
            style={{ opacity: clamp01(p / 0.3) * out, scale: String(0.7 + 0.3 * easeBack(p)) }} />;
        }
        const p = prog(t, l.at, 0.22);
        return <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} stroke={3}
          style={{ opacity: easeOut3(p / 0.6) * out, translate: `0 ${30 * (1 - easeOut3(p))}px` }} />;
      })}
    </>
  );
};

/* ------------------------------------------------------------- subtitles */
const Subtitles: React.FC = () => {
  const t = useT();
  const { subtitles: S, palette } = useTL();
  if (inRanges(t, S.hide)) return null;
  const chunk = S.chunks.find((c) => t >= c.start && t < c.end);
  if (!chunk) return null;
  const words = chunk.words as [string, number, string?][];
  let active = 0;
  words.forEach((w, i) => { if (w[1] <= t + 0.02) active = i; });
  const p = prog(t, chunk.start, 0.16);
  return (
    <div style={{
      position: "absolute", left: (1080 - S.maxWidth) / 2, width: S.maxWidth, top: S.y, height: 0,
      display: "flex", flexWrap: "wrap", justifyContent: "center", alignContent: "center", alignItems: "center",
      columnGap: S.size * 0.26, rowGap: S.size * 0.12,
      fontFamily: FONT, fontWeight: 900, fontSize: S.size, lineHeight: 1.1,
      opacity: clamp01((t - chunk.start) / 0.07),
      scale: String(p < 1 ? 0.86 + 0.14 * easeBack(p) : 1),
    }}>
      {words.map(([w, , kind], i) => {
        const cur = i === active;
        const key = kind === "key";
        const box = cur ? (key ? palette.gold : palette.navy) : undefined;
        return (
          <span key={i} style={{
            color: key ? (cur ? palette.navyDeep : palette.gold) : "#fff",
            background: box, borderRadius: S.size * 0.22,
            padding: `${S.size * 0.08}px ${S.size * 0.16}px ${S.size * 0.04}px`, margin: `0 -${S.size * 0.16}px`,
            WebkitTextStroke: box ? undefined : `3px ${palette.navyDeep}`, paintOrder: "stroke fill",
            textShadow: "0 4px 16px rgba(0,8,25,0.75)",
          }}>{w}</span>
        );
      })}
    </div>
  );
};

/* --------------------------------------------- title stacks (b-roll etc.) */
const Titles: React.FC = () => {
  const t = useT();
  const { titles } = useTL();
  return (
    <>
      {(titles ?? []).map((B, k) => {
        if (t < B.start || t >= B.end) return null;
        const out = 1 - prog(t, B.exitAt, 0.13);
        return (
          <React.Fragment key={k}>
            {B.overlay !== false && (
              <AbsoluteFill style={{
                opacity: clamp01((t - B.start) / 0.25) * out,
                background: "linear-gradient(180deg, rgba(6,22,52,0.47) 0px, rgba(6,22,52,0.47) 500px, rgba(6,22,52,0.59) 1500px)",
              }} />
            )}
            {B.lines.map((l, i) => {
              if (t < l.at) return null;
              const p = prog(t, l.at, 0.25);
              return <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} stroke={l.size > 60 ? 2 : 0} tracking={l.tracking}
                style={{ opacity: easeOut3(p / 0.5) * out, translate: `0 ${26 * (1 - easeOut3(p))}px`, scale: String(0.92 + 0.08 * easeOut3(p)) }} />;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ------------------------------------------------- info panels (fakta) */
const Panels: React.FC = () => {
  const t = useT();
  const { panels, palette } = useTL();
  return (
    <>
      {(panels ?? []).map((P, k) => {
        if (t < P.start || t >= P.end) return null;
        const out = 1 - prog(t, P.exitAt, 0.18);
        const pc = easeOut3(prog(t, P.start, 0.32));
        return (
          <React.Fragment key={k}>
            <div style={{
              position: "absolute", left: (1080 - P.width) / 2, width: P.width, top: P.top, height: P.bottom - P.top,
              borderRadius: 34, background: "rgba(11,42,91,0.89)", border: `4px solid ${palette.gold}`,
              scale: `1 ${pc}`, opacity: out, boxShadow: "0 18px 40px rgba(0,8,25,0.45)",
            }} />
            {(P.rules ?? []).map((ry, i) => {
              const pr = easeOut3(prog(t, P.start + 0.2, 0.3));
              return <div key={`r${i}`} style={{ position: "absolute", left: 540 - 130 * pr, width: 260 * pr, top: ry - 2, height: 4, background: palette.gold, opacity: out }} />;
            })}
            {P.lines.map((l, i) => {
              if (t < l.at) return null;
              const p = prog(t, l.at, 0.3);
              if (l.pop) {
                return <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} shadow={false}
                  style={{ opacity: clamp01(p / 0.3) * out, scale: String(0.7 + 0.3 * easeBack(p)) }} />;
              }
              return <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} shadow={false}
                style={{ opacity: easeOut3(p) * out, translate: `0 ${14 * (1 - easeOut3(p))}px` }} />;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ----------------------------------------------- ISBAT reveal + card */
const IsbatReveal: React.FC = () => {
  const t = useT();
  const { isbat: I, palette } = useTL();
  if (!I || t < I.revealAt || t >= I.end) return null;
  const out = 1 - prog(t, I.exitAt, 0.15);
  const pr = prog(t, I.revealAt, 0.24);
  const pm = easeInOut(prog(t, I.moveAt, 0.38));
  const moving = t >= I.moveAt;
  const y = moving ? I.bigY + (I.labelY - I.bigY) * pm : I.bigY;
  const sc = moving ? 1 - (1 - I.labelScale) * pm : 0.6 + 0.4 * easeBack(pr);
  const pc = easeOut3(prog(t, I.card.at, 0.32));
  const pt = easeOut3(prog(t, I.ruleAt, 0.3));
  const word = (glow: boolean) => (
    <RunsLine runs={[["ISBAT", "black", "gold"]]} size={I.bigSize} y={y} stroke={6} shadow={!glow}
      style={{
        scale: String(sc),
        opacity: (moving ? 1 : clamp01(pr / (glow ? 0.3 : 0.25))) * out * (glow ? (moving ? 0 : 0.55) : 1),
        filter: glow ? "blur(28px)" : undefined,
      }} />
  );
  return (
    <>
      {moving && pc > 0 && (
        <div style={{
          position: "absolute", left: (1080 - I.card.width) / 2, width: I.card.width, top: I.card.top,
          height: I.card.bottom - I.card.top, borderRadius: 34, background: "rgba(11,42,91,0.89)",
          border: `4px solid ${palette.gold}`, scale: `1 ${pc}`, opacity: out, boxShadow: "0 18px 40px rgba(0,8,25,0.45)",
        }} />
      )}
      {word(true)}
      {word(false)}
      {moving && pt > 0 && (
        <>
          <div style={{ position: "absolute", left: 540 - 130 * pt, width: 260 * pt, top: I.ruleY - 2, height: 4, background: palette.gold, opacity: out }} />
          {I.lines.map((l, i) => {
            const p = easeOut3(prog(t, l.at, 0.3));
            return <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} shadow={false}
              style={{ opacity: p * out, translate: `0 ${14 * (1 - p)}px` }} />;
          })}
        </>
      )}
    </>
  );
};

/* ------------------------------------------------------------ series tag */
const SeriesTag: React.FC = () => {
  const t = useT();
  const { seriesTag: s, palette } = useTL();
  if (!s || t < s.start || t >= s.end || inRanges(t, s.hide)) return null;
  const a = clamp01((t - s.start) / 0.3) * (1 - prog(t, s.end - 0.19, 0.19));
  return (
    <div style={{ position: "absolute", left: 70, top: 205, height: 0, display: "flex", alignItems: "center", gap: 12,
      fontFamily: FONT, fontSize: 36, lineHeight: 1, opacity: a, whiteSpace: "pre" }}>
      <span style={{ fontWeight: 800, color: "#fff", textShadow: "0 3px 12px rgba(0,8,25,0.7)" }}>{s.text}</span>
      <span style={{ fontWeight: 900, color: palette.navyDeep, background: palette.gold, borderRadius: 8, padding: "6px 10px 3px" }}>{s.badge}</span>
    </div>
  );
};

/* -------------------------------------------------------------- end card */
const EndCard: React.FC = () => {
  const t = useT();
  const { endCard: E, palette } = useTL();
  if (!E || t < E.start) return null;
  return (
    <>
      {E.lines.map((l, i) => {
        if (t < l.at) return null;
        if (l.pop) {
          const p = prog(t, l.at, 0.3);
          const breathe = t > l.at + 0.3 ? 1 + 0.012 * Math.sin((t - l.at - 0.3) * 2.2) : 1;
          const sc = String((0.7 + 0.3 * easeBack(p)) * breathe);
          return (
            <React.Fragment key={i}>
              <RunsLine runs={l.runs} size={l.size} y={l.y} stroke={4} shadow={false}
                style={{ scale: sc, opacity: 0.45 * clamp01(p / 0.3), filter: "blur(26px)" }} />
              <RunsLine runs={l.runs} size={l.size} y={l.y} stroke={4} style={{ scale: sc, opacity: clamp01(p / 0.25) }} />
            </React.Fragment>
          );
        }
        const p = prog(t, l.at, 0.28);
        const lift = l.at >= E.ruleAt ? 24 : 34;
        return <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} tracking={l.tracking} stroke={l.size > 90 ? 2 : 0}
          style={{ opacity: easeOut3(p / 0.6), translate: `0 ${lift * (1 - easeOut3(p))}px` }} />;
      })}
      {t >= E.ruleAt && (
        <div style={{ position: "absolute", top: E.ruleY - 2.5, height: 5, background: palette.gold,
          left: 540 - 150 * easeOut3(prog(t, E.ruleAt, 0.4)), width: 300 * easeOut3(prog(t, E.ruleAt, 0.4)) }} />
      )}
    </>
  );
};

/* ----------------------------------------------------------------- audio */
const AudioTracks: React.FC = () => {
  const { fps } = useVideoConfig();
  const { audio: A } = useTL();
  return (
    <>
      <Audio name="Suara ustaz (podcast)" src={f(A.dialog.file)} volume={A.dialog.volume} />
      <Audio name="Muzik latar (ducked)" src={f(A.music.file)} volume={A.music.volume} />
      <Audio name="Ambien b-roll" src={f(A.ambience.file)} volume={A.ambience.volume} />
      {A.sfx.map((s, i) => (
        <Sequence key={i} name={`SFX ${s.file.replace(".wav", "")} @${s.at}s`} from={Math.round(s.at * fps)} layout="none">
          <Audio src={f(s.file)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};

export const IsbatVideo: React.FC<{ timeline: Timeline }> = ({ timeline }) => (
  <Ctx.Provider value={timeline}>
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Footage />
      <LookOverlays />
      <Hook />
      <Titles />
      <SeriesTag />
      <Panels />
      <IsbatReveal />
      <Subtitles />
      <EndCard />
      <AudioTracks />
    </AbsoluteFill>
  </Ctx.Provider>
);
