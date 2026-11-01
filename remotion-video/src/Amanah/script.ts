// Skrip & masa untuk video "Amanah Seorang Pemimpin".
// Tanda *perkataan* = perkataan disorot (emas, italic).

export const FPS = 30;

export type BRoll = {
  src: string; // fail dalam public/broll
  from: number; // saat mula dalam klip sumber
  pos?: number; // kedudukan menegak crop (0 = atas, 1 = bawah)
};

export type Card = {
  text: string;
  broll?: BRoll;
  finale?: boolean;
};

// HOOK (0-3.7s): buka "gap" — soalan apa? Jawapannya dibayar di kad "Allah akan mempersoalkan setiap amanah".
export const HOOK_LINE1 = "Jawatan ini akan *berakhir.*";
export const HOOK_LINE2 = "Tapi ada satu *soalan* yang tetap akan ditanya…";
export const HOOK_FRAMES = 84;
export const HOOK_LINE2_AT = 22;
export const TITLE_FRAMES = 48;
export const INTRO_FRAMES = HOOK_FRAMES + TITLE_FRAMES;
export const INTRO_BROLL: BRoll = { src: "G.mp4", from: 4, pos: 0.2 };

export const CARDS: Card[] = [
  { text: "Menjadi seorang pemimpin ini bukan soal berapa tinggi *jawatan* yang kita pegang,", broll: { src: "A.mp4", from: 2 } },
  { text: "berapa ramai orang yang mengenali kita, atau berapa banyak *pujian* yang kita terima.", broll: { src: "E.mp4", from: 46, pos: 0.45 } },
  { text: "Tetapi sejauh mana kita mampu melaksanakan *amanah* yang telah diberikan.", broll: { src: "D.mp4", from: 6, pos: 0.4 } },
  { text: "Kadang-kadang, kita *penat.*", broll: { src: "H.mp4", from: 6 } },
  { text: "Ada perkara yang kita usahakan, tetapi tidak semua orang *nampak.*", broll: { src: "H.mp4", from: 26 } },
  { text: "Ada keputusan yang kita buat, mungkin tidak semua orang *bersetuju.*", broll: { src: "H.mp4", from: 46 } },
  { text: "Namun, saya selalu *percaya* satu perkara.", broll: { src: "B.mp4", from: 12 } },
  { text: "Apabila kita diberikan *amanah,* jangan sesekali kita lupa kepada siapa kita perlu *bertanggungjawab.*", broll: { src: "B.mp4", from: 0, pos: 0.45 } },
  { text: "*Rakyat* meletakkan harapan, dan *Allah* akan mempersoalkan setiap amanah.", broll: { src: "B.mp4", from: 28, pos: 0.45 } },
  { text: "Sebab itu, selagi diberikan ruang dan kemampuan, kita teruskan *berkhidmat.*", broll: { src: "E.mp4", from: 4 } },
  { text: "Turun bertemu rakyat, dengar *keluhan* mereka dan usahakan apa sahaja yang termampu.", broll: { src: "C.mp4", from: 24, pos: 0.4 } },
  { text: "Kita mungkin tidak mampu menyelesaikan *semua* perkara,", broll: { src: "F.mp4", from: 58, pos: 0.4 } },
  { text: "tetapi jangan sampai ada perkara yang kita mampu lakukan, tetapi kita *abaikan.*", broll: { src: "C.mp4", from: 64, pos: 0.4 } },
  { text: "Kerana akhirnya, *jawatan* itu akan berakhir,", finale: true },
  { text: "tetapi setiap *amanah* dan *tanggungjawab* tetap akan *dihitung* di hadapan *Allah.*", finale: true },
];

export const STAGGER = 2; // frame antara setiap perkataan muncul
export const EXIT = 10; // frame untuk keluar
export const TAIL_FRAMES = 12; // rehat selepas kad terakhir sebelum outro
// Outro jenama FK (public/brand/fk-outro.mp4, 10s) — guna 7s pertama (animasi siap ~6s)
export const OUTRO_FRAMES = 210;
export const OUTRO_XFADE = 12;

const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length;

export const cardDuration = (c: Card) => {
  const n = wordCount(c.text);
  const hold = Math.max(50, n * 6);
  return n * STAGGER + hold + EXIT + (c.finale ? 36 : 0);
};

export type Timed = Card & { start: number; duration: number };

export const TIMELINE: Timed[] = (() => {
  let t = INTRO_FRAMES;
  return CARDS.map((c) => {
    const d = cardDuration(c);
    const out = { ...c, start: t, duration: d };
    t += d;
    return out;
  });
})();

export const FINALE_START = TIMELINE.find((c) => c.finale)!.start;
export const MAIN_FRAMES = TIMELINE[TIMELINE.length - 1].start + TIMELINE[TIMELINE.length - 1].duration + TAIL_FRAMES;
export const TOTAL_FRAMES = MAIN_FRAMES - OUTRO_XFADE + OUTRO_FRAMES;
