import { useEffect, useMemo, useState } from "react";
import { encryptText } from "../lib/crypto";
import { createNote, runCode, updateNote } from "../lib/api";

const starterCodeByLanguage = {
  cpp: `#include <iostream>
using namespace std;

int main() {
  cout<<"Save all your code notes here";
  return 0;
}`,
  c: `#include <stdio.h>

int main() {
  printf("Save all your code notes here");
  return 0;
}`,
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Save all your code notes here");
  }
}`,
  python: `print("Save all your code notes here")`,
  javascript: `console.log("Save all your code notes here");`,
};

const extByLanguage = { cpp: "cpp", c: "c", java: "java", python: "py", javascript: "js" };

export default function CodeNotes({ auth, vaultPassphrase, draft, setDraft }) {
  const [status, setStatus] = useState("");
  const [outputLines, setOutputLines] = useState([
    { type: "info", text: "OUTPUT_CONSOLE READY" },
  ]);
  const tabs = useMemo(() => draft.tabs || [], [draft.tabs]);
  const activeTabId = draft.activeTabId || tabs[0]?.id;
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (!tabs.length) {
      const firstTab = { id: `${Date.now()}-code`, title: "main.cpp", content: starterCodeByLanguage.cpp, noteId: null, language: "cpp" };
      setDraft({ tabs: [firstTab], activeTabId: firstTab.id });
      return;
    }
    if (!draft.activeTabId && tabs[0]) {
      setDraft((prev) => ({ ...prev, activeTabId: tabs[0].id }));
    }
    if (!activeTab?.content) {
      const language = activeTab?.language || "cpp";
      setDraft((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) => (tab.id === activeTabId ? { ...tab, content: starterCodeByLanguage[language] || starterCodeByLanguage.cpp } : tab)),
      }));
    }
  }, [tabs, draft.activeTabId, setDraft, activeTab?.content, activeTab?.language, activeTabId]);

  const handleSave = async () => {
    if (!activeTab) return;
    if (!vaultPassphrase) {
      setStatus("Session key missing. Please login again.");
      return;
    }
    try {
      setStatus("Saving...");
      const envelope = await encryptText(activeTab.content, vaultPassphrase);
      const payload = { title: activeTab.title, type: "code", language: activeTab.language || "cpp", ...envelope };
      const saved = activeTab.noteId
        ? await updateNote(auth.token, activeTab.noteId, { ...payload, expectedRevision: activeTab.revision || 1 })
        : await createNote(auth.token, payload);
      setDraft((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) => (tab.id === activeTab.id ? { ...tab, noteId: saved._id, revision: saved.revision || 1 } : tab)),
      }));
      setStatus("Saved to database.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleRunCode = async () => {
    if (!activeTab) return;
    setOutputLines([{ type: "info", text: "RUN_CODE started..." }]);
    try {
      const result = await runCode(auth.token, {
        language: activeTab.language || "cpp",
        code: activeTab.content,
      });
      const lines = [];
      const compileOut = result.compileOutput || "";
      const compileErr = result.compileError || "";
      const runOut = result.stdout || "";
      const runErr = result.stderr || "";

      if (compileOut.trim()) lines.push({ type: "warn", text: compileOut });
      if (compileErr.trim()) lines.push({ type: "error", text: compileErr });
      if (runOut.trim()) lines.push({ type: "success", text: runOut });
      if (runErr.trim()) lines.push({ type: "error", text: runErr });
      if (!lines.length) {
        const code = result.exitCode;
        lines.push({ type: "info", text: code === 0 ? "Program finished with exit code 0 (no stdout)." : "No output." });
        lines.push({ type: "info", text: `RAW: ${JSON.stringify(result.raw || {})}` });
      }
      setOutputLines(lines);
    } catch (error) {
      setOutputLines([{ type: "error", text: error?.message || String(error) }]);
    }
  };

  const addTab = () => {
    const next = { id: `${Date.now()}-code`, title: `main_${tabs.length + 1}.cpp`, content: starterCodeByLanguage.cpp, noteId: null, language: "cpp" };
    setDraft((prev) => ({ tabs: [...prev.tabs, next], activeTabId: next.id }));
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) return;
    const nextTabs = tabs.filter((tab) => tab.id !== tabId);
    const nextActive = activeTabId === tabId ? nextTabs[0].id : activeTabId;
    setDraft({ tabs: nextTabs, activeTabId: nextActive });
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <div className="h-12 flex items-center justify-between px-3 sm:px-4 bg-[#191919] border-b border-[#484848]/30">
        <div className="flex h-full overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDraft((prev) => ({ ...prev, activeTabId: tab.id }))}
              className={`h-full px-3 sm:px-4 border-r border-[#484848]/30 text-[11px] uppercase flex items-center gap-2 ${activeTabId === tab.id ? "bg-[#0e0e0e] text-[#8eff71] border-t-2 border-[#8eff71]" : "text-[#757575]"}`}
            >
              <span className="truncate max-w-[140px]">{tab.title}</span>
              <span onClick={(event) => { event.stopPropagation(); closeTab(tab.id); }} className="text-xs">x</span>
            </button>
          ))}
          <button onClick={addTab} className="px-3 text-[#757575] hover:text-[#8eff71]">+</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="bg-[#1f1f1f] border border-[#8eff71]/40 text-[#8eff71] px-3 py-1 text-[10px] font-bold">SAVE_CODE</button>
          <button onClick={handleRunCode} className="bg-[#8eff71]/20 border border-[#8eff71] text-[#8eff71] px-3 py-1 text-[10px] font-bold">RUN_CODE</button>
        </div>
      </div>
      <div className="px-3 sm:px-4 py-2 border-b border-[#484848]/20 flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          value={activeTab?.title || ""}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              tabs: prev.tabs.map((tab) => (tab.id === activeTabId ? { ...tab, title: event.target.value } : tab)),
            }))
          }
          className="bg-[#131313] border border-[#757575]/30 text-[#8eff71] text-xs px-3 py-2 w-full sm:max-w-xs"
          placeholder="CODE_FILE_NAME"
        />
        <select
          value={activeTab?.language || "cpp"}
          onChange={(event) => {
            const language = event.target.value;
            setDraft((prev) => ({
              ...prev,
              tabs: prev.tabs.map((tab) =>
                tab.id === activeTabId
                  ? {
                      ...tab,
                      language,
                      title: tab.title.includes(".") ? `${tab.title.split(".")[0]}.${extByLanguage[language]}` : tab.title,
                      content: tab.content?.trim() ? tab.content : starterCodeByLanguage[language],
                    }
                  : tab
              ),
            }));
          }}
          className="bg-[#131313] border border-[#757575]/30 text-[#8eff71] text-xs px-3 py-2 w-full sm:w-44"
        >
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <span className="text-[10px] text-[#757575]">{status}</span>
      </div>
      <div className="flex h-[calc(100%-3rem)]">
        <div className="w-10 sm:w-12 bg-[#000000] border-r border-[#484848]/30 pt-4 text-center text-[#484848] text-[11px] leading-6">
          01<br/>02<br/>03<br/>04<br/>05<br/>06<br/>07<br/>08<br/>09<br/>10<br/>11<br/>12
        </div>
        <div className="flex-1 bg-[#000000] overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 text-[12px] sm:text-sm leading-6 text-[#2be800] overflow-auto flex-1">
            <textarea
              value={activeTab?.content || ""}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  tabs: prev.tabs.map((tab) => (tab.id === activeTabId ? { ...tab, content: event.target.value } : tab)),
                }))
              }
              className="w-full min-h-[260px] bg-transparent outline-none resize-y text-[#2be800]"
              placeholder="Write code notes here..."
            />
          </div>
          <div className="h-44 border-t border-[#8eff71]/30 bg-[#050505] flex flex-col">
            <div className="px-4 py-1 bg-[#1f1f1f] border-b border-[#484848]/40 text-[10px] font-bold tracking-widest text-[#8eff71]">
              OUTPUT_CONSOLE
            </div>
            <div className="flex-1 p-3 overflow-auto text-[11px] space-y-1">
              {outputLines.map((line, index) => (
                <div
                  key={`${line.text}-${index}`}
                  className={
                    line.type === "error"
                      ? "text-[#ff7351]"
                      : line.type === "success"
                        ? "text-[#8eff71]"
                        : line.type === "warn"
                          ? "text-[#d6d4d3]"
                          : "text-[#ababab]"
                  }
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
