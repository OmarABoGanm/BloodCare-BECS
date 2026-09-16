const mongoose=require('mongoose');
module.exports=mongoose.model('AdminLock',new mongoose.Schema({_id:String,owner:String,expiresAt:Date}));
