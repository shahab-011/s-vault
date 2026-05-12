import { useState } from "react";
import { login, register } from "../lib/api";

export default function Landing({ onAuthSuccess }) {
  const [mode, setMode] = useState("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = { username, password };
      const data = mode === "register" ? await register(payload) : await login(payload);
      onAuthSuccess({ token: data.token, user: data.user }, password);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="selection:bg-neon-green selection:text-black">
      <div className="fixed inset-0 scanline z-[100] opacity-10 pointer-events-none"></div>
      <nav className="fixed top-0 w-full z-50 bg-deep-black/90 border-b-2 border-fortress-gray backdrop-blur-md">
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-7xl mx-auto">
          <div className="text-sm sm:text-base lg:text-xl font-extrabold tracking-widest text-neon-green flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined">terminal</span>
            <span className="truncate">SOVEREIGN_VAULT_v2.0</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest">
            <a className="text-slate-500 hover:text-neon-green transition-colors" href="#">[01] ABOUT</a>
            <a className="text-slate-500 hover:text-neon-green transition-colors" href="#">[02] PROTOCOL</a>
            <a className="text-slate-500 hover:text-neon-green transition-colors" href="#">[03] DOCS</a>
            <a className="text-slate-500 hover:text-neon-green transition-colors" href="#">[04] CORE</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode("login")}
              className="bg-neon-green text-black px-3 sm:px-6 py-2 font-black text-[10px] sm:text-xs uppercase tracking-tighter hover:translate-y-[-2px] active:translate-y-[0px] transition-transform"
            >
              Initialize Access
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-20">
        <section className="relative px-4 sm:px-8 pt-12 sm:pt-16 pb-16 sm:pb-24 overflow-hidden border-b-4 border-fortress-gray">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 sm:gap-16 relative z-10">
            <div className="w-full lg:w-3/5 text-left">
              <div className="inline-block px-3 py-1 bg-neon-green/10 border border-neon-green text-neon-green text-[10px] font-bold tracking-widest uppercase mb-6">
                SYSTEM_STATUS: SECURE // E2E_ENABLED
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 sm:mb-8 leading-[0.9] text-white">
                ENCRYPT.
                <br />
                EXECUTE.
                <br />
                <span className="text-neon-green">EVADE.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl mb-8 sm:mb-12 font-medium leading-relaxed border-l-4 border-fortress-gray pl-4 sm:pl-6">
                More than a vault. A terminal for your digital ghost. Secure notes, code execution, and instant access across the neural web.
              </p>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4 max-w-md opacity-50 text-[10px] uppercase font-bold tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">●</span> AES-256_GCM
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">●</span> POLYGLOT_RUNTIME
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">●</span> ZERO_LOG_POLICY
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">●</span> INSTANT_SYNC
                </div>
              </div>
            </div>
            <div className="w-full lg:w-2/5">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-green/5 vault-core scale-150 blur-3xl rounded-full"></div>
                <div className="relative bg-deep-black border-4 border-fortress-gray p-5 sm:p-8 brutalist-border">
                  <div className="mb-6 sm:mb-8 border-b border-fortress-gray pb-4">
                    <h2 className="text-xl font-bold text-white mb-1">VAULT_ENTRY</h2>
                    <p className="text-[10px] text-slate-500 tracking-widest uppercase">Identity Verification Required</p>
                  </div>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neon-green tracking-widest">/USER_NAME</label>
                      <div className="relative group">
                        <input
                          className="w-full bg-fortress-gray border-2 border-transparent focus:border-neon-green text-white px-4 py-4 font-bold outline-none transition-all placeholder:text-slate-600"
                          placeholder="ENTER_USERNAME"
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">.vault</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neon-green tracking-widest">/PASSWORD</label>
                      <input
                        className="w-full bg-fortress-gray border-2 border-transparent focus:border-neon-green text-white px-4 py-4 font-bold outline-none transition-all placeholder:text-slate-600"
                        placeholder="ENTER_PASSWORD"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                    <button
                      disabled={loading}
                      className="w-full bg-neon-green text-black py-4 sm:py-5 font-black text-base sm:text-lg uppercase tracking-tighter hover:bg-white transition-colors flex items-center justify-between px-4 sm:px-6 group disabled:opacity-70"
                    >
                      <span>{mode === "register" ? "CREATE_ACCOUNT" : "LOG_IN"}</span>
                      <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">login</span>
                    </button>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="text-neon-green text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                        onClick={() => setMode(mode === "register" ? "login" : "register")}
                      >
                        {mode === "register" ? "ALREADY_HAVE_ACCOUNT? LOG_IN" : "NEED_ACCOUNT? CREATE_ONE"}
                      </button>
                    </div>
                    {message && <div className="text-[10px] text-red-400 font-bold uppercase">{message}</div>}
                    <div className="p-3 bg-fortress-gray/50 text-[9px] leading-tight text-slate-500 uppercase tracking-widest font-bold">
                      Warning: If key is lost, data recovery is mathematically impossible. We store zero knowledge of your credentials.
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-20 pointer-events-none">
            <pre className="text-[8px] font-bold text-neon-green leading-none">
              {`01010101 01010101 
10101010 10101010
01010101 01010101`}
            </pre>
          </div>
        </section>

        <section className="px-4 sm:px-8 py-16 sm:py-24 bg-deep-black border-b-2 border-fortress-gray">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 sm:mb-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tighter">OPERATIONAL_CAPABILITIES</h2>
              <div className="h-1 w-24 bg-neon-green mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="brutalist-card overflow-hidden">
                <div className="terminal-header px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Buffer: Secure_Notes.sh</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                </div>
                <div className="p-5 sm:p-8">
                  <div className="text-neon-green mb-6">
                    <span className="material-symbols-outlined text-4xl">description</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">SECURE_RECORDS</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight mb-6">
                    Save encrypted text and code snippets with instant versioning. Your thoughts are zero-knowledge by default.
                  </p>
                  <div className="bg-fortress-gray/30 p-3 font-mono text-[10px] text-neon-green/60">
                    $ vault save --type=secret "My secret note"
                    <br />
                    {"> ENCRYPTING... OK."}
                  </div>
                </div>
              </div>
              <div className="brutalist-card overflow-hidden border-neon-green/30">
                <div className="terminal-header px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neon-green uppercase">Console: Polyglot_Runtime</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-5 sm:p-8">
                  <div className="text-neon-green mb-6">
                    <span className="material-symbols-outlined text-4xl">terminal</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">WEB_EXECUTION</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight mb-6">
                    Run Python, JS, C++, and Rust directly in your browser. Sandbox testing within the security of your vault.
                  </p>
                  <div className="bg-black p-3 font-mono text-[10px] text-white">
                    <span className="text-neon-green">print</span>("Executing in browser...")
                    <br />
                    {"> Running Python 3.11..."}
                  </div>
                </div>
              </div>
              <div className="brutalist-card overflow-hidden">
                <div className="terminal-header px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Network: Sync_Daemon</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                </div>
                <div className="p-5 sm:p-8">
                  <div className="text-neon-green mb-6">
                    <span className="material-symbols-outlined text-4xl">sync</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">UNIVERSAL_SYNC</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight mb-6">
                    Seamless login/logout flow across all devices. Your session ends when you say so, leaving no trace behind.
                  </p>
                  <div className="bg-fortress-gray/30 p-3 font-mono text-[10px] text-neon-green/60">
                    $ vault connect --device="Mobile_01"
                    <br />
                    {"> AUTHENTICATED [0.2s]"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-8 py-16 sm:py-24 bg-deep-black border-b-2 border-fortress-gray">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-fortress-gray">
              <div className="p-6 sm:p-12 border-fortress-gray border-b md:border-b-0 md:border-r brutalist-card">
                <div className="text-neon-green mb-8">
                  <span className="material-symbols-outlined text-5xl">lock_open</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-white">EDGE_ENCRYPT</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                  Encryption occurs strictly within your local runtime environment. No plaintext data ever traverses the network layer.
                </p>
              </div>
              <div className="p-6 sm:p-12 border-fortress-gray border-b md:border-b-0 md:border-r brutalist-card">
                <div className="text-neon-green mb-8">
                  <span className="material-symbols-outlined text-5xl">memory</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-white">ZERO_K_ARCH</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                  Infrastructure is built on the principle of absolute ignorance. We provide the fortress; you hold the only key.
                </p>
              </div>
              <div className="p-6 sm:p-12 brutalist-card">
                <div className="text-neon-green mb-8">
                  <span className="material-symbols-outlined text-5xl">speed</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-white">LOW_LATENCY</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                  High-performance C++ backend ensures sub-millisecond response times for encrypted block retrieval. Optimized for speed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-8 py-16 sm:py-24 border-t-2 border-fortress-gray bg-fortress-gray/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 sm:gap-16">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 sm:mb-8 text-white leading-none">
                ENGINEERED FOR THE <br />
                <span className="text-neon-green">PARANOID.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-10 leading-relaxed uppercase tracking-tight font-medium">
                Traditional cloud storage is a liability. Sovereign Vault is a cryptographic utility designed to withstand state-level observation.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 border-2 border-neon-green flex items-center justify-center text-neon-green font-bold text-xs">01</div>
                  <span className="text-white font-bold uppercase tracking-widest text-sm">NON-CUSTODIAL DATA CONTROL</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 border-2 border-neon-green flex items-center justify-center text-neon-green font-bold text-xs">02</div>
                  <span className="text-white font-bold uppercase tracking-widest text-sm">AUDITABLE OPEN-CORE SOURCE</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 border-2 border-neon-green flex items-center justify-center text-neon-green font-bold text-xs">03</div>
                  <span className="text-white font-bold uppercase tracking-widest text-sm">TRACKER-FREE ENVIRONMENT</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative bg-deep-black p-4 brutalist-border overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen"
                  alt="abstract digital representation of secure data encryption with glowing blue hexagonal patterns and floating digital fragments in a dark space"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqwAOeE3ku8JBjEkR9p1SPYlby0-CcyvEwg-mnxKEXygPSvxD805XKfKBx4K7A0BcdVVDiFPxPWG9uveCLrf2tAmm_IvbVHRET4Kb859pUf9EbKaVshwDkPr9ieyoMfAE0Kinq73jOb4huPUPoBZ0OSrhJ_NLcbZHd7VXJItpRN2azBiXPXwhMsh0MtjxXQGCtDqZWjkNkYK2Hut63hDdhT6QPnf7-Ay9kkQeELIc8dL2JnCt3bOiD0HKhRuGby607oYAc5hiYCZSl"
                />
                <div className="absolute inset-0 border-[20px] border-deep-black/80 pointer-events-none"></div>
                <div className="absolute bottom-8 left-8 p-4 bg-neon-green text-black font-black text-[10px] tracking-widest uppercase">
                  CORE_VISUALIZATION_74-A
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t-4 border-fortress-gray bg-deep-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 sm:gap-12">
            <div className="space-y-4">
              <div className="text-2xl font-black text-neon-green">SOVEREIGN_VAULT</div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] max-w-xs leading-loose">
                SECURE_COMMUNICATION_PROTOCOL_v2.0.4
                <br />
                ESTABLISHED_2024
                <br />
                ENCRYPTION_BY_DEFAULT
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 w-full md:w-auto">
              <div className="flex flex-col gap-3">
                <div className="text-white font-black text-xs mb-2">SYSTEM</div>
                <a className="text-[10px] text-slate-500 hover:text-neon-green font-bold transition-colors uppercase" href="#">Audit_Log</a>
                <a className="text-[10px] text-slate-500 hover:text-neon-green font-bold transition-colors uppercase" href="#">Uptime_Node</a>
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-white font-black text-xs mb-2">LEGAL</div>
                <a className="text-[10px] text-slate-500 hover:text-neon-green font-bold transition-colors uppercase" href="#">Privacy_Def</a>
                <a className="text-[10px] text-slate-500 hover:text-neon-green font-bold transition-colors uppercase" href="#">Terms_Of_Op</a>
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-white font-black text-xs mb-2">RESOURCES</div>
                <a className="text-[10px] text-slate-500 hover:text-neon-green font-bold transition-colors uppercase" href="#">API_Core</a>
                <a className="text-[10px] text-slate-500 hover:text-neon-green font-bold transition-colors uppercase" href="#">Bug_Bounty</a>
              </div>
            </div>
          </div>
          <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-fortress-gray flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[9px] font-black text-slate-700 uppercase tracking-widest">
            <div>[SYSTEM_OK]</div>
            <div>© 2024 SOVEREIGN_VAULT_LABS</div>
            <div>[0x44_E_92]</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
