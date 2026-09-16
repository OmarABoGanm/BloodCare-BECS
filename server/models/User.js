const mongoose=require('mongoose');const {ROLES}=require('../config/roles');
const schema=new mongoose.Schema({
 username:{type:String,required:true,unique:true,lowercase:true,trim:true,maxlength:80},
 fullName:{type:String,required:true,trim:true,maxlength:120},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true,maxlength:254},
 passwordHash:{type:String,required:true,select:false},
 role:{type:String,enum:ROLES,required:true},
 active:{type:Boolean,default:true},
 lastLogin:Date
},{timestamps:true,toJSON:{transform:(_doc,ret)=>{delete ret.passwordHash;return ret;}},toObject:{transform:(_doc,ret)=>{delete ret.passwordHash;return ret;}}});
module.exports=mongoose.model('User',schema);
