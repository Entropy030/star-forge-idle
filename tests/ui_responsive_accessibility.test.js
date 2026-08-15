import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const styleCss = fs.readFileSync(path.resolve(testDir, '../style.css'), 'utf8');
const indexHtml = fs.readFileSync(path.resolve(testDir, '../index.html'), 'utf8');

describe('Responsive and accessibility contracts', () => {
  it('keeps all four navigation destinations in the semantic navigation landmark', () => {
    const navMarkup = indexHtml.match(/<nav class="tab-menu">([\s\S]*?)<\/nav>/)[1];
    expect(navMarkup.match(/class="tab-btn/g)).toHaveLength(4);
    expect(navMarkup).toContain('>Cosmos<');
    expect(navMarkup).toContain('>Forge<');
    expect(navMarkup).toContain('>Legacy<');
    expect(navMarkup).toContain('>More<');
  });

  it('reserves one safe-area-aware clearance for content above the fixed navigation', () => {
    expect(styleCss).toMatch(/--bottom-nav-clearance:\s*calc\(var\(--nav-height\) \+ 34px \+ env\(safe-area-inset-bottom, 0px\)\)/);
    expect(styleCss).toMatch(/\.tab-content\s*\{[^}]*padding:\s*16px 16px var\(--bottom-nav-clearance\)/s);
    expect(styleCss).toMatch(/\.tab-menu\s*\{[^}]*bottom:\s*max\(12px, var\(--sab\)\)/s);
  });

  it('preserves the Era label and respects system reduced-motion preferences on narrow screens', () => {
    expect(styleCss).toMatch(/@media \(max-width: 480px\)[\s\S]*?\.header-context \.timeline-banner[\s\S]*?max-width:\s*none/);
    expect(styleCss).toMatch(/\.header-context \.cosmic-phase-banner\s*\{\s*display:\s*none/);
    expect(styleCss).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\*, \*::before, \*::after/);
  });
});
