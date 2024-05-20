const port = 4000;
const express = require("express")
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const cors = require('cors');
const { type } = require("os");
const bodyParser = require('body-parser');
const { error, log } = require("console");

app.use(express.json());
app.use(cors());

app.use(bodyParser.json());


// data base connection mongoDb

mongoose.connect('mongodb+srv://Binshad07:b1nshad1@cluster0.bf6pb4d.mongodb.net/e-commerce')
 
// API Creation

app.get('/',(req,res)=>{
    res.send('express is running')
})

//image Storage
const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
           return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})


const upload = multer({
    storage:storage
})


// Creating upload images

app.use('/images',express.static('upload/images'))

app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for Creating Products  

const Product = mongoose.model("product",
{
   id:{
    type:Number,
    required:true,  
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
}) 

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id ;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1
    }else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price
    })
    console.log(product);
    await product.save()
    console.log("saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})


// Creating API deleting

app.post('/removeproduct',async(req,res)=>{
    let deleteProduct = await Product.find({
        id:req.body.id,
        name:req.body.name,
    })
    console.log(deleteProduct,'got it');
    if(deleteProduct){

        await Product.findOneAndDelete({
            id:req.body.id,
            name:req.body.name
        })
        console.log('removed');
         res.status(404).json({
            success:true,  
            name:req.body.name,
            message:'data success fully deleted'
        })
    }else{
        res.status(404).json({
            success:false,
            title:'sorry we can not find this id and name'
        })
        console.log("sorry");

    }
}) 

// Creating API for getting All products

app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({})
    console.log('all products fetched');
    res.status(200).send(products);
})

// Schema creating for  User model

const Users = mongoose.model('user',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating EndPoint for registering the user

app.post('/signup',async (req,res)=>{
/*     const {name,password,email,} = req.body;
 */
console.log(req.body);
    let check = await  Users.findOne({email:req.body.email})
    if(check){
        return res.status(400).json({
         success:false,
         errors:'existing user found with same email address'
        })
    }
    let cart = {};
    for (let i = 0 ;i < 300; i++){
        cart[i]=0;
    }
    
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({
        success:true,
        token
    })

})

// creating EndPoint for login'

   app.post('/login',async (req,res)=>{
    let user =  await Users.findOne({email:req.body.email})
    console.log(user);
    if(user){
/*         console.log('password ',user.password,' ', req.body.password);
 */        const passCompare = req.body.password === user.password  ;
        console.log('passCompare',passCompare);
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom')
            res.json({
                success:true,token
            })
        }else{
            res.json({
                success:false,
                errors:"Wrong Password",
            })
        }
    }else{
        res.json({
            success:false,
            errors:'Wrong email Id'
        })
    }
   })

   //Creating  endpoint for newCollection data
 
   app.get('/newcollections',async(req,res)=>{
    let product = await Product.find({});
    let newCollection = product.slice(1).slice(-8);
    console.log('new collection fetched');
    res.send(newCollection).status(200)
   })

   // creating endpoint for popular in women section
   
    app.get('/popularinwomen',async(req,res)=>{
        let products = await Product.find({category:'women'})
        let popular_in_women = products.slice(0,4);
        console.log('Popular in women fetched');
        res.send(popular_in_women);
    })
       // creating middelware to fetch user
       const fetchUser = async (req,res,next)=>{
        const token = req.header('auth-token');
        if(!token){
            res.status(401).send({
                errors:'please authenticate using valid token'
            })
        }else{
            try{
             const data = jwt.verify(token,'secret_ecom');
             req.user = data.user;
             next();
            }catch (error){
             res.status(401).send({errors:'please authenticate valid token'})
            }
        }
       }
    //creating end point to cartItem 
    app.post('/addtocart',fetchUser,async (req,res)=>{
        let userData = await Users.findOne({_id:req.user.id})
        userData.cartData[req.body.itemId] +=1;
        await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
        res.send('Added')
    })

    //creating endpoint to remove product from cartData

    app.post('/removefromcart',fetchUser,async(req,res)=>{

        console.log('removed',req.body.itemId);
        let userData = await Users.findOne({_id:req.user.id})
        if(userData.cartData[req.body.itemId]>0){
            userData.cartData[req.body.itemId] -=1;
            await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
            res.send('removed')  
        }
    })

    // Creating endpoint to get cartData
    
    app.post('/getcart',fetchUser,async(req,res)=>{
        console.log('getCart');
        let userData = await Users.findOne({_id:req.user.id})

        res.json(userData.cartData);
    })

app.listen(port,(error)=>{
    if(!error){
        console.log("server running port",port); 
    }else{
        console.log('Error',error);
    }
})