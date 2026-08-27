const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../config/bloodTypeConfig');

const casualtySchema = new mongoose.Schema({
  casualtyNumber: { type: Number, required: true, min: 1 },
  bloodType: { type: String, enum: [...BLOOD_TYPES, 'UNKNOWN'], required: true },
  unitsRequired: { type: Number, required: true, min: 0 }
}, { _id: false });

const allocationSchema = new mongoose.Schema({
  bloodType: { type: String, enum: BLOOD_TYPES, required: true },
  unitsAllocated: { type: Number, required: true, min: 0 },
  availableBefore: { type: Number, required: true, min: 0 },
  availableAfter: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true }
}, { _id: false });

const inventorySnapshotSchema = new mongoose.Schema({
  bloodType: { type: String, enum: BLOOD_TYPES, required: true },
  unitsAvailable: { type: Number, required: true, min: 0 },
  reservedUnits: { type: Number, required: true, min: 0 }
}, { _id: false });

const schema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true, maxlength: 120 },
  numberOfCasualties: { type: Number, required: true, min: 1 },
  bloodTypeStatus: { type: String, enum: ['ALL_UNKNOWN','PARTIALLY_KNOWN','ALL_KNOWN'], required: true },
  estimatedUnitsRequired: { type: Number, required: true, min: 1 },
  severity: { type: String, enum: ['URGENT','CRITICAL','MASS_CASUALTY'], required: true },
  casualtyData: { type: [casualtySchema], default: [] },
  allocation: { type: [allocationSchema], default: [] },
  inventorySnapshot: { type: [inventorySnapshotSchema], default: [] },
  totalAllocated: { type: Number, required: true, min: 0 },
  shortage: { type: Number, required: true, min: 0 },
  warnings: { type: [String], default: [] },
  allocationStatus: { type: String, enum: ['SUFFICIENT','LOW_INVENTORY','CRITICAL_SHORTAGE'], required: true },
  status: { type: String, enum: ['DRAFT','SIMULATED','CONFIRMING','CONFIRMED','COMPLETED','CANCELLED'], default: 'SIMULATED' },
  notes: { type: String, trim: true, maxlength: 1000 },
  confirmedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('EmergencyEvent', schema);
