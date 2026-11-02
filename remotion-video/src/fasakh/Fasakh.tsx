import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import cuts from "./cuts.json";
import { Captions } from "./Captions";
import { Checklist, EndCard, InfoCard, LightLayer, SectionChip } from "./Overlays";
import { C, sec } from "./theme";

type Keep = {
  src_start: number;
  src_end: number;
  out_start: number;
  after_cut: string;
  hook?: boolean;
  beep?: boolean;
};
const KEEPS = (cuts as { keeps: Keep[] }).keeps;
const LAST = KEEPS[KEEPS.length - 1];
const VOICE_END = LAST.out_start + (LAST.src_end - LAST.src_start);

/** Map a time in the raw recording to the edited timeline, so overlays stay locked to the words after re-cuts. */
const src = (t: number) => {
  for (const k of KEEPS) {
    if (k.hook || k.beep) continue; // cold-open clip is a repeat, beep has no source; map body times only
    if (t < k.src_start) return k.out_start;
    if (t <= k.src_end) return k.out_start + (t - k.src_start);
  }
  return VOICE_END;
};

const END_AT = src(278.52); // "iaitu dinamakan cerai fasakh"
const HOOK_CUT = KEEPS[0].src_end - KEEPS[0].src_start; // end of cold open
const BEEP = KEEPS.find((k) => k.beep)!;
const BEEP_LEN = BEEP.src_end - BEEP.src_start;
const BODY_START = BEEP.out_start + BEEP_LEN; // "Baik. Dalam Islam..."
const OUTRO_AT = VOICE_END + 4.2; // end card holds, then the FK outro
const OUTRO_LEN = 10.0;
export const FASAKH_DURATION_S = Math.ceil(OUTRO_AT + OUTRO_LEN);

/** Alternating framing per segment hides each jump cut; slow push-in keeps the frame alive. */
const useCameraScale = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let i = KEEPS.length - 1;
  for (let k = 0; k < KEEPS.length; k++) {
    const end = KEEPS[k].out_start + (KEEPS[k].src_end - KEEPS[k].src_start);
    if (t < end) {
      i = k;
      break;
    }
  }
  const seg = KEEPS[i];
  const len = seg.src_end - seg.src_start;
  const p = Math.min(Math.max((t - seg.out_start) / len, 0), 1);
  if (seg.beep) return 1;
  const base = seg.hook ? 1.12 : i % 2 === 0 ? 1.0 : 1.1;
  return base + 0.035 * p;
};

const Footage: React.FC = () => {
  const scale = useCameraScale();
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "50% 40%" }}>
      <OffthreadVideo src={staticFile("fasakh/base_video.mp4")} muted />
    </AbsoluteFill>
  );
};

/** Brief warm light bloom that hides the cut from the cold open into the talk. */
const WarmFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3, 10], [0, 0.42, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 900px 1300px at 50% 42%, rgba(255,226,180,1) 0%, rgba(255,200,140,0.6) 60%, rgba(255,190,120,0) 100%)",
        opacity: o,
        mixBlendMode: "screen",
      }}
    />
  );
};

/** Brand logos (Johor + Maju Johor top, Fared Khalid watermark bottom) — shown through the talk. */
const Logos: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 15, dur - 12, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={staticFile("fasakh/logos.png")} style={{ width: 1080, height: 1920 }} />
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; file: string; vol: number }> = ({ at, file, vol }) => (
  <Sequence from={sec(at)} layout="none">
    <Audio src={staticFile(`fasakh/sfx/${file}.wav`)} volume={vol} />
  </Sequence>
);

const Chip: React.FC<{ at: number; dur: number; kicker: string; label: string }> = ({ at, dur, kicker, label }) => (
  <>
    <Sequence from={sec(at)} durationInFrames={sec(dur)} layout="none">
      <SectionChip kicker={kicker} label={label} dur={sec(dur)} />
    </Sequence>
    <Sfx at={at} file="whoosh_soft" vol={0.2} />
  </>
);

const GROUNDS_AT = src(165.2);
const GROUNDS = [
  { text: "Suami hilang lebih 1 tahun", at: src(178.0) },
  { text: "Suami cuai, tidak beri nafkah", at: src(193.0) },
  { text: "Tidak beri nafkah batin", at: src(200.03) },
  { text: "Suami menganiaya / menyakiti isteri", at: src(216.8) },
];

