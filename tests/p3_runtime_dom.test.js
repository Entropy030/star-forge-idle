import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexHtmlPath = path.resolve(__dirname, '../index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const bootstrapPath = path.resolve(__dirname, '../src/bootstrap.js');
const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

describe('DOM Initialization and Bootstrap Integration', () => {
  test('bootstrap uses top-level await for the dynamic main import', () => {
    // Assert top-level await is present and NOT wrapped in an async IIFE
    expect(bootstrapContent).toMatch(/try\s*\{\s*await import\(['"]\.\/main\.js['"]\);/);
    expect(bootstrapContent).not.toMatch(/\(async function/);
  });

  test('raw HTML does not contain hardcoded canvas-active', () => {
    expect(indexHtmlContent).not.toMatch(/class="[^"]*canvas-active[^"]*"/);
  });

  describe('Runtime Initialization', () => {
    let dom;
    let window;
    let document;

    beforeEach(async () => {
      dom = new JSDOM(indexHtmlContent, {
        runScripts: 'dangerously',
        url: 'http://localhost/'
      });
      window = dom.window;
      document = window.document;

      // Mock matchMedia
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Set up global game dependencies for the DOM script to run without blowing up
      window.Decimal = class Decimal {
        constructor(v) { this.v = v; }
        gte() { return false; }
        lte() { return false; }
        lt() { return false; }
        gt() { return false; }
        eq() { return false; }
        plus() { return new window.Decimal(0); }
        minus() { return new window.Decimal(0); }
        times() { return new window.Decimal(0); }
        div() { return new window.Decimal(0); }
        toNumber() { return 0; }
        toString() { return '0'; }
      };

      // Create a mocked engine environment
      window.engine = {
        dispatch: vi.fn().mockReturnValue({
          ok: true,
          events: [{ type: 'CORE_CLICKED', gain: '1', quarkGain: '1', gluonGain: '1' }]
        }),
        loadState: vi.fn()
      };
      
      window.gameState = {
        activeEpoch: 1,
        resources: {
          quantumFluctuations: { amount: new window.Decimal(0) }
        },
        currencies: {
          stardust: { amount: new window.Decimal(0) }
        },
        era3: {
          temperature: new window.Decimal(0)
        }
      };

      window.getAIState = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('DOM initialization handles document readyState correctly', () => {
      const mainContent = fs.readFileSync(path.resolve(__dirname, '../src/main.js'), 'utf8');
      
      // Check the exact logic at the end of the file for readyState handling
      expect(mainContent).toMatch(/if\s*\(\s*document\.readyState\s*===\s*['"]loading['"]\s*\)\s*\{/);
      expect(mainContent).toMatch(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*initializeDomRuntime,\s*\{\s*once:\s*true\s*\}\)/);
      expect(mainContent).toMatch(/else\s*\{\s*initializeDomRuntime\(\);\s*\}/);
    });
  });
});
