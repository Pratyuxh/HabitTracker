const dotenv = require("dotenv");

dotenv.config();

const mongoose = require('mongoose');

exports.connectMongoose =()=>{
    mongoose.set("strictQuery", false);
    mongoose.connect('mongodb+srv://pratyuxhsharma:1DAgJQs7SQfR1F2m@habit-tracker.cjpdz.mongodb.net/csv-upload?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then((e)=>console.log("Connected to Mongodb => Habit-Tracker"))
    .catch((e)=>console.log("Not Connect Mongodb", e));
}