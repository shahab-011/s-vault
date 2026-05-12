import { useEffect, useMemo, useState } from "react";
import { decryptText, encryptText } from "../lib/crypto";
import { createNote, getNotes, updateNote } from "../lib/api";

export default function TextNotes({ auth, vaultPassphrase, draft, setDraft }) {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("");
  const tabs = useMemo(() => draft.tabs || [], [draft.tabs]);
  const activeTabId = draft.activeTabId || tabs[0]?.id;
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (!tabs.length) {
      const firstTab = { id: `${Date.now()}-text`, title: "NOTE_01.TXT", content: "", noteId: null };
      setDraft({ tabs: [firstTab], activeTabId: firstTab.id });
      return;
    }
    if (!draft.activeTabId && tabs[0]) {
      setDraft((prev) => ({ ...prev, activeTabId: tabs[0].id }));
    }
  }, [tabs, draft.activeTabId, setDraft]);

  useEffect(() => {
    let isMounted = true;

    async function loadNotes() {
      try {
        const response = await getNotes(auth.token);
        if (!isMounted) return;
        setNotes(response);
        if (response.length > 0 && tabs.length === 1 && !tabs[0].content.trim()) {
          let restoredContent = response[0].content || "";
          if (vaultPassphrase && response[0].ciphertext) {
            try {
              restoredContent = await decryptText(response[0], vaultPassphrase);
            } catch {
              restoredContent = "";
              setStatus("Could not decrypt first note with current passphrase.");
            }
          }
          setDraft({
            tabs: [{ ...tabs[0], title: response[0].title, content: restoredContent, noteId: response[0]._id, revision: response[0].revision || 1 }],
            activeTabId: tabs[0].id,
          });
        }
      } catch {
        if (isMounted) setStatus("Failed to load saved notes.");
      }
    }

    loadNotes();
    return () => {
      isMounted = false;
    };
  }, [auth.token, setDraft, tabs, vaultPassphrase]); // load once per auth unless tabs reset

  const handleSave = async () => {
    if (!activeTab) return;
    if (!vaultPassphrase) {
      setStatus("Session key missing. Please login again.");
      return;
    }
    try {
      setStatus("Saving...");
      const envelope = await encryptText(activeTab.content, vaultPassphrase);
      const payload = {
        title: activeTab.title,
        type: "text",
        ...envelope,
      };
      const saved = activeTab.noteId
        ? await updateNote(auth.token, activeTab.noteId, { ...payload, expectedRevision: activeTab.revision || 1 })
        : await createNote(auth.token, payload);
      setNotes((prev) => [saved, ...prev.filter((n) => n._id !== saved._id)]);
      setDraft((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) => (tab.id === activeTab.id ? { ...tab, noteId: saved._id, revision: saved.revision || 1 } : tab)),
      }));
      setStatus("Saved to database.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const addTab = () => {
    const next = { id: `${Date.now()}-text`, title: `NOTE_${tabs.length + 1}.TXT`, content: "", noteId: null };
    setDraft((prev) => ({ tabs: [...prev.tabs, next], activeTabId: next.id }));
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) return;
    const nextTabs = tabs.filter((tab) => tab.id !== tabId);
    const nextActive = activeTabId === tabId ? nextTabs[0].id : activeTabId;
    setDraft({ tabs: nextTabs, activeTabId: nextActive });
  };

  return (
    <div className="h-full px-3 sm:px-8 py-4 sm:py-6 overflow-auto custom-scrollbar">
      <div className="flex bg-[#0e0e0e] border border-[#757575]/20 mb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDraft((prev) => ({ ...prev, activeTabId: tab.id }))}
            className={`px-4 py-2 text-[10px] uppercase border-r border-[#757575]/20 flex items-center gap-2 ${activeTabId === tab.id ? "text-[#8eff71] bg-[#000000]" : "text-[#757575]"}`}
          >
            <span className="truncate max-w-[160px]">{tab.title}</span>
            <span onClick={(event) => { event.stopPropagation(); closeTab(tab.id); }} className="text-xs">x</span>
          </button>
        ))}
        <button onClick={addTab} className="px-3 text-[#757575] hover:text-[#8eff71]">+</button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">article</span>
            EDIT_MODE: ACTIVE
          </h2>
          <p className="text-[9px] text-[#757575]">LOCATION: /ROOT/SECURE/TEXT_NOTES/NOTE_01.TXT</p>
        </div>
        <div className="hidden sm:flex gap-3">
          <button onClick={handleSave} className="bg-[#1f1f1f] border border-[#8eff71]/30 text-[#8eff71] px-3 py-1 text-[10px]">SAVE_NOTE</button>
        </div>
      </div>
      <div className="mb-3 flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          value={activeTab?.title || ""}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              tabs: prev.tabs.map((tab) => (tab.id === activeTabId ? { ...tab, title: event.target.value } : tab)),
            }))
          }
          className="bg-[#131313] border border-[#757575]/30 text-[#8eff71] text-xs px-3 py-2 w-full sm:max-w-xs"
          placeholder="FILE_TITLE"
        />
        <button onClick={handleSave} className="sm:hidden bg-[#1f1f1f] border border-[#8eff71]/30 text-[#8eff71] px-3 py-2 text-[10px] uppercase">Save Note</button>
        <span className="text-[10px] text-[#757575]">{status}</span>
      </div>
      <div className="bg-[#0e0e0e] border border-[#757575]/20 p-4 sm:p-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] relative min-h-[70%]">
        <div className="absolute left-0 top-0 pt-8 w-10 sm:w-12 text-right pr-3 sm:pr-4 text-[#484848] text-[10px] leading-relaxed select-none">
          001<br/>002<br/>003<br/>004<br/>005<br/>006<br/>007<br/>008<br/>009<br/>010<br/>011<br/>012
        </div>
        <div className="ml-8 text-[#8eff71] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          <textarea
            value={activeTab?.content || ""}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                tabs: prev.tabs.map((tab) => (tab.id === activeTabId ? { ...tab, content: event.target.value } : tab)),
              }))
            }
            className="w-full min-h-[340px] bg-transparent outline-none resize-y"
            placeholder="Type or paste your secure text notes here..."
          />
          <span className="inline-block w-2 h-4 bg-[#8eff71] animate-pulse ml-1 align-middle"></span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-[10px] text-[#757575] uppercase mb-2">Recently Saved</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {notes.slice(0, 6).map((note) => (
            <button
              key={note._id}
              onClick={async () => {
                const existing = tabs.find((tab) => tab.noteId === note._id);
                if (existing) {
                  setDraft((prev) => ({ ...prev, activeTabId: existing.id }));
                  return;
                }
                let restored = note.content || "";
                if (vaultPassphrase && note.ciphertext) {
                  try {
                    restored = await decryptText(note, vaultPassphrase);
                  } catch {
                    restored = "";
                    setStatus("Could not decrypt selected note.");
                  }
                }
                const next = { id: `${Date.now()}-text-open`, title: note.title, content: restored, noteId: note._id, revision: note.revision || 1 };
                setDraft((prev) => ({ tabs: [...prev.tabs, next], activeTabId: next.id }));
              }}
              className="text-left text-[10px] border border-[#757575]/20 bg-[#131313] px-3 py-2 hover:border-[#8eff71]/40"
            >
              <div className="text-[#8eff71] truncate">{note.title}</div>
              <div className="text-[#757575]">DB_SAVED</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
