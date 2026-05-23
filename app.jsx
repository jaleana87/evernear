
import React from "react";
export default function App() {
  const [activeMockup, setActiveMockup] = React.useState('dashboard');

  const NavLink = ({ label, target }) => (
    <button
      onClick={() => {
        const el = document.getElementById(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="text-[#f5f5dc] hover:text-[#d4af37] transition-colors px-4 py-2 text-sm tracking-[2px]"
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#c5a26f]" />
            <div className="font-serif text-2xl tracking-[3px]">MY EVERNEAR</div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink label="HERO" target="hero" />
            <NavLink label="FEATURES" target="features" />
            <NavLink label="MOCKUPS" target="mockups" />
            <NavLink label="FOOTER" target="footer" />
            <button className="ml-6 px-6 py-2.5 bg-[#d4af37] text-[#0a0a0a] rounded-full text-sm tracking-[2px] hover:bg-white transition">
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      {/* LANDING HERO */}
      <section id="hero" className="pt-20 min-h-[100dvh] flex items-center justify-center px-8 bg-[radial-gradient(#222_0.8px,transparent_1px)] bg-[length:4px_4px]">
        <div className="max-w-4xl text-center">
          <div className="inline-block px-4 py-1 rounded-full border border-[#d4af37]/30 text-[#d4af37] text-xs tracking-[4px] mb-6">EST 2024 • CURATED LEGACY</div>
          <h1 className="font-serif text-[92px] leading-[82px] tracking-[-4.5px] mb-6">Memories,<br />preserved forever.</h1>
          <p className="max-w-md mx-auto text-xl text-[#aaa] mb-10">A private sanctuary for the stories that matter most.</p>
          <div className="flex gap-4 justify-center">
            <button className="px-10 py-4 rounded-full bg-[#d4af37] text-[#0a0a0a] font-medium tracking-widest text-sm">CREATE YOUR VAULT</button>
            <button className="px-10 py-4 rounded-full border border-[#d4af37]/40 hover:bg-white/5 transition tracking-widest text-sm">WATCH FILM</button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-24 grid md:grid-cols-3 gap-8">
        {[
          { title: "Private Vaults", desc: "End-to-end encrypted spaces for photos, letters, and voice notes." },
          { title: "Legacy Sharing", desc: "Grant access to loved ones with beautiful, time-controlled delivery." },
          { title: "Timeless Design", desc: "Matte black, gold, and cream. Built to feel like an heirloom." }
        ].map((f, i) => (
          <div key={i} className="bg-[#111] border border-[#222] p-10 rounded-3xl hover:border-[#d4af37]/30 transition group">
            <div className="text-[#d4af37] text-xs tracking-[3px] mb-4">0{i + 1}</div>
            <div className="font-serif text-4xl tracking-tight mb-6 group-hover:text-[#d4af37] transition">{f.title}</div>
            <p className="text-[#999] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* MOCKUPS SECTION */}
      <section id="mockups" className="bg-[#111] py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[#d4af37] text-xs tracking-[4px] mb-3">EXPERIENCE THE PRODUCT</div>
            <div className="font-serif text-6xl tracking-[-2px]">Beautifully crafted interfaces</div>
          </div>

          {/* Mockup Tabs */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {['login', 'dashboard', 'share', 'memory'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveMockup(view)}
                className={`px-8 py-3 text-sm tracking-widest rounded-full border transition ${activeMockup === view ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-[#333] hover:bg-[#222]'}`}
              >
                {view.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Login Mockup */}
            {activeMockup === 'login' && (
              <MockupFrame title="LOGIN • EVERNEAR">
                <div className="p-8">
                  <div className="font-serif text-4xl tracking-tight mb-8 text-center">Welcome back</div>
                  <div className="space-y-4">
                    <input className="w-full bg-[#111] border border-[#333] rounded-2xl px-6 py-4 placeholder:text-[#555]" placeholder="Email" />
                    <input type="password" className="w-full bg-[#111] border border-[#333] rounded-2xl px-6 py-4 placeholder:text-[#555]" placeholder="Password" />
                    <button className="w-full py-4 rounded-2xl bg-[#d4af37] text-black font-medium tracking-widest mt-4">SIGN IN</button>
                  </div>
                  <div className="text-center text-xs text-[#666] mt-8 tracking-widest">FORGOT PASSWORD?</div>
                </div>
              </MockupFrame>
            )}

            {/* Dashboard Mockup */}
            {activeMockup === 'dashboard' && (
              <MockupFrame title="DASHBOARD">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-8">
                    <div><div className="font-serif text-3xl">Good evening, Elena.</div><div className="text-xs text-[#666]">12 memories • 3 vaults</div></div>
                    <div className="w-9 h-9 rounded-full bg-[#d4af37]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="aspect-video bg-[#1a1a1a] rounded-2xl" />)}
                  </div>
                </div>
              </MockupFrame>
            )}

            {/* Share/Upload Mockup */}
            {activeMockup === 'share' && (
              <MockupFrame title="SHARE • UPLOAD">
                <div className="p-8 space-y-6">
                  <div className="border border-dashed border-[#d4af37]/40 rounded-3xl h-48 flex items-center justify-center text-[#d4af37]">Drop memory here</div>
                  <div className="bg-[#1a1a1a] p-5 rounded-2xl flex justify-between items-center">
                    <div>family-vault-2024</div>
                    <button className="text-xs px-4 py-1.5 border border-[#d4af37] rounded-full">SHARE</button>
                  </div>
                </div>
              </MockupFrame>
            )}

            {/* Memory Detail Mockup */}
            {activeMockup === 'memory' && (
              <MockupFrame title="MEMORY DETAIL">
                <div className="p-6">
                  <div className="aspect-video bg-[#222] rounded-2xl mb-6" />
                  <div className="font-serif text-3xl tracking-tight mb-1">Our last summer in Santorini</div>
                  <div className="text-[#777] text-sm mb-6">June 12, 2023 • 4:12pm</div>
                  <div className="text-[#aaa] leading-relaxed text-[15px]">The light hit the white walls just right. We stayed until the last ferry left.</div>
                </div>
              </MockupFrame>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="border-t border-[#222] py-16 px-8 text-center text-xs tracking-[3px] text-[#555]">
        © MY EVERNEAR — HANDCRAFTED FOR ETERNITY
      </footer>
    </div>
  );
}