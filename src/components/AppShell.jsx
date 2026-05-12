import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sections } from "../constants/sections";
import { decryptText } from "../lib/crypto";
import Workspace from "./Workspace";

function makeTab(title, content = "", noteId = null, language = null) {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return { id, title, content, noteId, language };
}

export default function AppShell({ onLogout, auth, vaultPassphrase }) {
  const navigate = useNavigate();
  const { section } = useParams();
  const validSections = useMemo(() => sections.map((item) => item.id), []);
  const active = validSections.includes(section) ? section : "text";
  const [textDraft, setTextDraft] = useState({
    tabs: [makeTab("NOTE_01.TXT", "")],
    activeTabId: null,
  });
  const [codeDraft, setCodeDraft] = useState({
    tabs: [makeTab("main.cpp", "", null, "cpp")],
    activeTabId: null,
  });

  useEffect(() => {
    if (!validSections.includes(section)) {
      navigate("/app/text", { replace: true });
    }
  }, [navigate, section, validSections]);

  const handleOpenNoteFromLibrary = async (note) => {
    const noteType = note.type === "code" ? "code" : "text";
    let decryptedContent = note.content || "";
    if (vaultPassphrase && note.ciphertext) {
      try {
        decryptedContent = await decryptText(note, vaultPassphrase);
      } catch {
        decryptedContent = "";
      }
    }

    if (noteType === "code") {
      setCodeDraft((prev) => {
        const existing = prev.tabs.find((tab) => tab.noteId === note._id);
        if (existing) {
          return { ...prev, activeTabId: existing.id };
        }
        const nextTab = makeTab(note.title || "main.cpp", decryptedContent, note._id, note.language || "cpp");
        nextTab.revision = note.revision || 1;
        return {
          tabs: [...prev.tabs, nextTab],
          activeTabId: nextTab.id,
        };
      });
      navigate("/app/code");
      return;
    }

    setTextDraft((prev) => {
      const existing = prev.tabs.find((tab) => tab.noteId === note._id);
      if (existing) {
        return { ...prev, activeTabId: existing.id };
      }
      const nextTab = makeTab(note.title || "NOTE_01.TXT", decryptedContent, note._id);
      nextTab.revision = note.revision || 1;
      return {
        tabs: [...prev.tabs, nextTab],
        activeTabId: nextTab.id,
      };
    });
    navigate("/app/text");
  };

  return (
    <div className="bg-[#000000] text-[#8eff71] min-h-screen">
      <header className="fixed top-0 w-full border-b-2 border-[#8eff71]/20 bg-[#000000] z-50 flex justify-between items-center px-4 sm:px-6 h-16">
        <div className="flex items-center gap-4">
          <span className="text-sm sm:text-xl font-bold tracking-tighter">SOVEREIGN_VAULT_v2.0</span>
          <div className="hidden lg:flex gap-6 text-[10px] text-[#757575]">
            <span className="text-[#8eff71]">SYS_OK</span>
            <span>LATENCY: 12MS</span>
            <span>ENC_STRENGTH: 4096-BIT</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden md:block text-[10px]">SECURE // E2E_ENABLED</span>
          <span className="material-symbols-outlined hidden sm:inline text-base">terminal</span>
          <span className="material-symbols-outlined hidden sm:inline text-base">settings</span>
          <span className="hidden md:block text-[10px] uppercase text-[#8eff71]">{auth?.user?.username || "user"}</span>
          <button
            onClick={() => {
              onLogout();
              navigate("/login", { replace: true });
            }}
            className="border border-[#8eff71]/40 px-2 py-1 text-[10px]"
          >
            LOG_OUT
          </button>
        </div>
      </header>

      <div className="pt-16 flex h-[calc(100vh-4rem)]">
        <aside className="w-16 sm:w-64 border-r border-[#757575]/20 bg-[#0e0e0e]">
          <div className="hidden sm:block px-6 py-4">
            <div className="text-[#8eff71] font-black text-sm">VAULT_COMMAND</div>
            <div className="text-[#757575] text-[10px]">USER_SESSION: ACTIVE</div>
          </div>
          <nav className="flex flex-col gap-1 sm:px-2">
            {sections.map((sectionItem) => (
              <button
                key={sectionItem.id}
                onClick={() => navigate(`/app/${sectionItem.id}`)}
                className={`py-3 px-3 sm:px-4 flex items-center gap-3 text-xs uppercase tracking-widest text-left ${
                  active === sectionItem.id
                    ? "text-[#8eff71] bg-[#8eff71]/5 border-l-4 border-[#8eff71]"
                    : "text-[#757575] hover:text-[#8eff71] hover:bg-[#1f1f1f]"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{sectionItem.icon}</span>
                <span className="hidden sm:inline">{sectionItem.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 bg-[#000000] overflow-hidden relative">
          <div className="h-10 border-b border-[#757575]/20 px-4 sm:px-6 flex items-center text-[10px] text-[#757575]">
            {active.toUpperCase()} // ACTIVE_WORKSPACE
          </div>
          <div className="h-[calc(100%-2.5rem)]">
            <Workspace
              active={active}
              auth={auth}
              vaultPassphrase={vaultPassphrase}
              textDraft={textDraft}
              setTextDraft={setTextDraft}
              codeDraft={codeDraft}
              setCodeDraft={setCodeDraft}
              onOpenNoteFromLibrary={handleOpenNoteFromLibrary}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#0e0e0e] border-t border-[#757575]/20 flex items-center justify-between px-4 sm:px-6 text-[9px] text-[#757575]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#8eff71]"></span>UTF-8</span>
              <span className="hidden sm:inline">LN 14, COL 32</span>
            </div>
            <span className="text-[#8eff71] hidden md:inline">E2E_STATUS: ENCRYPTED_TUNNEL_ESTABLISHED</span>
          </div>
        </main>
      </div>
    </div>
  );
}
