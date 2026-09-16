const mongoose=require('mongoose');
const schema=new mongoose.Schema({tokenHash:{type:String,required:true,unique:true,select:false},userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},expiresAt:{type:Date,required:true,index:{expireAfterSeconds:0}}},{timestamps:true});
module.exports=mongoose.model('AuthSession',schema);
