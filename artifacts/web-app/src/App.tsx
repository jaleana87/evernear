import React, { useMemo, useState } from "react";

type View = "home" | "login" | "space" | "add" | "invite" | "detail";

type MemoryType = "photo" | "video" | "note" | "voice" | "link" | "meme";

type Memory = {
  id: number;
  type: MemoryType;
  title: string;
  caption: string;
  sharedBy: string;
  date: string;
  preview?: string;
};

const GOLD = "#C9A24A";
const GOLD_SOFT = "#D6B76A";
const CREAM = "#F3E7D0";
const MUTED = "#A8A39A";

const Heart = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={GOLD} className="inline opacity-60">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

function App() {
  const [view, setView] = useState<View>("home");
  const [spaceName, setSpaceName] = useState("Our Space");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: 1,
      type: "photo",
      title: "Family beach day",
      caption: "The wind was strong and everyone was laughing anyway.",
      sharedBy: "Maya",
      date: "Today • 7:42 PM",
    },
    {
      id: 2,
      type: "voice",
      title: "Voice note from Mom",
      caption: "Saved because the last line made me tear up a little.",
      sharedBy: "Mom",
      date: "Yesterday • 9:14 AM",
    },
    {
      id: 3,
      type: "meme",
      title: "Best friend meme",
      caption: "The exact thing we both needed after a long week.",
      sharedBy: "Jordan",
      date: "2 days ago",
    },
    {
      id: 4,
      type: "note",
      title: "Wedding morning",
      caption: "A note written before the day started.",
      sharedBy: "Elena",
      date: "May 18 • 8:02 AM",
    },
  ]);

  const [form, setForm] = useState({
    type: "photo" as MemoryType,
    title: "",
    caption: "",
    sharedBy: "",
    preview: "",
  });

  const sampleInviteLink = useMemo(() => "evernear.app/join/our-space", []);

  const heroBlobs = (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,74,0.14),transparent_35%),linear-gradient(180deg,#090909_0%,#0b0b0b_45%,#080808_100%)]" />
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full bg-[#C9A24A] blur-[180px] opacity-[0.07]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:28px_28px]" />
    </>
  );

  const onCopyInvite = async () => {
    try {
    await navigator.clipboard.writeText(`https://${sampleInviteLink}`);
    } catch {}
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 1800);
  };

  const goHome = () => setView("home");

  const addMemory = () => {
    if (!form.title.trim() || !form.caption.trim() || !form.sharedBy.trim()) return;
    const newMemory: Memory = {
      id: Date.now(),
      type: form.type,
      title: form.title.trim(),
      caption: form.caption.trim(),
      sharedBy: form.sharedBy.trim(),
      date: "Just now",
      preview: form.preview.trim(),
    };
    setMemories((prev) => [newMemory, ...prev]);
    setSelectedMemory(newMemory);
    setForm({ type: "photo", title: "", caption: "", sharedBy: "", preview: "" });
    setView("detail");
  };

  const LogoMark = () => (
    <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/[0.03] flex items-center justify-center overflow-hidden">
      <div className="w-full h-full bg-[radial-gradient(circle_at_50%_30%,rgba(201,164,74,0.14),transparent_45%)] flex items-center justify-center">
        <div className="w-6 h-6 rounded-md bg-[#C9A24A]/12 border border-[#C9A24A]/25" />
      </div>
    </div>
  );

  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button onClick={goHome} className="flex items-center gap-3">
          <LogoMark />
          <div className="text-left">
            <div className="font-serif text-lg tracking-[0.28em] text-[#F3E7D0]">EVERNEAR</div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#8a857a]">Moments shared privately.</div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1 text-[11px] tracking-[0.24em] uppercase text-[#A8A39A]">
          <button onClick={() => setView("home")} className="px-3 py-2 hover:text-[#F3E7D0] transition">
            Home
          </button>
          <button onClick={() => setView("space")} className="px-3 py-2 hover:text-[#F3E7D0] transition">
            My Space
          </button>
          <button onClick={() => setView("invite")} className="px-3 py-2 hover:text-[#F3E7D0] transition">
            Invite People
          </button>
          <button onClick={() => setView("login")} className="px-3 py-2 hover:text-[#F3E7D0] transition">
            Log In
          </button>
          <button
            onClick={() => setView("add")}
            className="ml-3 px-5 py-2.5 rounded-full bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] hover:brightness-110 transition shadow-[0_18px_35px_rgba(201,164,74,0.14)]"
          >
            Create Space
          </button>
        </nav>
      </div>
    </header>
  );

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-[1.8rem] border border-white/6 bg-white/[0.03] shadow-[0_20px_70px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );

  const TypePill = ({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase border transition ${
        active
          ? "bg-[#C9A24A] border-[#C9A24A] text-[#090909]"
          : "bg-white/[0.02] border-white/8 text-[#A8A39A] hover:border-[#C9A24A]/25 hover:text-[#F3E7D0]"
      }`}
    >
      {label}
    </button>
  );

  const MemoryCard = ({ memory }: { memory: Memory }) => {
    const previewClass =
      memory.type === "photo"
        ? "bg-gradient-to-br from-[#7a5530] via-[#b58a53] to-[#1a120d]"
        : memory.type === "video"
        ? "bg-[#141414] relative"
        : memory.type === "note"
        ? "bg-[#f1e3cb] text-[#23170d]"
        : memory.type === "voice"
        ? "bg-gradient-to-br from-[#1b1b1b] to-[#0d0d0d]"
        : memory.type === "link"
        ? "bg-gradient-to-br from-[#151111] to-[#0c0c0c]"
        : "bg-gradient-to-br from-[#241915] via-[#4a3520] to-[#121212]";

    const previewLabel =
      memory.type === "photo"
        ? "Family beach day"
        : memory.type === "video"
        ? "Sunset video"
        : memory.type === "note"
        ? "Wedding morning"
        : memory.type === "voice"
        ? "Voice note from Mom"
        : memory.type === "link"
        ? "Helpful link"
        : "Best friend meme";

    return (
      <button
        onClick={() => {
          setSelectedMemory(memory);
          setView("detail");
        }}
        className="text-left group"
      >
        <Card className="overflow-hidden hover:border-[#C9A24A]/25 transition">
          <div className={`aspect-[4/3] ${previewClass} p-4 border-b border-white/5`}>
            <div className="h-full rounded-[1.2rem] border border-white/10 bg-black/10 overflow-hidden relative">
              {memory.type === "photo" && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
              )}
              {memory.type === "video" && (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(214,183,106,0.18),transparent_35%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-[#D6B76A] ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-[10px] uppercase tracking-[0.16em] text-[#F3E7D0]">
                    0:18
                  </div>
                </>
              )}
              {memory.type === "note" && (
                <div className="p-4 h-full">
                  <div className="text-[10px] tracking-[0.2em] uppercase text-[#8a6f41]">Handwritten note</div>
                  <div className="mt-4 font-serif text-lg leading-8 text-[#2a2015]">
                    “The kind of day we keep close.”
                  </div>
                </div>
              )}
              {memory.type === "voice" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-end gap-1 h-12">
                    <span className="w-[3px] h-5 bg-[#D6B76A] rounded-full animate-pulse" />
                    <span className="w-[3px] h-8 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:100ms]" />
                    <span className="w-[3px] h-4 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:200ms]" />
                    <span className="w-[3px] h-9 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-[3px] h-6 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:400ms]" />
                    <span className="w-[3px] h-3 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:500ms]" />
                  </div>
                  <div className="mt-4 text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">{previewLabel}</div>
                </div>
              )}
              {memory.type === "link" && (
                <div className="p-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Saved link</div>
                    <div className="mt-3 font-serif text-lg text-[#F3E7D0] leading-tight">A meme we could not lose</div>
                  </div>
                  <div className="rounded-xl bg-[#111] border border-white/5 p-3">
                    <div className="text-[10px] tracking-[0.18em] uppercase text-[#C9A24A]">evernear.link</div>
                    <div className="mt-1 text-[12px] text-[#A8A39A] leading-6">Saved privately in the space.</div>
                  </div>
                </div>
              )}
              {memory.type === "meme" && (
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="rounded-[1rem] bg-black/35 backdrop-blur-sm border border-white/10 p-3">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[#D6B76A]">{previewLabel}</div>
                    <div className="mt-2 text-sm text-[#F3E7D0]">The exact thing that made everyone laugh.</div>
                  </div>
                </div>
              )}
              {(memory.type === "photo" || memory.type === "video") && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="px-2.5 py-1 rounded-full bg-black/45 text-[10px] tracking-[0.2em] uppercase text-[#F3E7D0]">
                    {previewLabel}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/35 border border-white/10 flex items-center justify-center text-[#C9A24A]">
                    ♥
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-5">
            <div className="font-serif text-xl tracking-[-0.03em] text-[#F3E7D0] group-hover:text-[#D6B76A] transition">
              {memory.title}
            </div>
            <div className="mt-2 text-sm leading-6 text-[#A8A39A]">{memory.caption}</div>
            <div className="mt-4 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-[#8a857a]">
              <span>Shared by {memory.sharedBy}</span>
              <span>{memory.date}</span>
            </div>
          </div>
        </Card>
      </button>
    );
  };

  const Home = () => (
    <main className="relative pt-20">
      <section className="relative overflow-hidden">
        {heroBlobs}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#C9A24A]/20 bg-white/[0.02] text-[10px] tracking-[0.3em] uppercase text-[#A8A39A]">
                Moments shared privately <span className="text-[#C9A24A]">•</span> A private space for the moments you never want buried
              </div>
              <h1 className="mt-8 font-serif text-5xl sm:text-6xl lg:text-[5.8rem] leading-[0.95] tracking-[-0.06em] text-[#F3E7D0]">
                The moments you never want buried.
              </h1>
              <p className="mt-6 max-w-2xl text-base sm:text-lg lg:text-xl leading-8 text-[#A8A39A]">
                Photos, videos, notes, voice messages, memes, and links — saved privately with the people who matter.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setView("login")}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] sm:text-xs tracking-[0.28em] uppercase shadow-[0_18px_40px_rgba(201,164,74,0.16)] hover:brightness-110 transition"
                >
                  Create Your EverNear
                </button>
                <button
                  onClick={() => setView("space")}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-[#C9A24A]/25 text-[#F3E7D0] text-[11px] sm:text-xs tracking-[0.28em] uppercase hover:bg-white/[0.04] transition"
                >
                  See My Space
                </button>
              </div>

              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] tracking-[0.18em] uppercase text-[#8a857a]">
                {["Private by design", "Only with your people", "Moments > Messages", "Yours, always"].map((item) => (
                  <div key={item} className="rounded-full border border-white/6 bg-white/[0.02] px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogoMark />
                  <div>
                    <div className="font-serif text-2xl tracking-[0.2em]">EVERNEAR</div>
                    <div className="text-[10px] tracking-[0.28em] uppercase text-[#8a857a]">Private shared space</div>
                  </div>
                </div>
                <div className="text-[#C9A24A] text-sm">♥</div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-[1.4rem] p-4 bg-gradient-to-br from-[#2d2417] via-[#171411] to-[#0d0d0d] border border-[#3a2a12]">
                  <div className="text-[10px] tracking-[0.22em] uppercase text-[#D6B76A]">Space created</div>
                  <div className="mt-3 font-serif text-2xl leading-tight">Our Space</div>
                  <div className="mt-4 text-sm text-[#A8A39A]">Invited people can add what matters.</div>
                </div>
                <div className="rounded-[1.4rem] p-4 bg-[#111] border border-white/6">
                  <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Invite link</div>
                  <div className="mt-3 font-mono text-sm text-[#F3E7D0] break-all">evernear.app/join/our-space</div>
                  <button onClick={() => setView("invite")} className="mt-4 text-[#C9A24A] text-[11px] tracking-[0.2em] uppercase">
                    Invite People
                  </button>
                </div>
                <div className="col-span-2 rounded-[1.4rem] border border-white/6 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Recent memory</div>
                      <div className="mt-1 text-lg text-[#F3E7D0]">Family beach day</div>
                    </div>
                    <Heart />
                  </div>
                  <div className="mt-4 rounded-[1rem] h-28 bg-gradient-to-br from-[#6b4b24] via-[#b58a53] to-[#1a120d]" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Create a private space",
              desc: "Name your EverNear space and invite only the people who belong there.",
            },
            {
              title: "Save meaningful moments",
              desc: "Add photos, videos, notes, voice messages, memes, and links in one calm feed.",
            },
            {
              title: "Return anytime",
              desc: "Open the space later and relive the best parts without searching buried threads.",
            },
          ].map((item) => (
            <Card key={item.title} className="p-7">
              <div className="text-[#C9A24A] text-[10px] tracking-[0.28em] uppercase flex items-center gap-2">
                {item.title}
                <Heart />
              </div>
              <div className="mt-4 font-serif text-2xl tracking-[-0.03em]">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-[#A8A39A]">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );

  const Login = () => (
    <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark />
          <div className="mt-5 font-serif text-4xl tracking-[-0.04em]">Welcome back</div>
          <p className="mt-3 text-sm leading-7 text-[#A8A39A]">Log in to your private EverNear space.</p>
        </div>
        <div className="mt-8 space-y-4">
          <input className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]" placeholder="Email" />
          <input className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]" placeholder="Password" type="password" />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setView("space")}
              className="flex-1 py-4 rounded-[1rem] bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
            >
              Log In
            </button>
            <button
              onClick={() => setView("space")}
              className="flex-1 py-4 rounded-[1rem] border border-[#C9A24A]/25 text-[11px] tracking-[0.28em] uppercase text-[#F3E7D0]"
            >
              Create account
            </button>
          </div>
        </div>
      </Card>
    </main>
  );

  const Space = () => (
    <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
            Your private EverNear space <Heart />
          </div>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-[-0.05em] text-[#F3E7D0]">{spaceName}</h2>
          <p className="mt-4 max-w-2xl text-[#A8A39A] leading-7">
            Photos, videos, notes, voice messages, memes, and links — saved with the people who matter.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setView("add")} className="px-5 py-3 rounded-full bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.24em] uppercase">
            Add Memory
          </button>
          <button onClick={() => setView("invite")} className="px-5 py-3 rounded-full border border-[#C9A24A]/25 text-[11px] tracking-[0.24em] uppercase text-[#F3E7D0]">
            Invite People
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {["All", "Photos", "Videos", "Notes", "Voice", "Links", "Memes"].map((tab, i) => (
          <TypePill key={tab} label={tab} active={i === 0} onClick={() => {}} />
        ))}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}

        <button
          onClick={() => setView("add")}
          className="rounded-[1.8rem] border border-dashed border-[#C9A24A]/30 bg-white/[0.02] p-8 text-left min-h-[260px] flex flex-col justify-between hover:bg-white/[0.03] transition"
        >
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-[#A8A39A]">Add a new memory</div>
            <div className="mt-4 font-serif text-3xl leading-tight text-[#F3E7D0]">Keep another good thing close.</div>
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
          Add memory <Heart />
        </div>
        <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em]">Send to your space</h2>
        <p className="mt-3 text-[#A8A39A] leading-7">
          Add something meaningful so it stays with the people who matter.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="flex flex-wrap gap-2">
            {(["photo", "video", "note", "voice", "link", "meme"] as MemoryType[]).map((t) => (
              <TypePill
                key={t}
                label={t}
                active={form.type === t}
                onClick={() => setForm((p) => ({ ...p, type: t }))}
              />
            ))}
          </div>

          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
            placeholder="Title"
          />
          <textarea
            value={form.caption}
            onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
            className="w-full min-h-32 bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
            placeholder="Caption or note"
          />
          <input
            value={form.sharedBy}
            onChange={(e) => setForm((p) => ({ ...p, sharedBy: e.target.value }))}
            className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
            placeholder="Shared by"
          />
          <input
            value={form.preview}
            onChange={(e) => setForm((p) => ({ ...p, preview: e.target.value }))}
            className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
            placeholder="Optional preview URL or image note"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addMemory}
              className="flex-1 py-4 rounded-[1rem] bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
            >
              Save memory
            </button>
            <button
              onClick={() => setView("space")}
              className="flex-1 py-4 rounded-[1rem] border border-[#C9A24A]/25 text-[11px] tracking-[0.28em] uppercase text-[#F3E7D0]"
            >
              Back to space
            </button>
          </div>
        </div>
      </Card>
    </main>
  );

  const Invite = () => (
    <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Card className="p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
          Invite people <Heart />
        </div>
        <h2 className="mt-4 font-serif text-4xl tracking-[-0.05em]">Share the private space</h2>
        <p className="mt-3 text-[#A8A39A] leading-7">
          Send a private invite link to the people who belong in this EverNear space.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-white/6 bg-white/[0.03] p-5">
          <div className="text-[10px] tracking-[0.24em] uppercase text-[#A8A39A]">Invite link</div>
          <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 rounded-[1rem] bg-[#111] border border-white/8 px-4 py-4 text-sm text-[#F3E7D0] break-all">
              https://{sampleInviteLink}
            </div>
            <button
              onClick={onCopyInvite}
              className="px-5 py-4 rounded-[1rem] bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
            >
              {inviteLinkCopied ? "Copied" : "Copy link"}
            </button>
          </div>
          <div className="mt-4 text-[11px] tracking-[0.2em] uppercase text-[#8a857a]">
            Shared privately • invite only <Heart />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setView("space")}
            className="px-5 py-3 rounded-full border border-[#C9A24A]/25 text-[11px] tracking-[0.24em] uppercase text-[#F3E7D0]"
          >
            Back to space
          </button>
          <button
            onClick={() => setView("add")}
            className="px-5 py-3 rounded-full bg-[#C9A24A] text-[#090909] text-[11px] tracking-[0.24em] uppercase"
          >
            Add memory
          </button>
        </div>
      </Card>
    </main>
  );

  const Detail = () => {
    const m =
      selectedMemory ??
      memories[0] ?? {
        id: 0,
        type: "photo" as MemoryType,
        title: "Little moments like this mean everything.",
        caption: "Saved privately.",
        sharedBy: "EverNear",
        date: "Just now",
      };

    return (
      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <button onClick={() => setView("space")} className="mb-6 text-[11px] tracking-[0.24em] uppercase text-[#A8A39A]">
          ← Back to space
        </button>

        <Card className="overflow-hidden">
          <div className="aspect-[16/9] bg-gradient-to-br from-[#6b4b24] via-[#caa15f] to-[#16110d] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_28%,rgba(255,255,255,0.18),transparent_24%)]" />
            <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/35 border border-white/10 flex items-center justify-center text-[#C9A24A]">
              ♥
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="font-serif text-3xl sm:text-4xl tracking-[-0.05em]">{m.title}</div>
            <p className="mt-3 text-[#A8A39A] leading-7 max-w-3xl">{m.caption}</p>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#A8A39A]">Shared by</div>
                <div className="mt-2 text-[#F3E7D0]">{m.sharedBy}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#A8A39A]">Date</div>
                <div className="mt-2 text-[#F3E7D0]">{m.date}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#A8A39A]">Type</div>
                <div className="mt-2 text-[#F3E7D0] capitalize">{m.type}</div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-[#C9A24A]/20 bg-[#111]/80 p-5">
              <div className="text-[10px] tracking-[0.24em] uppercase text-[#A8A39A] flex items-center gap-2">
                Memory note <Heart />
              </div>
              <p className="mt-3 text-sm leading-7 text-[#A8A39A]">
                This is where a shared memory stays visible, calm, and easy to revisit — like a small private archive of the best parts.
              </p>
            </div>
          </div>
        </Card>
      </main>
    );
  };

  const Footer = () => (
    <footer className="border-t border-white/6 py-14 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-3 text-[#A8A39A]">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase">
          <Heart />
          <span>© My EverNear — Moments shared privately.</span>
          <Heart />
        </div>
        <div className="text-[10px] tracking-[0.24em] uppercase text-[#6d6d6d]">
          A private place for the best parts of life.
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-[#F3E7D0] antialiased">
      <Header />
      {view === "home" && <Home />}
      {view === "login" && <Login />}
      {view === "space" && <Space />}
      {view === "add" && <AddMemory />}
      {view === "invite" && <Invite />}
      {view === "detail" && <Detail />}
      <Footer />
    </div>
  );
}

export default App;