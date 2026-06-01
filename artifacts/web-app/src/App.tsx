import React, { useState, useRef, useEffect, useCallback } from "react";
import { logIn, signUp } from "./lib/auth";
import {
  createSpace,
  loadMySpaces,
  getInviteUrl,
  loadSpaceByCode,
} from "./lib/spaces";
import {
  loadMemories,
  addMemory,
  addGuestMemory,
  toggleLike as sbToggleLike,
  deleteMemory,
  updateMemory,
} from "./lib/memories";
import { uploadPhoto, uploadVoice } from "./lib/upload";
import { supabase } from "./lib/supabase";

const LOGO_SRC =
  "https://ooyytlibotujvjzkbipy.supabase.co/storage/v1/object/public/demo-assets/logo2.png";
const BRAND_NAME = "EVERNEAR";

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

const FEATURES = [
  {
    title: "A keepsake, not an app",
    body: "Two keychains. One shared world. Tap to open a private space that belongs only to the two of you.",
  },
  {
    title: "No passwords, no friction",
    body: "Tap the keychain and you're in. The physical object is the key — no accounts, no logins, just memories.",
  },
  {
    title: "Every kind of moment",
    body: "Photos, notes, voice messages, memes, music. The everyday things that become extraordinary with time.",
  },
];

const COPY = {
  eyebrow: "Moments shared privately",
  headline1: "The moments you",
  headline2: "never want buried.",
  sub: "Two keychains. One private space. Tap to instantly open a world of shared memories — photos, notes, voice messages, music, and more.",
  quote: "Not to post. Not to share. Just to keep.",
  cta: "Create Your EverNear",
};

type MemType = "photo" | "note" | "voice" | "meme" | "music";
type View =
  | "landing"
  | "auth"
  | "login"
  | "create-space"
  | "dashboard"
  | "pick-type"
  | "add-memory"
  | "invite"
  | "detail"
  | "edit"
  | "guest-space"
  | "guest-name"
  | "guest-pick-type"
  | "guest-add";

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
  id: string;
  name: string;
  memories: MemoryItem[];
  inviteLink: string;
  spaceCode?: string;
}

const T: Record<
  MemType,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: string;
  }
