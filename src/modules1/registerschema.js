const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const studentSchama = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true

    },

    password: {
        type:String,
        required: true


    },

    cfpass: {
        type: String,
        required: true

    },
    number: {
        type: Number,
        required: true


    },

    tokens:[{
        token:{
            type:String,
            required:true     // here we are genreting the token string to stored the multiple tokens from login to multiple divices 
        }
    }]


})


// Another middleware to genrate the token 
studentSchama.methods.generateAuthTpken = async function(){   // if you are not dirctley call collection(register) student is only method so you need to call only method
    try {
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY); 
        this.tokens = this.tokens.concat({token:token});  // to pass the token value into the token schema 
        await this.save();          // save the value into database
        return token;
    } catch (error) {
        res.send("the error part " + error);
        console.log("the error part " + error);
    }
}



// Middlewere for hashing password
studentSchama.pre("save", async function(next) {
                      
        if(this.isModified("password")){   // if password are modified then and then hash  
           
            this.password =await bcrypt.hash(this.password, 10); 
            this.cfpass = await bcrypt.hash(this.password, 10);
        }
        
    
    next();
})



// We need to create collection
const Register = new mongoose.model("Register", studentSchama);
module.exports = Register;

//NOTE: The first name of resister should be uppercase