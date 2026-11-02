import React from "react";
import { Audio, Video } from "@remotion/media";
import { poppins } from "./fonts";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption } from "./Caption";
import { Shot } from "./Shot";
import { GHOST_LANDINGS, MakananTambahan, MejaShot } from "./Meja";
import { BawaShot } from "./Bawa";

export const BEKAL_FPS = 30;
export const BEKAL_DURATION_S = 39.5;
/** outro jenama (FK) disambung selepas video utama */
export const OUTRO_S = 10.0;
export const BEKAL_TOTAL_S = BEKAL_DURATION_S + OUTRO_S;

export type BekalProps = {
  /** suara panduan AI: "perempuan" (Yasmin) atau "lelaki" (Osman). "tiada" = senyap, guna VO sendiri */
  suara: "perempuan" | "lelaki" | "tiada";
  /** fail VO sendiri (dalam public/), contoh "bekal/vo/vo_nawal.mp3" — dimainkan dari saat 0 */
  voSendiri: string | null;
  /** klip Seedance bekal sunset (ganti foto bekal), contoh "bekal/seedance/bekal_sunset.mp4" */
  seedanceBekal: string | null;
  /** klip Seedance masjid waktu subuh (ganti klip pintu masjid) */
  seedanceMasjid: string | null;
  /** klip Seedance meja penuh pelbagai bekal (stop-motion) — ganti babak meja, contoh "bekal/seedance/meja_bekal.mp4" */
  seedanceMeja: string | null;
  /** makanan tambahan (PNG lut sinar) yang diletak oleh "tangan hantu" atas meja — sandwich, mi goreng, nasi goreng... */
  makananTambahan: MakananTambahan[];
};

export const bekalDefaultProps: BekalProps = {
  suara: "lelaki",
  voSendiri: null,
  seedanceBekal: null,
  seedanceMasjid: null,
  seedanceMeja: null,
  makananTambahan: [],
};

const F = "bekal/footage/";
const SFX = "bekal/sfx/";

/** Bunyi pada saat tertentu */
const Sfx: React.FC<{ src: string; at: number; volume: number }> = ({
  src,
  at,
  volume,
}) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence name={`SFX ${src}`} from={Math.round(at * fps)} layout="none">
      <Audio src={staticFile(SFX + src)} volume={volume} />
    </Sequence>
  );
};

/** Kilat putih bila "snap" gambar bekal di awal */
const Flash: React.FC<{ at: number; dur: number }> = ({ at, dur }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence
      name="Kilat"
      from={Math.round(at * fps)}
      durationInFrames={Math.round(dur * fps)}
      layout="absolute-fill"
    >
      <FlashInner len={Math.round(dur * fps)} />
    </Sequence>
  );
};
const FlashInner: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFF4E0",
        opacity: interpolate(frame, [0, len], [0.9, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        }),
      }}
    />
  );
};

/** Fade ke hitam — detik "pause" sebelum masuk bekal akhirat */
const ToBlack: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const { fps } = useVideoConfig();
  const len = Math.round((to - from) * fps);
  return (
    <Sequence
      name="Fade ke hitam"
      from={Math.round(from * fps)}
      durationInFrames={len + 2}
      layout="absolute-fill"
    >
      <ToBlackInner len={len} />
    </Sequence>
  );
};
const ToBlackInner: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "black",
        opacity: interpolate(frame, [0, len], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.quad),
        }),
      }}
    />
  );
};

/** Tajuk kecil "B E K A L" di atas sepanjang babak dunia */
const Kicker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 600,
          fontSize: 40,
          letterSpacing: 26,
          paddingLeft: 26,
          color: "rgba(255,240,220,0.95)",
          textShadow: "0 3px 14px rgba(80,25,0,0.7)",
          display: "flex",
          alignItems: "center",
          gap: 28,
          opacity: interpolate(
            frame,
            [0, 0.5 * fps, durationInFrames - 0.4 * fps, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <span style={{ width: 70, height: 2, background: "rgba(255,220,180,0.8)" }} />
        BEKAL
        <span style={{ width: 70, height: 2, background: "rgba(255,220,180,0.8)" }} />
      </div>
    </AbsoluteFill>
  );
};

