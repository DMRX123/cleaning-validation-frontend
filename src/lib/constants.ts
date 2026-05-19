// src/lib/constants.ts
export const PLANTS = ['Plant-1', 'Plant-2', 'Plant-3', 'Plant-4']

export const SOLUBILITY = [
  'Very Soluble',
  'Freely Soluble',
  'Soluble',
  'Sparingly Soluble',
  'Slightly Soluble',
  'Very Slightly Soluble',
  'Practically Insoluble',
  'Insoluble',
]

export const CLEANING_DIFFICULTY = [
  'Very Easy',
  'Easy',
  'Medium',
  'Difficult',
  'Very Difficult',
]

export const EQUIPMENT_TYPES = [
  'Sifter',
  'Granulator',
  'Dryer',
  'Blender/Lubricator',
  'Compression',
  'Coater',
  'Packaging',
  'Sampler',
  'Reactor',
  'Centrifuge',
  'Filter',
  'Tank',
  'Mill',
]

export const MATERIALS_OF_CONSTRUCTION = [
  'Stainless Steel 316L',
  'Stainless Steel 304',
  'Hastelloy C22',
  'Glass Lined',
  'PTFE Lined',
  'Teflon',
  'Polypropylene',
  'EPDM Rubber',
  'Viton',
  'Silicone',
]

export const HOLD_TIME_DEFAULTS = {
  reactor: { dht: 24, cht: 72, dht_max: 48, cht_max: 168 },
  dryer: { dht: 12, cht: 168, dht_max: 24, cht_max: 336 },
  mill: { dht: 8, cht: 168, dht_max: 16, cht_max: 336 },
  blender: { dht: 8, cht: 168, dht_max: 16, cht_max: 336 },
  filler: { dht: 4, cht: 24, dht_max: 8, cht_max: 72 },
  centrifuge: { dht: 12, cht: 72, dht_max: 24, cht_max: 168 },
  filter: { dht: 8, cht: 48, dht_max: 16, cht_max: 120 },
  tank: { dht: 48, cht: 168, dht_max: 96, cht_max: 336 },
  coater: { dht: 8, cht: 72, dht_max: 16, cht_max: 168 },
  granulator: { dht: 12, cht: 72, dht_max: 24, cht_max: 168 },
}