export const Fasakh: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Voice fades out under the end card's final hold.
  const voiceVol = interpolate(t, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#07080A" }}>
      <Footage />
      <Sequence from={0} durationInFrames={sec(HOOK_CUT)} layout="none">
        <LightLayer />
      </Sequence>
      <Sequence from={sec(BODY_START)} layout="none">
        <LightLayer />
      </Sequence>

      {/* Hook title — built and rendered in HyperFrames (GSAP), composited here with alpha */}
      <Sequence from={0} durationInFrames={sec(HOOK_CUT)}>
        <OffthreadVideo src={staticFile("fasakh/hook.mov")} transparent muted />
      </Sequence>

      {/* Colour-bars beep between the hook and the talk */}
      <Sfx at={BEEP.out_start} file="beep_bars" vol={1} />
      <Sequence from={sec(BODY_START - 0.05)} durationInFrames={10} layout="none">
        <WarmFlash />
      </Sequence>

      <Sequence from={sec(BODY_START)} durationInFrames={sec(OUTRO_AT - BODY_START)} layout="none">
        <Logos dur={sec(OUTRO_AT - BODY_START)} />
      </Sequence>

      <Chip at={src(11.77)} dur={4.6} kicker="TUJUAN" label="Perkahwinan dalam Islam" />
      <Chip at={src(37.17)} dur={5.2} kicker="BILA MUDARAT" label="Islam beri jalan keluar" />
      <Chip at={src(71.7)} dur={4.9} kicker="PERCERAIAN" label="Ada beberapa jenis" />

      <Sequence from={sec(src(82.93))} durationInFrames={sec(src(101.63) - src(82.93))} layout="none">
        <InfoCard
          dur={sec(src(101.63) - src(82.93))}
          kicker="JENIS 1"
          title="Talak"
          body="Suami bersetuju melepaskan atau menceraikan isteri."
        />
      </Sequence>
      <Sfx at={src(82.93)} file="swipe_soft" vol={0.24} />

      <Sequence from={sec(src(119.13))} durationInFrames={sec(src(143.33) - src(119.13))} layout="none">
        <InfoCard
          dur={sec(src(143.33) - src(119.13))}
          kicker="JENIS 2"
          title={
            <span>
              <span style={{ color: C.gold }}>Fasakh</span>
            </span>
          }
          body={
            <>
              Perintah <b style={{ color: C.gold }}>Mahkamah Syariah</b> untuk membubarkan perkahwinan — apabila suami
              tidak mahu menceraikan.
            </>
          }
        />
      </Sequence>
      <Sfx at={src(119.13)} file="swipe_soft" vol={0.24} />
      <Sfx at={src(119.33)} file="chime_soft" vol={0.12} />

      <Chip at={src(143.43)} dur={7.4} kicker="TETAPI" label="Ada syarat-syaratnya" />

      <Sequence from={sec(GROUNDS_AT)} durationInFrames={sec(src(228.9) - GROUNDS_AT)} layout="none">
        <Checklist
          dur={sec(src(228.9) - GROUNDS_AT)}
          title="Antara alasan fasakh"
          items={GROUNDS.map((g) => ({ text: g.text, at: g.at - GROUNDS_AT }))}
        />
      </Sequence>
      <Sfx at={GROUNDS_AT} file="swipe_soft" vol={0.24} />
      {GROUNDS.map((g) => (
        <Sfx key={g.at} at={g.at} file="tick_soft" vol={0.3} />
      ))}

      <Chip at={src(238.8)} dur={6.2} kicker="KES ANDA" label="Diabaikan bertahun-tahun?" />
      <Chip at={src(256.07)} dur={6.0} kicker="KESIMPULAN" label="Ada jalan penyelesaian" />

      <Captions hideBefore={0} hideRanges={[[END_AT, 9999]]} />

      <Sequence from={sec(END_AT)} durationInFrames={sec(OUTRO_AT - END_AT)}>
        <EndCard dur={sec(OUTRO_AT - END_AT)} />
      </Sequence>

      {/* Fared Khalid outro */}
      <Sequence from={sec(OUTRO_AT)}>
        <AbsoluteFill style={{ backgroundColor: "#F4F4F4" }}>
          <OffthreadVideo src={staticFile("fasakh/outro.mp4")} volume={0.72} />
        </AbsoluteFill>
      </Sequence>

      {/* Audio: cleaned voice + soft SFX (kept well under the voice) */}
      <Audio src={staticFile("fasakh/voice.wav")} volume={voiceVol} />
      <Sfx at={0.0} file="impact_soft" vol={0.32} />
      <Sfx at={2.28} file="tick_soft" vol={0.32} />
      <Sfx at={2.3} file="chime_soft" vol={0.16} />
      <Sfx at={END_AT} file="impact_soft" vol={0.26} />
      <Sfx at={END_AT + 0.25} file="chime_soft" vol={0.2} />
    </AbsoluteFill>
  );
};