/** Label besar untuk split screen */
const Label: React.FC<{
  text: string;
  mark: string;
  markColor: string;
  top: number;
  markAt: number;
  calm?: boolean;
}> = ({ text, mark, markColor, top, markAt, calm }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mf = markAt * fps;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: top }}>
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 800,
          fontSize: 92,
          color: "white",
          letterSpacing: -1,
          textShadow: calm
            ? "0 4px 30px rgba(10,20,50,0.8)"
            : "0 6px 24px rgba(90,30,0,0.7)",
          display: "flex",
          alignItems: "center",
          gap: 26,
          opacity: interpolate(frame, [0, 0.35 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0 ${interpolate(frame, [0, 0.5 * fps], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}px`,
        }}
      >
        {text}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: markColor,
            fontSize: 72,
            boxShadow: "0 6px 30px rgba(0,0,0,0.35)",
            opacity: frame >= mf ? 1 : 0,
            scale: interpolate(frame, [mf, mf + 0.3 * fps], [0.3, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.34, 1.7, 0.64, 1),
              output: "perceptual-scale",
            }),
          }}
        >
          {mark}
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** Babak akhir: bekal dunia (atas, sunset) vs bekal akhirat (bawah, subuh) */
const SplitScene: React.FC<{ bekalSrc: string }> = ({ bekalSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const half: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: 1080,
    height: 960,
    overflow: "hidden",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <div
        style={{
          ...half,
          top: 0,
          translate: `0 ${interpolate(frame, [0, 0.6 * fps], [-960, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}px`,
        }}
      >
        <Shot name="Split: bekal dunia" src={bekalSrc} start={0} end={6.6} tail={0} grade="sunset" zoom={[1.05, 1.15]} position="50% 72%" rate={0.65} />
        <Sequence from={Math.round(0.6 * fps)} layout="absolute-fill">
          <Label text="Bekal dunia" mark="✓" markColor="#E8A23A" top={300} markAt={1.02} />
        </Sequence>
      </div>
      <div
        style={{
          ...half,
          top: 960,
          translate: `0 ${interpolate(frame, [0, 0.6 * fps], [960, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}px`,
        }}
      >
        <Shot name="Split: bekal akhirat" src={F + "sujud.mp4"} start={0} end={6.6} tail={0} grade="dawn" rate={0.6} trim={0.2} zoom={[1.05, 1.12]} />
        <Sequence from={Math.round(3.0 * fps)} layout="absolute-fill">
          <Label text="Bekal akhirat" mark="?" markColor="#5B7BB5" top={110} markAt={1.34} calm />
        </Sequence>
      </div>
      {/* garis pemisah lembut */}
      <AbsoluteFill style={{ justifyContent: "center" }}>
        <div
          style={{
            height: 4,
            width: "100%",
            background:
              "linear-gradient(90deg, rgba(255,170,90,0) 0%, rgba(255,230,200,0.9) 50%, rgba(140,170,230,0) 100%)",
            opacity: interpolate(frame, [0.4 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Logo jenama (lambang Johor + Maju Johor di atas, FK di bawah) sepanjang video utama */
const LogoOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img
        src={staticFile("bekal/brand/logo_overlay.png")}
        style={{
          width: "100%",
          height: "100%",
          opacity: interpolate(
            frame,
            [0, 0.4 * fps, durationInFrames - 1.0 * fps, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.45))",
        }}
      />
    </AbsoluteFill>
  );
};

/** Outro jenama: pudar masuk dari hitam */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Video src={staticFile("bekal/brand/outro_fk.mp4")} volume={0.75} objectFit="cover" style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Muzik latar: ambience subuh (angin lembut + drone, tiada melodi) */
const ambientVolume = (f: number) => {
  const s = f / BEKAL_FPS;
  return interpolate(
    s,
    [0, 9.0, 11.0, BEKAL_DURATION_S - 1.8, BEKAL_DURATION_S],
    [0, 0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

const VO: React.FC<{ suara: BekalProps["suara"] }> = ({ suara }) => {
  const { fps } = useVideoConfig();
  if (suara === "tiada") return null;
  const dir = suara === "lelaki" ? "bekal/vo/lelaki/" : "bekal/vo/";
  // [fail, saat mula]
  const lines: [string, number][] = [
    ["vo1.mp3", 0.4],
    ["vo2.mp3", 3.6],
    ["vo3.mp3", 10.9],
    ["vo4.mp3", 14.4],
    ["vo5.mp3", 20.2],
    ["vo6.mp3", 28.2],
  ];
  return (
    <>
      {lines.map(([f, at]) => (
        <Sequence key={f} name={`VO ${f}`} from={Math.round(at * fps)} layout="none">
          <Audio src={staticFile(dir + f)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};

// Babak meja: mula 5.0s; tangan hantu mula 0.8s kemudian, kelajuan 0.8
const MEJA_START = 5.0;
const GHOST_START = 0.8;
const GHOST_SPEED = 0.8;

export const Bekal: React.FC<BekalProps> = ({
  suara,
  voSendiri,
  seedanceBekal,
  seedanceMasjid,
  seedanceMeja,
  makananTambahan,
}) => {
  const { fps } = useVideoConfig();
  const bekalSrc = seedanceBekal ?? "bekal/bekal_foto.jpg";
  const masjidSrc = seedanceMasjid ?? F + "masjid_pintu.mp4";
  const END = BEKAL_DURATION_S;
  const ghostPops = GHOST_LANDINGS.map(
    (i) => MEJA_START + GHOST_START + i / GHOST_SPEED / BEKAL_FPS,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* ===== BABAK 1 — BEKAL DUNIA (sunset, rentak rancak 150 BPM: potongan atas beat) ===== */}
      <Shot name="1. Ini bekal (foto)" src={bekalSrc} start={0} end={2.2} grade="sunset" zoom={[1.12, 1.02]} position="50% 62%" />
      {/* POV: tangan pegang beg bekal, timelapse jalan masuk bangunan di belakang */}
      <BawaShot start={2.2} end={MEJA_START} bgRate={1.65} />
      {seedanceMeja ? (
        <Shot name="2b. Meja penuh bekal (Seedance)" src={seedanceMeja} start={MEJA_START} end={8.6} fadeIn={0.1} grade="sunset" rate={1.2} zoom={[1.02, 1.1]} />
      ) : (
        <MejaShot start={MEJA_START} end={8.6} ghostStart={GHOST_START} ghostSpeed={GHOST_SPEED} tambahan={makananTambahan} />
      )}
      <Shot name="2c. Bekal (detik renung)" src={bekalSrc} start={8.6} end={10.2} tail={0} fadeIn={0.4} grade="sunset" zoom={[1.02, 1.14]} position="50% 62%" />
      <Sequence name="Tajuk BEKAL" from={Math.round(0.3 * fps)} durationInFrames={Math.round(9.0 * fps)} layout="absolute-fill">
        <Kicker />
      </Sequence>
      <Flash at={0} dur={0.5} />
      <ToBlack from={9.5} to={10.2} />

      {/* ===== BABAK 2 — BEKAL AKHIRAT (tenang, subuh) ===== */}
      <Shot name="3. Ini pun bekal (masjid)" src={masjidSrc} start={10.2} end={14.2} fadeIn={1.0} tail={0.8} grade="dawn" rate={0.65} zoom={[1.0, 1.08]} />
      <Shot name="4a. Dalam masjid" src={F + "masjid_dalam.mp4"} start={14.2} end={17.4} fadeIn={0.8} tail={0.8} grade="dawn" rate={0.65} trim={0.3} zoom={[1.02, 1.09]} />
      <Shot name="4b. Saf" src={F + "masjid_saf.mp4"} start={17.4} end={20.2} fadeIn={0.8} tail={0.8} grade="dawn" rate={0.7} trim={0.2} zoom={[1.02, 1.08]} />
      <Shot name="5a. Wudhu" src={F + "wudhu.mp4"} start={20.2} end={22.7} fadeIn={0.8} tail={0.8} grade="dawn" rate={0.75} trim={0.4} zoom={[1.03, 1.1]} volume={0.5} />
      <Shot name="5b. Qiyam" src={F + "masjid_qiyam.mp4"} start={22.7} end={25.0} fadeIn={0.8} tail={0.8} grade="dawn" rate={0.7} trim={0.2} zoom={[1.02, 1.08]} />
      <Shot name="5c. Sujud" src={F + "sujud.mp4"} start={25.0} end={27.8} fadeIn={0.8} tail={0.6} grade="dawn" rate={0.75} trim={0.3} zoom={[1.02, 1.09]} volume={0.2} />

      {/* ===== BABAK 3 — PERBANDINGAN & CTA ===== */}
      <Sequence name="6. Split dunia vs akhirat" from={Math.round(27.8 * fps)} durationInFrames={Math.round(6.6 * fps)} layout="absolute-fill">
        <SplitScene bekalSrc={bekalSrc} />
      </Sequence>
      <Shot name="7. CTA" src={F + "masjid_dalam.mp4"} start={34.0} end={END} tail={0} fadeIn={0.6} grade="dawn" rate={0.55} trim={3.5} zoom={[1.0, 1.1]} />
      <ToBlack from={END - 1.0} to={END} />

      {/* ===== KAPSYEN (timing ikut suara lelaki) ===== */}
      <Caption variant="warm" text="Ini... bekal." highlight="bekal" start={0.55} end={2.2} />
      <Caption variant="warm" text="Setiap hari," start={3.7} end={4.75} y={0.3} />
      <Caption variant="warm" text="kita bawak bekal" highlight="bekal" start={4.75} end={6.0} y={0.6} />
      <Caption variant="warm" text="untuk perut kita." start={6.0} end={8.4} y={0.6} />
      <Caption variant="calm" text="Ini pun... bekal." highlight="bekal" start={11.0} end={13.9} y={0.66} size={84} />
      <Caption variant="calm" text="Bekal utama kita," highlight="bekal" start={14.5} end={16.2} />
      <Caption variant="calm" text="untuk kat 'sana'" highlight="sana" start={16.2} end={17.5} />
      <Caption variant="calm" text="nanti." start={17.5} end={19.8} />
      <Caption variant="calm" text="Jom... kita mulakan pagi kita" start={20.3} end={22.9} />
      <Caption variant="calm" text="dengan Solat Subuh berjemaah" highlight="subuh" start={22.9} end={25.05} />
      <Caption variant="calm" text="sama-sama." start={25.05} end={27.5} />
      <Caption variant="calm" text="Jom Solat Subuh Berjemaah!" highlight="subuh" start={34.0} end={END - 0.6} y={0.48} size={104} />

      {/* ===== LOGO & OUTRO ===== */}
      <Sequence name="Logo jenama" durationInFrames={Math.round(END * fps)} layout="absolute-fill">
        <LogoOverlay />
      </Sequence>
      <Sequence name="Outro FK" from={Math.round(END * fps)} durationInFrames={Math.round(OUTRO_S * fps)} layout="absolute-fill">
        <Outro />
      </Sequence>

      {/* ===== AUDIO ===== */}
      {/* Rentak rancak (perkusi gaya kompang) — babak bekal dunia, berhenti 9.0s */}
      <Audio name="Rentak rancak" src={staticFile(SFX + "rentak_rancak.wav")} volume={0.5} />
      {/* Ambience subuh tenang — naik bila masuk bekal akhirat */}
      <Audio name="Ambience subuh" src={staticFile(SFX + "ambient_dawn.wav")} volume={ambientVolume} />
      <VO suara={suara} />
      {voSendiri ? <Audio name="VO sendiri" src={staticFile(voSendiri)} volume={1} /> : null}
      <Sfx src="shutter-modern.wav" at={0} volume={0.55} />
      <Sfx src="whoosh_soft.wav" at={2.0} volume={0.45} />
      <Sfx src="whoosh.wav" at={4.95} volume={0.55} />
      {/* bunyi "pop" setiap bekal diletak tangan hantu */}
      {(seedanceMeja ? [5.4, 5.85, 6.3, 6.75, 7.2, 7.65] : ghostPops).map((t) => (
        <Sfx key={t} src="switch.wav" at={t} volume={0.3} />
      ))}
      {makananTambahan.map((m, i) => (
        <Sfx key={`tambah-${i}`} src="switch.wav" at={MEJA_START + m.at} volume={0.3} />
      ))}
      <Sfx src="riser.wav" at={8.2} volume={0.4} />
      <Sfx src="soft_boom.wav" at={10.2} volume={0.9} />
      <Sfx src="whoosh_soft.wav" at={14.0} volume={0.15} />
      <Sfx src="whoosh_soft.wav" at={17.2} volume={0.15} />
      <Sfx src="whoosh_soft.wav" at={22.5} volume={0.15} />
      <Sfx src="whoosh_soft.wav" at={24.8} volume={0.15} />
      <Sfx src="whoosh_soft.wav" at={27.6} volume={0.45} />
      <Sfx src="switch.wav" at={29.42} volume={0.5} />
      <Sfx src="soft_boom.wav" at={32.14} volume={0.45} />
      <Sfx src="ding.wav" at={34.65} volume={0.4} />
    </AbsoluteFill>
  );
};
