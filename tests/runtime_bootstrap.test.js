import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import Decimal from 'break_infinity.js';

describe('Runtime bootstrap contract', () => {
  it('break_infinity.js has a usable default Decimal export', () => {
    expect(Decimal).toBeDefined();
    expect(typeof Decimal).toBe('function');
  });

  it('Constructing and operating on that export works', () => {
    const value = new Decimal(2).times(3);
    expect(value.toNumber()).toBe(6);
  });

  it('index.html references src/bootstrap.js, not src/main.js', () => {
    const indexPath = path.resolve(__dirname, '../index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    expect(indexContent).toContain('src/bootstrap.js');
    expect(indexContent).not.toContain('src/main.js');
  });

  it('No standalone break_infinity.js browser script is required', () => {
    const indexPath = path.resolve(__dirname, '../index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    expect(indexContent).not.toContain('<script src="break_infinity.js"></script>');
  });

  it('bootstrap.js assigns globalThis.Decimal before dynamically importing main.js', () => {
    const bootstrapPath = path.resolve(__dirname, '../src/bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf-8');
    
    // Check ordering: globalThis.Decimal = Decimal; should appear before import('./main.js')
    const decimalAssignIndex = bootstrapContent.indexOf('globalThis.Decimal = Decimal;');
    const importMainIndex = bootstrapContent.indexOf("import('./main.js')");
    
    expect(decimalAssignIndex).toBeGreaterThan(-1);
    expect(importMainIndex).toBeGreaterThan(decimalAssignIndex);
  });
});
