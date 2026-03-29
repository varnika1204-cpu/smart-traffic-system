const mongoose = require("mongoose");

const TrafficSchema = new mongoose.Schema({
    north: Number,
    south: Number,
    east: Number,
    west: Number,
    signal: String,
    time: Number,
    junction: String
});

module.exports = mongoose.model("Traffic", TrafficSchema);