/**
 * Created by Administrator on 2018/11/20.
 */
const mongoose = require('mongoose');

const danmusSchema = new mongoose.Schema({
    doubanId:string,
    author:String,
    time:Number,
    text:string,
    color:Number,
    type:Number
})

const Danmus = mongoose.model('danmus',danmusSchema);

module.exports = Danmus;
















