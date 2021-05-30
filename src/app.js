require('dotenv').config();                     // To ganrate the secret key for the sefty
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");                     // handelbar  (like html)
const bcrypt = require("bcryptjs");              // Hashing password   
const jwt = require("jsonwebtoken");              // To genrate tokens for atontication
const cookieParser = require("cookie-parser");   // To get and fetch the value of cookies
const auth = require("./middleware/auth");       // path of auth.js file to require middleware




require("./db/conn");                                      
const contactschama = require("./models/contactschama");
const Register = require("./modules1/registerschema");
const {json} = require("express");
const {log} = require("console");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");  // to give th css path
const templets_path = path.join(__dirname, "../tamplets/views");  // to give th html path
const partials_path = path.join(__dirname, "../tamplets/partials");  // to give th html path



app.use(express.json());
app.use(cookieParser());                         // Use cookieparser
app.use(express.urlencoded({extended:false}));  // To get the deta from html page


app.use(express.static(static_path))   // define for html
app.set("view engine", "hbs");    // st view engine as hbs

app.set("views", templets_path);
hbs.registerPartials(partials_path);


// console.log(process.env.SECRET_KEY);


app.get("/",(req, res)=>{
    res.render("index");
})
app.get("/secret", auth ,(req, res)=>{     // auth is a middleare file so thats why we add "auth" argument
    // console.log(`This is the cookie ${req.cookies.jwt}`); // This is secret page if jwt cookie is avilable trheen and then the page are shown
    res.render("secret");
})

app.get("/logout", auth, async(req,res)=>{   // auth is the otintication file 
    try {
        console.log(req.user);

        // for single device logout
        req.user.tokens = req.user.tokens.filter((currentElement)=>{    // we are comparing the current token to the detabase tokens 
            return currentElement.token !== req.token                   // and if its match then delet token and remening tokens are return
            // "filter" compare the array and send maching array        // currentElement.token is filter token and req.token are current token
        })


        // // logout from all devices
        // req.user.tokens = [];      // to give the empty array it means all deta of deta is clear from the detabase and all tokens are deleted


        res.clearCookie("jwt");             // delete jwt cookie for the logout
        console.log("logout successfully");

        await req.user.save();              // save the logout data
        res.render("login", {logout: "Logout Successfully..."});                // render login page after logout 
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/logoutall", auth, async(req,res)=>{   // auth is the otintication file 
    try {
        console.log(req.user);

        // logout from all devices
        req.user.tokens = [];      // to give the empty array it means all deta of deta is clear from the detabase and all tokens are deleted


        res.clearCookie("jwt");             // delete jwt cookie for the logout
        console.log("logout successfully");

        await req.user.save();              // save the logout data
        res.render("login", {logout: "Logout Successfully..."});                // render login page after logout 
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/about",(req,res)=>{
    res.render("about");
})
app.get("/contact",(req,res)=>{
    res.render("contact");
})
app.get("/login",(req,res)=>{
    res.render("login", {message: "Please Login Here..."});
})
app.get("/register",(req,res)=>{
    res.render("register", {success: "Please Fill Your Ligal details..."});
})
app.get("/demo", async(req,res)=>{
        res.status(201).render("demo");
})

app.post("/register", async(req,res)=>{
    try {
        const password = req.body.password;          // This data is getting from user at time of ragistation
        const cpassword = req.body.cfpass;           // This data is getting from user at time of ragistation

        if(password === cpassword){
            const registerstudents = new Register({
                fullname : req.body.fullname,
                email : req.body.email,
                password: req.body.password,
                cfpass : req.body.cfpass,
                number : req.body.number
            })


            // Middleware to genrate TOKEN
            console.log("the success part" + registerstudents);
            const token = await registerstudents.generateAuthTpken();
            console.log("The token part"+ token);


            // Cookies
            // The res.cookie() function is used to set the cookie name to value 
            // The value parameter may be a string or object converted to JSON

            res.cookie("jwt", token, {             // stored token into cookies (on browser)
                expires: new Date(Date.now() + 30000),   // Time to expire the cookie
                httpOnly:true      //Client site scripting langauge can't delete this cookie 
            });      



            const register = await registerstudents.save();
            res.status(201).render("login");

        }else{
            res.render("register", {success: "Password are not meaching..."});
        }
       
    } catch (error) {
        res.render("register", {success: "Something is worong..."});
    }
})

// Post data of the user into the database
app.post("/contact",async(req,res)=>{
    try {
        console.log(req.body.name);
        console.log(req.body.emails);
        console.log(req.body.phone);
        console.log(req.body.add);
        console.log(req.body.space);

        const contactstudents = new contactschama({
            name:req.body.name,
            emails:req.body.emails,
            phone:req.body.phone,
            add:req.body.add,
            space:req.body.space
        })

      const resistered = await contactstudents.save();
      res.status(201).render("index");
        
    } catch (e) {
        res.render("register", {success: "Something is worong..."});
    }
})




// Login check
app.post("/login", async(req,res)=>{
    try {
        const email = req.body.email;         // to get email at thime of type 
        const password = req.body.password;    // to get password at thime of type 

    
        const useremail = await Register.findOne({email:email}); // find the database email and maching user entered to detabase email and stored useremail variable
        

        const isMatch = await bcrypt.compare(password, useremail.password);    // password = user entered and useremail.password = detabase password
        // compare detabase hash password and user intered password            // useremail.password is feach the password into database


        // middlewre here again a token part the will same in registerschama but here the stored value is useremail
        const token = await useremail.generateAuthTpken();
        console.log("The token part"+ token);


        res.cookie("jwt", token, {                   // stored token into cookies
            expires: new Date(Date.now() + 600000),   // Time to expire thee cookie
            httpOnly:true                            //Client site scripting langauge cant delete this cookie 
        });      



        if(isMatch){
            res.status(201).render("index");        // if password is match

        }else{
            res.status(400).render("login", {err: "Please inter valid details..."});
        }
        
    } catch (error) {
        res.status(400).render("login", {err: "Please inter valid details..."});
    }
})


app.get("*" , (req,res) =>{
    res.render("404", {
        errorcoment : "Opps page not found"
    });
});



//NOTES

// // Hashing password
// const bcrypt = require("bcryptjs");

// const securepass = async (password) =>{

//     const passHash = await bcrypt.hash(password, 10);
//     console.log(passHash);

//     const passMatch = await bcrypt.compare(password, passHash);
//     console.log(passMatch);

// }

// securepass("Harshal@123");





// // genrate unique Token because to know the user is same or not 

// const jwt = require("jsonwebtoken"); 

// const createToken = async() => {
//     const token = await jwt.sign({_id:"5fcb21fd2fd1943ec0d9ebf6"}, "onedayharshalwillbecomegoodengineer",{
//         expiresIn:"2 seconds"   // The time of token will expire
//     });
//     console.log(token);

//     // user verify
//     const userVer = await jwt.verify(token, "onedayharshalwillbecomegoodengineer");
//     console.log(userVer);
// }
// createToken();  // function call



app.listen(port,()=>{
    console.log(`server is runing on port no. ${port}`);
})
