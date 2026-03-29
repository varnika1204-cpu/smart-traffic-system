const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.static("public"));

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/trafficDB")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// Schema
const Traffic = mongoose.model("Traffic", {
    north: Number,
    south: Number,
    east: Number,
    west: Number,
    signal: String,
    time: Number
});

// Store waiting time (memory simulation)
let wait = {
    NORTH: 0,
    SOUTH: 0,
    EAST: 0,
    WEST: 0
};

// API
app.post("/traffic", async (req, res) => {
    let { north, south, east, west, emergency } = req.body;

    let signal, time;

    // 🚑 Emergency Interrupt
    if (emergency) {
        signal = emergency;
        time = 25;
    } else {

        // 🧠 Priority logic
        let priority = {
            NORTH: north * 2 + wait.NORTH,
            SOUTH: south * 2 + wait.SOUTH,
            EAST: east * 2 + wait.EAST,
            WEST: west * 2 + wait.WEST
        };

        signal = Object.keys(priority).reduce((a, b) =>
            priority[a] > priority[b] ? a : b
        );

        // ⏱️ Dynamic timing
        let maxVehicles = Math.max(north, south, east, west);
        time = 5 + Math.floor(maxVehicles * 1.5);

        // Update waiting times
        for (let dir in wait) {
            if (dir === signal) wait[dir] = 0;
            else wait[dir] += 2;
        }
    }

    // Save
    const data = new Traffic({ north, south, east, west, signal, time });
    await data.save();

    res.json({ signal, time });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));