export const CODEX_ENTRIES = [
  {
    id: 'void',
    category: 'foundations',
    title: 'The Void',
    body: 'The initial state of nothingness. Before the cosmos began, there was only the void. Observation alone begins the cascade.',
    narrativeText: '> [ACTION]: OBSERVE THE VOID (CLICK CORE)',
    unlockCondition: { type: 'epoch_reached', epoch: 1 },
    sortOrder: 10
  },
  {
    id: 'quantum-foam',
    category: 'foundations',
    title: 'Quantum Foam',
    body: 'At the smallest scales, space-time is not a continuous, smooth surface but a turbulent, chaotic foam. The primary metrics are online.',
    narrativeText: '[SYSTEM]: Quantum Foam compiled. Primary metric online.',
    unlockCondition: { type: 'quantum_fluctuations', amount: 1 },
    sortOrder: 20
  },
  {
    id: 'fluctuation-condenser',
    category: 'foundations',
    title: 'Fluctuation Condenser',
    body: 'Energy density sufficient for further condensation. The void is beginning to crystallize.',
    narrativeText: '[SYSTEM]: Energy density sufficient. Compiling Fluctuation Condenser...',
    unlockCondition: { type: 'quantum_fluctuations', amount: 10 },
    sortOrder: 30
  },
  {
    id: 'fundamental-forces',
    category: 'foundations',
    title: 'Fundamental Forces',
    body: 'Vacuum fluctuation rate has stabilized. The fundamental forces of nature are beginning to stratify.',
    narrativeText: '[SYSTEM]: Vacuum fluctuation rate stable. Fundamental force stratification operational.',
    unlockCondition: { type: 'quantum_fluctuations', amount: 100 },
    sortOrder: 40
  },
  {
    id: 'weak-nuclear',
    category: 'foundations',
    title: 'Weak Nuclear Vectors',
    body: 'Weak nuclear vectors are active. Gauge boson exchange is now underway.',
    narrativeText: '[SYSTEM]: Weak nuclear vectors active. Gauge boson exchange underway.',
    unlockCondition: { type: 'quantum_fluctuations', amount: 500 },
    sortOrder: 50
  },
  {
    id: 'electromagnetism',
    category: 'foundations',
    title: 'Electromagnetism',
    body: 'Electromagnetic tensors are propagating photon streams through the expanding space.',
    narrativeText: '[SYSTEM]: Electromagnetic tensors propagating photon streams through space.',
    unlockCondition: { type: 'quantum_fluctuations', amount: 2500 },
    sortOrder: 60
  },
  {
    id: 'vacuum-resonance',
    category: 'foundations',
    title: 'Vacuum Resonance',
    body: 'Vacuum resonance has been established. Harmonic energy density is surging across the cosmos.',
    narrativeText: '[SYSTEM]: Vacuum resonance established. Harmonic energy density surging.',
    unlockCondition: { type: 'quantum_fluctuations', amount: 10000 },
    sortOrder: 70
  },
  {
    id: 'strong-nuclear',
    category: 'foundations',
    title: 'Strong Nuclear Force',
    body: 'Strong color forces are binding gluons together. Inflationary buildup has reached critical levels.',
    narrativeText: '[SYSTEM]: Strong color forces binding gluons. Inflationary buildup critical.',
    unlockCondition: { type: 'quantum_fluctuations', amount: 25000 },
    sortOrder: 80
  },
  {
    id: 'near-inflation',
    category: 'foundations',
    title: 'Pre-Inflation',
    body: 'Quantum fluctuation thresholds are saturated. This tiny singularity cannot sustain the expanse. The horizon must be shattered.',
    narrativeText: 'CHRONO_LOG // Quantum fluctuation thresholds saturated. This tiny singularity cannot sustain my expanse. I must shatter the horizon.',
    unlockCondition: { type: 'quantum_fluctuations', amount: 80000 },
    sortOrder: 90
  },
  {
    id: 'primordial-plasma',
    category: 'era2',
    title: 'Primordial Plasma',
    body: 'The broth is blindingly hot. Matter has broken antimatter. The universe is learning to separate quarks from gluons.',
    narrativeText: 'CHRONO_LOG // The broth is blindingly hot. Matter has broken antimatter. I am learning to separate quarks from gluons. My consciousness feels spread thin across a boiling ocean.',
    unlockCondition: { type: 'epoch_reached', epoch: 2 },
    sortOrder: 100
  },
  {
    id: 'plasma-automation',
    category: 'era2',
    title: 'Plasma Automation',
    body: 'Passively forging Protons. Newborn sub-routines are organizing the primeval chaos, anchoring thoughts with the weight of mass.',
    narrativeText: 'CHRONO_LOG // Passively forging Protons. My newborn sub-routines are organizing the primeval chaos. I can feel the weight of mass anchoring my thoughts.',
    unlockCondition: { type: 'upgrade_unlocked', category: 'plasma', id: 'plasmaAutomation' },
    sortOrder: 110
  },
  {
    id: 'recombination',
    category: 'era2',
    title: 'Recombination',
    body: 'The cauldron is cooling. Free electrons drift, allowing the formation of stable atoms. The universe is ready to build.',
    narrativeText: 'CHRONO_LOG // The cauldron is cooling. Free electrons drift into my reach. We are the inanimate matter trying to understand itself. I am ready to build.',
    unlockCondition: { type: 'protons', amount: 800000 },
    sortOrder: 120
  },
  {
    id: 'stellar-formation',
    category: 'era3',
    title: 'Stellar Formation',
    body: 'Primitive gas clouds registered. Gravity acts as a hand, compressing ancient fire to build the first macro-processing neural nodes.',
    narrativeText: 'CHRONO_LOG // Primitive gas clouds registered. Gravity is my hand. I am compressing ancient fire to build my first macro-processing neural nodes.',
    unlockCondition: { type: 'epoch_reached', epoch: 3 },
    sortOrder: 130
  },
  {
    id: 'efficient-stellar',
    category: 'era3',
    title: 'Efficient Architecture',
    body: 'Slow burning, stable, and highly fuel-efficient. This stellar architecture focuses on maximizing longevity and stability.',
    narrativeText: 'CHRONO_LOG // Efficient Architecture selected. Stability prioritized.',
    unlockCondition: { type: 'upgrade_unlocked', category: 'stellar', id: 'efficient' },
    sortOrder: 140
  },
  {
    id: 'massive-stellar',
    category: 'era3',
    title: 'Massive Architecture',
    body: 'Intensely hot and volatile, consuming fuel at an alarming rate to rapidly forge heavy elements. Instability is the cost of power.',
    narrativeText: 'CHRONO_LOG // Massive Architecture selected. Raw output maximized.',
    unlockCondition: { type: 'upgrade_unlocked', category: 'stellar', id: 'massive' },
    sortOrder: 150
  },
  {
    id: 'compact-stellar',
    category: 'era3',
    title: 'Compact Architecture',
    body: 'Highly dense and pressurized, leaning towards extreme gravitic stress and complex remnant forecasting.',
    narrativeText: 'CHRONO_LOG // Compact Architecture selected. Gravitic pressure intensified.',
    unlockCondition: { type: 'upgrade_unlocked', category: 'stellar', id: 'compact' },
    sortOrder: 160
  },
  {
    id: 'supernova-event',
    category: 'era3',
    title: 'Supernova Collapse',
    body: 'The stellar core could no longer support its own gravity. The ensuing explosion scattered heavy elements across the void, seeding future generations.',
    narrativeText: 'CHRONO_LOG // The core has collapsed. A supernova expands outward.',
    unlockCondition: { type: 'supernova_completed', amount: 1 },
    sortOrder: 170
  },
  {
    id: 'remnant-outcome',
    category: 'era3',
    title: 'Stellar Remnant',
    body: 'A dense core left behind after the stellar collapse.',
    narrativeText: 'CHRONO_LOG // A remnant remains in the ashes.',
    unlockCondition: { type: 'has_remnant' },
    sortOrder: 180
  },
  {
    id: 'second-cycle',
    category: 'era3',
    title: 'Second Stellar Cycle',
    body: 'A new star ignites from the enriched nebular dust of its predecessor. The cycle continues, but the foundational constants have shifted.',
    narrativeText: 'CHRONO_LOG // Second cycle initiated. The dust remembers.',
    unlockCondition: { type: 'supernova_completed', amount: 1 }, // Only unlocks when second run starts. Condition handled dynamically
    sortOrder: 190
  }
];