> = {
  photo: {
    label: "Photo",
    color: "#D6B76A",
    bg: "rgba(201,162,74,0.13)",
    border: "rgba(201,162,74,0.36)",
    glow: "0 0 14px rgba(201,162,74,0.13)",
    icon: "🖼️",
  },
  note: {
    label: "Note",
    color: "#d8d0c6",
    bg: "rgba(216,208,198,0.09)",
    border: "rgba(216,208,198,0.28)",
    glow: "0 0 14px rgba(216,208,198,0.08)",
    icon: "✍️",
  },
  voice: {
    label: "Voice",
    color: "#C9A87A",
    bg: "rgba(180,152,108,0.12)",
    border: "rgba(180,152,108,0.32)",
    glow: "0 0 14px rgba(180,152,108,0.1)",
    icon: "🎙️",
  },
  meme: {
    label: "Meme",
    color: "#c9907e",
    bg: "rgba(195,130,110,0.1)",
    border: "rgba(195,130,110,0.3)",
    glow: "0 0 14px rgba(195,130,110,0.09)",
    icon: "😂",
  },
  music: {
    label: "Music",
    color: "#a898c8",
    bg: "rgba(148,130,185,0.11)",
    border: "rgba(148,130,185,0.3)",
    glow: "0 0 14px rgba(148,130,185,0.1)",
    icon: "🎵",
  },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --black:#0b0a09;--s1:#1b1916;--s2:#222018;
    --gold:#C9A24A;--gold-lt:#D6B76A;--gold-dk:#8F6A2A;--gold-d:rgba(201,162,74,0.36);
    --cream:#ece6dd;--c-mid:#c0b9b0;--c-dim:#887f78;
    --sb:rgba(255,255,255,0.05);--r:14px;--rs:9px;
    --sh:0 2px 8px rgba(0,0,0,0.55),0 0 28px rgba(201,162,74,0.05);
  }
  html,body,#root{min-height:100%;background:var(--black);color:var(--cream);font-family:'Jost',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased;letter-spacing:0.015em;}
  h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;font-weight:400;letter-spacing:-0.01em}
  input,textarea,select{background:var(--s1);border:1px solid var(--sb);border-radius:var(--rs);color:var(--cream);font-family:'Jost',sans-serif;font-size:15px;font-weight:300;padding:13px 16px;width:100%;outline:none;transition:border-color .25s;letter-spacing:0.02em;}
  input::placeholder,textarea::placeholder{color:var(--c-dim);opacity:.7}
  input:focus,textarea:focus,select:focus{border-color:var(--gold-d)}
  .btn-gold{background:linear-gradient(135deg,var(--gold-dk) 0%,var(--gold-lt) 46%,var(--gold-dk) 100%);color:#100c00;border:none;border-radius:var(--rs);font-family:'Jost',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;padding:14px 36px;cursor:pointer;transition:opacity .2s,transform .15s;white-space:nowrap;}
  .btn-gold:hover{opacity:.86;transform:translateY(-1px)}
  .btn-gold:active{transform:scale(.98)}
  .btn-ghost{background:transparent;color:var(--c-mid);border:1px solid rgba(255,255,255,.11);border-radius:var(--rs);font-family:'Jost',sans-serif;font-size:12px;font-weight:400;letter-spacing:0.12em;text-transform:uppercase;padding:13px 28px;cursor:pointer;transition:border-color .2s,color .2s;white-space:nowrap;}
  .btn-ghost:hover{border-color:var(--gold-d);color:var(--gold)}
  .btn-text{background:none;border:none;color:var(--gold);font-family:'Jost',sans-serif;font-size:13px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(201,162,74,.35);transition:opacity .2s;}
  .btn-text:hover{opacity:.7}
  .card{background:var(--s1);border:1px solid var(--sb);border-radius:var(--r);box-shadow:var(--sh);transition:border-color .3s,transform .3s,box-shadow .3s;}
  .card:hover{border-color:rgba(201,162,74,.15);transform:translateY(-3px);box-shadow:0 12px 38px rgba(0,0,0,.55),0 0 38px rgba(201,162,74,.07);}
  .tab-btn{background:transparent;border:none;color:var(--c-dim);font-family:'Jost',sans-serif;font-size:11px;font-weight:400;letter-spacing:.1em;text-transform:uppercase;padding:11px 20px;cursor:pointer;border-bottom:1px solid transparent;transition:color .2s,border-color .2s;white-space:nowrap;}
  .tab-btn:hover{color:var(--cream)}
  .tab-btn.active{color:var(--gold);border-bottom-color:var(--gold)}
  .hbtn{background:none;border:none;cursor:pointer;padding:4px 6px;transition:transform .15s;color:var(--c-dim);display:flex;align-items:center;gap:4px;font-size:12px;font-family:'Jost',sans-serif;}
  .hbtn:hover{transform:scale(1.1);color:var(--gold)}
  .hbtn.liked{color:var(--gold)}
  .wv{display:flex;align-items:center;gap:3px;height:28px;flex:1;overflow:hidden}
  .wvb{width:2.5px;border-radius:2px;flex-shrink:0;animation:wvp 1.65s ease-in-out infinite;}
  @keyframes wvp{0%,100%{transform:scaleY(.28);opacity:.35}50%{transform:scaleY(1);opacity:.92}}
  .lsc{border-radius:14px;overflow:hidden;position:relative;background:var(--s2);aspect-ratio:3/4;box-shadow:0 6px 24px rgba(0,0,0,.5);transition:transform .45s,box-shadow .45s;}
  .lsc:hover{transform:translateY(-7px) scale(1.015);}
  .lsc img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform .65s}
  .lsc:hover img{transform:scale(1.07)}
  .iph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px dashed rgba(201,162,74,.18);border-radius:inherit;color:rgba(201,162,74,.45);font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;}
  .fade-in{animation:fu .44s ease both}
  @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shim{0%,100%{opacity:1}50%{opacity:.45}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,60,60,.3)}50%{box-shadow:0 0 0 12px rgba(220,60,60,0)}}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(201,162,74,.18);border-radius:3px}
  hr.dv{border:none;border-top:1px solid rgba(255,255,255,.042)}
  .sec{max-width:1020px;margin:0 auto;width:100%;padding:88px 36px}
  .secs{max-width:700px;margin:0 auto;width:100%;padding:88px 36px}
  @media(max-width:720px){
    .sec,.secs{padding:60px 20px}
    .lsgrid{grid-template-columns:repeat(2,1fr)!important}
    .fgrid{grid-template-columns:1fr!important}
    .sgrid{grid-template-columns:1fr!important}
    .mgrid{grid-template-columns:1fr!important}
    header{padding:0 16px!important;height:70px!important}
    .hdr-btns{display:none!important}
    .hdr-menu{display:flex!important}
  }
