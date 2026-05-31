import React, { useState, useRef, useEffect, useCallback } from "react";
import { onAuthChange } from "./lib/auth";
import { logIn, signUp, logOut } from "./lib/auth";
import { createSpace, loadMySpaces, getInviteUrl } from "./lib/spaces";
import {
  loadMemories,
  addMemory,
  toggleLike as sbToggleLike,
} from "./lib/memories";
import { uploadPhoto, uploadVoice } from "./lib/upload";
import { supabase } from "./lib/supabase";

// ═══════════════════════════════════════════════════════════════════════════════
// ✏️  EDITABLE CONTENT — change everything here without touching anything else
// ═══════════════════════════════════════════════════════════════════════════════

// ── Logo ─────────────────────────────────────────────────────────────────────
// Drop logo.png into /public/ to replace. Falls back to wordmark automatically.
const LOGO_SRC =
  "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/logo2.png";
const BRAND_NAME = "EVERNEAR";

// ── Lifestyle photo cards (landing page) ─────────────────────────────────────
// Add files to /public/ with these names to replace placeholders.
const LIFESTYLE_CARDS = [
  {
    label: "Parent & Child",
    image:
      "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/parentandchild.png",
  },
  {
    label: "Friends, Laughing",
    image:
      "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/friendslaughing.png",
  },
  {
    label: "Couple Together",
    image:
      "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/coupletogether.png",
  },
  {
    label: "Family Moment",
    image:
      "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/familymoment.png",
  },
];

// ── Demo link memory (homepage showcase) ─────────────────────────────────────
// Change any of these fields to update the homepage link card instantly.
// Replace the url with your real Spotify/YouTube/Apple Music link.
const DEMO_LINK = {
  title: "The song we played on repeat",
  url: "https://www.youtube.com/watch?v=AIOAlaACuv4",
  caption:
    "This was our road trip anthem. Three hours, six plays, zero complaints.",
  sharedBy: "Alex",
  date: "July 4, 2024",
};

// ── Sample memories (dashboard + showcase) ───────────────────────────────────
// Edit titles, captions, names, dates freely.
// For photo/meme: add a matching file to /public/ and set image: "/yourfile.jpg"
// Leave image undefined to show an elegant placeholder instead.
const SAMPLE_MEMORIES: MemoryItem[] = [
  {
    id: "1",
    type: "photo",
    title: "Family beach day",
    caption: "The kind of afternoon that feels like it should stay forever.",
    image:
      "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/familybeachday.png",
    sharedBy: "Mom",
    date: "June 12, 2024",
    liked: true,
  },
  {
    id: "2",
    type: "note",
    title: "I love you more than all the stars",
    caption:
      "I love you more than all the stars. More than every grain of sand on every beach we've ever walked. — Dad",
    sharedBy: "Dad",
    date: "March 3, 2024",
    liked: false,
  },
  {
    id: "3",
    type: "voice",
    title: "Voice note from Mom",
    caption: "Left this the morning of my birthday. I'll keep it forever.",
    sharedBy: "Mom",
    date: "August 19, 2024",
    liked: true,
  },
  {
    id: "4",
    type: "meme",
    title: "The one that made us laugh",
    caption: "The exact thing that made us both laugh at 1:12am.",
    image:
      "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/meme.png",
    sharedBy: "Jamie",
    date: "November 1, 2024",
    liked: false,
  },
  {
    id: "5",
    type: "link",
    title: DEMO_LINK.title,
    caption: DEMO_LINK.caption,
    url: DEMO_LINK.url,
    sharedBy: DEMO_LINK.sharedBy,
    date: DEMO_LINK.date,
    liked: true,
  },
];

// ── Feature cards (landing "how it works") ───────────────────────────────────
const FEATURES = [
  {
    title: "Private by invitation",
    body: "Your space belongs only to the people you choose. No public profiles, no discovery, no strangers.",
  },
  {
    title: "No noise, no feed",
    body: "No algorithms. No distractions. Just your moments, exactly where you left them.",
  },
  {
    title: "Made for meaningful moments",
    body: "Photos, notes, voice messages, memes, links. The everyday things that become extraordinary with time.",
  },
];

