const mongoose=require('mongoose');

const postSchema=new mongoose.Schema({
  title:{type:String,required:true},
  description:{type:String,required:true},
  category:{type:String,required:true},
  name:{type:String,required:true},
  contactInfo:{type:String,required:true}
},{collection:'postInfo'});

module.exports = mongoose.model('PostInfo',postSchema);