`;

// ICONS
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
const MusicIc = ({ sz = 16 }: { sz?: number }) => (
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
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
const TrashIc = ({ sz = 14 }: { sz?: number }) => (
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
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// PRIMITIVES
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
      {!err && (
        <img
          src={LOGO_SRC}
          alt={BRAND_NAME}
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
            color: "rgba(201,162,74,.55)",
            fontFamily: "'Jost',sans-serif",
            fontSize: 10,
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          {BRAND_NAME}
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

function Lbl({ t }: { t: string }) {
  return (
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

// HEADER
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
  const [menuOpen, setMenuOpen] = useState(false);
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
        <div
          className="hdr-btns"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          {right}
        </div>
      )}
      <div
        className="hdr-menu"
        style={{ display: "none", position: "relative" }}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 8,
            color: "var(--cream)",
            cursor: "pointer",
            padding: "8px 12px",
            fontFamily: "'Jost',sans-serif",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              background: "var(--s1)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: "8px",
              minWidth: 180,
              boxShadow: "0 12px 38px rgba(0,0,0,.6)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {right &&
              React.Children.map(right as React.ReactElement, (child) => (
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{ borderRadius: 8, overflow: "hidden" }}
                >
                  {child}
                </div>
              ))}
          </div>
        )}
      </div>
    </header>
  );
}

// LIFESTYLE CARD
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
        </div>
      )}
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

// MEMORY CARD
function MemCard({
  mem,
  onLike,
  onClick,
}: {
  mem: MemoryItem;
  onLike?: (id: string) => void;
  onClick: (m: MemoryItem) => void;
}) {
  const [vp, setVp] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggleVoice = () => {
    const a = audioRef.current;
    if (!a) return;
    if (vp) {
      a.pause();
      setVp(false);
    } else {
      a.play().catch(() => {});
      setVp(true);
    }
  };
  return (
    <div
      className="card fade-in"
      style={{ cursor: "pointer", overflow: "hidden" }}
      onClick={() => onClick(mem)}
    >
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
          {onLike && (
            <button
              className={`hbtn${mem.liked ? " liked" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onLike(mem.id);
              }}
            >
              <Hrt f={mem.liked} sz={13} />
            </button>
          )}
        </div>
        {mem.type === "voice" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleVoice();
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
            {mem.url && (
              <audio
                ref={audioRef}
                src={mem.url}
                preload="auto"
                onEnded={() => setVp(false)}
              />
            )}
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
          </div>
        )}
        {mem.type === "music" && (
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
            <MusicIc sz={13} />
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
              {mem.url || "Music link"}
            </span>
            <ExtLink />
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

// VOICE RECORDER
function VoiceRecorder({
  onAudio,
}: {
  onAudio: (blob: Blob | null, url: string | null) => void;
}) {
  const [state, setState] = useState<"idle" | "recording" | "recorded">("idle");
  const [seconds, setSeconds] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        onAudio(blob, url);
        setState("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setState("recording");
      setSeconds(0);
      timerRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000,
      );
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const discard = () => {
    setBlobUrl(null);
    setPlaying(false);
    setProgress(0);
    setSeconds(0);
    setState("idle");
    onAudio(null, null);
  };
  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {state === "idle" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "28px 0",
          }}
        >
          <button
            onClick={startRecording}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "2px solid rgba(201,162,74,.4)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MicIc sz={28} />
          </button>
          <p style={{ fontSize: 13, color: "var(--c-dim)" }}>
            Tap to start recording
          </p>
        </div>
      )}
      {state === "recording" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "28px 0",
          }}
        >
          <button
            onClick={stopRecording}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "2px solid rgba(220,60,60,.6)",
              background: "rgba(220,60,60,.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                background: "rgba(220,80,80,.9)",
                borderRadius: 4,
              }}
            />
          </button>
          <p style={{ fontSize: 13, color: "rgba(220,100,100,.9)" }}>
            Recording — {fmt(seconds)} — tap to stop
          </p>
          <Waveform playing={true} />
        </div>
      )}
      {state === "recorded" && blobUrl && (
        <div
          style={{
            background: "rgba(201,162,74,.05)",
            border: "1px solid rgba(201,162,74,.18)",
            borderRadius: 10,
            padding: "18px 20px",
          }}
        >
          <audio
            ref={audioRef}
            src={blobUrl}
            onTimeUpdate={(e) => {
              const a = e.currentTarget;
              if (a.duration) setProgress((a.currentTime / a.duration) * 100);
            }}
            onEnded={() => {
              setPlaying(false);
              setProgress(0);
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 10,
            }}
          >
            <button
              onClick={togglePlay}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                flexShrink: 0,
                cursor: "pointer",
                background: playing ? "var(--gold)" : "transparent",
                border: `1px solid ${playing ? "var(--gold)" : "rgba(201,162,74,.4)"}`,
                color: playing ? "#100c00" : "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {playing ? <Pause sz={12} /> : <Play sz={12} />}
            </button>
            <Waveform playing={playing} progress={progress} />
            <span style={{ fontSize: 11, color: "var(--c-dim)" }}>
              {fmt(seconds)}
            </span>
          </div>
          <div
            style={{
              height: 1.5,
              background: "rgba(201,162,74,.12)",
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 12,
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
          <button
            onClick={discard}
            style={{
              background: "none",
              border: "none",
              color: "rgba(220,100,100,.7)",
              fontFamily: "'Jost',sans-serif",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrashIc sz={13} /> Discard and re-record
          </button>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }}
        />
        <span style={{ fontSize: 11, color: "var(--c-dim)" }}>
          or upload a file
        </span>
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }}
        />
      </div>
      <label
        style={{
          border: "1px dashed rgba(201,162,74,.2)",
          borderRadius: 9,
          padding: "16px",
          textAlign: "center",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: "var(--c-dim)",
        }}
      >
        <UpIc sz={15} />
        <span style={{ fontSize: 13 }}>Upload audio file</span>
        <input
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            setBlobUrl(url);
            onAudio(file, url);
            setState("recorded");
            setSeconds(0);
          }}
        />
      </label>
    </div>
  );
}

// TYPE PICKER
function TypePicker({
  onPick,
  onBack,
}: {
  onPick: (t: MemType) => void;
  onBack: () => void;
}) {
  const types: { type: MemType; desc: string }[] = [
    { type: "photo", desc: "A moment captured in a photo" },
    { type: "note", desc: "Words from the heart" },
    { type: "voice", desc: "Record or upload a voice message" },
    { type: "music", desc: "A song that means something" },
    { type: "meme", desc: "Something that made you both laugh" },
  ];
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        width: "100%",
        padding: "48px 28px",
      }}
    >
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
          marginBottom: 28,
        }}
      >
        <ChevL /> Back
      </button>
      <Rule />
      <h2
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 34,
          fontWeight: 400,
          marginBottom: 10,
          color: "var(--cream)",
        }}
      >
        What kind of memory?
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--c-dim)",
          marginBottom: 36,
          lineHeight: 1.65,
        }}
      >
        Choose a type and we'll take you right there.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {types.map(({ type, desc }) => {
          const s = T[type];
          return (
            <button
              key={type}
              onClick={() => onPick(type)}
              style={{
                background: "var(--s1)",
                border: "1px solid var(--sb)",
                borderRadius: "var(--r)",
                padding: "22px 28px",
                cursor: "pointer",
                transition: "all .25s",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                textAlign: "left",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = s.border;
                e.currentTarget.style.background = s.bg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--sb)";
                e.currentTarget.style.background = "var(--s1)";
              }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: s.color,
                    marginBottom: 4,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--c-dim)",
                    lineHeight: 1.5,
                  }}
                >
                  {desc}
                </div>
              </div>
              <ChevL />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ADD MEMORY FORM
