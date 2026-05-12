export default function About() {
  return (
    <div className="p-4 sm:p-8 overflow-auto custom-scrollbar h-full">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
        <div className="xl:col-span-8">
          <div className="text-[#8eff71] text-xs tracking-[0.3em] mb-3">&gt; MISSION_STATEMENT // REV_04</div>
          <h2 className="text-3xl sm:text-6xl font-black text-[#8eff71] leading-[0.9] mb-6">DIGITAL SOVEREIGNTY<br/>THROUGH ZERO_KNOWLEDGE</h2>
          <p className="text-[#ababab] max-w-3xl">
            Sovereign Vault is a technical perimeter. Data is encrypted client-side and remains under user custody.
          </p>
        </div>
        <div className="xl:col-span-4 border border-[#8eff71]/20 bg-[#131313] p-5">
          <div className="text-[#8eff71] text-xs mb-2">SYSTEM_HEALTH</div>
          <div className="h-2 w-full bg-[#8eff71]/10 mb-3"><div className="h-full bg-[#8eff71] w-4/5"></div></div>
          <div className="text-[10px] text-[#757575] space-y-1">
            <div className="flex justify-between"><span>NODES_ONLINE</span><span className="text-[#8eff71]">1,402</span></div>
            <div className="flex justify-between"><span>UPTIME_METRIC</span><span className="text-[#8eff71]">99.999%</span></div>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#484848]/20 border border-[#484848]/20">
        <div className="bg-[#0e0e0e] p-6 sm:p-10">
          <h3 className="text-xl text-white font-bold mb-3">ZERO-KNOWLEDGE</h3>
          <p className="text-[#ababab] text-sm">Client-side encryption with private keys that never leave your browser context.</p>
        </div>
        <div className="bg-[#0e0e0e] p-6 sm:p-10 border-l border-[#484848]/20">
          <h3 className="text-xl text-white font-bold mb-3">SECURE EXECUTION</h3>
          <p className="text-[#ababab] text-sm">Run snippets in isolated execution paths without exposing plaintext on disk.</p>
        </div>
        <div className="bg-[#0e0e0e] p-6 sm:p-10 border-l border-[#484848]/20">
          <h3 className="text-xl text-white font-bold mb-3">UNIVERSAL SYNC</h3>
          <p className="text-[#ababab] text-sm">Conflict-safe synchronization hardened against interception attacks.</p>
        </div>
      </section>
    </div>
  );
}
