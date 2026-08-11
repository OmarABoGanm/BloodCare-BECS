const Donation = require('../models/Donation'); const inventory = require('./inventoryService');
async function create(data) { const donation = await Donation.create(data); let updatedInventory = await inventory.get(data.bloodType); if (data.status === 'AVAILABLE') updatedInventory = await inventory.addUnits(data.bloodType, data.unitsDonated); return { donation, inventory: updatedInventory }; }
async function list() { return Donation.find().sort({ donationDate: -1 }).lean(); }
module.exports = { create, list };
