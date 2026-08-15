import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexHtmlPath = path.resolve(__dirname, '../index.html');
let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const styleCssPath = path.resolve(__dirname, '../style.css');
const styleCssContent = fs.readFileSync(styleCssPath, 'utf8');

// Replace external link with inline style so JSDOM can parse it synchronously
indexHtmlContent = indexHtmlContent.replace(
  /<link rel="stylesheet" href="\.\/style\.css">/,
  `<style>${styleCssContent}</style>`
);

describe('Era II progression integration', () => {
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

    // Polyfill canvas methods and matches
    window.HTMLCanvasElement.prototype.getContext = () => ({});
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

    global.window = window;
    global.document = document;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    vi.restoreAllMocks();
  });

  test('Upgrade chain visibility is authoritative and updates seamlessly', async () => {
    // 1. Setup global state
    const Decimal = (await import('break_infinity.js')).default;
    window.Decimal = Decimal;
    const stateModule = await import('../src/core/state.js');
    const { gameState } = stateModule;
    
    gameState.activeEpoch = 2;
    gameState.era2 = { currentAct: 1 };
    gameState.activeTab = 'upgrades';
    gameState.upgrades = {
      plasma: {
        quarkCondenser: { level: 2, cost: new Decimal(10) },
        gluonBinding: { level: 0, cost: new Decimal(10) },
        leptonHarvest: { level: 0, cost: new Decimal(10) },
        plasmaAutomation: { level: 0, cost: new Decimal(10) },
        baryoRadiator: { level: 0, cost: new Decimal(10) }
      }
    };
    
    // Set DOM attributes
    document.body.setAttribute('data-epoch', '2');
    document.body.setAttribute('data-era2-act', '1');
    document.body.setAttribute('data-tab', 'upgrades');
    
    // 2. Initial Render
    const viewportModule = await import('../src/ui/viewport.js');
    const Viewport = viewportModule.Viewport;
    
    // Manually render generic tier list to ensure the DOM is populated
    Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
    
    const gluonRow = document.getElementById('plasma-row-gluonBinding');
    const leptonRow = document.getElementById('plasma-row-leptonHarvest');
    const protonRow = document.getElementById('plasma-row-plasmaAutomation');
    const baryoRow = document.getElementById('plasma-row-baryoRadiator');
    
    expect(gluonRow).not.toBeNull();
    
    // Confirm Gluon Matrix is hidden at L2 Quark Condenser
    expect(window.getComputedStyle(gluonRow).display).toBe('none');
    
    // 3. Change Quark Condenser to level 3
    gameState.upgrades.plasma.quarkCondenser.level = 3;
    
    // Run Viewport update (ActManager runs within this, setting era2-act to 2)
    Viewport.update();
    Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
    
    // Confirm Gluon Matrix is visible, DOM node is identical
    const gluonRowAfter = document.getElementById('plasma-row-gluonBinding');
    expect(window.getComputedStyle(gluonRowAfter).display).not.toBe('none');
    expect(window.getComputedStyle(gluonRowAfter).display).toBe('flex');
    
    // 4. Test Chain: Gluon Matrix L2 -> Lepton Collector
    expect(window.getComputedStyle(document.getElementById('plasma-row-leptonHarvest')).display).toBe('none');
    gameState.upgrades.plasma.gluonBinding.level = 2;
    Viewport.update();
    Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
    expect(window.getComputedStyle(document.getElementById('plasma-row-leptonHarvest')).display).toBe('flex');
    
    // 5. Test Chain: Lepton Collector L1 -> Proton Synthesizer
    expect(window.getComputedStyle(document.getElementById('plasma-row-plasmaAutomation')).display).toBe('none');
    gameState.upgrades.plasma.leptonHarvest.level = 1;
    Viewport.update();
    Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
    expect(window.getComputedStyle(document.getElementById('plasma-row-plasmaAutomation')).display).toBe('flex');
    
    // 6. Test Chain: Proton Synthesizer L1 -> Baryogenesis Radiator
    expect(window.getComputedStyle(document.getElementById('plasma-row-baryoRadiator')).display).toBe('none');
    gameState.upgrades.plasma.plasmaAutomation.level = 1;
    Viewport.update(); // Sets act to 3
    Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
    expect(window.getComputedStyle(document.getElementById('plasma-row-baryoRadiator')).display).toBe('flex');
  });
});