function AddMemoryForm({
  memType,
  sharedBy,
  onBack,
  onSave,
}: {
  memType: MemType;
  sharedBy: string;
  onBack: () => void;
  onSave: (m: Omit<MemoryItem, "id" | "date" | "liked">) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSave = () => {
    if (!title.trim()) return false;
    if (memType === "photo" || memType === "meme") return !!photoPreview;
    if (memType === "music") return !!musicUrl.trim();
    if (memType === "voice") return !!audioUrl;
    return true;
  };

  const save = async () => {
    if (!canSave()) return;
    setBusy(true);
    await onSave({
      type: memType,
      title: title.trim(),
      caption: caption.trim(),
      image: photoPreview ?? undefined,
      url:
        memType === "music"
          ? musicUrl
          : memType === "voice"
            ? (audioUrl ?? undefined)
            : undefined,
      sharedBy,
    });
    setSaved(true);
    setBusy(false);
  };

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        width: "100%",
        padding: "48px 28px",
      }}
    >
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
          marginBottom: 28,
        }}
      >
        <ChevL /> Back
      </button>
      <Rule />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 34,
        }}
      >
        <span style={{ fontSize: 24 }}>{T[memType].icon}</span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 30,
            fontWeight: 400,
            color: "var(--cream)",
          }}
        >
          Add a {T[memType].label.toLowerCase()}
        </h2>
      </div>
      <div className="card fade-in" style={{ padding: "36px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {(memType === "photo" || memType === "meme") && (
            <div>
              <Lbl t={memType === "photo" ? "Photo" : "Meme Image"} />
              {photoPreview ? (
                <div
                  style={{
                    position: "relative",
                    borderRadius: 9,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={photoPreview}
                    alt="preview"
                    style={{
                      width: "100%",
                      maxHeight: 240,
                      objectFit: "cover",
                      display: "block",
                      borderRadius: 9,
                    }}
                  />
                  <button
                    onClick={() => setPhotoPreview(null)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "rgba(0,0,0,.6)",
                      border: "none",
                      borderRadius: 6,
                      color: "var(--cream)",
                      fontFamily: "'Jost',sans-serif",
                      fontSize: 11,
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    border: "1px dashed rgba(201,162,74,.22)",
                    borderRadius: 9,
                    padding: "36px 16px",
                    textAlign: "center",
                    color: "var(--c-dim)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <UpIc sz={22} />
                  <span style={{ fontSize: 14 }}>Tap to upload</span>
                  <span style={{ fontSize: 11, opacity: 0.45 }}>
                    JPG, PNG, GIF
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPhotoPreview(URL.createObjectURL(f));
                    }}
                  />
                </label>
              )}
            </div>
          )}
          {memType === "voice" && (
            <div>
              <Lbl t="Voice Message" />
              <VoiceRecorder onAudio={(_, url) => setAudioUrl(url)} />
            </div>
          )}
          {memType === "music" && (
            <div>
              <Lbl t="Music or Video Link" />
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#a898c8",
                    pointerEvents: "none",
                  }}
                >
                  <MusicIc sz={15} />
                </div>
                <input
                  type="url"
                  placeholder="Paste a Spotify, YouTube, Apple Music link…"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>
              {musicUrl && (
                <div
                  style={{
                    marginTop: 10,
                    background: "rgba(148,130,185,.08)",
                    border: "1px solid rgba(148,130,185,.22)",
                    borderRadius: 9,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <MusicIc sz={14} />
                  <span
                    style={{
                      fontSize: 13,
                      color: "#a898c8",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {musicUrl.replace("https://", "")}
                  </span>
                  <a
                    href={musicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#a898c8", opacity: 0.6 }}
                  >
                    <ExtLink sz={12} />
                  </a>
                </div>
              )}
              <p
                style={{
                  fontSize: 11,
                  color: "var(--c-dim)",
                  opacity: 0.5,
                  marginTop: 8,
                }}
              >
                Works with Spotify, YouTube, Apple Music, SoundCloud, and more.
              </p>
            </div>
          )}
          <div>
            <Lbl t="Title" />
            <input
              placeholder={
                memType === "note"
                  ? "Give this note a title"
                  : "Give this memory a name"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {memType !== "voice" && (
            <div>
              <Lbl t={memType === "note" ? "Your note" : "Caption"} />
              <textarea
                placeholder={
                  memType === "note"
                    ? "Write what's on your heart…"
                    : "What do you want to remember?"
                }
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={memType === "note" ? 5 : 3}
                style={{ resize: "vertical" }}
              />
            </div>
          )}
          <button
            className="btn-gold"
            style={{
              width: "100%",
              marginTop: 6,
              opacity: canSave() && !busy ? 1 : 0.38,
            }}
            onClick={save}
            disabled={busy || !canSave()}
          >
            {saved
              ? "Saved ✓"
              : busy
                ? "Saving…"
                : `Save ${T[memType].label} Memory`}
          </button>
        </div>
      </div>
    </div>
  );
}

// GUEST NAME VIEW
function GuestNameView({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState("");
  const save = () => {
    if (!name.trim()) return;
    localStorage.setItem("evernear_guest_name", name.trim());
    onDone(name.trim());
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--black)",
      }}
    >
      <div
        className="card fade-in"
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "48px 42px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 20 }}>🤍</div>
        <Rule />
        <h2
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 30,
            fontWeight: 400,
            color: "var(--cream)",
            marginBottom: 12,
          }}
        >
          Welcome to this space
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--c-dim)",
            lineHeight: 1.72,
            marginBottom: 32,
          }}
        >
          Before you step inside — what would you like to be called?
        </p>
        <input
          placeholder="Your name or nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          style={{ marginBottom: 16, textAlign: "center", fontSize: 17 }}
          autoFocus
        />
        <button
          className="btn-gold"
          style={{ width: "100%", opacity: name.trim() ? 1 : 0.4 }}
          onClick={save}
        >
          Step Inside
        </button>
        <p
          style={{
            fontSize: 11,
            color: "var(--c-dim)",
            marginTop: 20,
            opacity: 0.4,
            lineHeight: 1.6,
          }}
        >
          We'll remember your name on this device.
          <br />
          No account needed.
        </p>
      </div>
    </div>
  );
}

