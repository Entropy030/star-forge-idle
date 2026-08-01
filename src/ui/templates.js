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
  `
};
