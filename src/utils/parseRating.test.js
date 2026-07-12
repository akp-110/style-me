import { describe, it, expect } from 'vitest';
import { parseRating } from './parseRating';

const FULL_RESPONSE = `**Overall Rating: 7.5/10**

**Social Media Summary:**
Quiet luxury done loudly — the proportions save it.

**Breakdown:**
- Style: 8/10
- Weather Appropriateness: 7/10
- Occasion Fit: 7/10

**What Works:**
- The monochrome base reads intentional
- Proportions balance the oversized knit

**Suggestions:**
- Swap the sneakers for a chelsea boot
- A structured coat would sharpen the silhouette

**Weather Check:**
This outfit handles 18°C drizzle well.`;

describe('parseRating', () => {
  it('parses the full template', () => {
    const r = parseRating(FULL_RESPONSE);
    expect(r.parsed).toBe(true);
    expect(r.overall).toBe('7.5');
    expect(r.breakdown).toEqual([
      { label: 'Style', score: 8 },
      { label: 'Weather Appropriateness', score: 7 },
      { label: 'Occasion Fit', score: 7 },
    ]);
    expect(r.whatWorks).toContain('monochrome base');
    expect(r.suggestions).toContain('chelsea boot');
    expect(r.extras).toEqual([
      { title: 'Weather Check', body: 'This outfit handles 18°C drizzle well.' },
    ]);
  });

  it('parses the versatility variant (no weather)', () => {
    const r = parseRating('**Overall Rating: 9/10**\n\n**Breakdown:**\n- Style: 9/10\n- Versatility: 8/10\n- Occasion Fit: 9/10');
    expect(r.overall).toBe('9');
    expect(r.breakdown[1]).toEqual({ label: 'Versatility', score: 8 });
  });

  it('captures The Roast as an extra section', () => {
    const r = parseRating('**Overall Rating: 4/10**\n\n**The Roast:**\nThose shoes filed a complaint.');
    expect(r.extras).toEqual([{ title: 'The Roast', body: 'Those shoes filed a complaint.' }]);
  });

  it('returns parsed:false for free-form text', () => {
    const r = parseRating('Honestly this outfit is great, love the coat, maybe lose the hat.');
    expect(r.parsed).toBe(false);
    expect(r.overall).toBeNull();
    expect(r.breakdown).toEqual([]);
  });

  it('tolerates a missing breakdown while parsing the rest', () => {
    const r = parseRating('**Overall Rating: 6/10**\n\n**What Works:**\n- Nice color');
    expect(r.parsed).toBe(true);
    expect(r.breakdown).toEqual([]);
    expect(r.whatWorks).toBe('- Nice color');
  });

  it('handles null/empty input', () => {
    expect(parseRating(null).parsed).toBe(false);
    expect(parseRating('').parsed).toBe(false);
  });

  it('ignores the social media summary section (handled upstream)', () => {
    const r = parseRating(FULL_RESPONSE);
    const titles = r.extras.map((e) => e.title);
    expect(titles).not.toContain('Social Media Summary');
  });
});
