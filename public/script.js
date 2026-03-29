let chart;
let running = false;

// ✅ DOM ELEMENTS (VERY IMPORTANT)
const north = document.getElementById("north");
const south = document.getElementById("south");
const east = document.getElementById("east");
const west = document.getElementById("west");
const emergency = document.getElementById("emergency");
const timer = document.getElementById("timer");

// ✅ BASE URL (FIX FOR DEPLOYMENT)
const BASE_URL = window.location.origin;

// Start system
function startSystem() {
    if (running) return;
    running = true;
    runCycle();
}

// Loop
async function runCycle() {
    let data = {
        north: +north.value || 0,
        south: +south.value || 0,
        east: +east.value || 0,
        west: +west.value || 0,
        emergency: emergency.value
    };

    try {
        let res = await fetch(`${BASE_URL}/traffic`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        let result = await res.json();

        updateChart(data);
        await runSignal(result.signal, result.time);

        if (running) runCycle();

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// Signal sequence
function runSignal(signal, time) {
    return new Promise(resolve => {
        let t = time;

        let interval = setInterval(() => {
            setLight("green");

            timer.innerText = `${signal} GREEN | ${t}s`;

            t--;

            if (t <= 2) setLight("yellow");

            if (t < 0) {
                clearInterval(interval);
                setLight("red");
                resolve();
            }

        }, 1000);
    });
}

// Light control
function setLight(color) {
    ["red","yellow","green"].forEach(id =>
        document.getElementById(id).classList.remove("active")
    );
    document.getElementById(color).classList.add("active");
}

// Chart
function updateChart(data) {
    let values = [data.north, data.south, data.east, data.west];

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels: ["North","South","East","West"],
            datasets: [{
                label: "Traffic Density",
                data: values
            }]
        }
    });
}