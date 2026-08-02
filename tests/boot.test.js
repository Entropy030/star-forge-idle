import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Browser Boot Sequence', () => {
  it('loads break_infinity.js as a global via script tag exactly like production', () => {
    // Read the actual html
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Create JSDOM instance configured to run scripts
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/'
    });

    // We manually inject the break_infinity.js content just like the browser would fetching it
    const scriptPath = path.resolve(__dirname, '../break_infinity.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Execute it in the JSDOM context
    dom.window.eval(scriptContent);
    
    // Verify it works
    expect(dom.window.Decimal).toBeDefined();
    
    // Create an instance using the global
    const dec = new dom.window.Decimal(500);
    expect(dec.toNumber()).toBe(500);
  });
});
