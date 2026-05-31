const BLOCKED_KEYS = new Set([
  "F12",
  "F11",
  "F5",
  "Escape",
]);

const BLOCKED_COMBOS = [
  { ctrl: true, key: "c" },
  { ctrl: true, key: "v" },
  { ctrl: true, key: "x" },
  { ctrl: true, key: "a" },
  { ctrl: true, key: "u" },
  { ctrl: true, key: "s" },
  { ctrl: true, key: "p" },
  { alt: true, key: "Tab" },
];

export function setupBrowserLockdown({ onViolation }) {
  const handleContextMenu = (e) => {
    e.preventDefault();
    onViolation?.("RIGHT_CLICK");
  };

  const handleCopy = (e) => {
    e.preventDefault();
    onViolation?.("COPY_PASTE");
  };

  const handlePaste = (e) => {
    e.preventDefault();
    onViolation?.("COPY_PASTE");
  };

  const handleKeyDown = (e) => {
    if (BLOCKED_KEYS.has(e.key)) {
      e.preventDefault();
      onViolation?.("KEYBOARD_SHORTCUT");
      return;
    }

    for (const combo of BLOCKED_COMBOS) {
      const ctrlOk = combo.ctrl
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const altOk = combo.alt ? e.altKey : !e.altKey;
      if (
        ctrlOk &&
        altOk &&
        e.key.toLowerCase() === combo.key.toLowerCase()
      ) {
        e.preventDefault();
        onViolation?.("KEYBOARD_SHORTCUT");
        return;
      }
    }
  };

  const handleBlur = () => {
    onViolation?.("WINDOW_BLUR");
  };

  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("copy", handleCopy);
  document.addEventListener("paste", handlePaste);
  document.addEventListener("cut", handleCopy);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("blur", handleBlur);

  return () => {
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("copy", handleCopy);
    document.removeEventListener("paste", handlePaste);
    document.removeEventListener("cut", handleCopy);
    document.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("blur", handleBlur);
  };
}
