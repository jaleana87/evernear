import React, { useMemo, useState } from "react";

type View = "home" | "auth" | "create-space" | "space" | "add" | "invite" | "detail";
type MemoryType = "photo" | "video" | "note" | "voice" | "link" | "meme" | "milestone";

type Memory = {
  id: number;
  type: MemoryType;
  title: string;
  caption: string;
  sharedBy: string;
  date: string;
  length?: string;
  linkUrl?: string;
};

const GOLD = "#C9A24A";
const GOLD_SOFT = "#D6B76A";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [spaceName, setSpaceName] = useState("Our Family");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [filter, setFilter] = useState<"All" | MemoryType>("All");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: 1,
      type: "photo",
      title: "Family beach day",
      caption: "The kind of afternoon that feels like it should stay forever.",
      sharedBy: "Mom",
      date: "Today • 7:42 PM",
    },
    {
      id: 2,
      type: "video",
      title: "Wedding morning",
      caption: "The quiet moments before everything changed.",
      sharedBy: "Sarah",
      date: "June 18 • 8:11 AM",
      length: "0:18",
    },
    {
      id: 3,
      type: "voice",
      title: "Voice note from Mom",
      caption: "I just wanted to tell you I’m proud of you.",
      sharedBy: "Mom",
      date: "Yesterday • 9:14 AM",
      length: "0:31",
    },
    {
      id: 4,
      type: "note",
      title: "A note from Dad",
      caption: "I love you more than all the stars.",
      sharedBy: "Dad",
      date: "May 2 • 10:42 PM",
    },
    {
      id: 5,
      type: "meme",
      title: "Best friend meme",
      caption: "The exact thing that made us both laugh at 1:12am.",
      sharedBy: "Emma",
      date: "2 days ago",
    },
    {
      id: 6,
      type: "link",
      title: "Recipe Grandma always made",
      caption: "The one everybody asks for every single year.",
      sharedBy: "Nina",
      date: "Last week",
      linkUrl: "evernear.app/link/recipe",
    },
    {
      id: 7,
      type: "milestone",
      title: "First day of school",
      caption: "A big little moment we wanted to keep close.",
      sharedBy: "Dad",
      date: "September 4 • 7:30 AM",
    },
  ]);

  const [form, setForm] = useState({
    type: "photo" as MemoryType,
    title: "",
    caption: "",
    linkUrl: "",
    sharedBy: "",
  });

  const inviteLink = useMemo(() => "https://evernear.app/join/our-family", []);
  const currentSpaceName = spaceName.trim() || "Our Family";

  const addMemory = () => {
    if (!form.title.trim() || !form.caption.trim() || !form.sharedBy.trim()) return;
    const newMemory: Memory = {
      id: Date.now(),
      type: form.type,
      title: form.title.trim(),
      caption: form.caption.trim(),
      sharedBy: form.sharedBy.trim(),
      date: "Just now",
      linkUrl: form.linkUrl.trim() || undefined,
    };
    setMemories((prev) => [newMemory, ...prev]);
    setSelectedMemory(newMemory);
    setForm({ type: "photo", title: "", caption: "", linkUrl: "", sharedBy: "" });
    setView("detail");
  };

  const visibleMemories = filter === "All" ? memories : memories.filter((m) => m.type === filter);

  const heart = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={GOLD} aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  const LogoPlaceholder = () => (
    <div className="w-[170px] h-[48px] rounded-xl border border-[#C9A24A]/25 bg-white/[0.03] flex items-center justify-center px-3 text-[10px] tracking-[0.24em] uppercase text-[#D6B76A] text-center">
      UPLOAD EVERNEAR LOGO HERE
    </div>
  );

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-[1.6rem] border border-white/6 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );

  const TextButton = ({
    children,
    onClick,
    active = false,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase border transition ${
        active
          ? "bg-[#C9A24A] border-[#C9A24A] text-[#090909]"
          : "bg-white/[0.02] border-white/8 text-[#A8A39A] hover:text-[#F3E7D0] hover:border-[#C9A24A]/25"
      }`}
    >
      {children}
    </button>
  );

  const selectedPreviewByType = (type: MemoryType) => {
    switch (type) {
      case "photo":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#6b4b24] via-[#bd9160] to-[#1a120d]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_70%_40%,rgba(255,236,210,0.12),transparent_22%)]" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="px-2.5 py-1 rounded-full bg-black/45 text-[10px] tracking-[0.2em] uppercase text-[#F3E7D0]">
                Family beach day
              </div>
              <div className="w-8 h-8 rounded-full bg-black/35 border border-white/10 flex items-center justify-center text-[#C9A24A]">
                ♥
              </div>
            </div>
          </div>
        );
      case "video":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#201717] via-[#3d2b1a] to-[#0f0f0f]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(214,183,106,0.18),transparent_40%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="w-0 h-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-[#D6B76A] ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="px-2.5 py-1 rounded-full bg-black/45 text-[10px] tracking-[0.2em] uppercase text-[#F3E7D0]">
                Wedding morning
              </div>
              <div className="px-2.5 py-1 rounded-full bg-black/45 text-[10px] tracking-[0.18em] uppercase text-[#F3E7D0]">
                0:18
              </div>
            </div>
          </div>
        );
      case "voice":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#0a0a0a] flex flex-col items-center justify-center">
            <div className="flex items-end gap-1 h-14 mb-4">
              {[10, 18, 7, 22, 13, 9, 16, 8].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] bg-[#D6B76A] rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }}
                />
              ))}
            </div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Voice note from Mom</div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#F3E7D0]">0:31</div>
              <div className="text-[#C9A24A]">♥</div>
            </div>
          </div>
        );
      case "note":
        return (
          <div className="absolute inset-0 bg-[#f3e7d0] text-[#24180f] p-5">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#8a6f41]">Saved note</div>
            <div className="mt-5 font-serif text-[1.2rem] leading-8">
              “I love you more than all the stars.”
            </div>
            <div className="mt-6 text-[10px] tracking-[0.18em] uppercase text-[#8a6f41]">Signed by Dad</div>
          </div>
        );
      case "link":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#090909] p-4">
            <div className="h-full rounded-[1rem] border border-white/6 bg-white/[0.03] p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Saved link</div>
                <div className="mt-3 font-serif text-[1.3rem] leading-tight text-[#F3E7D0]">
                  Recipe Grandma always made
                </div>
              </div>
              <div className="rounded-[0.9rem] bg-[#151515] border border-white/6 p-3">
                <div className="text-[10px] tracking-[0.18em] uppercase text-[#C9A24A]">evernear.link/recipe</div>
                <div className="mt-2 text-[12px] leading-6 text-[#A8A39A]">
                  Saved privately in the space.
                </div>
              </div>
            </div>
          </div>
        );
      case "meme":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#241915] via-[#4a3520] to-[#101010] p-4">
            <div className="h-full rounded-[1rem] border border-white/8 bg-black/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.08),transparent_30%)]" />
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/45 text-[10px] tracking-[0.2em] uppercase text-[#F3E7D0]">
                Meme
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="rounded-[1rem] bg-black/35 backdrop-blur-sm border border-white/10 p-3">
                  <div className="text-[10px] tracking-[0.22em] uppercase text-[#D6B76A]">Shared by Emma</div>
                  <div className="mt-2 text-sm text-[#F3E7D0]">
                    The exact thing that made us both laugh at 1:12am.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "milestone":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1620] via-[#251b13] to-[#0f0f0f] p-4">
            <div className="h-full rounded-[1rem] border border-white/6 bg-[radial-gradient(circle_at_top,rgba(201,164,74,0.12),transparent_42%)] p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Milestone memory</div>
                <div className="mt-3 font-serif text-[1.35rem] leading-tight text-[#F3E7D0]">
                  First day of school
                </div>
              </div>
              <div className="flex items-center justify-between text-[#C9A24A]">
                <span className="text-[10px] tracking-[0.2em] uppercase">Kept close</span>
                <span>♥</span>
              </div>
            </div>
          </div>
        );
    }
  };

  const MemoryCard = ({ memory }: { memory: Memory }) => (
    <button
      onClick={() => {
        setSelectedMemory(memory);
        setView("detail");
      }}
      className="text-left group"
    >
      <Card className="overflow-hidden hover:border-[#C9A24A]/25 transition">
        <div className="aspect-[4/3] relative">{selectedPreviewByType(memory.type)}</div>
        <div className="p-5">
          <div className="font-serif text-xl tracking-[-0.03em] text-[#F3E7D0] group-hover:text-[#D6B76A] transition">
            {memory.title}
          </div>
          <div className="mt-2 text-sm leading-6 text-[#A8A39A]">{memory.caption}</div>
          <div className="mt-4 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-[#8a857a]">
            <span>Shared by {memory.sharedBy}</span>
            <span>{memory.date}</span>
          </div>
          <div className="mt-3 text-[#C9A24A]">{heart()}</div>
        </div>
      </Card>
    </button>
  );

  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button onClick={() => setView("home")} className="flex items-center gap-4">
          <LogoPlaceholder />
          <div className="text-left">
            <div className="font-serif text-3xl tracking-[0.22em] text-[#F3E7D0]">EVERNEAR</div>
            <div className="mt-1 text-[10px] tracking-[0.28em] uppercase text-[#8a857a]">
              Moments shared privately.
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => setView("home")} className="px-3 py-2 text-[11px] tracking-[0.22em] uppercase text-[#A8A39A] hover:text-[#F3E7D0]">
            Home
          </button>
          <button onClick={() => setView("auth")} className="px-3 py-2 text-[11px] tracking-[0.22em] uppercase text-[#A8A39A] hover:text-[#F3E7D0]">
            Log In
          </button>
          <button
            onClick={() => setView("create-space")}
            className="ml-3 px-5 py-2.5 rounded-full bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.24em] uppercase"
          >
            Create Your EverNear
          </button>
        </div>
      </div>
    </header>
  );

  const DEMO_MEMORIES = [
    { type: "photo" as MemoryType, title: "Family beach day", caption: "The kind of afternoon that feels like it should stay close forever.", sharedBy: "Maya", date: "Today • 7:42 PM" },
    { type: "video" as MemoryType, title: "Wedding morning", caption: "Captured before everything began. The light through the window was perfect.", sharedBy: "Elena", date: "May 18 • 8:02 AM" },
    { type: "voice" as MemoryType, title: "Voice note from Mom", caption: "A little message I wanted to keep instead of letting it disappear in a thread.", sharedBy: "Mom", date: "Yesterday • 9:14 AM" },
    { type: "note" as MemoryType, title: "I love you more than all the stars.", caption: "Written at 2am, sent just because.", sharedBy: "Jordan", date: "3 days ago" },
    { type: "meme" as MemoryType, title: "The one that made us laugh", caption: "The exact thing that made everyone laugh at exactly the right moment.", sharedBy: "Chris", date: "Last week" },
    { type: "link" as MemoryType, title: "The song we played on repeat", caption: "Found it again after years. Saved so we never lose it.", sharedBy: "Sam", date: "2 weeks ago", linkUrl: "https://open.spotify.com/track/example" },
  ];

  const MemoryCardVisual = ({ type, title }: { type: MemoryType; title: string }) => {
    if (type === "photo") return (
      <div className="aspect-[4/3] rounded-[1.2rem] bg-gradient-to-br from-[#624425] via-[#ab8150] to-[#17110c] relative overflow-hidden border border-white/6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_30%)]" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="px-2.5 py-1 rounded-full bg-black/45 text-[10px] tracking-widest uppercase text-[#F3E7D0]">Photo</div>
          <div className="text-[#C9A24A]">♥</div>
        </div>
      </div>
    );
    if (type === "video") return (
      <div className="aspect-[4/3] rounded-[1.2rem] bg-[#151515] relative overflow-hidden border border-white/6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(214,183,106,0.16),transparent_40%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-[#D6B76A] ml-1" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-[10px] tracking-widest uppercase text-[#F3E7D0]">0:18</div>
      </div>
    );
    if (type === "voice") return (
      <div className="aspect-[4/3] rounded-[1.2rem] bg-gradient-to-br from-[#151515] to-[#0b0b0b] relative overflow-hidden border border-white/6 flex flex-col items-center justify-center gap-3">
        <div className="flex items-end gap-1 h-10">
          {[5,8,4,9,6,3,7,5,8,4].map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-[#D6B76A] animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Voice note</div>
      </div>
    );
    if (type === "note") return (
      <div className="aspect-[4/3] rounded-[1.2rem] bg-[#f3e7d0] relative overflow-hidden border border-white/6 p-5 flex flex-col justify-between">
        <div className="text-[10px] tracking-[0.2em] uppercase text-[#8a6f41]">Note</div>
        <div className="font-serif text-xl leading-8 text-[#2a2015]">"{title}"</div>
        <div className="text-[10px] text-[#8a6f41]">Saved privately</div>
      </div>
    );
    if (type === "meme") return (
      <div className="aspect-[4/3] rounded-[1.2rem] bg-gradient-to-br from-[#201614] via-[#46311f] to-[#101010] relative overflow-hidden border border-white/6 flex flex-col justify-end p-4">
        <div className="rounded-[1rem] bg-black/40 backdrop-blur-sm border border-white/10 p-3">
          <div className="text-[10px] tracking-[0.22em] uppercase text-[#D6B76A]">Meme</div>
          <div className="mt-1 text-sm text-[#F3E7D0]">The exact thing that made everyone laugh.</div>
        </div>
      </div>
    );
    return (
      <div className="aspect-[4/3] rounded-[1.2rem] bg-gradient-to-br from-[#121212] to-[#090909] relative overflow-hidden border border-white/6 p-4 flex flex-col justify-between">
        <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Link</div>
        <div>
          <div className="font-serif text-lg text-[#F3E7D0] leading-tight mb-3">{title}</div>
          <div className="rounded-xl bg-[#111] border border-white/5 p-3">
            <div className="text-[10px] tracking-widest uppercase text-[#C9A24A]">open.spotify.com</div>
            <div className="mt-1 text-[11px] text-[#A8A39A]">Saved in your space</div>
          </div>
        </div>
      </div>
    );
  };

  const Home = () => (
    <main className="pt-20">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,74,0.14),transparent_35%),linear-gradient(180deg,#090909_0%,#0b0b0b_45%,#080808_100%)]" />
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] rounded-full bg-[#C9A24A] blur-[180px] opacity-[0.07]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div>
              <div className="flex items-center gap-4">
                <LogoPlaceholder />
                <div>
                  <div className="font-serif text-3xl tracking-[0.22em] text-[#F3E7D0]">EVERNEAR</div>
                  <div className="mt-1 text-[10px] tracking-[0.28em] uppercase text-[#8a857a]">Moments shared privately.</div>
                </div>
              </div>
              <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#C9A24A]/18 bg-white/[0.02] text-[10px] tracking-[0.3em] uppercase text-[#A8A39A]">
                A private place for the best parts <span>{heart()}</span>
              </div>
              <h1 className="mt-8 font-serif text-5xl sm:text-6xl lg:text-[5.6rem] leading-[0.95] tracking-[-0.06em] text-[#F3E7D0]">
                The moments you never want buried.
              </h1>
              <p className="mt-6 max-w-2xl text-base sm:text-lg lg:text-xl leading-8 text-[#A8A39A]">
                Photos, videos, notes, voice messages, memes, and links — saved with the people who matter.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button onClick={() => setView("create-space")} className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] sm:text-xs tracking-[0.28em] uppercase shadow-[0_18px_40px_rgba(201,164,74,0.16)] hover:brightness-110 transition">
                  Create Your EverNear
                </button>
                <button onClick={() => setView("auth")} className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-[#C9A24A]/25 text-[#F3E7D0] text-[11px] sm:text-xs tracking-[0.28em] uppercase hover:bg-white/[0.04] transition">
                  Log In
                </button>
              </div>
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] tracking-[0.18em] uppercase text-[#8a857a]">
                {["Private by design", "Only with your people", "Moments > Messages", "Yours, always"].map((item) => (
                  <div key={item} className="rounded-full border border-white/6 bg-white/[0.02] px-4 py-3">{item}</div>
                ))}
              </div>
            </div>
            <Card className="p-6 sm:p-8">
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
                A private home for the best parts <span>{heart()}</span>
              </div>
              <div className="mt-5 space-y-4">
                {["Photos that feel worth saving", "Voice messages that mean something later", "Notes, links, and memes you actually want to keep", "A calm space shared only with invited people"].map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-white/6 bg-white/[0.02] p-4 text-sm leading-7 text-[#A8A39A]">{item}</div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── WHAT YOUR EVERNEAR CAN HOLD ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-12">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A24A] flex items-center gap-2 mb-4">
            What your EverNear can hold <span>{heart()}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.05em] text-[#F3E7D0]">Six ways to save what matters.</h2>
          <p className="mt-4 text-[#A8A39A] leading-7 max-w-2xl">Photos, videos, voice notes, written notes, links, and memes — all in one calm private space.</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {DEMO_MEMORIES.map((m) => (
            <button
              key={m.title}
              onClick={() => setView("space")}
              className="text-left group"
            >
              <Card className="overflow-hidden hover:border-[#C9A24A]/30 transition">
                <MemoryCardVisual type={m.type} title={m.title} />
                <div className="p-5">
                  <div className="font-serif text-xl tracking-[-0.03em] text-[#F3E7D0] group-hover:text-[#D6B76A] transition">{m.title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#A8A39A]">{m.caption}</div>
                  <div className="mt-4 flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-[#8a857a]">
                    <span>Shared by {m.sharedBy}</span>
                    <span>{m.date}</span>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button onClick={() => setView("space")} className="px-8 py-4 rounded-full bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase hover:brightness-110 transition shadow-[0_18px_40px_rgba(201,164,74,0.14)]">
            See Your Space
          </button>
        </div>
      </section>

      {/* ── ADD A MEMORY ─────────────────────────────────────── */}
      <section className="bg-white/[0.02] border-y border-white/5 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A24A] flex items-center gap-2 mb-4">
              Add a memory <span>{heart()}</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.05em] text-[#F3E7D0]">Save a moment right now.</h2>
            <p className="mt-4 text-[#A8A39A] leading-7">Choose the type, fill in a few words, and it's saved privately in your space.</p>
          </div>

          <Card className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Memory type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as MemoryType }))}
                className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 text-[#F3E7D0]"
              >
                {(["photo", "video", "note", "voice", "link", "meme"] as MemoryType[]).map((t) => (
                  <option key={t} value={t} className="bg-[#111]">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 rounded-[1rem] border border-white/8 bg-[#111] px-4 py-4 text-sm text-[#A8A39A] hover:border-[#C9A24A]/30 hover:text-[#F3E7D0] transition">
                <span className="text-lg">📎</span> Upload photo / video
              </button>
              <button className="flex items-center justify-center gap-2 rounded-[1rem] border border-white/8 bg-[#111] px-4 py-4 text-sm text-[#A8A39A] hover:border-[#C9A24A]/30 hover:text-[#F3E7D0] transition">
                <span className="text-lg">🎙</span> Record voice note
              </button>
            </div>

            <div>
              <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Paste a link</label>
              <input
                value={form.linkUrl}
                onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#555] text-[#F3E7D0]"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#555] text-[#F3E7D0]"
                placeholder="Family beach day"
              />
            </div>

            <div>
              <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Write a note / caption</label>
              <textarea
                value={form.caption}
                onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
                className="w-full min-h-28 bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#555] text-[#F3E7D0]"
                placeholder="A few words about this moment..."
              />
            </div>

            <div>
              <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Shared by</label>
              <input
                value={form.sharedBy}
                onChange={(e) => setForm((p) => ({ ...p, sharedBy: e.target.value }))}
                className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#555] text-[#F3E7D0]"
                placeholder="Mom"
              />
            </div>

            <button
              onClick={addMemory}
              className="w-full py-4 rounded-[1rem] bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase hover:brightness-110 transition"
            >
              Save Memory
            </button>
          </Card>
        </div>
      </section>

      {/* ── MY EVERNEAR SPACE DASHBOARD ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2 mb-4">
              Your private EverNear space <span>{heart()}</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.05em] text-[#F3E7D0]">Our Moments</h2>
            <p className="mt-4 max-w-2xl text-[#A8A39A] leading-7">Everything saved. Private, calm, and always yours.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView("invite")} className="px-5 py-3 rounded-full border border-[#C9A24A]/25 text-[11px] tracking-[0.24em] uppercase text-[#F3E7D0] hover:bg-white/[0.04] transition">
              Invite People
            </button>
            <button onClick={() => setView("add")} className="px-5 py-3 rounded-full bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.24em] uppercase hover:brightness-110 transition">
              Add Memory
            </button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {(["All", "Photos", "Videos", "Notes", "Voice", "Links", "Memes"] as const).map((tab) => {
            const mapped = tab === "Photos" ? "photo" : tab === "Videos" ? "video" : tab === "Notes" ? "note" : tab === "Voice" ? "voice" : tab === "Links" ? "link" : tab === "Memes" ? "meme" : "All";
            return (
              <TextButton key={tab} active={filter === mapped} onClick={() => setFilter(mapped as any)}>
                {tab}
              </TextButton>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleMemories.map((memory) => (
            <div key={memory.id} onClick={() => { setSelectedMemory(memory); setView("detail"); }} className="text-left group cursor-pointer">
              <Card className="overflow-hidden hover:border-[#C9A24A]/25 transition">
                <MemoryCardVisual type={memory.type} title={memory.title} />
                <div className="p-5">
                  <div className="font-serif text-xl tracking-[-0.03em] text-[#F3E7D0] group-hover:text-[#D6B76A] transition">{memory.title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#A8A39A]">{memory.caption}</div>
                  <div className="mt-4 flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-[#8a857a]">
                    <span>Shared by {memory.sharedBy}</span>
                    <span>{memory.date}</span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          <button onClick={() => setView("add")} className="rounded-[1.6rem] border border-dashed border-[#C9A24A]/25 bg-white/[0.02] min-h-[260px] p-6 text-left flex flex-col justify-between hover:bg-white/[0.03] transition">
            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[#A8A39A]">Add memory</div>
              <div className="mt-4 font-serif text-3xl leading-tight text-[#F3E7D0]">Keep another good thing close.</div>
            </div>
            <div className="text-[#C9A24A] text-sm">Create a memory →</div>
          </button>
        </div>
      </section>
    </main>
  );

  const Auth = () => (
    <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <LogoPlaceholder />
          <div>
            <div className="font-serif text-3xl tracking-[0.22em] text-[#F3E7D0]">EVERNEAR</div>
            <div className="mt-1 text-[10px] tracking-[0.28em] uppercase text-[#8a857a]">
              Moments shared privately.
            </div>
          </div>
        </div>

        <h2 className="mt-8 font-serif text-4xl tracking-[-0.04em] text-[#F3E7D0]">Welcome back</h2>
        <p className="mt-3 text-[#A8A39A] leading-7">Log in or create your EverNear space to continue.</p>

        <div className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
            placeholder="Password"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setView("create-space")}
              className="flex-1 py-4 rounded-[1rem] bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
            >
              Continue
            </button>
            <button
              onClick={() => setView("create-space")}
              className="flex-1 py-4 rounded-[1rem] border border-[#C9A24A]/25 text-[11px] tracking-[0.28em] uppercase text-[#F3E7D0]"
            >
              Create Account
            </button>
          </div>
        </div>
      </Card>
    </main>
  );

  const CreateSpace = () => (
    <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <Card className="p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
          Create a private space <span>{heart()}</span>
        </div>
        <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-[#F3E7D0]">Name your EverNear space</h2>
        <p className="mt-3 text-[#A8A39A] leading-7">Examples: Our Family, Mom &amp; Me, Wedding Day, For Dad.</p>

        <div className="mt-8 space-y-4">
          <input
            value={spaceName}
            onChange={(e) => setSpaceName(e.target.value)}
            className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
            placeholder="Space name"
          />
          <button
            onClick={() => setView("space")}
            className="w-full py-4 rounded-[1rem] bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
          >
            Create Space
          </button>
        </div>
      </Card>
    </main>
  );

  const Space = () => (
    <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
            Your private space <span>{heart()}</span>
          </div>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl tracking-[-0.05em] text-[#F3E7D0]">
            {currentSpaceName}
          </h1>
          <p className="mt-4 max-w-2xl text-[#A8A39A] leading-7">
            The moments you never want buried. Photos, videos, notes, voice messages, memes, and links — saved with the people who matter.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setView("invite")}
            className="px-5 py-3 rounded-full border border-[#C9A24A]/25 text-[11px] tracking-[0.24em] uppercase text-[#F3E7D0]"
          >
            Invite
          </button>
          <button
            onClick={() => setView("add")}
            className="px-5 py-3 rounded-full bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.24em] uppercase"
          >
            Add Memory
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-2 flex-wrap">
        {(["All", "Photos", "Videos", "Notes", "Voice", "Links", "Memes"] as const).map((tab) => {
          const mapped =
            tab === "Photos" ? "photo" :
            tab === "Videos" ? "video" :
            tab === "Notes" ? "note" :
            tab === "Voice" ? "voice" :
            tab === "Links" ? "link" :
            tab === "Memes" ? "meme" :
            "All";
          return (
            <TextButton key={tab} active={filter === mapped} onClick={() => setFilter(mapped as any)}>
              {tab}
            </TextButton>
          );
        })}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleMemories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}

        <button
          onClick={() => setView("add")}
          className="rounded-[1.6rem] border border-dashed border-[#C9A24A]/25 bg-white/[0.02] min-h-[260px] p-6 text-left flex flex-col justify-between hover:bg-white/[0.03] transition"
        >
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-[#A8A39A]">Add memory</div>
            <div className="mt-4 font-serif text-3xl leading-tight text-[#F3E7D0]">
              Keep another good thing close.
            </div>
          </div>
          <div className="text-[#C9A24A] text-sm">Create a memory →</div>
        </button>
      </div>
    </main>
  );

  const AddMemory = () => (
    <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Card className="p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
          Add memory <span>{heart()}</span>
        </div>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.05em] text-[#F3E7D0]">Save a moment</h1>
        <p className="mt-3 text-[#A8A39A] leading-7">
          Add a meaningful memory to your private space.
        </p>

        <div className="mt-8 space-y-5">
          <div className="rounded-[1.3rem] border border-white/6 bg-white/[0.02] p-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Upload photo</div>
            <div className="mt-2 text-sm text-[#A8A39A]">Add a warm family, couple, or friend moment.</div>
          </div>
          <div className="rounded-[1.3rem] border border-white/6 bg-white/[0.02] p-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Upload video</div>
            <div className="mt-2 text-sm text-[#A8A39A]">Keep a moving moment with sound and motion.</div>
          </div>
          <div className="rounded-[1.3rem] border border-white/6 bg-white/[0.02] p-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Record voice message</div>
            <div className="mt-2 text-sm text-[#A8A39A]">Save a voice note from someone you love.</div>
          </div>
          <div className="rounded-[1.3rem] border border-white/6 bg-white/[0.02] p-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Write note</div>
            <div className="mt-2 text-sm text-[#A8A39A]">Write a journal-style memory or heartfelt message.</div>
          </div>
          <div className="rounded-[1.3rem] border border-white/6 bg-white/[0.02] p-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Paste link</div>
            <div className="mt-2 text-sm text-[#A8A39A]">Save a recipe, song, article, or shared link.</div>
          </div>
          <div className="rounded-[1.3rem] border border-white/6 bg-white/[0.02] p-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Add meme / image</div>
            <div className="mt-2 text-sm text-[#A8A39A]">Store the funny things you actually want to keep.</div>
          </div>

          <div className="rounded-[1.3rem] border border-[#C9A24A]/20 bg-white/[0.03] p-5 space-y-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Memory details</div>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as MemoryType }))}
              className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none"
            >
              {(["photo", "video", "note", "voice", "link", "meme", "milestone"] as MemoryType[]).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none placeholder:text-[#666]"
              placeholder="Title"
            />
            <textarea
              value={form.caption}
              onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
              className="w-full min-h-28 bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none placeholder:text-[#666]"
              placeholder="Caption / note"
            />
            <input
              value={form.linkUrl}
              onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
              className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none placeholder:text-[#666]"
              placeholder="Link URL optional"
            />
            <input
              value={form.sharedBy}
              onChange={(e) => setForm((p) => ({ ...p, sharedBy: e.target.value }))}
              className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none placeholder:text-[#666]"
              placeholder="Shared by"
            />
            <button
              onClick={addMemory}
              className="w-full py-4 rounded-[1rem] bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
            >
              Save Memory
            </button>
          </div>

          <button
            onClick={() => setView("space")}
            className="w-full py-4 rounded-[1rem] border border-[#C9A24A]/25 text-[11px] tracking-[0.28em] uppercase text-[#F3E7D0]"
          >
            Back to Space
          </button>
        </div>
      </Card>
    </main>
  );

  const Invite = () => (
    <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Card className="p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
          Invite people <span>{heart()}</span>
        </div>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.05em] text-[#F3E7D0]">Invite people to this space</h1>
        <p className="mt-3 text-[#A8A39A] leading-7">
          Only people with this link can add to this space.
        </p>

        <div className="mt-8 rounded-[1.4rem] border border-white/6 bg-white/[0.03] p-5">
          <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Invite link</div>
          <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 rounded-[1rem] bg-[#111] border border-white/8 px-4 py-4 text-sm text-[#F3E7D0] break-all">
              {inviteLink}
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteLink);
                } catch {}
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 1500);
              }}
              className="px-5 py-4 rounded-[1rem] bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
            >
              {inviteCopied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-sm text-[#A8A39A] leading-7">
          Only people with this link can add to this space.
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setView("space")}
            className="px-5 py-3 rounded-full border border-[#C9A24A]/25 text-[11px] tracking-[0.24em] uppercase text-[#F3E7D0]"
          >
            Back to Space
          </button>
          <button
            onClick={() => setView("add")}
            className="px-5 py-3 rounded-full bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.24em] uppercase"
          >
            Add Memory
          </button>
        </div>
      </Card>
    </main>
  );

  const Detail = () => {
    const m = selectedMemory || memories[0];

    return (
      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <button
          onClick={() => setView("space")}
          className="mb-5 text-[11px] tracking-[0.24em] uppercase text-[#A8A39A] hover:text-[#F3E7D0]"
        >
          ← Back
        </button>

        <Card className="overflow-hidden">
          <div className="aspect-[16/9] relative">
            {selectedPreviewByType(m.type)}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">
              <span>Type: {m.type}</span>
              <span className="text-[#C9A24A]">•</span>
              <span>Shared privately</span>
            </div>

            <h2 className="mt-4 font-serif text-3xl sm:text-4xl tracking-[-0.05em] text-[#F3E7D0]">
              {m.title}
            </h2>
            <p className="mt-4 text-[#A8A39A] leading-7 max-w-3xl">{m.caption}</p>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Shared by</div>
                <div className="mt-2 text-[#F3E7D0]">{m.sharedBy}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Date</div>
                <div className="mt-2 text-[#F3E7D0]">{m.date}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Saved as</div>
                <div className="mt-2 text-[#F3E7D0] capitalize">{m.type}</div>
              </div>
            </div>

            {m.linkUrl && (
              <div className="mt-6 rounded-[1.3rem] border border-[#C9A24A]/18 bg-white/[0.03] p-5">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Link</div>
                <div className="mt-2 text-[#F3E7D0] break-all">{m.linkUrl}</div>
              </div>
            )}
          </div>
        </Card>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F3E7D0] antialiased">
      <Header />
      {view === "home" && <Home />}
      {view === "auth" && <Auth />}
      {view === "create-space" && <CreateSpace />}
      {view === "space" && <Space />}
      {view === "add" && <AddMemory />}
      {view === "invite" && <Invite />}
      {view === "detail" && <Detail />}
      <footer className="border-t border-white/6 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-7xl mx-auto text-[10px] tracking-[0.28em] uppercase text-[#8a857a] flex items-center justify-center gap-2 flex-wrap">
          <span>{heart()}</span>
          <span>© My EverNear — Moments shared privately.</span>
          <span>{heart()}</span>
        </div>
      </footer>
    </div>
  );
}
