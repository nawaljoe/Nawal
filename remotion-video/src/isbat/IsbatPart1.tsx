import React from "react";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  T,
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

const f = (name: string) => staticFile(`isbat/${name}`);
loadFont({ family: FONT, url: f("fonts/InterDisplay-SemiBold.otf"), weight: "600" });
loadFont({ family: FONT, url: f("fonts/InterDisplay-ExtraBold.otf"), weight: "800" });
loadFont({ family: FONT, url: f("fonts/InterDisplay-Black.otf"), weight: "900" });

const { navy, navyDeep, gold } = T.palette;
const W = T.width;
const H = T.height;
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/* ---------------------------------------------------------------- footage */
const GRADE_USTAZ = "contrast(1.06) saturate(1.07) brightness(0.99)";
const GRADE_BROLL = "contrast(1.06) saturate(0.98) brightness(0.96)";

type Shot = {
  id: string; type: string; start: number; end: number;
  mediaStart?: number; src?: string; zoom?: Keyframe[]; center?: number[][]; fadeIn?: number;
};

const ShotLayer: React.FC<{ shot: Shot }> = ({ shot }) => {
  const t = useT() + shot.start; // absolute timeline time
  const { fps } = useVideoConfig();
  const z = shot.zoom ? keyframes(t, shot.zoom) : 1;
  const base: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0" };

  if (shot.type === "ustaz" || shot.type === "still") {
    const style = { ...base, transform: ustazTransform(z), filter: GRADE_USTAZ };
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {shot.type === "ustaz" ? (
          <Video src={f("ustaz.mp4")} trimBefore={Math.round(shot.mediaStart! * fps)} muted style={style} />
        ) : (
          <Img src={f(shot.src!)} style={style} />
        )}
      </AbsoluteFill>
    );
  }
  if (shot.type === "broll") {
    const [cx, cy] = center(t, shot.center!);
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Video
          src={f("broll.mp4")}
          trimBefore={Math.round(shot.mediaStart! * fps)}
          muted
          style={{ ...base, transform: brollTransform(z, cx, cy), filter: GRADE_BROLL }}
        />
      </AbsoluteFill>
    );
  }
  // end card background: blurred b-roll under deep navy
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: easeInOut((t - shot.start) / (shot.fadeIn ?? 0.3)) }}>
      <Video
        src={f("broll.mp4")}
        trimBefore={Math.round(shot.mediaStart! * fps)}
        muted
        style={{ ...base, transformOrigin: "50% 50%", transform: "scale(1.15)", filter: `blur(18px) ${GRADE_BROLL}` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,22,52,0.55) 0%, rgba(6,22,52,0.80) 100%)" }} />
    </AbsoluteFill>
  );
};

const Footage: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {(T.shots as unknown as Shot[]).map((s) => (
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
  const fade = 1 - clamp01((t - 20.0) / 0.3);
  return (
    <>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }}
      />
      <AbsoluteFill
        style={{
          opacity: fade,
          background: `linear-gradient(180deg, rgba(6,22,52,0.43) 0px, rgba(6,22,52,0) 360px, rgba(6,22,52,0) 980px, rgba(6,22,52,0.69) 1920px)`,
        }}
      />
    </>
  );
};

