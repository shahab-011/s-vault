import About from "../pages/About";
import CodeNotes from "../pages/CodeNotes";
import Library from "../pages/Library";
import TextNotes from "../pages/TextNotes";

export default function Workspace({ active, auth, vaultPassphrase, textDraft, setTextDraft, codeDraft, setCodeDraft, onOpenNoteFromLibrary }) {
  if (active === "text") return <TextNotes auth={auth} vaultPassphrase={vaultPassphrase} draft={textDraft} setDraft={setTextDraft} />;
  if (active === "code") return <CodeNotes auth={auth} vaultPassphrase={vaultPassphrase} draft={codeDraft} setDraft={setCodeDraft} />;
  if (active === "library") return <Library auth={auth} onOpenNote={onOpenNoteFromLibrary} />;
  return <About />;
}
