import { useEffect, useMemo, useState } from "react";
import { deleteNote, getNotes } from "../lib/api";

function Section({ title, items, emptyText, onOpenNote, onDeleteNote }) {
  return (
    <div>
      <h2 className="text-xs sm:text-sm font-bold text-[#8eff71] uppercase tracking-widest mb-3">{title}</h2>
      {items.length === 0 ? (
        <div className="border border-[#484848]/20 bg-[#0e0e0e] px-4 py-6 text-[#757575] text-xs">{emptyText}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-[#484848]/20 border border-[#484848]/20">
          {items.map((note) => (
            <div key={note._id} className="bg-[#0e0e0e] p-6 hover:bg-[#1f1f1f] transition-colors">
              <h3 className="text-white font-bold text-lg truncate">{note.title}</h3>
              <p className="text-[#757575] text-[10px] mt-2">DB_SAVED_NOTE</p>
              <div className="mt-6 flex gap-2">
                <button
                  className="flex-1 border border-[#8eff71]/40 text-[#8eff71] text-[10px] py-1"
                  onClick={() => onOpenNote(note)}
                >
                  VIEW
                </button>
                <button
                  className="border border-[#ff7351]/40 text-[#ff7351] text-[10px] px-3 py-1"
                  onClick={() => onDeleteNote(note._id)}
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Library({ auth, onOpenNote }) {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    getNotes(auth.token)
      .then((data) => {
        if (mounted) setNotes(data);
      })
      .catch(() => {
        if (mounted) setNotes([]);
      });

    return () => {
      mounted = false;
    };
  }, [auth.token]);

  const handleDeleteNote = async (noteId) => {
    try {
      setStatus("Deleting...");
      await deleteNote(auth.token, noteId);
      setNotes((prev) => prev.filter((item) => item._id !== noteId));
      setStatus("Note deleted.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const textNotes = useMemo(() => notes.filter((item) => (item.type || "text") === "text"), [notes]);
  const codeNotes = useMemo(() => notes.filter((item) => item.type === "code"), [notes]);

  return (
    <div className="p-4 sm:p-8 overflow-auto custom-scrollbar h-full">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4 border-b border-[#484848]/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#8eff71] tracking-tight">VOL_MOUNT_01 // LIBRARY</h1>
          <p className="text-[#757575] text-xs mt-2">&gt; INITIALIZING_DIRECTORY_READOUT... [SUCCESS]</p>
        </div>
        <div className="flex gap-4 text-[10px]">
          <div className="text-right">
            <span className="text-[#757575] block">STORAGE_USED</span>
            <span className="text-[#8eff71]">12.4 GB / 100.0 GB</span>
          </div>
          <div className="text-right">
            <span className="text-[#757575] block">LAST_SYNC</span>
            <span className="text-[#8eff71]">02_MIN_AGO</span>
          </div>
        </div>
      </div>
      {status && <p className="text-[10px] text-[#757575] mb-4">{status}</p>}
      <div className="space-y-8">
        <Section title="SAVED_TEXT_NOTES" items={textNotes} emptyText="No saved text notes yet." onOpenNote={onOpenNote} onDeleteNote={handleDeleteNote} />
        <Section title="SAVED_CODE_NOTES" items={codeNotes} emptyText="No saved code notes yet." onOpenNote={onOpenNote} onDeleteNote={handleDeleteNote} />
      </div>
    </div>
  );
}
