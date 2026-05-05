export function toAbsoluteM3u8(url: string, playlist: string) {
  const lines = playlist.split("\n");
  let isM3u8 = false;
  let basePath = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check for valid m3u8 header
    if (line.startsWith('#EXTM3U')) {
      isM3u8 = true;
      // Extract base path from URL (origin only)
      const urlObj = new URL(url);
      basePath = urlObj.origin + '/';
    }

    // Fix relative m3u8 paths by prepending base path
    if (isM3u8 && line.startsWith('/') && line.endsWith('.m3u8')) {
      lines[i] = basePath + line.slice(1);
    }
  }

  return isM3u8 ? lines.join("\n") : playlist;
}