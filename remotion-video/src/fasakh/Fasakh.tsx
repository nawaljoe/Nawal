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
import { Checklist, EndCard, FocusBackdrop, InfoCard, KeyPopup, LightLayer, LowerThird, SectionChip } from "./Overlays";
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

/** Outro dissolves in over the end card (no flash of the talk in between). */
const OutroFadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#F4F4F4", opacity: o }}>{children}</AbsoluteFill>;
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

/**
 * Popups placed where the ustaz looks down at his notes for 2 s or more
 * (MediaPipe eye-look-down > 0.6, see fasakh-pipeline/lookdown.py). Times are in the edited timeline.
 */
const POPUPS: { from: number; to: number; kicker: string; lines: string[]; accent: string; accentDelay?: number }[] = [
  { from: 16.5, to: 18.9, kicker: "TUJUAN PERKAHWINAN", lines: ["Kebaikan untuk"], accent: "kedua-dua pihak" },
  { from: 29.4, to: 32.0, kicker: "TETAPI", lines: ["Bila perkahwinan", "membawa"], accent: "mudarat" },
  {
    from: 48.3,
    to: 54.0,
    kicker: "JALAN TERAKHIR",
    lines: ["Setelah berusaha", "selamatkan perkahwinan…"],
    accent: "perceraian dibenarkan",
    accentDelay: 75,
  },
  { from: 85.9, to: 88.3, kicker: "KES INI", lines: ["Isteri mohon cerai,"], accent: "suami tak mahu" },
  {
    from: 104.9,
    to: 116.6,
    kicker: "RUJUKAN UNDANG-UNDANG",
    lines: ["Seksyen 53", "Fasakh ialah perintah"],
    accent: "membubarkan perkahwinan",
    accentDelay: 150,
  },
  {
    from: 133.0,
    to: 141.0,
    kicker: "SYARATNYA",
    lines: ["Hanya dalam", "keadaan tertentu —"],
    accent: "diharuskan hukum syarak",
    accentDelay: 120,
  },
  { from: 196.7, to: 202.2, kicker: "CONTOH", lines: ["Suami abaikan isteri"], accent: "bertahun-tahun", accentDelay: 60 },
];

const GROUNDS_AT = src(165.2);
/** Checklist moves centre-stage over a blurred frame while the ustaz reads Seksyen 53 aloud. */
const GROUNDS_FOCUS: [number, number][] = [
  [GROUNDS_AT, 150.5],
  [155.5, 183.6],
];
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

      {GROUNDS_FOCUS.map(([a, b]) => (
        <Sequence key={a} from={sec(a)} durationInFrames={sec(b - a)} layout="none">
          <FocusBackdrop dur={sec(b - a)} />
        </Sequence>
      ))}
      <Sequence from={sec(GROUNDS_AT)} durationInFrames={sec(src(228.9) - GROUNDS_AT)} layout="none">
        <Checklist
          focus={GROUNDS_FOCUS.map(([a, b]) => [sec(a - GROUNDS_AT), sec(b - GROUNDS_AT)])}
          dur={sec(src(228.9) - GROUNDS_AT)}
          title="Antara alasan fasakh"
          items={GROUNDS.map((g) => ({ text: g.text, at: g.at - GROUNDS_AT }))}
        />
      </Sequence>
      <Sfx at={GROUNDS_AT} file="swipe_soft" vol={0.24} />
      {GROUNDS.map((g) => (
        <Sfx key={g.at} at={g.at} file="tick_soft" vol={0.3} />
      ))}

      <Chip at={src(256.07)} dur={6.0} kicker="KESIMPULAN" label="Ada jalan penyelesaian" />

      {POPUPS.map((p) => (
        <React.Fragment key={p.from}>
          <Sequence from={sec(p.from)} durationInFrames={sec(p.to - p.from)} layout="none">
            <KeyPopup
              dur={sec(p.to - p.from)}
              kicker={p.kicker}
              lines={p.lines}
              accent={p.accent}
              accentDelay={p.accentDelay}
            />
          </Sequence>
          <Sfx at={p.from} file="swipe_soft" vol={0.22} />
          <Sfx at={p.from + (p.accentDelay ?? 8) / 30} file="tick_soft" vol={0.18} />
        </React.Fragment>
      ))}

      {/* Speaker name — up front, during the cold open */}
      <Sequence from={sec(0.5)} durationInFrames={sec(HOOK_CUT - 0.7)} layout="none">
        <LowerThird
          dur={sec(HOOK_CUT - 0.7)}
          name="Ustaz Mohd Hafiz Abdul Rahman"
          role={"Penolong Pengarah\nBahagian Undang-undang Syariah Negeri Johor"}
          org="Jabatan Agama Islam Negeri Johor (JAINJ)"
        />
      </Sequence>

      <Captions hideBefore={0} hideRanges={[[BEEP.out_start, BODY_START], [END_AT, 9999]]} />

      {/* Held 12 frames past OUTRO_AT so the outro dissolves over the card, not over the talk */}
      <Sequence from={sec(END_AT)} durationInFrames={sec(OUTRO_AT - END_AT) + 12}>
        <EndCard dur={sec(OUTRO_AT - END_AT) + 12} />
      </Sequence>

      {/* Fared Khalid outro */}
      <Sequence from={sec(OUTRO_AT)}>
        <OutroFadeIn>
          <OffthreadVideo src={staticFile("fasakh/outro.mp4")} volume={0.72} />
        </OutroFadeIn>
      </Sequence>

      {/* Brand logos: from the start of the talk through to the end of the FK outro */}
      <Sequence from={sec(BODY_START)} layout="none">
        <Logos dur={sec(FASAKH_DURATION_S - BODY_START)} />
      </Sequence>

      {/* Audio: cleaned voice + soft SFX (kept well under the voice) */}
      <Audio src={staticFile("fasakh/voice.wav")} volume={voiceVol} />
      {/* Calm bed, pre-ducked under the voice and silent through the beep (fasakh-pipeline/music.py) */}
      <Audio src={staticFile("fasakh/music_bed.wav")} />
      <Sfx at={0.0} file="impact_soft" vol={0.32} />
      <Sfx at={2.28} file="tick_soft" vol={0.32} />
      <Sfx at={2.3} file="chime_soft" vol={0.16} />
      <Sfx at={END_AT} file="impact_soft" vol={0.26} />
      <Sfx at={END_AT + 0.25} file="chime_soft" vol={0.2} />
    </AbsoluteFill>
  );
};
