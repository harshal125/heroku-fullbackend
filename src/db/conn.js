const mongoose = require("mongoose");




mongoose.connect("mongodb+srv://college-project07:React@07@cluster0.lmwyh.mongodb.net/React_App?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(() =>{
    console.log(`connection successful`);
}).catch((e) =>{
    console.log(`no connection`);
})