// GUEST SPACE VIEW
function GuestSpaceView({
  space,
  memories,
  guestName,
  onAddMemory,
  onSel,
}: {
  space: { id: string; name: string };
  memories: MemoryItem[];
  guestName: string;
  onAddMemory: () => void;
  onSel: (m: MemoryItem) => void;
}) {
  const [tab, setTab] = useState<"all" | MemType>("all");
  const tabs: [string, string][] = [
    ["all", "All"],
    ["photo", "Photos"],
    ["note", "Notes"],
    ["voice", "Voice"],
    ["meme", "Memes"],
    ["music", "Music"],
  ];
  const filtered =
    tab === "all" ? memories : memories.filter((m) => m.type === tab);
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(11,10,9,.97)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,.042)",
          padding: "0 24px",
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo compact />
        <button
          className="btn-gold"
          style={{ padding: "10px 20px", fontSize: 11 }}
          onClick={onAddMemory}
        >
          + Add Memory
        </button>
      </header>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
        }}
      >
        <div style={{ padding: "40px 0 24px" }}>
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
              Shared Space
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(32px,5vw,52px)",
              fontWeight: 300,
              color: "var(--cream)",
              letterSpacing: "-.015em",
              lineHeight: 1.1,
            }}
          >
            {space.name}
          </h1>
          <p style={{ fontSize: 13, color: "var(--c-dim)", marginTop: 8 }}>
            Welcome, <span style={{ color: "var(--gold)" }}>{guestName}</span>.
            These moments were saved for you.
          </p>
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
            <div style={{ fontSize: 40, marginBottom: 20 }}>🤍</div>
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
            <p
              style={{ fontSize: 13, color: "var(--c-dim)", marginBottom: 28 }}
            >
              Be the first to add a memory.
            </p>
            <button className="btn-gold" onClick={onAddMemory}>
              + Add First Memory
            </button>
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
              <MemCard key={m.id} mem={m} onClick={onSel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// LANDING VIEW
function LandingView({ onNav }: { onNav: (v: View) => void }) {
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
              maxWidth: 520,
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
            <button
              className="btn-gold"
              style={{ fontSize: 12, padding: "15px 40px" }}
              onClick={() => onNav("auth")}
            >
              {COPY.cta}
            </button>
            <button
              className="btn-ghost"
              style={{ padding: "14px 30px" }}
              onClick={() => onNav("login")}
            >
              Log In
            </button>
          </div>
        </div>
      </section>
      <hr className="dv" />
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

// AUTH VIEW
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

// CREATE SPACE VIEW
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

// DASHBOARD VIEW
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
    ["music", "Music"],
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
              onClick={() => onNav("pick-type")}
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
            <button
              className="btn-gold"
              style={{ fontSize: 12, padding: "13px 28px", flexShrink: 0 }}
              onClick={() => onNav("pick-type")}
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

// INVITE VIEW
function InviteView({
  space,
  onNav,
}: {
  space: Space;
  onNav: (v: View) => void;
}) {
  const [copied, setCopied] = useState(false);
  const spaceUrl = space.spaceCode
    ? `${window.location.origin}/space/${space.spaceCode}`
    : space.inviteLink;
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
          <div style={{ fontSize: 40, marginBottom: 20 }}>🔗</div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 30,
              fontWeight: 400,
              color: "var(--cream)",
              marginBottom: 12,
            }}
          >
            Share your space
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--c-dim)",
              lineHeight: 1.72,
              marginBottom: 8,
            }}
          >
            Anyone with this link can view and add memories to your shared
            space.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--c-dim)",
              lineHeight: 1.6,
              marginBottom: 28,
              opacity: 0.7,
            }}
          >
            Program this URL onto your NFC keychain so anyone can tap and
            instantly open your shared memories.
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
              {spaceUrl}
            </span>
          </div>
          <button
            className="btn-gold"
            style={{ width: "100%" }}
            onClick={() => {
              navigator.clipboard.writeText(spaceUrl).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2200);
            }}
          >
            {copied ? "Copied ✓" : "Copy Link"}
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
            This is your shared space link.
            <br />
            Program it to both keychains.
          </p>
        </div>
      </div>
    </div>
  );
}

