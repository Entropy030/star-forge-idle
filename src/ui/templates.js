import { ICONS } from '../config/registry.js';

export const Templates = {
  artifactCard: (def) => `
    <div class="artifact-card">
      <div class="artifact-card-img-wrapper">
        <img src="${def.image}" alt="${def.name}" class="artifact-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="artifact-card-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
      </div>
      <div class="artifact-card-content">
        <div class="artifact-card-name">${def.name}</div>
        <div class="artifact-card-desc">${def.description}</div>
      </div>
    </div>
  `,
  artifactInventoryItem: (def, isEquipped, equippedSlot) => `
    <div class="artifact-picker-item-left">
      <div class="artifact-picker-thumb">
        <img src="${def.image}" alt="${def.name}" class="artifact-picker-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="artifact-picker-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
      </div>
      <div class="artifact-picker-info">
        <div class="artifact-picker-name" style="color: ${def.color};">${def.name} <small style="opacity: 0.6;">(${def.rarity})</small> ${isEquipped ? `<span style="color:#00ecc6; font-size:0.7rem; margin-left:6px;">[SLOT ${equippedSlot + 1}]</span>` : ''}</div>
        <div class="artifact-picker-desc">${def.description}</div>
      </div>
    </div>
    <button class="artifact-equip-btn" onclick="ArtifactManager.openPicker(0)">${isEquipped ? 'MANAGE' : 'EQUIP'}</button>
  `,
  artifactPickerEquippedItem: (def, currentSlot) => `
    <div class="artifact-picker-item-left">
      <div class="artifact-picker-thumb">
        <img src="${def.image}" alt="${def.name}" class="artifact-picker-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="artifact-picker-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
      </div>
      <div class="artifact-picker-info">
        <div class="artifact-picker-name" style="color: ${def.color};">${ICONS.pin} EQUIPPED: ${def.name}</div>
        <div class="artifact-picker-desc">${def.description}</div>
      </div>
    </div>
    <button class="artifact-equip-btn" style="border-color: #ff7675; color: #ff7675; background: rgba(255, 118, 117, 0.15);" onclick="ArtifactManager.unequip(${currentSlot})">UNEQUIP</button>
  `,
  artifactPickerAvailableItem: (def, id, currentSlot, isEquippedElsewhere) => `
    <div class="artifact-picker-item-left">
      <div class="artifact-picker-thumb">
        <img src="${def.image}" alt="${def.name}" class="artifact-picker-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="artifact-picker-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
      </div>
      <div class="artifact-picker-info">
        <div class="artifact-picker-name" style="color: ${def.color};">${def.name} <small style="opacity: 0.6;">(${def.rarity})</small></div>
        <div class="artifact-picker-desc">${def.description}</div>
      </div>
    </div>
    <button class="artifact-equip-btn" onclick="ArtifactManager.equip(${currentSlot}, '${id}')">${isEquippedElsewhere ? 'MOVE' : 'EQUIP'}</button>
  `,
  genericTierListRow: (displayColor) => `
    <div class="btn-meta">
      <strong><span class="name-display"></span> <span class="lvl-display" style="font-size: 0.75em; color: ${displayColor};"></span></strong>
      <small class="desc-display"></small>
    </div>
    <button class="upgrade-btn" style="padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size:0.78rem; margin:0; width:auto !important; min-height:unset;"></button>
  `,
  era5Dashboard: `
    <div class="era5-dashboard">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin:0; letter-spacing: 2px; color: #ff7675; text-shadow: 0 0 10px rgba(255,118,117,0.5);">THE HEAT DEATH</h2>
        <div style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #ff7675; height: 24px; border-radius: 12px; margin-top: 10px; overflow: hidden; position: relative;">
          <div id="entropy-bar-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff7675, #d63031); transition: width 0.1s linear;"></div>
          <div id="entropy-bar-text" style="position: absolute; top:0; left:0; width:100%; text-align: center; line-height: 24px; font-size: 0.8rem; font-weight: bold; mix-blend-mode: difference;">0.00% ENTROPY</div>
        </div>
      </div>
      
      <div class="resource-panel" style="margin-top: 20px;">
        <h3>Hawking Radiation</h3>
        <div id="hawking-radiation-count" class="big-number" style="color: #a29bfe; text-shadow: 0 0 15px rgba(162,155,254,0.4);">0</div>
        <div style="font-size:0.8rem; opacity:0.7;">Harvested from evaporating singularities.</div>
      </div>
      
      <div class="resource-panel" style="margin-top: 20px;">
        <h3>Information Bits</h3>
        <div id="bits-count" class="big-number" style="color: #00cec9; text-shadow: 0 0 15px rgba(0,206,201,0.4);">0</div>
        <div style="font-size:0.8rem; opacity:0.7;">The ultimate currency. Survives the Big Bounce.</div>
      </div>
    </div>
  `,
  heatDeathOverlay: `
    <div id="heat-death-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(10px); opacity: 0; transition: opacity 2s;">
      <h1 style="color: #fff; letter-spacing: 10px; font-weight: 300; font-size: 3rem; margin-bottom: 2rem;">MAXIMUM ENTROPY</h1>
      <p style="color: #aaa; max-width: 600px; text-align: center; margin-bottom: 3rem; font-size: 1.1rem; line-height: 1.6;">The universe has frozen. Time has lost all meaning. Only fundamental information remains.</p>
      <button id="btn-big-bounce" style="background: transparent; border: 2px solid #00cec9; color: #00cec9; padding: 15px 40px; font-size: 1.2rem; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; box-shadow: 0 0 20px rgba(0,206,201,0.2);">Initiate Big Bounce</button>
    </div>
  `,
  tuningModal: `
    <div class="modal" id="tuning-modal">
      <div class="modal-content" style="max-width: 800px;">
        <span class="close-btn" id="close-tuning-modal">&times;</span>
        <h2 style="color: #00cec9;"><i class="fa-solid fa-sliders"></i> Cosmic Constant Tuning</h2>
        <p style="opacity: 0.8; margin-bottom: 20px;">Alter the fundamental laws of physics for the next universe. This requires <span style="color:#00cec9; font-weight:bold;">Bits</span>.</p>
        <div style="font-size: 1.2rem; margin-bottom: 20px; text-align: right;">Available Bits: <strong id="tuning-bits-display" style="color:#00cec9;">0</strong></div>
        <div id="tuning-upgrades-list" class="upgrade-list" style="display: grid; grid-template-columns: 1fr; gap: 10px;"></div>
      </div>
    </div>
  `
};
