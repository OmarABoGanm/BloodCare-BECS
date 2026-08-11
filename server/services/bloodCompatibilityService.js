const { BLOOD_TYPES, BLOOD_TYPE_CONFIG } = require('../config/bloodTypeConfig');

const DONORS_BY_RECIPIENT = Object.freeze({
  'O-': ['O-'], 'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'], 'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'], 'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
});

function assertBloodType(type) {
  if (!BLOOD_TYPES.includes(type)) { const error = new Error(`Invalid blood type: ${type}`); error.status = 400; throw error; }
}
function getCompatibleDonors(recipient) { assertBloodType(recipient); return [...DONORS_BY_RECIPIENT[recipient]]; }
function getCompatibleRecipients(donor) { assertBloodType(donor); return BLOOD_TYPES.filter((r) => DONORS_BY_RECIPIENT[r].includes(donor)); }
function isCompatible(donor, recipient) { assertBloodType(donor); assertBloodType(recipient); return DONORS_BY_RECIPIENT[recipient].includes(donor); }
function rankCompatibleDonors(recipient, inventory = [], unitsRequired = 1) {
  assertBloodType(recipient);
  const byType = new Map(inventory.map((item) => [item.bloodType, Math.max(0, item.unitsAvailable - (item.reservedUnits || 0))]));
  return getCompatibleDonors(recipient).map((bloodType) => {
    const availableUnits = byType.get(bloodType) || 0;
    const exact = bloodType === recipient;
    const sufficient = availableUnits >= unitsRequired;
    const config = BLOOD_TYPE_CONFIG[bloodType];
    const score = (exact ? 1000 : 0) + (sufficient ? 300 : 0) + Math.min(availableUnits, 100) * 2 - config.preservationWeight - config.rarityWeight;
    const reason = exact && sufficient ? 'Exact match with sufficient inventory' : exact ? 'Exact match, but stock is insufficient' : sufficient ? `Compatible alternative; ${bloodType === 'O-' ? 'preserve universal O− when another option is suitable' : 'sufficient inventory available'}` : 'Compatible, but stock is insufficient';
    return { bloodType, compatible: true, availableUnits, sufficient, score, reason };
  }).sort((a, b) => b.score - a.score || BLOOD_TYPES.indexOf(a.bloodType) - BLOOD_TYPES.indexOf(b.bloodType));
}
module.exports = { DONORS_BY_RECIPIENT, getCompatibleDonors, getCompatibleRecipients, isCompatible, rankCompatibleDonors };
