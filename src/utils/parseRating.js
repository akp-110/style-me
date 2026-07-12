/**
 * Parses the markdown rating template produced by the prompt in App.jsx.
 * Every field is nullable/empty; consumers must fall back to rendering the
 * raw markdown when `parsed` is false (or per-section when a field is null).
 *
 * Shape:
 * {
 *   overall: string|null,               // "7.5"
 *   breakdown: [{label, score:number}], // [] when not parsed
 *   whatWorks: string|null,             // raw markdown body of the section
 *   suggestions: string|null,
 *   extras: [{title, body}],            // Weather Check, The Roast, etc.
 *   parsed: boolean
 * }
 */
export function parseRating(text) {
  const empty = { overall: null, breakdown: [], whatWorks: null, suggestions: null, extras: [], parsed: false };
  if (typeof text !== 'string' || !text.trim()) return { ...empty };

  const overallMatch = text.match(/overall rating:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  const overall = overallMatch ? overallMatch[1] : null;

  // Section headers are bold runs alone on a line: **Header:**
  const headerRe = /^[ \t]*\*\*([^*\n]+?)\*\*[ \t]*$/gm;
  const headers = [...text.matchAll(headerRe)].map((m) => ({
    title: m[1].replace(/:\s*$/, '').trim(),
    start: m.index,
    end: m.index + m[0].length,
  }));

  const breakdown = [];
  let whatWorks = null;
  let suggestions = null;
  const extras = [];

  headers.forEach((h, i) => {
    const body = text.slice(h.end, i + 1 < headers.length ? headers[i + 1].start : undefined).trim();
    const t = h.title.toLowerCase();
    if (t.startsWith('overall rating') || t.startsWith('social media summary')) return;
    if (t === 'breakdown') {
      for (const line of body.split('\n')) {
        const bm = line.match(/^\s*[-•*]\s*(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*10/);
        if (bm) breakdown.push({ label: bm[1].trim(), score: parseFloat(bm[2]) });
      }
    } else if (t === 'what works') {
      whatWorks = body || null;
    } else if (t === 'suggestions') {
      suggestions = body || null;
    } else if (body) {
      extras.push({ title: h.title, body });
    }
  });

  const parsed = overall !== null || breakdown.length > 0 || whatWorks !== null || suggestions !== null;
  return { overall, breakdown, whatWorks, suggestions, extras, parsed };
}
