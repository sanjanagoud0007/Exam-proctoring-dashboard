export function chunksToBlobUrl(chunks, mimeType = "video/webm") {
  if (!chunks?.length) return null;

  const parts = chunks.map((chunk) => {
    const binary = atob(chunk);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  });

  const total = parts.reduce((n, p) => n + p.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }

  const blob = new Blob([merged], { type: mimeType });
  return URL.createObjectURL(blob);
}
