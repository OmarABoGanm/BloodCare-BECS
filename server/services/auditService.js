const AuditLog=require('../models/AuditLog');const context=require('./auditContext');const {sanitize}=require('./securitySanitizer');

const eventNames=['DONATION_CREATED','INVENTORY_UPDATED','BLOOD_REQUEST_CREATED','BLOOD_REQUEST_UPDATED','EMERGENCY_SIMULATED','EMERGENCY_CONFIRMED','EMERGENCY_INVENTORY_UPDATED','BECS_METADATA_EXPORTED','AUDIT_TRAIL_EXPORTED','LOGIN_SUCCESS','LOGIN_FAILED','LOGOUT','USER_CREATED','USER_ROLE_CHANGED','USER_ACTIVATED','USER_DEACTIVATED','USER_PASSWORD_RESET','ACCESS_DENIED'];
const ACTIONS=Object.freeze(Object.fromEntries(eventNames.map(name=>[name,name])));
function buildFilter(query={}){const filter={};if(query.action)filter.action=query.action;if(query.entityType)filter.entityType=query.entityType;if(query.startDate||query.endDate){filter.timestamp={};if(query.startDate)filter.timestamp.$gte=new Date(query.startDate);if(query.endDate){const end=new Date(query.endDate);end.setHours(23,59,59,999);filter.timestamp.$lte=end;}}return filter;}
async function createAuditLog(data,options={}){return AuditLog.create([sanitize({performedBy:'System User',...context.getStore(),...data})],options).then(rows=>rows[0]);}
async function list(query={}){const page=Math.max(1,Number(query.page)||1);const limit=Math.min(100,Math.max(1,Number(query.limit)||25));const filter=buildFilter(query);const [items,total]=await Promise.all([AuditLog.find(filter).sort({timestamp:-1,_id:-1}).skip((page-1)*limit).limit(limit).lean(),AuditLog.countDocuments(filter)]);return{items:items.map(sanitize),pagination:{page,limit,total,pages:Math.ceil(total/limit)}};}
async function get(id){return sanitize(await AuditLog.findById(id).lean());}
async function exportRows(query={}){return(await AuditLog.find(buildFilter(query)).sort({timestamp:-1,_id:-1}).lean()).map(sanitize);}
module.exports={ACTIONS,buildFilter,createAuditLog,list,get,exportRows};
