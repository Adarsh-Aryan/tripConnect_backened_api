const mongoose= require('mongoose')

const ConnectedMongoose=()=>{
    mongoose.connect("mongodb+srv://admin-adarsh:adarsh123@cluster0.jshdb.mongodb.net/TripConnect?retryWrites=true&w=majority",()=>{
        console.log("Connecion established To Database using mongoose")
    })
}

module.exports=ConnectedMongoose