// DETAIL VIEW
function DetailView({
  mem,
  onNav,
  onLike,
  onDelete,
  isGuest = false,
}: {
  mem: MemoryItem;
  onNav: (v: View) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  isGuest?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const toggleAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().catch(() => {});
      setPlaying(true);
    }
  };
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        showBack
        onBack={() => onNav(isGuest ? "guest-space" : "dashboard")}
        onNav={onNav}
      />
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
            {mem.type === "voice" && mem.url && (
              <div
                style={{
                  background: "rgba(201,162,74,.04)",
                  border: "1px solid rgba(201,162,74,.1)",
                  borderRadius: 10,
                  padding: "18px 22px",
                  marginBottom: 24,
                }}
              >
                <audio
                  ref={audioRef}
                  src={mem.url}
                  preload="auto"
                  onTimeUpdate={(e) => {
                    const a = e.currentTarget;
                    if (a.duration)
                      setProgress((a.currentTime / a.duration) * 100);
                  }}
                  onEnded={() => {
                    setPlaying(false);
                    setProgress(0);
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 10,
                  }}
                >
                  <button
                    onClick={toggleAudio}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: playing ? "var(--gold)" : "transparent",
                      border: "1px solid rgba(201,162,74,.38)",
                      color: playing ? "#100c00" : "var(--gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {playing ? <Pause sz={13} /> : <Play sz={13} />}
                  </button>
                  <Waveform playing={playing} progress={progress} />
                </div>
                <div
                  style={{
                    height: 1.5,
                    background: "rgba(201,162,74,.12)",
                    borderRadius: 2,
                    overflow: "hidden",
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
              </div>
            )}
            {mem.type === "music" && mem.url && (
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
                <MusicIc sz={15} />
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
            {!isGuest && (
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  className="btn-ghost"
                  style={{ flex: 1, padding: "11px 0" }}
                  onClick={() => onNav("edit")}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(mem.id)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    background: "transparent",
                    border: "1px solid rgba(195,80,80,.3)",
                    borderRadius: "var(--rs)",
                    color: "rgba(220,100,100,.8)",
                    fontFamily: "'Jost',sans-serif",
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "border-color .2s,color .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(220,80,80,.6)";
                    e.currentTarget.style.color = "rgba(240,110,110,1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(195,80,80,.3)";
                    e.currentTarget.style.color = "rgba(220,100,100,.8)";
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// EDIT MEMORY VIEW
function EditMemoryView({
  mem,
  onNav,
  onSave,
}: {
  mem: MemoryItem;
  onNav: (v: View) => void;
  onSave: (updated: MemoryItem) => void;
}) {
  const [title, setTitle] = useState(mem.title);
  const [caption, setCaption] = useState(mem.caption);
  const [musicUrl, setMusicUrl] = useState(mem.url ?? "");
  const [by, setBy] = useState(mem.sharedBy);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!title.trim() || !by.trim()) return;
    setBusy(true);
    await onSave({
      ...mem,
      title: title.trim(),
      caption: caption.trim(),
      url: mem.type === "music" ? musicUrl : mem.url,
      sharedBy: by.trim(),
    });
    setBusy(false);
  };
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header showBack onBack={() => onNav("detail")} onNav={onNav} />
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
          Edit memory
        </h2>
        <div className="card fade-in" style={{ padding: "36px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <Lbl t="Title" />
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            {mem.type !== "voice" && (
              <div>
                <Lbl t={mem.type === "note" ? "Your note" : "Caption"} />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
            )}
            {mem.type === "music" && (
              <div>
                <Lbl t="Music Link" />
                <input
                  type="url"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                />
              </div>
            )}
            <div>
              <Lbl t="Shared By" />
              <input value={by} onChange={(e) => setBy(e.target.value)} />
            </div>
            <button
              className="btn-gold"
              style={{ width: "100%", marginTop: 6, opacity: busy ? 0.6 : 1 }}
              onClick={save}
              disabled={busy}
            >
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// APP ROOT
export default function App() {
  const [view, setView] = useState<View>("landing");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbSpace, setDbSpace] = useState<{
    id: string;
    name: string;
    invite_code: string;
  } | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [sel, setSel] = useState<MemoryItem | null>(null);
  const [memType, setMemType] = useState<MemType>("photo");
  const [guestName, setGuestName] = useState<string>(
    () => localStorage.getItem("evernear_guest_name") ?? "",
  );
  const [guestSpace, setGuestSpace] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [guestMemories, setGuestMemories] = useState<MemoryItem[]>([]);
  const [guestMemType, setGuestMemType] = useState<MemType>("photo");
  const [isGuestView, setIsGuestView] = useState(false);

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

  // Check for /space/:code in URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/space\/([a-zA-Z0-9-]+)$/);
    if (match) {
      const code = match[1];
      loadSpaceByCode(code)
        .then(async (space) => {
          if (space) {
            setGuestSpace({ id: space.id, name: space.name });
            const mems = await loadMemories(space.id);
            setGuestMemories(mems.map(dbToLocal));
            setIsGuestView(true);
            setLoading(false);
            const savedName = localStorage.getItem("evernear_guest_name");
            if (savedName) {
              setGuestName(savedName);
              setView("guest-space");
            } else {
              setView("guest-name");
            }
          } else {
            setLoading(false);
            setView("landing");
          }
        })
        .catch(() => {
          setLoading(false);
          setView("landing");
        });
      return;
    }
    const timer = setTimeout(() => setLoading(false), 4000);
    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timer);
      setUserId(data.session?.user?.id ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load spaces when userId changes
  useEffect(() => {
    if (!userId) {
      if (!isGuestView) setView("landing");
      return;
    }
    loadMySpaces()
      .then(async (spaces) => {
        if (spaces.length > 0) {
          const s = spaces[0];
          setDbSpace({ id: s.id, name: s.name, invite_code: s.invite_code });
          const mems = await loadMemories(s.id);
          setMemories(mems.map(dbToLocal));
          setView("dashboard");
        } else {
          setView("create-space");
        }
      })
      .catch(() => setView("create-space"));
  }, [userId]);

  // Real-time sync for owner
  useEffect(() => {
    if (!dbSpace) return;
    const channel = supabase
      .channel("owner-memories-" + dbSpace.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memories",
          filter: `space_id=eq.${dbSpace.id}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setMemories((ms) => {
              if (ms.find((m) => m.id === payload.new.id)) return ms;
              return [dbToLocal(payload.new), ...ms];
            });
          }
          if (payload.eventType === "DELETE") {
            setMemories((ms) => ms.filter((m) => m.id !== payload.old.id));
          }
          if (payload.eventType === "UPDATE") {
            setMemories((ms) =>
              ms.map((m) =>
                m.id === payload.new.id ? dbToLocal(payload.new) : m,
              ),
            );
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbSpace]);

  // Real-time sync for guest
  useEffect(() => {
    if (!guestSpace) return;
    const channel = supabase
      .channel("guest-memories-" + guestSpace.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memories",
          filter: `space_id=eq.${guestSpace.id}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setGuestMemories((ms) => {
              if (ms.find((m) => m.id === payload.new.id)) return ms;
              return [dbToLocal(payload.new), ...ms];
            });
          }
          if (payload.eventType === "DELETE") {
            setGuestMemories((ms) => ms.filter((m) => m.id !== payload.old.id));
          }
          if (payload.eventType === "UPDATE") {
            setGuestMemories((ms) =>
              ms.map((m) =>
                m.id === payload.new.id ? dbToLocal(payload.new) : m,
              ),
            );
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [guestSpace]);

  const handleAuth = useCallback(
    async (email: string, password: string, mode: "create" | "login") => {
      try {
        let user;
        if (mode === "create") user = await signUp(email, password);
        else user = await logIn(email, password);
        if (user) {
          setUserId(user.id);
          try {
            const spaces = await loadMySpaces();
            if (spaces.length > 0) {
              const s = spaces[0];
              setDbSpace({
                id: s.id,
                name: s.name,
                invite_code: s.invite_code,
              });
              const mems = await loadMemories(s.id);
              setMemories(mems.map(dbToLocal));
              setView("dashboard");
            } else {
              setView("create-space");
            }
          } catch {
            setView("create-space");
          }
        }
      } catch (e: any) {
        alert(e.message ?? "Something went wrong. Please try again.");
      }
    },
    [],
  );

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

  const handleToggleLike = useCallback(
    async (id: string) => {
      const mem = memories.find((m) => m.id === id);
      if (!mem) return;
      setMemories((ms) =>
        ms.map((m) => (m.id === id ? { ...m, liked: !m.liked } : m)),
      );
      setSel((s) => (s && s.id === id ? { ...s, liked: !s.liked } : s));
      try {
        await sbToggleLike(id, mem.liked);
      } catch {
        setMemories((ms) =>
          ms.map((m) => (m.id === id ? { ...m, liked: mem.liked } : m)),
        );
      }
    },
    [memories],
  );

  const handleSave = useCallback(
    async (item: MemoryItem) => {
      if (!dbSpace || !userId) {
        setMemories((ms) => [item, ...ms]);
        return;
      }
      try {
        let imagePath: string | undefined;
        if (item.image && item.image.startsWith("blob:")) {
          const res = await fetch(item.image);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `memory.${blob.type.split("/")[1] || "jpg"}`,
            { type: blob.type },
          );
          imagePath = await uploadPhoto(file, userId);
        }
        let voiceUrl: string | undefined;
        if (item.type === "voice" && item.url && item.url.startsWith("blob:")) {
          const res = await fetch(item.url);
          const blob = await res.blob();
          const file = new File([blob], `voice.webm`, { type: blob.type });
          voiceUrl = await uploadVoice(file, userId);
        }
        const saved = await addMemory({
          spaceId: dbSpace.id,
          type: item.type,
          title: item.title,
          caption: item.caption,
          url: item.type === "music" ? item.url : voiceUrl,
          imagePath,
          sharedBy: item.sharedBy,
        });
        setMemories((ms) => [dbToLocal(saved), ...ms]);
      } catch {
        setMemories((ms) => [item, ...ms]);
      }
    },
    [dbSpace, userId],
  );

  const handleGuestSave = useCallback(
    async (item: Omit<MemoryItem, "id" | "date" | "liked">) => {
      if (!guestSpace) return;
      setView("guest-space");
      try {
        let imagePath: string | undefined;
        if (item.image && item.image.startsWith("blob:")) {
          const res = await fetch(item.image);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `memory.${blob.type.split("/")[1] || "jpg"}`,
            { type: blob.type },
          );
          imagePath = await uploadPhoto(file, "guest_" + Date.now());
        }
        await addGuestMemory({
          spaceId: guestSpace.id,
          type: item.type,
          title: item.title,
          caption: item.caption,
          url: item.url,
          imagePath,
          sharedBy: item.sharedBy,
        });
        // Real-time will handle adding to guestMemories
      } catch (e: any) {
        console.error("Guest save failed:", e);
        alert("Failed to save memory. Please try again.");
      }
    },
    [guestSpace],
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Delete this memory? This can't be undone.")) return;
    setMemories((ms) => ms.filter((m) => m.id !== id));
    setView("dashboard");
    try {
      await deleteMemory(id);
    } catch {}
  }, []);

  const handleEdit = useCallback(async (updated: MemoryItem) => {
    setMemories((ms) => ms.map((m) => (m.id === updated.id ? updated : m)));
    setSel(updated);
    setView("detail");
    try {
      await updateMemory(updated.id, {
        title: updated.title,
        caption: updated.caption,
        url: updated.url,
        shared_by: updated.sharedBy,
      });
    } catch {}
  }, []);

  const space: Space = {
    id: dbSpace?.id ?? "",
    name: dbSpace?.name ?? "Our Moments",
    memories,
    inviteLink: dbSpace
      ? getInviteUrl(dbSpace.invite_code)
      : "myevernear.com/space/...",
    spaceCode: dbSpace?.invite_code,
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
            <div style={{ fontSize: 40, marginBottom: 20 }}>🤍</div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 22,
                color: "var(--cream)",
                opacity: 0.6,
              }}
            >
              Opening your space…
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      {/* GUEST FLOWS */}
      {view === "guest-name" && (
        <GuestNameView
          onDone={(name) => {
            setGuestName(name);
            setView("guest-space");
          }}
        />
      )}
      {view === "guest-space" && guestSpace && (
        <GuestSpaceView
          space={guestSpace}
          memories={guestMemories}
          guestName={guestName}
          onAddMemory={() => setView("guest-pick-type")}
          onSel={(m) => {
            setSel(m);
            setView("detail");
          }}
        />
      )}
      {view === "guest-pick-type" && (
        <div style={{ minHeight: "100vh", background: "var(--black)" }}>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              background: "rgba(11,10,9,.97)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,.042)",
              padding: "0 24px",
              height: 70,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Logo compact />
            <button
              onClick={() => setView("guest-space")}
              style={{
                background: "none",
                border: "none",
                color: "var(--c-dim)",
                cursor: "pointer",
                fontFamily: "'Jost',sans-serif",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
          </header>
          <TypePicker
            onPick={(t) => {
              setGuestMemType(t);
              setView("guest-add");
            }}
            onBack={() => setView("guest-space")}
          />
        </div>
      )}
      {view === "guest-add" && guestSpace && (
        <div style={{ minHeight: "100vh", background: "var(--black)" }}>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              background: "rgba(11,10,9,.97)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,.042)",
              padding: "0 24px",
              height: 70,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Logo compact />
          </header>
          <AddMemoryForm
            memType={guestMemType}
            sharedBy={guestName}
            onBack={() => setView("guest-pick-type")}
            onSave={async (item) => {
              await handleGuestSave(item);
            }}
          />
        </div>
      )}

      {/* OWNER FLOWS */}
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
      {view === "pick-type" && (
        <div style={{ minHeight: "100vh", background: "var(--black)" }}>
          <Header
            showBack
            onBack={() => setView("dashboard")}
            onNav={setView}
          />
          <TypePicker
            onPick={(t) => {
              setMemType(t);
              setView("add-memory");
            }}
            onBack={() => setView("dashboard")}
          />
        </div>
      )}
      {view === "add-memory" && (
        <div style={{ minHeight: "100vh", background: "var(--black)" }}>
          <Header
            showBack
            onBack={() => setView("pick-type")}
            onNav={setView}
          />
          <AddMemoryForm
            memType={memType}
            sharedBy=""
            onBack={() => setView("pick-type")}
            onSave={async (item) => {
              const full: MemoryItem = {
                ...item,
                id: Date.now().toString(),
                date: new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
                liked: false,
              };
              await handleSave(full);
              setView("dashboard");
            }}
          />
        </div>
      )}
      {view === "invite" && <InviteView space={space} onNav={setView} />}
      {view === "detail" && sel && (
        <DetailView
          mem={sel}
          onNav={setView}
          onLike={handleToggleLike}
          onDelete={handleDelete}
          isGuest={isGuestView}
        />
      )}
      {view === "edit" && sel && (
        <EditMemoryView mem={sel} onNav={setView} onSave={handleEdit} />
      )}
    </>
  );
}