// ── Hero copy ─────────────────────────────────────────────────────────────────
const COPY = {
  eyebrow: "Moments shared privately",
  headline1: "The moments you",
  headline2: "never want buried.",
  sub: "Photos, notes, voice messages, memes, and links — saved privately with the people who matter most.",
  quote: "Not to post. Not to share. Just to keep.",
  cta: "Create Your EverNear",
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type MemType = "photo" | "note" | "voice" | "meme" | "link";
type View =
  | "landing"
  | "auth"
  | "login"
  | "create-space"
  | "dashboard"
  | "add-memory"
  | "invite"
  | "detail";

interface MemoryItem {
  id: string;
  type: MemType;
  title: string;
  caption: string;
  image?: string;
  url?: string;
  sharedBy: string;
  date: string;
  liked: boolean;
}
interface Space {
  name: string;
  memories: MemoryItem[];
  inviteLink: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — type badge colours
// ═══════════════════════════════════════════════════════════════════════════════

const T: Record<
  MemType,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  photo: {
    label: "Photo",
    color: "#D6B76A",
    bg: "rgba(201,162,74,0.13)",
    border: "rgba(201,162,74,0.36)",
    glow: "0 0 14px rgba(201,162,74,0.13)",
  },
  note: {
    label: "Note",
    color: "#d8d0c6",
    bg: "rgba(216,208,198,0.09)",
    border: "rgba(216,208,198,0.28)",
    glow: "0 0 14px rgba(216,208,198,0.08)",
  },
  voice: {
    label: "Voice",
    color: "#C9A87A",
    bg: "rgba(180,152,108,0.12)",
    border: "rgba(180,152,108,0.32)",
    glow: "0 0 14px rgba(180,152,108,0.1)",
  },
  meme: {
    label: "Meme",
    color: "#c9907e",
    bg: "rgba(195,130,110,0.1)",
    border: "rgba(195,130,110,0.3)",
    glow: "0 0 14px rgba(195,130,110,0.09)",
  },
  link: {
    label: "Link",
    color: "#a898c8",
    bg: "rgba(148,130,185,0.11)",
    border: "rgba(148,130,185,0.3)",
    glow: "0 0 14px rgba(148,130,185,0.1)",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════════════════════

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0 }

  :root {
    --black:   #0b0a09;
    --s1:      #1b1916;
    --s2:      #222018;
    --gold:    #C9A24A;
    --gold-lt: #D6B76A;
    --gold-dk: #8F6A2A;
    --gold-d:  rgba(201,162,74,0.36);
    --cream:   #ece6dd;
    --c-mid:   #c0b9b0;
    --c-dim:   #887f78;
    --c-faint: rgba(236,230,221,0.04);
    --sb:      rgba(255,255,255,0.05);
    --r:       14px;
    --rs:      9px;
    --sh:      0 2px 8px rgba(0,0,0,0.55), 0 0 28px rgba(201,162,74,0.05);
  }

  html,body,#root {
    min-height:100%; background:var(--black); color:var(--cream);
    font-family:'Jost',sans-serif; font-weight:300;
    -webkit-font-smoothing:antialiased; letter-spacing:0.015em;
  }
  h1,h2,h3,h4 { font-family:'Cormorant Garamond',serif; font-weight:400; letter-spacing:-0.01em }

  input,textarea,select {
    background:var(--s1); border:1px solid var(--sb); border-radius:var(--rs);
    color:var(--cream); font-family:'Jost',sans-serif; font-size:15px;
    font-weight:300; padding:13px 16px; width:100%; outline:none;
    transition:border-color .25s; letter-spacing:0.02em;
  }
  input::placeholder,textarea::placeholder { color:var(--c-dim); opacity:.7 }
  input:focus,textarea:focus,select:focus  { border-color:var(--gold-d) }
  select option { background:var(--s2) }

  .btn-gold {
    background:linear-gradient(135deg,var(--gold-dk) 0%,var(--gold-lt) 46%,var(--gold-dk) 100%);
    color:#100c00; border:none; border-radius:var(--rs);
    font-family:'Jost',sans-serif; font-size:12px; font-weight:500;
    letter-spacing:0.16em; text-transform:uppercase; padding:14px 36px;
    cursor:pointer; transition:opacity .2s,transform .15s; white-space:nowrap;
  }
  .btn-gold:hover  { opacity:.86; transform:translateY(-1px) }
  .btn-gold:active { transform:scale(.98) }

  .btn-ghost {
    background:transparent; color:var(--c-mid);
    border:1px solid rgba(255,255,255,.11); border-radius:var(--rs);
    font-family:'Jost',sans-serif; font-size:12px; font-weight:400;
    letter-spacing:0.12em; text-transform:uppercase; padding:13px 28px;
    cursor:pointer; transition:border-color .2s,color .2s; white-space:nowrap;
  }
  .btn-ghost:hover { border-color:var(--gold-d); color:var(--gold) }

  .btn-text {
    background:none; border:none; color:var(--gold); font-family:'Jost',sans-serif;
    font-size:13px; cursor:pointer; text-decoration:underline;
    text-underline-offset:3px; text-decoration-color:rgba(201,162,74,.35);
    transition:opacity .2s; letter-spacing:0.04em;
  }
  .btn-text:hover { opacity:.7 }

  .card {
    background:var(--s1); border:1px solid var(--sb);
    border-radius:var(--r); box-shadow:var(--sh);
    transition:border-color .3s,transform .3s,box-shadow .3s;
  }
  .card:hover {
    border-color:rgba(201,162,74,.15); transform:translateY(-3px);
    box-shadow:0 12px 38px rgba(0,0,0,.55),0 0 38px rgba(201,162,74,.07);
  }

  .tab-btn {
    background:transparent; border:none; color:var(--c-dim);
    font-family:'Jost',sans-serif; font-size:11px; font-weight:400;
    letter-spacing:.1em; text-transform:uppercase; padding:11px 20px;
    cursor:pointer; border-bottom:1px solid transparent;
    transition:color .2s,border-color .2s; white-space:nowrap;
  }
  .tab-btn:hover  { color:var(--cream) }
  .tab-btn.active { color:var(--gold); border-bottom-color:var(--gold) }

  .hbtn {
    background:none; border:none; cursor:pointer; padding:4px 6px;
    transition:transform .15s; color:var(--c-dim);
    display:flex; align-items:center; gap:4px; font-size:12px;
    font-family:'Jost',sans-serif;
  }
  .hbtn:hover { transform:scale(1.1); color:var(--gold) }
  .hbtn.liked { color:var(--gold) }

  /* waveform */
  .wv { display:flex; align-items:center; gap:3px; height:28px; flex:1; overflow:hidden }
  .wvb {
    width:2.5px; border-radius:2px; flex-shrink:0;
    animation:wvp 1.65s ease-in-out infinite;
  }
  @keyframes wvp { 0%,100%{transform:scaleY(.28);opacity:.35} 50%{transform:scaleY(1);opacity:.92} }

  /* lifestyle card */
  .lsc {
    border-radius:14px; overflow:hidden; position:relative;
    background:var(--s2); aspect-ratio:3/4;
    box-shadow:0 6px 24px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04);
    transition:transform .45s cubic-bezier(.25,.46,.45,.94),box-shadow .45s;
  }
  .lsc:hover { transform:translateY(-7px) scale(1.015); box-shadow:0 24px 52px rgba(0,0,0,.65),0 0 0 1px rgba(201,162,74,.2) }
  .lsc img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; transition:transform .65s cubic-bezier(.25,.46,.45,.94) }
  .lsc:hover img { transform:scale(1.07) }

  /* image placeholder */
  .iph {
    position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:8px;
    border:1px dashed rgba(201,162,74,.18); border-radius:inherit;
    color:rgba(201,162,74,.45); font-family:'Jost',sans-serif;
    font-size:11px; letter-spacing:.1em; text-transform:uppercase;
  }

  .fade-in { animation:fu .44s ease both }
  @keyframes fu { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shim { 0%,100%{opacity:1} 50%{opacity:.45} }

  ::-webkit-scrollbar { width:3px }
  ::-webkit-scrollbar-track { background:transparent }
  ::-webkit-scrollbar-thumb { background:rgba(201,162,74,.18); border-radius:3px }

  .gt {
    background:linear-gradient(135deg,var(--gold) 0%,var(--gold-lt) 50%,var(--gold) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  hr.dv { border:none; border-top:1px solid rgba(255,255,255,.042) }
  .sec  { max-width:1020px; margin:0 auto; width:100%; padding:88px 36px }
  .secs { max-width:700px;  margin:0 auto; width:100%; padding:88px 36px }

  @media(max-width:720px){
    .sec,.secs { padding:60px 20px }
    .lsgrid  { grid-template-columns:repeat(2,1fr)!important }
    .fgrid   { grid-template-columns:1fr!important }
    .sgrid   { grid-template-columns:1fr!important }
    .mgrid   { grid-template-columns:1fr!important }
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════════

const Hrt = ({ f, sz = 14 }: { f?: boolean; sz?: number }) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill={f ? "var(--gold)" : "none"}
    stroke={f ? "var(--gold)" : "currentColor"}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const Play = ({ sz = 13 }: { sz?: number }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);
const Pause = ({ sz = 13 }: { sz?: number }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const ExtLink = ({ sz = 12 }: { sz?: number }) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const ChevL = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15,18 9,12 15,6" />
  </svg>
);
const MicIc = ({ sz = 15 }: { sz?: number }) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const UpIc = ({ sz = 18 }: { sz?: number }) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16,16 12,12 8,16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const ImgIc = ({ sz = 22 }: { sz?: number }) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.35 }}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

/** Image with elegant placeholder — no ugly boxes */
function Pic({
  src,
  alt,
  h,
  r = 9,
  style: sx,
}: {
  src?: string;
  alt: string;
  h: number;
  r?: number;
  style?: React.CSSProperties;
}) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const miss = !src || err;
  return (
    <div
      style={{
        position: "relative",
        height: h,
        borderRadius: r,
        overflow: "hidden",
        flexShrink: 0,
        ...sx,
      }}
    >
      {!miss && (
        <>
          {!ok && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--s2)",
                animation: "shim 2s ease-in-out infinite",
              }}
            />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={() => setOk(true)}
            onError={() => setErr(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: ok ? 1 : 0,
              transition: "opacity .6s",
            }}
          />
        </>
      )}
      {miss && (
        <div className="iph">
          <ImgIc sz={24} />
          <span>Upload image</span>
        </div>
      )}
    </div>
  );
}

/**
 * Logo — loads /public/logo.png.
 * Missing file → clean dashed "Upload logo" placeholder.
 * Never reconstructs the logo with CSS text or icons.
 */
function Logo({ compact = false }: { compact?: boolean }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const h = compact ? 70 : 100;
  const phW = compact ? 110 : 140;

  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        position: "relative",
        height: h,
        minWidth: phW,
      }}
    >
      {/* Shimmer behind img while loading */}
      {!ok && !err && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--s2)",
            borderRadius: 4,
            animation: "shim 2s ease-in-out infinite",
          }}
        />
      )}

      {/* The real logo img — always in DOM so onError fires */}
      {!err && (
        <img
          src={LOGO_SRC}
          alt={BRAND_NAME + " logo"}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
          style={{
            height: h,
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
            display: "block",
            opacity: ok ? 1 : 0,
            transition: "opacity .4s",
            position: "relative",
          }}
        />
      )}

      {/* Placeholder: only when image truly failed to load */}
      {err && (
        <div
          style={{
            height: h,
            width: phW,
            border: "1px dashed rgba(201,162,74,.35)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: "rgba(201,162,74,.55)",
            fontFamily: "'Jost',sans-serif",
            fontSize: 10,
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          <UpIc sz={12} /> Upload logo
        </div>
      )}
    </div>
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        letterSpacing: ".22em",
        textTransform: "uppercase",
        color: "var(--gold)",
        marginBottom: 16,
        fontFamily: "'Jost',sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 20,
          height: 1,
          background: "var(--gold)",
          opacity: 0.44,
          display: "inline-block",
        }}
      />
      {text}
      <span
        style={{
          width: 20,
          height: 1,
          background: "var(--gold)",
          opacity: 0.44,
          display: "inline-block",
        }}
      />
    </p>
  );
}

