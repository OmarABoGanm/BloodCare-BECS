function deidentifyDonor(donor){return{bloodType:donor.bloodType,unitsDonated:donor.unitsDonated,status:donor.status,donationYear:new Date(donor.donationDate).getUTCFullYear()};}
function safeInventory(item){return{bloodType:item.bloodType,unitsAvailable:item.unitsAvailable,reservedUnits:item.reservedUnits};}
module.exports={deidentifyDonor,safeInventory};
