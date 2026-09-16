const forbidden=/password|secret|token|cookie|authorization|mongodb.?uri|session/i;
function sanitize(value){if(value===null||value===undefined)return value;if(value instanceof Date)return value;if(value._bsontype==='ObjectId')return String(value);if(Array.isArray(value))return value.map(sanitize);if(typeof value==='object'){if(value.toObject)value=value.toObject();return Object.fromEntries(Object.entries(value).filter(([key])=>!forbidden.test(key)).map(([key,item])=>[key,sanitize(item)]));}return value;}
module.exports={sanitize};
