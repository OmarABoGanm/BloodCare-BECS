const AuditLog=require('../models/AuditLog');

const ACTIONS=Object.freeze({DONATION_CREATED:'DONATION_CREATED',INVENTORY_UPDATED:'INVENTORY_UPDATED',BLOOD_REQUEST_CREATED:'BLOOD_REQUEST_CREATED',BLOOD_REQUEST_UPDATED:'BLOOD_REQUEST_UPDATED',EMERGENCY_SIMULATED:'EMERGENCY_SIMULATED',EMERGENCY_CONFIRMED:'EMERGENCY_CONFIRMED',EMERGENCY_INVENTORY_UPDATED:'EMERGENCY_INVENTORY_UPDATED',BECS_METADATA_EXPORTED:'BECS_METADATA_EXPORTED',AUDIT_TRAIL_EXPORTED:'AUDIT_TRAIL_EXPORTED'});
function buildFilter(query={}){const filter={};if(query.action)filter.action=query.action;if(query.entityType)filter.entityType=query.entityType;if(query.startDate||query.endDate){filter.timestamp={};if(query.startDate)filter.timestamp.$gte=new Date(query.startDate);if(query.endDate){const end=new Date(query.endDate);end.setHours(23,59,59,999);filter.timestamp.$lte=end;}}return filter;}
async function createAuditLog(data,options={}){return AuditLog.create([{performedBy:'System User',...data}],options).then(rows=>rows[0]);}
async function list(query={}){const page=Math.max(1,Number(query.page)||1);const limit=Math.min(100,Math.max(1,Number(query.limit)||25));const filter=buildFilter(query);const [items,total]=await Promise.all([AuditLog.find(filter).sort({timestamp:-1,_id:-1}).skip((page-1)*limit).limit(limit).lean(),AuditLog.countDocuments(filter)]);return{items,pagination:{page,limit,total,pages:Math.ceil(total/limit)}};}
async function get(id){return AuditLog.findById(id).lean();}
async function exportRows(query={}){return AuditLog.find(buildFilter(query)).sort({timestamp:-1,_id:-1}).lean();}
module.exports={ACTIONS,buildFilter,createAuditLog,list,get,exportRows};
