import React, { useMemo, useState } from "react";

type View = "home" | "auth" | "create-space" | "space" | "add" | "invite" | "detail";
type MemoryType = "photo" | "video" | "note" | "voice" | "link" | "meme";

type Memory = {
  id: number;
  type: MemoryType;
  title: string;
  caption: string;
  sharedBy: string;
  date: string;
  linkUrl?: string;
};

const GOLD = "#C9A24A";
const GOLD_SOFT = "#D6B76A";
const CREAM = "#F3E7D0";
const MUTED = "#A8A39A";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [spaceName, setSpaceName] = useState("Our Family");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [filter, setFilter] = useState<"All" | MemoryType>("All");

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: 1,
      type: "photo",
      title: "Family beach day",
      caption: "The kind of afternoon that feels like it should stay close forever.",
      sharedBy: "Maya",
      date: "Today • 7:42 PM",
    },
    {
      id: 2,
      type: "voice",
      title: "Voice note from Mom",
      caption: "A little message I wanted to keep instead of letting it disappear in a thread.",
      sharedBy: "Mom",
      date: "Yesterday • 9:14 AM",
    },
    {
      id: 3,
      type: "meme",
      title: "Best friend meme",
      caption: "The exact thing that made us both laugh after a long day.",
      sharedBy: "Jordan",
      date: "2 days ago",
    },
    {
      id: 4,
      type: "note",
      title: "Wedding morning",
      caption: "A quiet note written before everything began.",
      sharedBy: "Elena",
      date: "May 18 • 8:02 AM",
    },
    {
      id: 5,
      type: "link",
      title: "Sunset video",
      caption: "A simple moment we didn’t want to lose.",
      sharedBy: "Chris",
      date: "Last week",
      linkUrl: "https://evernear.app/moment/123",
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

  const visibleMemories = useMemo(() => {
    if (filter === "All") return memories;
    return memories.filter((m) => m.type === filter);
  }, [filter, memories]);

  const heart = (className = "") => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={GOLD}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  const LogoPlaceholder = () => (
    <div className="w-[170px] h-[48px] rounded-xl border border-[#C9A24A]/25 bg-white/[0.03] flex items-center justify-center px-3 text-[10px] tracking-[0.24em] uppercase text-[#D6B76A] text-center">
      UPLOAD EVERNEAR LOGO HERE
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

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-[1.6rem] border border-white/6 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );

  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080808]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView("home")}>
          <LogoPlaceholder />
          <div className="hidden sm:block">
            <div className="font-serif text-xl tracking-[0.22em] text-[#F3E7D0]">EVERNEAR</div>
            <div className="text-[9px] tracking-[0.28em] uppercase text-[#8a857a]">Moments shared privately.</div>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <button onClick={() => setView("home")} className="text-[11px] tracking-[0.24em] uppercase text-[#A8A39A] hover:text-[#F3E7D0] transition">Home</button>
          <button onClick={() => setView("auth")} className="text-[11px] tracking-[0.24em] uppercase text-[#A8A39A] hover:text-[#F3E7D0] transition">Log In</button>
          <button onClick={() => setView("create-space")} className="px-5 py-2.5 rounded-full bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.24em] uppercase hover:brightness-110 transition">
            Create Your EverNear
          </button>
        </nav>
      </div>
    </header>
  );

  const goToSpace = () => {
    setView("space");
    if (!spaceName.trim()) setSpaceName("Our Family");
  };

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

  const MemoryPreview = ({ memory }: { memory: Memory }) => {
    const base =
      memory.type === "photo"
        ? "bg-gradient-to-br from-[#624425] via-[#ab8150] to-[#17110c]"
        : memory.type === "video"
        ? "bg-[#151515]"
        : memory.type === "note"
        ? "bg-[#f3e7d0] text-[#23160c]"
        : memory.type === "voice"
        ? "bg-gradient-to-br from-[#151515] to-[#0b0b0b]"
        : memory.type === "link"
        ? "bg-gradient-to-br from-[#121212] to-[#090909]"
        : "bg-gradient-to-br from-[#201614] via-[#46311f] to-[#101010]";

    return (
      <div className={`rounded-[1.2rem] border border-white/6 overflow-hidden ${base}`}>
        <div className="aspect-[4/3] relative">
          {memory.type === "photo" && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_30%)]" />
          )}
          {memory.type === "video" && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(214,183,106,0.16),transparent_40%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-[#D6B76A] ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-[10px] tracking-[0.16em] uppercase text-[#F3E7D0]">
                0:18
              </div>
            </>
          )}
          {memory.type === "note" && (
            <div className="p-4 h-full">
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#8a6f41]">Note</div>
              <div className="mt-4 font-serif text-lg leading-8 text-[#2a2015]">
                “A quiet line I wanted to keep.”
              </div>
            </div>
          )}
          {memory.type === "voice" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="flex items-end gap-1 h-12">
                <span className="w-[3px] h-5 bg-[#D6B76A] rounded-full animate-pulse" />
                <span className="w-[3px] h-8 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:100ms]" />
                <span className="w-[3px] h-4 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:200ms]" />
                <span className="w-[3px] h-9 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:300ms]" />
                <span className="w-[3px] h-6 bg-[#D6B76A] rounded-full animate-pulse [animation-delay:400ms]" />
              </div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Voice</div>
            </div>
          )}
          {memory.type === "link" && (
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-[#A8A39A]">Link</div>
                <div className="mt-3 font-serif text-lg text-[#F3E7D0] leading-tight">A link worth saving</div>
              </div>
              <div className="rounded-xl bg-[#111] border border-white/5 p-3">
                <div className="text-[10px] tracking-[0.18em] uppercase text-[#C9A24A] break-all">
                  {memory.linkUrl || "evernear.app/link"}
                </div>
              </div>
            </div>
          )}
          {memory.type === "meme" && (
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="rounded-[1rem] bg-black/35 backdrop-blur-sm border border-white/10 p-3">
                <div className="text-[10px] tracking-[0.22em] uppercase text-[#D6B76A]">Meme</div>
                <div className="mt-2 text-sm text-[#F3E7D0]">The exact thing that made everyone laugh.</div>
              </div>
            </div>
          )}
          {memory.type === "photo" && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="px-2.5 py-1 rounded-full bg-black/45 text-[10px] tracking-[0.2em] uppercase text-[#F3E7D0]">
                Family beach day
              </div>
              <div className="text-[#C9A24A]">♥</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const render = () => {
    switch (view) {
      case "auth":
        return (
          <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <LogoPlaceholder />
                <div>
                  <div className="font-serif text-3xl tracking-[0.22em]">EVERNEAR</div>
                  <div className="mt-1 text-[10px] tracking-[0.28em] uppercase text-[#8a857a]">
                    Moments shared privately.
                  </div>
                </div>
              </div>

              <h2 className="mt-8 font-serif text-4xl tracking-[-0.04em] text-[#F3E7D0]">
                Welcome back
              </h2>
              <p className="mt-3 text-[#A8A39A] leading-7">
                Log in or create your EverNear space to begin.
              </p>

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
                    onClick={goToSpace}
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

      case "create-space":
        return (
          <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
            <Card className="p-6 sm:p-8">
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
                Create a private space <span>{heart()}</span>
              </div>
              <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-[#F3E7D0]">
                Name your EverNear space
              </h2>
              <p className="mt-3 text-[#A8A39A] leading-7">
                Examples: Our Family, Mom &amp; Me, Wedding Day, For Dad.
              </p>

              <div className="mt-8 space-y-4">
                <input
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
                  placeholder="Space name"
                />
                <button
                  onClick={goToSpace}
                  className="w-full py-4 rounded-[1rem] bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
                >
                  Create Space
                </button>
              </div>
            </Card>
          </main>
        );

      case "space":
        return (
          <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
                    Your private space <span>{heart()}</span>
                  </div>
                  <h1 className="mt-4 font-serif text-4xl sm:text-5xl tracking-[-0.05em] text-[#F3E7D0]">
                    {spaceName}
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

              <div className="flex gap-2 flex-wrap">
                {(["All", "Photos", "Videos", "Notes", "Voice", "Links", "Memes"] as const).map((tab) => {
                  const tabKey = tab === "Photos" ? "photo" : tab === "Videos" ? "video" : tab === "Notes" ? "note" : tab === "Voice" ? "voice" : tab === "Links" ? "link" : tab === "Memes" ? "meme" : "All";
                  return (
                    <TextButton
                      key={tab}
                      active={filter === tabKey}
                      onClick={() => setFilter(tabKey as any)}
                    >
                      {tab}
                    </TextButton>
                  );
                })}
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleMemories.map((memory) => (
                  <button
                    key={memory.id}
                    onClick={() => {
                      setSelectedMemory(memory);
                      setView("detail");
                    }}
                    className="text-left group"
                  >
                    <Card className="overflow-hidden hover:border-[#C9A24A]/25 transition">
                      <MemoryPreview memory={memory} />
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
            </div>
          </main>
        );

      case "add":
        return (
          <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <Card className="p-6 sm:p-8">
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
                Add memory <span>{heart()}</span>
              </div>
              <h1 className="mt-4 font-serif text-4xl tracking-[-0.05em] text-[#F3E7D0]">Save a moment</h1>
              <p className="mt-3 text-[#A8A39A] leading-7">
                Add a photo, video, note, voice message, link, or meme to your private space.
              </p>

              <div className="mt-8 grid gap-4">
                <div>
                  <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Memory type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as MemoryType }))}
                    className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50"
                  >
                    {(["photo", "video", "note", "voice", "link", "meme"] as MemoryType[]).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
                    placeholder="Family beach day"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Caption / note</label>
                  <textarea
                    value={form.caption}
                    onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
                    className="w-full min-h-32 bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
                    placeholder="A few words about the moment..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Link URL optional</label>
                  <input
                    value={form.linkUrl}
                    onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                    className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] tracking-[0.22em] uppercase text-[#8a857a]">Shared by</label>
                  <input
                    value={form.sharedBy}
                    onChange={(e) => setForm((p) => ({ ...p, sharedBy: e.target.value }))}
                    className="w-full bg-[#111] border border-white/8 rounded-[1rem] px-4 py-4 text-sm outline-none focus:border-[#C9A24A]/50 placeholder:text-[#666]"
                    placeholder="Mom"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={addMemory}
                    className="flex-1 py-4 rounded-[1rem] bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] tracking-[0.28em] uppercase"
                  >
                    Save Memory
                  </button>
                  <button
                    onClick={() => setView("space")}
                    className="flex-1 py-4 rounded-[1rem] border border-[#C9A24A]/25 text-[11px] tracking-[0.28em] uppercase text-[#F3E7D0]"
                  >
                    Back to Space
                  </button>
                </div>
              </div>
            </Card>
          </main>
        );

      case "invite":
        return (
          <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
            <Card className="p-6 sm:p-8">
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
                Invite / share link <span>{heart()}</span>
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

      case "detail": {
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
              <div
                className={`aspect-[16/9] relative ${
                  m.type === "photo"
                    ? "bg-gradient-to-br from-[#644427] via-[#b68a52] to-[#17110d]"
                    : m.type === "video"
                    ? "bg-[#121212]"
                    : m.type === "note"
                    ? "bg-[#f3e7d0]"
                    : "bg-gradient-to-br from-[#201614] via-[#4a3520] to-[#101010]"
                }`}
              >
                {m.type === "video" && (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,183,106,0.14),transparent_35%)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-[#D6B76A] ml-1" />
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/35 border border-white/10 flex items-center justify-center text-[#C9A24A]">
                  ♥
                </div>
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
                <p className="mt-4 text-[#A8A39A] leading-7">{m.caption}</p>

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
                    <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a857a]">Preview</div>
                    <div className="mt-2 text-[#F3E7D0]">{m.linkUrl ? "Link included" : "Saved in space"}</div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
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
                    Add Another Memory
                  </button>
                </div>
              </div>
            </Card>
          </main>
        );
      }

      case "home":
      default:
        return (
          <main className="pt-20">
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
                        <div className="mt-1 text-[10px] tracking-[0.28em] uppercase text-[#8a857a]">
                          Moments shared privately.
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#C9A24A]/18 bg-white/[0.02] text-[10px] tracking-[0.3em] uppercase text-[#A8A39A]">
                      A private place for the best parts <span>{heart("opacity-80")}</span>
                    </div>

                    <h1 className="mt-8 font-serif text-5xl sm:text-6xl lg:text-[5.6rem] leading-[0.95] tracking-[-0.06em] text-[#F3E7D0]">
                      The moments you never want buried.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base sm:text-lg lg:text-xl leading-8 text-[#A8A39A]">
                      Photos, videos, notes, voice messages, memes, and links — saved with the people who matter.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setView("create-space")}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-b from-[#D6B76A] to-[#B8893B] text-[#090909] text-[11px] sm:text-xs tracking-[0.28em] uppercase shadow-[0_18px_40px_rgba(201,164,74,0.16)] hover:brightness-110 transition"
                      >
                        Create Your EverNear
                      </button>
                      <button
                        onClick={() => setView("auth")}
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-[#C9A24A]/25 text-[#F3E7D0] text-[11px] sm:text-xs tracking-[0.28em] uppercase hover:bg-white/[0.04] transition"
                      >
                        Log In
                      </button>
                    </div>
                  </div>

                  <Card className="p-6 sm:p-8">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#A8A39A] flex items-center gap-2">
                      How it feels <span>{heart()}</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {[
                        "Private spaces for family, partners, and close friends",
                        "A calm feed of saved moments instead of chat bubbles",
                        "Invite-only access with shareable links",
                        "Easy memory types: photo, video, note, voice, link, meme",
                      ].map((item) => (
                        <div key={item} className="rounded-[1.2rem] border border-white/6 bg-white/[0.02] p-4 text-sm leading-7 text-[#A8A39A]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </section>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F3E7D0] antialiased">
      <Header />
      {render()}
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
