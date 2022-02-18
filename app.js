const express =require('express')
const bodyParser=require("body-parser")
const cors=require("cors")
const mongo= require('mongodb')
const dotenv =require("dotenv")
const ConnectedMongoose= require('./database/db.js')
dotenv.config();
const MongoClient=mongo.MongoClient
const mongoUrl="mongodb+srv://admin-adarsh:adarsh123@cluster0.jshdb.mongodb.net/TripConnect?retryWrites=true&w=majority"
var db;
let port = process.env.PORT || 5000;


ConnectedMongoose();
//declare app
const app= express(); 

//middleWares
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())
app.use('/api/auth',require('./routes/auth'))

app.get('/',(req,res)=>{
    res.send("Its been delighted to Welcome you at TripConnect")
})

//get Routes
app.get("/location",(req,res)=>{
    db.collection('location').find().toArray((err,result)=>{
        if(err){
            console.log(err)
        }else{
            res.send(result)
        }
    })
       
})

//get hotels
app.get('/hotels',(req,res)=>{
    db.collection('hotelData').find().toArray((err,result)=>{
        if(err){
            throw err
        }
        res.send(result)
    })
})

//get hotels wrt city

app.get("/hotels/:id",(req,res)=>{
    db.collection('hotelData').find({city_id:req.params.id}).toArray((err,result)=>{
        if(err){
            throw err
        }else{
            res.send(result);
        }
    })
})

//get hotels wrt hotelType
app.get("/hotelsCat/:id",(req,res)=>{
    db.collection('hotelData').find({"hotelType.cat_id":req.params.id}).toArray((err,result)=>{
        if(err){
            throw err
        }
        else{
            res.send(result)
        }
    })
})
//get all Facilities
app.get("/allFacilities",(req,res)=>{
    db.collection('facilities').find().toArray((err,result)=>{
        if(err){
            throw err

        }
        res.send(result)
    })
})

//filter data

app.get('/filter/:hotelType',(req,res)=>{
    let sort={cost:1};
    let skip=0;
    let limit=100000000000;
    let category_id=req.params.hotelType //hotelType id
    let facility_id=req.query.facility// facilty id
    let lcost= (req.query.lcost)
    let hcost =(req.query.hcost)
    let query={}

    if(req.query.sort){
        sort={cost:req.query.sort}
    }
    if(req.query.skip && req.query.limit){
        skip = Number(req.query.skip);
        limit = Number(req.query.limit);
    }
    if(facility_id && lcost && hcost){
        query = {
            "facilities.fac_id":facility_id,
            "hotelType.cat_id":category_id,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }

    else if(facility_id){
        query={"hotelType.cat_id":category_id,"facilities.fac_id":facility_id}
    }
    else if(lcost&hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"hotelType.cat_id":category_id}
    }



    db.collection('hotelData').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result)=>{
        if(err){
            throw err
        }
        else{
            res.send(result)
        }
    })

})

//get hotelCategory
app.get("/hotelType",(req,res)=>{
    db.collection('hotelCategory').find().toArray((err,result)=>{
        if(err){
            throw err
        }
        res.send(result)
    })
})


//details page

app.get("/details/:id",(req,res)=>{
    db.collection('hotelData').find({hotel_id:req.params.id}).toArray((err,result)=>{
        if(err){
            throw err
        }
        res.send(result[0])
    })
})

//get all bookings
app.get("/allBookings",(req,res)=>{
    let email=req.query.email
    db.collection('allBookings').find({"email":email}).toArray((err,result)=>{
        if(err){
            throw err
        }
        if(result.length===0){
            res.send(`No booking found on this user ${email}`)
            // stop further execution in this callback
            return;
        }
        res.send(result)
    })
})
//placeBooking (post call)
app.post("/placeBooking",(req,res)=>{
    
    db.collection('allBookings').insertOne(req.body,(err)=>{
        if(err){
            throw err
        }
        res.send("Booking Placed")
    })
})

//updateBookingOrder (put call)
app.put("/updateBooking/:id",(req,res)=>{
    
    let status= req.query.status?req.query.status:'Not Confirmed'
    db.collection('allBookings').updateOne(
        {_id:mongo.ObjectId(req.params.id)},
        {$set:{
            "status":status

        }},(err)=>{
            if(!err){
                res.send(`Update your status to ${status}`)
            }
            else{
                console.log(err)
            }
        }
    )
})

//deleteBookingOrder (delete call)
app.delete("/deleteBooking/:id",(req,res)=>{
    let bookingId= mongo.ObjectId(req.params.id)
    db.collection('allBookings').remove({_id:bookingId},(err)=>{
        if(!err){
            res.send("Order deleted Successfully")
        }
        else{
            console.log(err)
        }
    })
})














//connect to database and listen the express app
MongoClient.connect(mongoUrl,(err,client)=>{
    if(!err){
        db=client.db('TripConnect')
        app.listen(port,()=>{
            console.log(`app is listening on port ${port}`)
        })
    }
    else{
        console.log("Error while connecting to your database")
    }
})















