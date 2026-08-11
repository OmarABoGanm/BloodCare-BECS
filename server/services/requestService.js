const BloodRequest = require('../models/BloodRequest'); const inventoryService = require('./inventoryService'); const compatibility = require('./bloodCompatibilityService');
async function create(data) { const inventory = await inventoryService.list(); const recommendations = compatibility.rankCompatibleDonors(data.requiredBloodType, inventory, data.unitsRequired); return BloodRequest.create({ ...data, recommendations, status: recommendations.some((r) => r.sufficient) ? 'MATCHED' : 'OPEN' }); }
async function list(query = {}) { const filter = {}; ['requiredBloodType','urgency','status'].forEach((key) => { if (query[key]) filter[key] = query[key]; }); return BloodRequest.find(filter).sort({ requestDate: -1 }).lean(); }
async function get(id) { return BloodRequest.findById(id).lean(); }
module.exports = { create, list, get };