function Rule() {
  return (
    <div
      style={{
        width: 22,
        height: 1,
        background: "var(--gold)",
        opacity: 0.48,
        marginBottom: 22,
      }}
    />
  );
}

function Badge({ type }: { type: MemType }) {
  const s = T[type];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: ".16em",
        textTransform: "uppercase" as const,
        padding: "4px 13px",
        fontFamily: "'Jost',sans-serif",
        display: "inline-block",
      }}
    >
      {s.label}
    </span>
  );
}

const WH = [
  8, 16, 24, 14, 28, 20, 10, 26, 18, 7, 22, 15, 27, 12, 20, 9, 24, 17,
];

function Waveform({
  playing,
  progress = 0,
}: {
  playing: boolean;
  progress?: number;
}) {
  return (
    <div className="wv">
      {WH.map((h, i) => {
        const past = (i / WH.length) * 100 < progress;
        return (
          <div
            key={i}
            className="wvb"
            style={{
              height: h,
              background: past ? "var(--gold)" : "rgba(201,162,74,.28)",
              animationDelay: `${i * 0.08}s`,
              animationPlayState: playing && !past ? "running" : "paused",
              transition: "background .12s",
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════════

function Header({
  showBack,
  onBack,
  onNav,
  right,
}: {
  showBack?: boolean;
  onBack?: () => void;
  onNav?: (v: View) => void;
  right?: React.ReactNode;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(11,10,9,.97)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,.042)",
        padding: "0 36px",
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {showBack && (
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "var(--c-dim)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "'Jost',sans-serif",
              fontSize: 13,
              letterSpacing: ".04em",
              transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cream)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-dim)")}
          >
            <ChevL /> Back
          </button>
        )}
        <button
          onClick={() => onNav?.("landing")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Logo compact={showBack} />
        </button>
      </div>
      {right && (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {right}
        </div>
      )}
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIFESTYLE CARD
// ═══════════════════════════════════════════════════════════════════════════════

function LsCard({ label, image }: { label: string; image: string }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div className="lsc">
      {!err && image && (
        <>
          {!ok && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--s2)",
                animation: "shim 2s ease-in-out infinite",
              }}
            />
          )}
          <img
            src={image}
            alt={label}
            onLoad={() => setOk(true)}
            onError={() => setErr(true)}
            style={{ opacity: ok ? 1 : 0, transition: "opacity .7s" }}
          />
        </>
      )}
      {(err || !image) && (
        <div className="iph">
          <ImgIc sz={28} />
          <span>{label}</span>
          <span style={{ fontSize: 9, opacity: 0.55 }}>Upload image</span>
        </div>
      )}
      {/* overlays */}
      {ok && !err && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(120,70,10,.08)",
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center,transparent 28%,rgba(8,5,2,.48) 100%)",
              pointerEvents: "none",
            }}
          />
        </>
      )}
      {/* label always visible */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "56px 20px 22px",
          background:
            "linear-gradient(to top,rgba(6,4,2,.9) 0%,rgba(6,4,2,.45) 42%,transparent 100%)",
          zIndex: 2,
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 15,
            fontWeight: 300,
            fontStyle: "italic",
            color: "rgba(236,230,221,.9)",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE SHOWCASE (full interactive)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Homepage demo voice note asset ───────────────────────────────────────────
// Drop voice-note.mp3 into /public/ to make this real.
const VOICE_DEMO_SRC =
  "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/voice-note.mp3?v=2";

function VoiceShowcase({ mem }: { mem: MemoryItem }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasAudio, setHasAudio] = useState<boolean | null>(null); // null = not yet tried

  // Detect whether the file actually exists on first render
  const handleCanPlay = () => setHasAudio(true);
  const handleError = () => setHasAudio(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <div>
          <Badge type="voice" />
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 20,
              fontWeight: 400,
              color: "var(--cream)",
              marginTop: 12,
              marginBottom: 6,
              lineHeight: 1.3,
            }}
          >
            {mem.title}
          </h3>
          <p style={{ fontSize: 13, color: "var(--c-dim)", lineHeight: 1.6 }}>
            {mem.caption}
          </p>
        </div>
        <div style={{ marginLeft: 16, flexShrink: 0 }}>
          <Hrt f sz={14} />
        </div>
      </div>

      {/* Hidden real audio element — always mounted so onError fires */}
      <audio
        ref={audioRef}
        src={VOICE_DEMO_SRC}
        preload="metadata"
        onCanPlay={handleCanPlay}
        onError={handleError}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (a.duration) setProgress((a.currentTime / a.duration) * 100);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        style={{ display: "none" }}
      />

      {/* If audio file missing: clean placeholder */}
      {hasAudio === false && (
        <div
          style={{
            border: "1px dashed rgba(201,162,74,.2)",
            borderRadius: 9,
            padding: "18px 20px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "rgba(201,162,74,.45)",
          }}
        >
          <MicIc sz={18} />
          <p
            style={{
              fontSize: 12,
              fontFamily: "'Jost',sans-serif",
              letterSpacing: ".04em",
              lineHeight: 1.5,
            }}
          >
            Upload{" "}
            <code
              style={{
                color: "var(--gold)",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              /public/voice-note.mp3
            </code>{" "}
            to preview a real voice memory.
          </p>
        </div>
      )}

      {/* Player — shown when file exists (hasAudio true) or not yet determined */}
      {hasAudio !== false && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 10,
          }}
        >
          <button
            onClick={toggle}
            disabled={hasAudio === null}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              flexShrink: 0,
              cursor: hasAudio ? "pointer" : "default",
              background: playing ? "var(--gold)" : "transparent",
              border: `1px solid ${playing ? "var(--gold)" : "rgba(201,162,74,.4)"}`,
              color: playing ? "#100c00" : "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .2s",
              opacity: hasAudio === null ? 0.45 : 1,
            }}
          >
            {playing ? <Pause sz={14} /> : <Play sz={14} />}
          </button>
          <Waveform playing={playing} progress={progress} />
          <span
            style={{
              fontSize: 11,
              color: "var(--c-dim)",
              flexShrink: 0,
              letterSpacing: ".04em",
            }}
          >
            0:42
          </span>
        </div>
      )}

      {/* Progress bar */}
      {hasAudio !== false && (
        <div
          style={{
            height: 1.5,
            background: "rgba(201,162,74,.12)",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--gold)",
              transition: "width .12s linear",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--c-dim)" }}>
          From <span style={{ color: "var(--gold)" }}>{mem.sharedBy}</span>
        </span>
        <span style={{ fontSize: 11, color: "var(--c-dim)", opacity: 0.45 }}>
          {mem.date}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY CARD (dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

function MemCard({
  mem,
  onLike,
  onClick,
}: {
  mem: MemoryItem;
  onLike: (id: string) => void;
  onClick: (m: MemoryItem) => void;
}) {
  const [vp, setVp] = useState(false);
  return (
    <div
      className="card fade-in"
      style={{ cursor: "pointer", overflow: "hidden" }}
      onClick={() => onClick(mem)}
    >
      {/* image area */}
      {(mem.type === "photo" || mem.type === "meme") && (
        <div
          style={{ position: "relative", height: 150, background: "var(--s2)" }}
        >
          {mem.image ? (
            <Pic src={mem.image} alt={mem.title} h={150} r={0} />
          ) : (
            <div
              className="iph"
              style={{
                borderRadius: 0,
                borderLeft: "none",
                borderRight: "none",
                borderTop: "none",
              }}
            />
          )}
        </div>
      )}
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Badge type={mem.type} />
          <button
            className={`hbtn${mem.liked ? " liked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike(mem.id);
            }}
          >
            <Hrt f={mem.liked} sz={13} />
          </button>
        </div>
        {mem.type === "voice" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setVp(!vp);
            }}
            style={{
              background: "rgba(201,162,74,.04)",
              border: "1px solid rgba(201,162,74,.1)",
              borderRadius: 9,
              padding: "10px 13px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                flexShrink: 0,
                cursor: "pointer",
                background: vp ? "var(--gold)" : "transparent",
                border: "1px solid rgba(201,162,74,.4)",
                color: vp ? "#100c00" : "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {vp ? <Pause sz={10} /> : <Play sz={10} />}
            </button>
            <Waveform playing={vp} />
            <span
              style={{ fontSize: 11, color: "var(--c-dim)", flexShrink: 0 }}
            >
              0:42
            </span>
          </div>
        )}
        {mem.type === "link" && (
          <div
            style={{
              background: "rgba(148,130,185,.07)",
              border: "1px solid rgba(148,130,185,.2)",
              borderRadius: 9,
              padding: "9px 13px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#a898c8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {mem.url || "https://..."}
            </span>
            <span style={{ color: "#a898c8", opacity: 0.5, flexShrink: 0 }}>
              <ExtLink />
            </span>
          </div>
        )}
        {mem.type === "note" && (
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--c-dim)",
              lineHeight: 1.55,
              marginBottom: 10,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {mem.caption}
          </p>
        )}
        <h3
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 18,
            fontWeight: 400,
            color: "var(--cream)",
            marginBottom: 7,
            lineHeight: 1.3,
          }}
        >
          {mem.title}
        </h3>
        {mem.type !== "note" && (
          <p
            style={{
              fontSize: 13,
              color: "var(--c-dim)",
              lineHeight: 1.62,
              marginBottom: 14,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {mem.caption}
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 13,
            borderTop: "1px solid rgba(255,255,255,.042)",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--gold)" }}>
            {mem.sharedBy}
          </span>
          <span style={{ fontSize: 11, color: "var(--c-dim)", opacity: 0.4 }}>
            {mem.date}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function LandingView({ onNav }: { onNav: (v: View) => void }) {
  const [showcaseFilter, setShowcaseFilter] = useState<MemType | null>(null);

  const voice = SAMPLE_MEMORIES.find((m) => m.type === "voice")!;
  const note = SAMPLE_MEMORIES.find((m) => m.type === "note")!;
  const photo = SAMPLE_MEMORIES.find((m) => m.type === "photo")!;
  const link = SAMPLE_MEMORIES.find((m) => m.type === "link")!;
  const meme = SAMPLE_MEMORIES.find((m) => m.type === "meme")!;

  // Which showcase cards to show based on pill filter
  const showcaseItems: MemType[] = showcaseFilter
    ? [showcaseFilter]
    : ["voice", "note", "photo", "link", "meme"];

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        onNav={onNav}
        right={
          <>
            <button
              className="btn-ghost"
              style={{ padding: "10px 20px" }}
              onClick={() => onNav("login")}
            >
              Log In
            </button>
            <button
              className="btn-gold"
              style={{ padding: "11px 24px", fontSize: 11 }}
              onClick={() => onNav("auth")}
            >
              {COPY.cta}
            </button>
          </>
        }
      />

      {/* HERO */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "104px 24px 84px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 560,
            background:
              "radial-gradient(ellipse,rgba(201,162,74,.03) 0%,transparent 66%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="fade-in"
          style={{ position: "relative", maxWidth: 780 }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 22,
                height: 1,
                background: "var(--gold)",
                opacity: 0.44,
                display: "inline-block",
              }}
            />
            {COPY.eyebrow}
            <span
              style={{
                width: 22,
                height: 1,
                background: "var(--gold)",
                opacity: 0.44,
                display: "inline-block",
              }}
            />
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(48px,7.5vw,84px)",
              fontWeight: 300,
              lineHeight: 1.07,
              color: "var(--cream)",
              marginBottom: 28,
              letterSpacing: "-.015em",
            }}
          >
            {COPY.headline1}
            <br />
            <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>
              {COPY.headline2}
            </em>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px,1.8vw,18px)",
              color: "var(--c-mid)",
              lineHeight: 1.82,
              maxWidth: 480,
              margin: "0 auto 52px",
              fontWeight: 300,
            }}
          >
            {COPY.sub}
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Create → auth (create mode) */}
            <button
              className="btn-gold"
              style={{ fontSize: 12, padding: "15px 40px" }}
              onClick={() => onNav("auth")}
            >
              {COPY.cta}
            </button>
            {/* Log In → login mode */}
            <button
              className="btn-ghost"
              style={{ padding: "14px 30px" }}
              onClick={() => onNav("login")}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Category pills — clicking filters the memory showcase below */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 62,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {(Object.keys(T) as MemType[]).map((t) => {
            const s = T[t];
            const active = showcaseFilter === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setShowcaseFilter(active ? null : t);
                  // scroll to showcase after state update
                  setTimeout(() => {
                    const el = document.getElementById("memory-showcase");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                style={{
                  background: active ? s.border : s.bg,
                  border: `1px solid ${s.border}`,
                  boxShadow: active
                    ? `${s.glow}, 0 0 0 1px ${s.border}`
                    : s.glow,
                  borderRadius: 20,
                  fontSize: 11,
                  color: active ? "var(--black)" : s.color,
                  padding: "7px 20px",
                  letterSpacing: ".12em",
                  textTransform: "uppercase" as const,
                  fontFamily: "'Jost',sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all .2s",
                  transform: active ? "translateY(-1px)" : "none",
                }}
              >
                {s.label}s
              </button>
            );
          })}
        </div>
        {showcaseFilter && (
          <p
            style={{
              marginTop: 14,
              fontSize: 12,
              color: "var(--c-dim)",
              letterSpacing: ".06em",
            }}
          >
            Showing{" "}
            <span style={{ color: "var(--gold)" }}>
              {T[showcaseFilter].label}s
            </span>{" "}
            — scroll down to see examples
            <button
              onClick={() => setShowcaseFilter(null)}
              style={{
                background: "none",
                border: "none",
                color: "var(--c-dim)",
                cursor: "pointer",
                marginLeft: 10,
                fontSize: 11,
                textDecoration: "underline",
                fontFamily: "'Jost',sans-serif",
              }}
            >
              clear
            </button>
          </p>
        )}
      </section>

      <hr className="dv" />

      {/* LIFESTYLE PHOTOS — driven by LIFESTYLE_CARDS */}
      <section className="sec">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow text="For the ones who matter" />
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(30px,4vw,48px)",
              fontWeight: 300,
              color: "var(--cream)",
              lineHeight: 1.15,
            }}
          >
            The best parts of life,{" "}
            <em style={{ fontStyle: "italic", color: "var(--c-mid)" }}>
              kept close.
            </em>
          </h2>
        </div>
        <div
          className="lsgrid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 44,
          }}
        >
          {LIFESTYLE_CARDS.map((c) => (
            <LsCard key={c.label} label={c.label} image={c.image} />
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: 21,
              fontWeight: 300,
              color: "var(--c-mid)",
              lineHeight: 1.5,
            }}
          >
            "{COPY.quote}"
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <button className="btn-gold" onClick={() => onNav("auth")}>
              {COPY.cta}
            </button>
            <button className="btn-ghost" onClick={() => onNav("login")}>
              Log In
            </button>
          </div>
        </div>
      </section>

      <hr className="dv" />

      {/* FEATURES — driven by FEATURES array */}
      <section className="sec">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow text="How it works" />
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(28px,3.5vw,44px)",
              fontWeight: 300,
              color: "var(--cream)",
              lineHeight: 1.2,
            }}
          >
            Built for quiet intimacy,
            <br />
            not the noise of everything else.
          </h2>
        </div>
        <div
          className="fgrid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card"
              style={{ padding: "34px 30px" }}
            >
              <Rule />
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 21,
                  fontWeight: 400,
                  color: "var(--cream)",
                  marginBottom: 13,
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--c-dim)",
                  lineHeight: 1.76,
                }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <hr className="dv" />

      {/* MEMORY SHOWCASE — filtered by pill clicks */}
      <section className="sec" id="memory-showcase">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow text="What you can keep" />
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(28px,3.5vw,44px)",
              fontWeight: 300,
              color: "var(--cream)",
              lineHeight: 1.2,
            }}
          >
            {showcaseFilter ? (
              <>
                <span style={{ color: "var(--gold)" }}>
                  {T[showcaseFilter].label}s
                </span>{" "}
                — in your private space.
              </>
            ) : (
              <>
                Every kind of memory,
                <br />
                in one private place.
              </>
            )}
          </h2>
          {showcaseFilter && (
            <button
              onClick={() => setShowcaseFilter(null)}
              style={{
                marginTop: 14,
                background: "none",
                border: "1px solid rgba(255,255,255,.1)",
                color: "var(--c-dim)",
                borderRadius: 20,
                fontSize: 11,
                padding: "5px 14px",
                cursor: "pointer",
                fontFamily: "'Jost',sans-serif",
                letterSpacing: ".06em",
                transition: "color .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--cream)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--c-dim)")
              }
            >
              Show all types
            </button>
          )}
        </div>
        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Voice */}
          {showcaseItems.includes("voice") && <VoiceShowcase mem={voice} />}

          {/* Note + Photo */}
          {(showcaseItems.includes("note") ||
            showcaseItems.includes("photo")) && (
            <div
              className="sgrid"
              style={{
                display: "grid",
                gridTemplateColumns: showcaseFilter ? "1fr" : "1fr 1fr",
                gap: 20,
              }}
            >
              {showcaseItems.includes("note") && (
                <div className="card" style={{ padding: "28px 30px" }}>
                  <Badge type="note" />
                  <blockquote
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 19,
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: "rgba(236,230,221,.88)",
                      lineHeight: 1.78,
                      marginTop: 18,
                      marginBottom: 20,
                    }}
                  >
                    "{note.caption.replace(/ — \w+$/, "")}"
                  </blockquote>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: 14,
                      borderTop: "1px solid rgba(255,255,255,.05)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: "'Cormorant Garamond',serif",
                        fontStyle: "italic",
                        color: "var(--gold)",
                      }}
                    >
                      — {note.sharedBy}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--c-dim)",
                        opacity: 0.42,
                      }}
                    >
                      {note.date}
                    </span>
                  </div>
                </div>
              )}
              {showcaseItems.includes("photo") && (
                <div className="card" style={{ overflow: "hidden" }}>
                  <Pic src={photo.image} alt={photo.title} h={160} r={0} />
                  <div style={{ padding: "18px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Badge type="photo" />
                      <Hrt f sz={13} />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 17,
                        fontWeight: 400,
                        color: "var(--cream)",
                        marginBottom: 5,
                      }}
                    >
                      {photo.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--c-dim)",
                        lineHeight: 1.6,
                        marginBottom: 10,
                      }}
                    >
                      {photo.caption}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "var(--gold)" }}>
                        {photo.sharedBy}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--c-dim)",
                          opacity: 0.42,
                        }}
                      >
                        {photo.date}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Link + Meme */}
          {(showcaseItems.includes("link") ||
            showcaseItems.includes("meme")) && (
            <div
              className="sgrid"
              style={{
                display: "grid",
                gridTemplateColumns: showcaseFilter ? "1fr" : "1fr 1fr",
                gap: 20,
              }}
            >
              {showcaseItems.includes("link") && (
                <div className="card" style={{ padding: 22 }}>
                  <Badge type="link" />
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 18,
                      fontWeight: 400,
                      color: "var(--cream)",
                      marginTop: 14,
                      marginBottom: 12,
                      lineHeight: 1.3,
                    }}
                  >
                    {link.title}
                  </h3>

                  {/* Show real link chip when url is set, placeholder when it's the default stub */}
                  {link.url && link.url !== "https://open.spotify.com" ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(148,130,185,.07)",
                        border: "1px solid rgba(148,130,185,.22)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        textDecoration: "none",
                        color: "#a898c8",
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {link.url.replace("https://", "")}
                      </span>
                      <ExtLink sz={12} />
                    </a>
                  ) : (
                    <div
                      style={{
                        border: "1px dashed rgba(148,130,185,.25)",
                        borderRadius: 8,
                        padding: "14px 16px",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        color: "rgba(148,130,185,.5)",
                      }}
                    >
                      <ExtLink sz={18} />
                      <p
                        style={{
                          fontSize: 12,
                          fontFamily: "'Jost',sans-serif",
                          letterSpacing: ".04em",
                          lineHeight: 1.5,
                        }}
                      >
                        Set{" "}
                        <code
                          style={{
                            color: "#a898c8",
                            fontFamily: "monospace",
                            fontSize: 11,
                          }}
                        >
                          DEMO_LINK.url
                        </code>{" "}
                        to your real link to preview it here.
                      </p>
                    </div>
                  )}

                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--c-dim)",
                      lineHeight: 1.6,
                    }}
                  >
                    {link.caption}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(255,255,255,.042)",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--gold)" }}>
                      {link.sharedBy}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--c-dim)",
                        opacity: 0.42,
                      }}
                    >
                      {link.date}
                    </span>
                  </div>
                </div>
              )}
              {showcaseItems.includes("meme") && (
                <div className="card" style={{ overflow: "hidden" }}>
                  <Pic src={meme.image} alt={meme.title} h={130} r={0} />
                  <div style={{ padding: "16px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Badge type="meme" />
                      <Hrt sz={13} />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 17,
                        fontWeight: 400,
                        color: "var(--cream)",
                        marginBottom: 5,
                      }}
                    >
                      {meme.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--c-dim)",
                        lineHeight: 1.6,
                        marginBottom: 10,
                      }}
                    >
                      {meme.caption}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "var(--gold)" }}>
                        {meme.sharedBy}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--c-dim)",
                          opacity: 0.42,
                        }}
                      >
                        {meme.date}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <hr className="dv" />

      {/* FINAL CTA */}
      <section className="secs" style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 26,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="var(--gold)"
            style={{ opacity: 0.38 }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(32px,4.5vw,54px)",
            fontWeight: 300,
            color: "var(--cream)",
            lineHeight: 1.12,
            marginBottom: 18,
          }}
        >
          Start with one memory.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "var(--c-dim)",
            lineHeight: 1.82,
            maxWidth: 320,
            margin: "0 auto 42px",
          }}
        >
          Your space takes less than a minute to create. The memories inside it
          will last much longer.
        </p>
        <button
          className="btn-gold"
          style={{ fontSize: 12, padding: "16px 46px" }}
          onClick={() => onNav("auth")}
        >
          {COPY.cta}
        </button>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,.042)",
          padding: "22px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Logo compact />
        <p
          style={{
            fontSize: 11,
            color: "var(--c-dim)",
            opacity: 0.28,
            letterSpacing: ".08em",
          }}
        >
          myevernear.com · Moments shared privately.
        </p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

function AuthView({
  onNav,
  defaultMode = "create",
  onAuth,
}: {
  onNav: (v: View) => void;
  defaultMode?: "login" | "create";
  onAuth?: (
    email: string,
    password: string,
    mode: "create" | "login",
  ) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState<"login" | "create">(defaultMode);
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!email || !pass) return;
    setBusy(true);
    try {
      if (onAuth) await onAuth(email, pass, mode);
      else onNav("create-space");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header showBack onBack={() => onNav("landing")} onNav={onNav} />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
        }}
      >
        <div
          className="card fade-in"
          style={{ width: "100%", maxWidth: 420, padding: "48px 42px" }}
        >
          <Rule />
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 32,
              fontWeight: 400,
              marginBottom: 8,
              color: "var(--cream)",
            }}
          >
            {mode === "create" ? "Create your account" : "Welcome back"}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--c-dim)",
              marginBottom: 36,
              lineHeight: 1.65,
            }}
          >
            {mode === "create"
              ? "Your private space starts here."
              : "Sign in to continue."}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
            <input
              type="password"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
          </div>
          <button
            className="btn-gold"
            style={{ width: "100%", marginBottom: 20, opacity: busy ? 0.6 : 1 }}
            onClick={handle}
            disabled={busy}
          >
            {busy ? "Please wait…" : "Continue"}
          </button>
          <p
            style={{ textAlign: "center", fontSize: 13, color: "var(--c-dim)" }}
          >
            {mode === "create"
              ? "Already have an account? "
              : "New to EverNear? "}
            <button
              className="btn-text"
              onClick={() => setMode(mode === "create" ? "login" : "create")}
            >
              {mode === "create" ? "Log in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE SPACE
// ═══════════════════════════════════════════════════════════════════════════════

function CreateSpaceView({
  onNav,
  onCreate,
}: {
  onNav: (v: View) => void;
  onCreate: (n: string) => void;
}) {
  const [name, setName] = useState("");
  const examples = [
    "Our Moments",
    "Mom & Me",
    "Wedding Day",
    "For Dad",
    "Best Friends",
  ];
  const go = () => {
    if (name.trim()) {
      onCreate(name.trim());
      onNav("dashboard");
    }
  };
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header showBack onBack={() => onNav("auth")} onNav={onNav} />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
        }}
      >
        <div
          className="card fade-in"
          style={{ width: "100%", maxWidth: 460, padding: "48px 42px" }}
        >
          <Rule />
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 32,
              fontWeight: 400,
              marginBottom: 10,
              color: "var(--cream)",
            }}
          >
            Name your space
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--c-dim)",
              marginBottom: 32,
              lineHeight: 1.65,
            }}
          >
            Give it a name that means something to you.
          </p>
          <input
            placeholder="e.g. Our Moments"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            style={{ marginBottom: 16, fontSize: 17 }}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 32,
            }}
          >
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setName(ex)}
                style={{
                  background:
                    name === ex ? "rgba(201,162,74,.1)" : "transparent",
                  border: `1px solid ${name === ex ? "rgba(201,162,74,.35)" : "rgba(255,255,255,.06)"}`,
                  borderRadius: 20,
                  fontSize: 12,
                  color: name === ex ? "var(--gold)" : "var(--c-dim)",
                  padding: "6px 15px",
                  cursor: "pointer",
                  transition: "all .15s",
                  fontFamily: "'Jost',sans-serif",
                  letterSpacing: ".04em",
                }}
              >
                {ex}
              </button>
            ))}
          </div>
          <button
            className="btn-gold"
            style={{ width: "100%", opacity: name.trim() ? 1 : 0.4 }}
            onClick={go}
          >
            Create Space
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardView({
  space,
  onNav,
  onLike,
  onSel,
}: {
  space: Space;
  onNav: (v: View) => void;
  onLike: (id: string) => void;
  onSel: (m: MemoryItem) => void;
}) {
  const [tab, setTab] = useState<"all" | MemType>("all");
  const tabs: [string, string][] = [
    ["all", "All"],
    ["photo", "Photos"],
    ["note", "Notes"],
    ["voice", "Voice"],
    ["meme", "Memes"],
    ["link", "Links"],
  ];
  const filtered =
    tab === "all"
      ? space.memories
      : space.memories.filter((m) => m.type === tab);
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        onNav={onNav}
        right={
          <>
            <button
              className="btn-ghost"
              style={{ padding: "10px 20px" }}
              onClick={() => onNav("invite")}
            >
              Invite
            </button>
            <button
              className="btn-gold"
              style={{ padding: "10px 22px" }}
              onClick={() => onNav("add-memory")}
            >
              + Add Memory
            </button>
          </>
        }
      />
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          width: "100%",
          padding: "0 28px",
        }}
      >
        <div style={{ padding: "52px 0 28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 18,
                height: 1,
                background: "var(--gold)",
                opacity: 0.44,
              }}
            />
            <span
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontFamily: "'Jost',sans-serif",
              }}
            >
              Private Space
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 10,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(38px,5.5vw,58px)",
                  fontWeight: 300,
                  color: "var(--cream)",
                  letterSpacing: "-.015em",
                  lineHeight: 1.1,
                }}
              >
                {space.name}
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--c-dim)",
                  fontWeight: 300,
                  marginTop: 8,
                }}
              >
                A private place for the best parts.
              </p>
            </div>
            {/* Visible Add Memory CTA inside the space */}
            <button
              className="btn-gold"
              style={{ fontSize: 12, padding: "13px 28px", flexShrink: 0 }}
              onClick={() => onNav("add-memory")}
            >
              + Add Memory
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,.042)",
            overflowX: "auto",
            scrollbarWidth: "none",
            marginBottom: 32,
          }}
        >
          {tabs.map(([k, l]) => (
            <button
              key={k}
              className={`tab-btn${tab === k ? " active" : ""}`}
              onClick={() => setTab(k as "all" | MemType)}
            >
              {l}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div
              style={{
                width: 1,
                height: 44,
                background: "var(--gold)",
                opacity: 0.22,
                margin: "0 auto 24px",
              }}
            />
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 24,
                color: "var(--cream)",
                marginBottom: 10,
              }}
            >
              Nothing here yet.
            </p>
            <p style={{ fontSize: 13, color: "var(--c-dim)" }}>
              Add your first memory.
            </p>
          </div>
        ) : (
          <div
            className="mgrid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))",
              gap: 18,
              paddingBottom: 64,
            }}
          >
            {filtered.map((m) => (
              <MemCard key={m.id} mem={m} onLike={onLike} onClick={onSel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE UPLOAD FIELD — used inside AddMemoryView
// ═══════════════════════════════════════════════════════════════════════════════

function VoiceUploadField({
  url,
  onUrl,
}: {
  url: string;
  onUrl: (u: string) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const blob = URL.createObjectURL(file);
    setBlobUrl(blob);
    onUrl(blob);
    setPlaying(false);
    setProgress(0);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const activeAudio = blobUrl || (url.startsWith("http") ? url : null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label
        style={{
          fontSize: 11,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--c-dim)",
          marginBottom: 0,
          display: "block",
          fontFamily: "'Jost',sans-serif",
        }}
      >
        Voice Message
      </label>

      {/* File upload zone */}
      <label
        style={{
          border: "1px dashed rgba(201,162,74,.28)",
          borderRadius: 9,
          padding: "22px 16px",
          textAlign: "center",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "var(--c-dim)",
          background: "rgba(201,162,74,.03)",
          transition: "border-color .2s",
        }}
      >
        <MicIc sz={20} />
        <span style={{ fontSize: 13 }}>
          {fileName ? fileName : "Upload audio file"}
        </span>
        <span style={{ fontSize: 11, opacity: 0.45 }}>
          MP3, M4A, WAV, OGG · up to 50MB
        </span>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </label>

      {/* — OR — */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }}
        />
        <span
          style={{
            fontSize: 11,
            color: "var(--c-dim)",
            letterSpacing: ".08em",
          }}
        >
          or paste a URL
        </span>
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }}
        />
      </div>

      {/* Audio URL input */}
      <input
        type="url"
        placeholder="/voice-note.mp3 or https://..."
        value={blobUrl ? "" : url}
        onChange={(e) => {
          onUrl(e.target.value);
          setBlobUrl(null);
          setFileName(null);
          setPlaying(false);
          setProgress(0);
        }}
        style={{ fontSize: 13 }}
      />

      {/* Preview player — shown when we have any source */}
      {activeAudio && (
        <div
          style={{
            background: "rgba(201,162,74,.05)",
            border: "1px solid rgba(201,162,74,.14)",
            borderRadius: 9,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <audio
            ref={audioRef}
            src={activeAudio}
            preload="metadata"
            onTimeUpdate={(e) => {
              const a = e.currentTarget;
              if (a.duration) setProgress((a.currentTime / a.duration) * 100);
            }}
            onEnded={() => {
              setPlaying(false);
              setProgress(0);
            }}
          />
          <button
            onClick={togglePlay}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              cursor: "pointer",
              background: playing ? "var(--gold)" : "transparent",
              border: `1px solid ${playing ? "var(--gold)" : "rgba(201,162,74,.4)"}`,
              color: playing ? "#100c00" : "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .2s",
            }}
          >
            {playing ? <Pause sz={11} /> : <Play sz={11} />}
          </button>
          <Waveform playing={playing} progress={progress} />
          <span
            style={{
              fontSize: 11,
              color: "var(--c-dim)",
              flexShrink: 0,
              letterSpacing: ".04em",
            }}
          >
            {fileName || "preview"}
          </span>
        </div>
      )}

      {/* Reminder about public path */}
      <p
        style={{
          fontSize: 11,
          color: "var(--c-dim)",
          opacity: 0.5,
          lineHeight: 1.5,
        }}
      >
        For production: place the file in{" "}
        <code style={{ color: "var(--gold)", fontFamily: "monospace" }}>
          /public/
        </code>{" "}
        and enter its path (e.g.{" "}
        <code style={{ color: "var(--gold)", fontFamily: "monospace" }}>
          /voice-note.mp3
        </code>
        ).
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD MEMORY
// ═══════════════════════════════════════════════════════════════════════════════

function AddMemoryView({
  onNav,
  onSave,
}: {
  onNav: (v: View) => void;
  onSave: (m: MemoryItem) => void;
}) {
  const [type, setType] = useState<MemType>("photo");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [voiceUrl, setVoiceUrl] = useState("");
  const [by, setBy] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!title.trim() || !by.trim()) return;
    const url =
      type === "link" ? linkUrl : type === "voice" ? voiceUrl : undefined;
    onSave({
      id: Date.now().toString(),
      type,
      title,
      caption,
      url: url || undefined,
      sharedBy: by,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      liked: false,
    });
    setSaved(true);
    setTimeout(() => onNav("dashboard"), 700);
  };

  const Lbl = ({ t }: { t: string }) => (
    <label
      style={{
        fontSize: 11,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--c-dim)",
        marginBottom: 8,
        display: "block",
        fontFamily: "'Jost',sans-serif",
      }}
    >
      {t}
    </label>
  );

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header showBack onBack={() => onNav("dashboard")} onNav={onNav} />
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          width: "100%",
          padding: "48px 28px",
        }}
      >
        <Rule />
        <h2
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 34,
            fontWeight: 400,
            marginBottom: 34,
            color: "var(--cream)",
          }}
        >
          Add a memory
        </h2>
        <div className="card fade-in" style={{ padding: "36px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Memory Type */}
            <div>
              <Lbl t="Memory Type" />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MemType)}
              >
                <option value="photo">Photo</option>
                <option value="note">Note</option>
                <option value="voice">Voice</option>
                <option value="meme">Meme</option>
                <option value="link">Link</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <Lbl t="Title" />
              <input
                placeholder="Give this memory a name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Caption — not shown for voice (has its own description) */}
            {type !== "voice" && (
              <div>
                <Lbl t="Caption / Note" />
                <textarea
                  placeholder="What do you want to remember?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
            )}

            {/* Photo / Meme upload */}
            {(type === "photo" || type === "meme") && (
              <div>
                <Lbl t={type === "photo" ? "Photo" : "Meme Image"} />
                <label
                  style={{
                    border: "1px dashed rgba(201,162,74,.22)",
                    borderRadius: 9,
                    padding: "28px 16px",
                    textAlign: "center",
                    color: "var(--c-dim)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        onSave({
                          id: Date.now().toString(),
                          type,
                          title: title || file.name,
                          caption,
                          image: url,
                          sharedBy: by,
                          date: new Date().toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }),
                          liked: false,
                        });
                      }
                    }}
                  />
                  <UpIc sz={18} />
                  <span style={{ fontSize: 13 }}>Tap to upload</span>
                  <span style={{ fontSize: 11, opacity: 0.45 }}>
                    JPG, PNG, GIF · up to 20MB
                  </span>
                </label>
              </div>
            )}

            {/* Voice — full upload + preview component */}
            {type === "voice" && (
              <>
                <div>
                  <Lbl t="Caption (optional)" />
                  <textarea
                    placeholder="What do you want to remember about this?"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <VoiceUploadField url={voiceUrl} onUrl={setVoiceUrl} />
              </>
            )}

            {/* Link URL */}
            {type === "link" && (
              <div>
                <Lbl t="Link URL" />
                <input
                  type="url"
                  placeholder="https://"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            )}

            {/* Shared by */}
            <div>
              <Lbl t="Shared By" />
              <input
                placeholder="Your name or nickname"
                value={by}
                onChange={(e) => setBy(e.target.value)}
              />
            </div>

            <button
              className="btn-gold"
              style={{
                width: "100%",
                marginTop: 6,
                opacity: title.trim() && by.trim() ? 1 : 0.38,
              }}
              onClick={save}
            >
              {saved
                ? "Saved ✓"
                : type === "voice"
                  ? "Save Voice Memory"
                  : "Save Memory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVITE
// ═══════════════════════════════════════════════════════════════════════════════

function InviteView({
  space,
  onNav,
}: {
  space: Space;
  onNav: (v: View) => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header showBack onBack={() => onNav("dashboard")} onNav={onNav} />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
        }}
      >
        <div
          className="card fade-in"
          style={{
            width: "100%",
            maxWidth: 480,
            padding: "48px 42px",
            textAlign: "center",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="var(--gold)"
            style={{ opacity: 0.42, marginBottom: 20 }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 30,
              fontWeight: 400,
              color: "var(--cream)",
              marginBottom: 12,
            }}
          >
            Invite someone
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--c-dim)",
              lineHeight: 1.72,
              marginBottom: 28,
            }}
          >
            Only people with this link can add to your space.
          </p>
          <div
            style={{
              background: "var(--s2)",
              border: "1px solid rgba(255,255,255,.05)",
              borderRadius: 9,
              padding: "14px 18px",
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--gold)",
                wordBreak: "break-all",
              }}
            >
              {space.inviteLink}
            </span>
          </div>
          <button
            className="btn-gold"
            style={{ width: "100%" }}
            onClick={() => {
              navigator.clipboard.writeText(space.inviteLink).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2200);
            }}
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
          <p
            style={{
              fontSize: 11,
              color: "var(--c-dim)",
              marginTop: 20,
              opacity: 0.35,
              lineHeight: 1.65,
            }}
          >
            This space is completely private.
            <br />
            Share only with people you trust.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY DETAIL
// ═══════════════════════════════════════════════════════════════════════════════

function DetailView({
  mem,
  onNav,
  onLike,
}: {
  mem: MemoryItem;
  onNav: (v: View) => void;
  onLike: (id: string) => void;
}) {
  const [vp, setVp] = useState(false);
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header showBack onBack={() => onNav("dashboard")} onNav={onNav} />
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
          padding: "48px 28px",
        }}
      >
        <div className="card fade-in" style={{ overflow: "hidden" }}>
          {(mem.type === "photo" || mem.type === "meme") && (
            <Pic src={mem.image} alt={mem.title} h={220} r={0} />
          )}
          <div style={{ padding: "28px 32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Badge type={mem.type} />
              <button
                className={`hbtn${mem.liked ? " liked" : ""}`}
                onClick={() => onLike(mem.id)}
              >
                <Hrt f={mem.liked} sz={14} />
                {mem.liked ? "Saved" : "Save"}
              </button>
            </div>
            {mem.type === "voice" && (
              <div
                onClick={() => setVp(!vp)}
                style={{
                  background: "rgba(201,162,74,.04)",
                  border: "1px solid rgba(201,162,74,.1)",
                  borderRadius: 10,
                  padding: "18px 22px",
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                }}
              >
                <button
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: vp ? "var(--gold)" : "transparent",
                    border: "1px solid rgba(201,162,74,.38)",
                    color: vp ? "#100c00" : "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {vp ? <Pause sz={13} /> : <Play sz={13} />}
                </button>
                <Waveform playing={vp} />
                <span
                  style={{ fontSize: 12, color: "var(--c-dim)", flexShrink: 0 }}
                >
                  0:42
                </span>
              </div>
            )}
            {mem.type === "link" && mem.url && (
              <a
                href={mem.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(148,130,185,.07)",
                  border: "1px solid rgba(148,130,185,.22)",
                  borderRadius: 10,
                  padding: "13px 17px",
                  marginBottom: 24,
                  textDecoration: "none",
                  color: "#a898c8",
                  fontSize: 14,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {mem.url}
                </span>
                <ExtLink sz={13} />
              </a>
            )}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 32,
                fontWeight: 400,
                color: "var(--cream)",
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              {mem.title}
            </h1>
            <p
              style={
                {
                  fontSize: mem.type === "note" ? 20 : 15,
                  fontFamily:
                    mem.type === "note"
                      ? "'Cormorant Garamond',serif"
                      : "'Jost',sans-serif",
                  fontStyle: mem.type === "note" ? "italic" : "normal",
                  color: "var(--c-mid)",
                  lineHeight: 1.84,
                  marginBottom: 28,
                } as React.CSSProperties
              }
            >
              {mem.caption}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 20,
                borderTop: "1px solid rgba(255,255,255,.042)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "var(--c-dim)",
                    opacity: 0.38,
                    marginBottom: 4,
                  }}
                >
                  Shared by
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 18,
                    color: "var(--gold)",
                  }}
                >
                  {mem.sharedBy}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "var(--c-dim)",
                    opacity: 0.38,
                    marginBottom: 4,
                  }}
                >
                  Date
                </div>
                <div style={{ fontSize: 13, color: "var(--c-dim)" }}>
                  {mem.date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT — wired to Supabase
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase space (real)
  const [dbSpace, setDbSpace] = useState<{
    id: string;
    name: string;
    invite_code: string;
  } | null>(null);
  // Local MemoryItem list for display (mapped from DB)
  const [memories, setMemories] = useState<MemoryItem[]>(
    SAMPLE_MEMORIES.map((m) => ({ ...m })),
  );
  const [sel, setSel] = useState<MemoryItem | null>(null);

  // ── Listen for auth state changes ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthChange(async (uid) => {
      setUserId(uid);
      setLoading(false);
      if (uid) {
        // Load the user's first space
        try {
          const spaces = await loadMySpaces();
          if (spaces.length > 0) {
            const s = spaces[0];
            setDbSpace({ id: s.id, name: s.name, invite_code: s.invite_code });
            const mems = await loadMemories(s.id);
            setMemories(mems.map(dbToLocal));
            setView("dashboard");
          } else {
            setView("create-space");
          }
        } catch {
          setView("create-space");
        }
      } else {
        setView("landing");
      }
    });
    return unsub;
  }, []);

  // ── Map DB memory → local MemoryItem ───────────────────────────────────────
  function dbToLocal(m: any): MemoryItem {
    return {
      id: m.id,
      type: m.type,
      title: m.title,
      caption: m.caption ?? "",
      image: m.image_url ?? m.image_path ?? undefined,
      url: m.url ?? undefined,
      sharedBy: m.shared_by ?? "",
      date: new Date(m.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      liked: m.liked ?? false,
    };
  }

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const handleAuth = useCallback(
    async (email: string, password: string, mode: "create" | "login") => {
      try {
        if (mode === "create") await signUp(email, password);
        else await logIn(email, password);
        // onAuthChange will fire and handle redirect
      } catch (e: any) {
        alert(e.message);
      }
    },
    [],
  );

  // ── Create space ────────────────────────────────────────────────────────────
  const handleCreateSpace = useCallback(async (name: string) => {
    try {
      const s = await createSpace(name);
      setDbSpace({ id: s.id, name: s.name, invite_code: s.invite_code });
      setMemories([]);
      setView("dashboard");
    } catch (e: any) {
      alert(e.message);
    }
  }, []);

  // ── Toggle like ─────────────────────────────────────────────────────────────
  const handleToggleLike = useCallback(
    async (id: string) => {
      const mem = memories.find((m) => m.id === id);
      if (!mem) return;
      // Optimistic update
      setMemories((ms) =>
        ms.map((m) => (m.id === id ? { ...m, liked: !m.liked } : m)),
      );
      setSel((s) => (s && s.id === id ? { ...s, liked: !s.liked } : s));
      try {
        await sbToggleLike(id, mem.liked);
      } catch {
        // revert on error
        setMemories((ms) =>
          ms.map((m) => (m.id === id ? { ...m, liked: mem.liked } : m)),
        );
      }
    },
    [memories],
  );

  // ── Save memory ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (item: MemoryItem) => {
      if (!dbSpace || !userId) {
        // Not logged in — just add to local state
        setMemories((ms) => [item, ...ms]);
        return;
      }
      try {
        let imagePath: string | undefined;

        // If image is a blob URL (file just uploaded locally), upload to storage
        if (item.image && item.image.startsWith("blob:")) {
          const res = await fetch(item.image);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `memory.${blob.type.split("/")[1] || "jpg"}`,
            { type: blob.type },
          );
          if (item.type === "voice")
            imagePath = await uploadVoice(file, userId);
          else imagePath = await uploadPhoto(file, userId);
        }

        const saved = await addMemory({
          spaceId: dbSpace.id,
          type: item.type,
          title: item.title,
          caption: item.caption,
          url: item.url,
          imagePath,
          sharedBy: item.sharedBy,
        });
        setMemories((ms) => [dbToLocal(saved), ...ms]);
      } catch (e: any) {
        // Fallback: add locally so UI doesn't break
        setMemories((ms) => [item, ...ms]);
      }
    },
    [dbSpace, userId],
  );

  // ── Build the local Space object for existing views ─────────────────────────
  const space: Space = {
    name: dbSpace?.name ?? "Our Moments",
    memories,
    inviteLink: dbSpace
      ? getInviteUrl(dbSpace.invite_code)
      : "myevernear.com/join/...",
  };

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--black)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 1,
                height: 44,
                background: "var(--gold)",
                opacity: 0.3,
                margin: "0 auto 24px",
              }}
            />
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 22,
                color: "var(--cream)",
                opacity: 0.6,
              }}
            >
              Loading…
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      {view === "landing" && <LandingView onNav={setView} />}
      {view === "auth" && (
        <AuthView onNav={setView} defaultMode="create" onAuth={handleAuth} />
      )}
      {view === "login" && (
        <AuthView onNav={setView} defaultMode="login" onAuth={handleAuth} />
      )}
      {view === "create-space" && (
        <CreateSpaceView onNav={setView} onCreate={handleCreateSpace} />
      )}
      {view === "dashboard" && (
        <DashboardView
          space={space}
          onNav={setView}
          onLike={handleToggleLike}
          onSel={(m) => {
            setSel(m);
            setView("detail");
          }}
        />
      )}
      {view === "add-memory" && (
        <AddMemoryView onNav={setView} onSave={handleSave} />
      )}
      {view === "invite" && <InviteView space={space} onNav={setView} />}
      {view === "detail" && sel && (
        <DetailView mem={sel} onNav={setView} onLike={handleToggleLike} />
      )}
    </>
  );
}
