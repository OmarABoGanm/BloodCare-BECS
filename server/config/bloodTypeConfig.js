const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
// Academic seed estimates only; validate locally before any operational use.
const BLOOD_TYPE_CONFIG = {
  'O-': { populationPercentage: 6, rarityWeight: 10, preservationWeight: 30 },
  'O+': { populationPercentage: 35, rarityWeight: 2, preservationWeight: 8 },
  'A-': { populationPercentage: 6, rarityWeight: 9, preservationWeight: 12 },
  'A+': { populationPercentage: 32, rarityWeight: 2, preservationWeight: 3 },
  'B-': { populationPercentage: 2, rarityWeight: 14, preservationWeight: 14 },
  'B+': { populationPercentage: 17, rarityWeight: 5, preservationWeight: 5 },
  'AB-': { populationPercentage: 1, rarityWeight: 18, preservationWeight: 18 },
  'AB+': { populationPercentage: 1, rarityWeight: 15, preservationWeight: 5 }
};
const INVENTORY_THRESHOLDS = { critical: 5, low: 12, target: 30 };
module.exports = { BLOOD_TYPES, BLOOD_TYPE_CONFIG, INVENTORY_THRESHOLDS };
