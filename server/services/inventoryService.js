const Inventory = require('../models/BloodInventory'); const { BLOOD_TYPES } = require('../config/bloodTypeConfig');
async function list() { return Inventory.find().sort({ bloodType: 1 }).lean(); }
async function get(type) { return Inventory.findOne({ bloodType: type }).lean(); }
async function addUnits(type, units, session) { return Inventory.findOneAndUpdate({ bloodType: type }, { $inc: { unitsAvailable: units }, $set: { lastUpdated: new Date() } }, { new: true, upsert: true, session, setDefaultsOnInsert: true }).lean(); }
async function ensureAll() { await Promise.all(BLOOD_TYPES.map((bloodType) => Inventory.updateOne({ bloodType }, { $setOnInsert: { unitsAvailable: 0, reservedUnits: 0 } }, { upsert: true }))); }
module.exports = { list, get, addUnits, ensureAll };
