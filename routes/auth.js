const express= require('express')

const bodyParser =require('body-parser')
const cors = require('cors')
const router = express.Router()
const User = require('../models/User')
const jwt =require("jsonwebtoken")
const { hashingPassword, verifyPassword } = require('../config/password-controller')
const jwt_secret=process.env.JWT_SECRET_KEY


router.use(bodyParser.urlencoded({extended:true}))
router.use(cors())
router.use(express.json())

router.post('/register',async(req,res)=>{
    
    const {name,email,password}=req.body

    if(!email || !name || !email.includes('@') || !password){
        res.status(422).json({token:'Invalid Input',auth:false})
        return;
    }

    //password validation pending

    const foundUser = await User.findOne({email:email})

    if(foundUser){
        res.status(400).json({token:'User Already Exists',auth:false})
        return;
    }

    const hashPassword= await hashingPassword(password)

    try {
        const userResult = await User.create({email,name,password:hashPassword})
        const token  = jwt.sign({email:userResult.email},jwt_secret)

        res.status(201).json({token:token,auth:true})
        
    } catch (error) {
        res.status(500).json({token:'User Not Created!',auth:false})
        
    }
})


router.post('/login',async(req,res)=>{

    const {email,password}= req.body

    if(!email || !email.includes('@') || !password){
        res.status(422).json({token:'Invalid Input!', auth:false})
        return;
    }

    const foundUser = await User.findOne({email:email})

    if (!foundUser){
        res.status(404).json({token:'Register First' ,auth:false})
        return;
    }

    const isValid = await verifyPassword(password,foundUser.password)

    if(!isValid){
        res.status(400).json({token:'Incorrect Password!',auth:false})
        return;
    }   

    const token= jwt.sign({email:foundUser.email},jwt_secret)

    res.status(200).json({token:token,auth:true})
})



module.exports=router