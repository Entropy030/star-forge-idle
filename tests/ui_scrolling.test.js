import { expect, test, describe } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const styleCssPath = path.resolve(__dirname, '../style.css');
const styleCssContent = fs.readFileSync(styleCssPath, 'utf8');

describe('UI scrolling integrity', () => {
  test('body has overflow-y: auto and is not completely hidden', () => {
    // Extract the body block
    const bodyBlockMatch = styleCssContent.match(/body\s*\{([^}]*)\}/);
    expect(bodyBlockMatch).not.toBeNull();
    const bodyBlock = bodyBlockMatch[1];

    expect(bodyBlock).toMatch(/overflow-y:\s*auto/);
    expect(bodyBlock).toMatch(/overflow-x:\s*hidden/);
    expect(bodyBlock).not.toMatch(/overflow:\s*hidden(?!-)/);
    expect(bodyBlock).toMatch(/min-height:\s*100dvh/);
  });

  test('main does not trap scroll', () => {
    const mainBlockMatch = styleCssContent.match(/main\s*\{([^}]*)\}/);
    expect(mainBlockMatch).not.toBeNull();
    const mainBlock = mainBlockMatch[1];
    
    expect(mainBlock).toMatch(/overflow:\s*visible/);
  });
  
  test('html uses min-height', () => {
    const htmlBlockMatch = styleCssContent.match(/html\s*\{([^}]*)\}/);
    expect(htmlBlockMatch).not.toBeNull();
    const htmlBlock = htmlBlockMatch[1];
    expect(htmlBlock).toMatch(/min-height:\s*100%/);
  });
});
