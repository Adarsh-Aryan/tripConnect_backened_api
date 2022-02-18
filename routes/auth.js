const express= require('express')
const bcrypt =require('bcrypt')
const bodyParser =require('body-parser')
const cors = require('cors')
const router = express.Router()
const User = require('../models/User')
const jwt =require("jsonwebtoken")
const jwt_secret=process.env.JWT_SECRET_KEY


router.use(bodyParser.urlencoded({extended:true}))
router.use(cors())
router.use(express.json())

router.get('/getAllUsers',(req,res)=>{
    User.find({},(err,result)=>{
        if(err){
            throw err
        }
        res.send(result)
    })
})

router.post('/register',(req,res)=>{
    
    User.findOne({email:req.body.email},(err,foundUser)=>{

        
        
        if(err){
            throw err
        }
        if(!foundUser){
            const saltRounds=8;
            const hashPassword=bcrypt.hashSync(req.body.password,saltRounds)
            User.create({
                name:req.body.name,
                email:req.body.email,
                password:hashPassword
            }).then(()=>{
                res.status(201).send("User Registered Succesfully")
            })
            return;
        }
        res.send("User already Exists")
    })
})


router.post('/login',(req,res)=>{
    User.findOne({email:req.body.email},(err,foundUser)=>{
        if(err){
            throw err
        }
        if(foundUser){
            const result= bcrypt.compareSync(req.body.password,foundUser.password);
            if(result){
                const data= {
                    id:foundUser._id
                }
                const secret= jwt_secret
                const token =jwt.sign(data,secret);
                res.status(200).send({auth:true,token:token})
                return
            }
            else{
                res.status(400).send({auth:false,msg:"Invalid Password"})
                return;
            }
        }
        res.send("User not Found ,Please Register first")
    })
})

router.get('/userInfo',(req,res)=>{
    const token = req.headers['access-token']
    if(!token){
        res.send("Token not found!")
    }
    else{
        const data= jwt.verify(token,'TripBar')
        const {id}=data
        User.findById(id,(err,user)=>{
            if(err){
                throw err
            }
            res.status(200).send(user)
        })
    }
})

module.exports=router