/* ------------------------------------------------------------------ hook */
const Hook: React.FC = () => {
  const t = useT();
  const { hook } = T;
  if (t >= hook.end) return null;
  const out = 1 - prog(t, hook.exitAt, 0.16);
  return (
    <>
      {(hook.lines as unknown as Line[]).map((l, i) => {
        if (t < l.at) return null;
        if (l.pop) {
          const p = prog(t, l.at, 0.24);
          return (
            <RunsLine key={i} runs={l.runs} size={l.size} y={l.y}
              style={{ opacity: clamp01(p / 0.3) * out, scale: String(0.7 + 0.3 * easeBack(p)) }} />
          );
        }
        const p = prog(t, l.at, 0.22);
        return (
          <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} stroke={3}
            style={{ opacity: easeOut3(p / 0.6) * out, translate: `0 ${30 * (1 - easeOut3(p))}px` }} />
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------- subtitles */
const Subtitles: React.FC = () => {
  const t = useT();
  const { subtitles: S, isbat } = T;
  if (t >= isbat.revealAt && t < isbat.moveAt) return null;
  const chunk = S.chunks.find((c) => t >= c.start && t < c.end);
  if (!chunk) return null;
  const words = chunk.words as [string, number, string?][];
  let active = 0;
  words.forEach((w, i) => { if (w[1] <= t + 0.02) active = i; });
  const p = prog(t, chunk.start, 0.16);
  return (
    <div
      style={{
        position: "absolute", left: (W - S.maxWidth) / 2, width: S.maxWidth, top: S.y, height: 0,
        display: "flex", flexWrap: "wrap", justifyContent: "center", alignContent: "center", alignItems: "center",
        columnGap: S.size * 0.26, rowGap: S.size * 0.12,
        fontFamily: FONT, fontWeight: 900, fontSize: S.size, lineHeight: 1.1,
        opacity: clamp01((t - chunk.start) / 0.07),
        scale: String(p < 1 ? 0.86 + 0.14 * easeBack(p) : 1),
      }}
    >
      {words.map(([w, , kind], i) => {
        const cur = i === active;
        const key = kind === "key";
        const box = cur ? (key ? gold : navy) : undefined;
        return (
          <span key={i} style={{
            color: key ? (cur ? navyDeep : gold) : "#fff",
            background: box, borderRadius: S.size * 0.22,
            padding: `${S.size * 0.08}px ${S.size * 0.16}px ${S.size * 0.04}px`, margin: `0 -${S.size * 0.16}px`,
            WebkitTextStroke: box ? undefined : `3px ${navyDeep}`, paintOrder: "stroke fill",
            textShadow: "0 4px 16px rgba(0,8,25,0.75)",
          }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------- b-roll 2 title stack */
const BrollTitle: React.FC = () => {
  const t = useT();
  const B = T.brollTitle;
  if (t < B.start || t >= B.end) return null;
  const out = 1 - prog(t, B.exitAt, 0.13);
  return (
    <>
      <AbsoluteFill style={{
        opacity: clamp01((t - B.start) / 0.25) * out,
        background: "linear-gradient(180deg, rgba(6,22,52,0.47) 0px, rgba(6,22,52,0.47) 500px, rgba(6,22,52,0.59) 1500px)",
      }} />
      {(B.lines as unknown as Line[]).map((l, i) => {
        if (t < l.at) return null;
        const p = prog(t, l.at, 0.25);
        return (
          <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} stroke={l.size > 60 ? 2 : 0}
            tracking={l.runs[0][0] === "NEGERI JOHOR" ? 6 : 0}
            style={{ opacity: easeOut3(p / 0.5) * out, translate: `0 ${26 * (1 - easeOut3(p))}px`, scale: String(0.92 + 0.08 * easeOut3(p)) }} />
        );
      })}
    </>
  );
};

/* ----------------------------------------------- ISBAT reveal + card */
const IsbatReveal: React.FC = () => {
  const t = useT();
  const I = T.isbat;
  if (t < I.revealAt || t >= I.end) return null;
  const out = 1 - prog(t, I.exitAt, 0.15);
  const pr = prog(t, I.revealAt, 0.24);
  const pm = easeInOut(prog(t, I.moveAt, 0.38));
  const moving = t >= I.moveAt;
  const y = moving ? I.bigY + (I.labelY - I.bigY) * pm : I.bigY;
  const sc = moving ? 1 - (1 - I.labelScale) * pm : 0.6 + 0.4 * easeBack(pr);
  const pc = easeOut3(prog(t, I.card.at, 0.32));
  const pt = easeOut3(prog(t, 17.15, 0.3));
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
          position: "absolute", left: (W - I.card.width) / 2, width: I.card.width, top: I.card.top,
          height: I.card.bottom - I.card.top, borderRadius: 34, background: "rgba(11,42,91,0.89)",
          border: `4px solid ${gold}`, scale: `1 ${pc}`, opacity: out, boxShadow: "0 18px 40px rgba(0,8,25,0.45)",
        }} />
      )}
      {word(true)}
      {word(false)}
      {moving && pt > 0 && (
        <>
          <div style={{ position: "absolute", left: W / 2 - 130 * pt, width: 260 * pt, top: I.ruleY - 2, height: 4, background: gold, opacity: out }} />
          {(I.lines as unknown as Line[]).map((l, i) => {
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
  const s = T.seriesTag;
  if (t < s.start || t >= s.end || (t >= s.hideFrom && t < s.hideTo)) return null;
  const a = clamp01((t - s.start) / 0.3) * (1 - prog(t, s.end - 0.19, 0.19));
  return (
    <div style={{ position: "absolute", left: 70, top: 205, height: 0, display: "flex", alignItems: "center", gap: 12,
      fontFamily: FONT, fontSize: 36, lineHeight: 1, opacity: a, whiteSpace: "pre" }}>
      <span style={{ fontWeight: 800, color: "#fff", textShadow: "0 3px 12px rgba(0,8,25,0.7)" }}>{s.text}</span>
      <span style={{ fontWeight: 900, color: navyDeep, background: gold, borderRadius: 8, padding: "6px 10px 3px" }}>{s.badge}</span>
    </div>
  );
};

/* -------------------------------------------------------------- end card */
const EndCard: React.FC = () => {
  const t = useT();
  const E = T.endCard;
  if (t < E.start) return null;
  return (
    <>
      {(E.lines as unknown as Line[]).map((l, i) => {
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
        return (
          <RunsLine key={i} runs={l.runs} size={l.size} y={l.y} tracking={l.tracking} stroke={l.size > 90 ? 2 : 0}
            style={{ opacity: easeOut3(p / 0.6), translate: `0 ${(l.at >= 23 ? 24 : 34) * (1 - easeOut3(p))}px` }} />
        );
      })}
      {t >= E.ruleAt && (
        <div style={{ position: "absolute", top: E.ruleY - 2.5, height: 5, background: gold,
          left: W / 2 - 150 * easeOut3(prog(t, E.ruleAt, 0.4)), width: 300 * easeOut3(prog(t, E.ruleAt, 0.4)) }} />
      )}
    </>
  );
};

/* ----------------------------------------------------------------- audio */
const AudioTracks: React.FC = () => {
  const { fps } = useVideoConfig();
  const A = T.audio;
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

export const IsbatPart1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    <LookOverlays />
    <Hook />
    <BrollTitle />
    <SeriesTag />
    <IsbatReveal />
    <Subtitles />
    <EndCard />
    <AudioTracks />
  </AbsoluteFill>
);
