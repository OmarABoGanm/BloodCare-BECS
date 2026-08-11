const mongoose = require('mongoose'); const { BLOOD_TYPES } = require('../config/bloodTypeConfig');
const schema = new mongoose.Schema({ bloodType: { type: String, enum: BLOOD_TYPES, unique: true, required: true }, unitsAvailable: { type: Number, min: 0, default: 0 }, reservedUnits: { type: Number, min: 0, default: 0 }, lastUpdated: { type: Date, default: Date.now } });
module.exports = mongoose.model('BloodInventory', schema);
