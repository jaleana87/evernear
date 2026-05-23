import React from 'react';

export default function App() {
  const [activeMockup, setActiveMockup] = React.useState('dashboard');

  const Heart = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9A24A" className="inline opacity-60">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );

  const NavLogo = () => (
    <div className="relative w-9 h-9 flex items-center justify-center">
      <div className="absolute w-5 h-7 border-[1.5px] border-[#C9A24A] rounded-[50%] -rotate-12" />
      <div className="absolute w-5 h-7 border-[1.5px] border-[#D6B76A] rounded-[50%] rotate-12 translate-x-[3px]" />
    </div>
  );

  const StickerLogo = () => (
    <div className="relative w-16 h-16 flex items-center justify-center rounded-full border border-[#C9A24A]/30 bg-[#0a0a0a]">
      <div className="absolute w-7 h-9 border-[1.5px] border-[#C9A24A] rounded-[50%] -rotate-12" />
      <div className="absolute w-7 h-9 border-[1.5px] border-[#D6B76A] rounded-[50%] rotate-12 translate-x-[4px]" />
    </div>
  );

  const NavLink = ({ label, target }) => (
    <button
      onClick={() => {
        const el = document.getElementById(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="text-[#f5f5dc] hover:text-[#C9A24A] transition-colors px-4 py-2 text-sm tracking-[2px]"
    >
      {label}
    </button>
  );

  const MockupFrame = ({ children, title }) => (
    <div className="bg-[#111] border border-[#333] rounded-3xl p-2 shadow-2xl w-full max-w-[320px] mx-auto">
      <div className="bg-black rounded-2xl overflow-hidden border border-[#222]">
        <div className="h-8 bg-[#1a1a1a] flex items-center px-4 text-[10px] text-[#666] tracking-widest">{title}</div>
        <div className="min-h-[520px] bg-[#0a0a0a] text-[#f5f5dc]">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5dc] font-sans">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 border-b border-[#222] backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <NavLogo />
            <div className="font-serif text-2xl tracking-[3px]">EVERNEAR</div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink label="HERO" target="hero" />
            <NavLink label="FEATURES" target="features" />
            <NavLink label="MOCKUPS" target="mockups" />
            <NavLink label="FOOTER" target="footer" />
            <button className="ml-6 px-6 py-2.5 bg-[#C9A24A] text-[#0a0a0a] rounded-full text-sm tracking-[2px] hover:bg-[#D6B76A] transition flex items-center gap-2">
              GET STARTED <Heart />
            </button>
          </div>
        </div>
      </nav>

      {/* LANDING HERO */}
      <section id="hero" className="pt-20 min-h-[100dvh] flex items-center justify-center px-8 relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A24A_0.4px,transparent_1px)] bg-[length:140px_140px] opacity-[0.035]" />
        <div className="max-w-4xl text-center relative z-10">
          <h1 className="font-serif text-[92px] leading-[82px] tracking-[-4.5px] mb-6">The moments you never want buried.</h1>
          <p className="max-w-xl mx-auto text-xl text-[#aaa] mb-4">A private place for the best parts of life.</p>
          <p className="max-w-xl mx-auto text-[#777] mb-10">Photos, videos, notes, voice messages, memes, and links — saved privately with the people who matter.</p>
          <div className="flex gap-4 justify-center items-center">
            <button className="px-10 py-4 rounded-full bg-[#C9A24A] text-[#0a0a0a] font-medium tracking-widest text-sm hover:bg-[#D6B76A] transition flex items-center gap-2">CREATE YOUR EVERNEAR <Heart /></button>
            <button className="px-10 py-4 rounded-full border border-[#C9A24A]/40 hover:bg-white/5 transition tracking-widest text-sm">SEE HOW IT WORKS</button>
          </div>
          <div className="mt-12 flex justify-center"><Heart /></div>
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[620px] h-[620px] bg-[#C9A24A] rounded-full blur-[160px] opacity-[0.04]" />
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-24 grid md:grid-cols-3 gap-8">
        {[ 
          { title: "Private Spaces", desc: "End-to-end encrypted spaces for photos, letters, and voice notes." },
          { title: "Legacy Sharing", desc: "Grant access to loved ones with beautiful, time-controlled delivery." },
          { title: "Timeless Design", desc: "Matte black, gold, and cream. Built to feel like an heirloom." }
        ].map((f, i) => (
          <div key={i} className="bg-[#111] border border-[#222] p-10 rounded-3xl hover:border-[#C9A24A]/30 transition group relative overflow-hidden">
            <div className="text-[#C9A24A] text-xs tracking-[3px] mb-4 flex items-center gap-2">0{i + 1} <div className="w-px h-3 bg-[#C9A24A]/30" /> <Heart /></div>
            <div className="font-serif text-4xl tracking-tight mb-6 group-hover:text-[#C9A24A] transition">{f.title}</div>
            <p className="text-[#999] leading-relaxed">{f.desc}</p>
            <div className="absolute -bottom-2 -right-2 opacity-10"><Heart /></div>
          </div>
        ))}
      </section>

      {/* MOCKUPS SECTION */}
      <section id="mockups" className="bg-[#111] py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[#C9A24A] text-xs tracking-[4px] mb-3 flex justify-center items-center gap-2">EXPERIENCE THE PRODUCT <Heart /></div>
            <div className="font-serif text-6xl tracking-[-2px]">Beautifully crafted interfaces</div>
          </div>

          {/* Mockup Tabs */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {['login', 'dashboard', 'share', 'memory'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveMockup(view)}
                className={`px-8 py-3 text-sm tracking-widest rounded-full border transition flex items-center gap-2 ${activeMockup === view ? 'bg-[#C9A24A] text-black border-[#C9A24A]' : 'border-[#333] hover:bg-[#222]'}`}
              >
                {view.toUpperCase()} {activeMockup === view && <Heart />}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Login Mockup */}
            {activeMockup === 'login' && (
              <MockupFrame title="LOGIN • EVERNEAR">
                <div className="p-8">
                  <div className="font-serif text-4xl tracking-tight mb-8 text-center flex items-center justify-center gap-3">Welcome back <Heart /></div>
                  <div className="space-y-4">
                    <input className="w-full bg-[#111] border border-[#333] rounded-2xl px-6 py-4 placeholder:text-[#555]" placeholder="Email" />
                    <input type="password" className="w-full bg-[#111] border border-[#333] rounded-2xl px-6 py-4 placeholder:text-[#555]" placeholder="Password" />
                    <button className="w-full py-4 rounded-2xl bg-[#C9A24A] text-black font-medium tracking-widest mt-4 flex items-center justify-center gap-2">SIGN IN <Heart /></button>
                  </div>
                  <div className="text-center text-xs text-[#666] mt-8 tracking-widest flex items-center justify-center gap-2">FORGOTTEN PASSWORD? <Heart /></div>
                </div>
              </MockupFrame>
            )}

            {/* Dashboard Mockup */}
            {activeMockup === 'dashboard' && (
              <MockupFrame title="DASHBOARD">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-8">
                    <div><div className="font-serif text-3xl">Good evening, Elena.</div><div className="text-xs text-[#666]">12 memories • 3 spaces</div></div>
                    <div className="w-9 h-9 rounded-full bg-[#C9A24A] flex items-center justify-center"><Heart /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="aspect-video bg-[#1a1a1a] rounded-2xl hover:ring-1 hover:ring-[#C9A24A]/30 transition" />)}
                  </div>
                </div>
              </MockupFrame>
            )}

            {/* Share/Upload Mockup */}
            {activeMockup === 'share' && (
              <MockupFrame title="SHARE • UPLOAD">
                <div className="p-8 space-y-6">
                  <div className="border border-dashed border-[#C9A24A]/40 rounded-3xl h-48 flex items-center justify-center text-[#C9A24A]">Drop memory here <Heart /></div>
                  <div className="bg-[#1a1a1a] p-5 rounded-2xl flex justify-between items-center">
                    <div>family-space-2024</div>
                    <button className="text-xs px-4 py-1.5 border border-[#C9A24A] rounded-full flex items-center gap-1.5">SHARE <Heart /></button>
                  </div>
                </div>
              </MockupFrame>
            )}

            {/* Memory Detail Mockup */}
            {activeMockup === 'memory' && (
              <MockupFrame title="MEMORY DETAIL">
                <div className="p-6">
                  <div className="aspect-video bg-[#222] rounded-2xl mb-6" />
                  <div className="font-serif text-3xl tracking-tight mb-1 flex items-center gap-3">Our last summer in Santorini <Heart /></div>
                  <div className="text-[#777] text-sm mb-6">June 12, 2023 • 4:12pm</div>
                  <div className="text-[#aaa] leading-relaxed text-[15px]">The light hit the white walls just right. We stayed until the last ferry left.</div>
                </div>
              </MockupFrame>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="border-t border-[#222] py-16 px-8 text-center text-xs tracking-[3px] text-[#555] flex flex-col items-center gap-3">
        <div className="flex items-center gap-2"><Heart /> © My EverNear — Moments shared privately. <Heart /></div>
      </footer>
    </div>
  );
}