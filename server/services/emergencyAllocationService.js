const mongoose = require('mongoose');
const EmergencyEvent = require('../models/EmergencyEvent');
const BloodInventory = require('../models/BloodInventory');
const inventoryService = require('./inventoryService');
const compatibility = require('./bloodCompatibilityService');
const policy = require('../config/emergencyBloodPolicy');
const { BLOOD_TYPES } = require('../config/bloodTypeConfig');

const DISCLAIMER = 'Academic prototype – Emergency recommendations are for simulation only and must not be used for clinical decision-making.';

function httpError(message, status = 400) { const error = new Error(message); error.status = status; return error; }
function snapshotInventory(inventory) {
  return BLOOD_TYPES.map((bloodType) => { const item = inventory.find((x) => x.bloodType === bloodType) || {}; return { bloodType, unitsAvailable: Math.max(0, item.unitsAvailable || 0), reservedUnits: Math.max(0, item.reservedUnits || 0) }; });
}
function buildCasualties(data) {
  const supplied = new Map((data.casualtyData || []).map((x) => [Number(x.casualtyNumber), x.bloodType || 'UNKNOWN']));
  const base = Math.floor(data.estimatedUnitsRequired / data.numberOfCasualties);
  const extra = data.estimatedUnitsRequired % data.numberOfCasualties;
  return Array.from({ length: data.numberOfCasualties }, (_, index) => ({
    casualtyNumber: index + 1,
    bloodType: supplied.get(index + 1) || 'UNKNOWN',
    unitsRequired: base + (index < extra ? 1 : 0)
  }));
}
function validateCasualties(data, casualties) {
  const known = casualties.filter((x) => x.bloodType !== 'UNKNOWN').length;
  if (data.bloodTypeStatus === 'ALL_UNKNOWN' && known) throw httpError('All casualties must have unknown blood types');
  if (data.bloodTypeStatus === 'PARTIALLY_KNOWN' && (known === 0 || known === casualties.length)) throw httpError('Partially known status requires both known and unknown casualties');
  if (data.bloodTypeStatus === 'ALL_KNOWN' && known !== casualties.length) throw httpError('A valid blood type is required for every casualty');
}
function calculateAllocation(data, inventory) {
  if (!Number.isInteger(data.numberOfCasualties) || data.numberOfCasualties < 1) throw httpError('Number of casualties must be a positive integer');
  if (!Number.isInteger(data.estimatedUnitsRequired) || data.estimatedUnitsRequired < 1) throw httpError('Estimated units required must be a positive integer');
  const before = snapshotInventory(inventory); const projected = new Map(before.map((x) => [x.bloodType, x.unitsAvailable]));
  const reserved = new Map(before.map((x) => [x.bloodType, x.reservedUnits])); const reasons = new Map(); const allocated = new Map(); const warnings = new Set();
  const casualties = buildCasualties(data); validateCasualties(data, casualties);
  if (casualties.some((x) => x.bloodType === 'UNKNOWN')) warnings.add('Unknown recipient blood types: configured academic emergency policy applied');
  function usable(type) {
    let floor = reserved.get(type) || 0;
    if (type === 'O-' && policy.preserveONegative) floor = Math.max(floor, policy.minimumONegativeReserve);
    return Math.max(0, (projected.get(type) || 0) - floor);
  }
  function take(type, units, reason) {
    const amount = Math.min(units, usable(type)); if (!amount) return 0;
    projected.set(type, projected.get(type) - amount); allocated.set(type, (allocated.get(type) || 0) + amount); reasons.set(type, reason); return amount;
  }
  for (const casualty of casualties) {
    let needed = casualty.unitsRequired;
    if (casualty.bloodType === 'UNKNOWN') {
      needed -= take(policy.unknownRecipientPreferredType, needed, 'Emergency unknown-recipient RBC allocation under configured academic policy');
      if (needed && policy.allowOPositiveEmergencyFallback) warnings.add('O-positive fallback is policy-dependent and requires manual eligibility review; it was not automatically allocated');
      if (needed) warnings.add('Emergency policy restriction prevents additional allocation');
    } else {
      const liveInventory = before.map((x) => ({ ...x, unitsAvailable: projected.get(x.bloodType) }));
      const ranked = compatibility.rankCompatibleDonors(casualty.bloodType, liveInventory, needed);
      for (const option of ranked) { if (!needed) break; needed -= take(option.bloodType, needed, `Compatible RBC allocation for known ${casualty.bloodType} recipient using the existing compatibility engine`); }
    }
  }
  const allocation = before.map((item) => ({ bloodType: item.bloodType, unitsAllocated: allocated.get(item.bloodType) || 0, availableBefore: item.unitsAvailable, availableAfter: projected.get(item.bloodType), reason: reasons.get(item.bloodType) || 'No units allocated from this blood type' }));
  const totalAllocated = allocation.reduce((sum, x) => sum + x.unitsAllocated, 0); const shortage = data.estimatedUnitsRequired - totalAllocated;
  const oNegativeAfter = projected.get('O-') || 0;
  if (policy.preserveONegative && oNegativeAfter <= policy.minimumONegativeReserve) warnings.add('Configured O-negative emergency reserve reached');
  if (oNegativeAfter <= policy.criticalInventoryThreshold) warnings.add('O-negative inventory is low');
  if (shortage) warnings.add('Insufficient compatible emergency inventory');
  warnings.add('Manual blood-bank review required');
  const allocationStatus = shortage ? 'CRITICAL_SHORTAGE' : allocation.some((x) => x.unitsAllocated > 0 && x.availableAfter <= policy.emergencyInventoryThreshold) ? 'LOW_INVENTORY' : 'SUFFICIENT';
  return { casualties, allocation, inventorySnapshot: before, totalAllocated, shortage, allocationStatus, warnings: [...warnings] };
}
async function simulate(data) {
  const inventory = await inventoryService.list(); const result = calculateAllocation(data, inventory);
  const event = await EmergencyEvent.create({ ...data, casualtyData: result.casualties, allocation: result.allocation, inventorySnapshot: result.inventorySnapshot, totalAllocated: result.totalAllocated, shortage: result.shortage, warnings: result.warnings, allocationStatus: result.allocationStatus, status: 'SIMULATED' });
  return formatEvent(event.toObject ? event.toObject() : event);
}
function formatEvent(event) { return { ...event, workflowStatus: event.status, event: { eventName: event.eventName, casualties: event.numberOfCasualties, requestedUnits: event.estimatedUnitsRequired, bloodTypeStatus: event.bloodTypeStatus, severity: event.severity }, totalRequested: event.estimatedUnitsRequired, disclaimer: DISCLAIMER }; }
function inventoryChanged(savedInventory, currentInventory) {
  return savedInventory.some((saved) => { const now = currentInventory.find((x) => x.bloodType === saved.bloodType); return !now || now.unitsAvailable !== saved.unitsAvailable || now.reservedUnits !== saved.reservedUnits; });
}
async function supportsTransactions() {
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  return Boolean(hello.setName || hello.msg === 'isdbgrid');
}
async function confirmWithTransaction(id) {
  const session = await mongoose.startSession(); let confirmed;
  try {
    await session.withTransaction(async () => {
      const event = await EmergencyEvent.findById(id).session(session);
      if (!event) throw httpError('Emergency event not found', 404);
      if (event.status !== 'SIMULATED') throw httpError('Emergency allocation has already been confirmed or is no longer confirmable', 409);
      const current = snapshotInventory(await BloodInventory.find().session(session).lean());
      if (inventoryChanged(event.inventorySnapshot, current)) throw httpError('Inventory changed since simulation; run a new simulation', 409);
      for (const item of event.allocation.filter((x) => x.unitsAllocated > 0)) {
        const updated = await BloodInventory.updateOne({ bloodType: item.bloodType, unitsAvailable: { $gte: item.unitsAllocated } }, { $inc: { unitsAvailable: -item.unitsAllocated }, $set: { lastUpdated: new Date() } }, { session });
        if (updated.modifiedCount !== 1) throw httpError('Inventory changed since simulation; run a new simulation', 409);
      }
      event.status = 'CONFIRMED'; event.confirmedAt = new Date(); await event.save({ session }); confirmed = event.toObject();
    });
  } finally { await session.endSession(); }
  return confirmed;
}
async function confirmStandalone(id) {
  const event = await EmergencyEvent.findOneAndUpdate({ _id:id, status:'SIMULATED' }, { $set:{ status:'CONFIRMING' } }, { new:true });
  if (!event) { const exists=await EmergencyEvent.exists({ _id:id }); throw httpError(exists?'Emergency allocation has already been confirmed or is no longer confirmable':'Emergency event not found',exists?409:404); }
  const applied=[];
  try {
    const current=snapshotInventory(await BloodInventory.find().lean());
    if (inventoryChanged(event.inventorySnapshot,current)) throw httpError('Inventory changed since simulation; run a new simulation',409);
    for (const item of event.allocation.filter((x)=>x.unitsAllocated>0)) {
      const saved=event.inventorySnapshot.find((x)=>x.bloodType===item.bloodType);
      const updated=await BloodInventory.updateOne({bloodType:item.bloodType,unitsAvailable:saved.unitsAvailable,reservedUnits:saved.reservedUnits},{$inc:{unitsAvailable:-item.unitsAllocated},$set:{lastUpdated:new Date()}});
      if(updated.modifiedCount!==1) throw httpError('Inventory changed since simulation; run a new simulation',409);
      applied.push(item);
    }
    const confirmed=await EmergencyEvent.findOneAndUpdate({_id:id,status:'CONFIRMING'},{$set:{status:'CONFIRMED',confirmedAt:new Date()}},{new:true,runValidators:true});
    if(!confirmed) throw httpError('Emergency confirmation state changed unexpectedly',409);
    return confirmed.toObject();
  } catch(error) {
    for(const item of applied.reverse()) await BloodInventory.updateOne({bloodType:item.bloodType},{$inc:{unitsAvailable:item.unitsAllocated},$set:{lastUpdated:new Date()}});
    await EmergencyEvent.updateOne({_id:id,status:'CONFIRMING'},{$set:{status:'SIMULATED'}});
    throw error;
  }
}
async function confirm(id) {
  const confirmed=await (await supportsTransactions()?confirmWithTransaction(id):confirmStandalone(id));
  return formatEvent(confirmed);
}
async function list() { return EmergencyEvent.find().sort({ createdAt: -1 }).lean(); }
async function get(id) { const event = await EmergencyEvent.findById(id).lean(); return event ? formatEvent(event) : null; }

module.exports = { DISCLAIMER, calculateAllocation, simulate, confirm, list, get };
