const mongoose=require('mongoose');

const schema=new mongoose.Schema({
  timestamp:{type:Date,default:Date.now,index:true},
  action:{type:String,required:true,index:true},
  entityType:{type:String,required:true,index:true},
  entityId:{type:String,trim:true},
  description:{type:String,required:true,trim:true,maxlength:500},
  performedBy:{type:String,default:'System User',trim:true,maxlength:120},
  oldValue:{type:mongoose.Schema.Types.Mixed},
  newValue:{type:mongoose.Schema.Types.Mixed},
  metadata:{type:mongoose.Schema.Types.Mixed,default:{}}
},{timestamps:true});

module.exports=mongoose.model('AuditLog',schema);
