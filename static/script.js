// Utility: sleep for animation timing
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// DOM Elements
const parentStatus = document.getElementById("parentStatus");
const parentData = document.getElementById("parentData");
const childStatus = document.getElementById("childStatus");
const childData = document.getElementById("childData");
const pipeMessage = document.getElementById("pipeMessage");
const stepsList = document.getElementById("stepsList");
const logsBox = document.getElementById("logsBox");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");

// Reset visualization
function resetUI() {
    parentStatus.textContent = "Idle";
    parentData.textContent = "-";
    childStatus.textContent = "Idle";
    childData.textContent = "-";
    pipeMessage.textContent = "";
    pipeMessage.style.left = "0px";

    stepsList.innerHTML = `<li class="placeholder">Click "Run Simulation" to see step-by-step IPC operations.</li>`;
    logsBox.innerHTML = `<p class="placeholder">Logs will appear here after simulation.</p>`;
}
resetBtn.onclick = resetUI;


// Add step to UI
function addStepToUI(step) {
    const li = document.createElement("li");
    li.innerHTML = `
        <strong>${step.title}</strong><br>
        <em>[${step.actor}]</em> - ${step.description}
    `;
    stepsList.appendChild(li);
}

// Add log to UI
function addLogToUI(log) {
    const p = document.createElement("p");
    p.innerHTML = `[${log.timestamp}] <strong>${log.level}</strong>: ${log.message}`;
    logsBox.appendChild(p);
}

// Animate message moving through pipe
async function animatePipe(text) {
    pipeMessage.textContent = text;
    pipeMessage.style.position = "absolute";

    for (let x = 0; x <= 160; x += 4) {
        pipeMessage.style.left = x + "px";
        await sleep(20);
    }
}


// MAIN SIMULATION HANDLER
runBtn.onclick = async function () {
    resetUI(); // Clear previous run
    runBtn.disabled = true;

    const message = document.getElementById("message").value;
    const authToken = document.getElementById("authToken").value;
    const useEncryption = document.getElementById("useEncryption").checked;
    const encKey = document.getElementById("encKey").value;

    const payload = {
        message,
        authToken,
        useEncryption,
        encKey
    };

    // Call backend simulation
    const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    stepsList.innerHTML = "";
    logsBox.innerHTML = "";

    // Process each simulation step with animation
    for (const step of data.steps) {
        addStepToUI(step);

        if (step.actor === "parent") {
            parentStatus.textContent = step.title;
            if (step.dataAfter?.encrypted)
                parentData.textContent = step.dataAfter.encrypted;
            else if (step.dataAfter?.messagePlain)
                parentData.textContent = step.dataAfter.messagePlain;
        }

        if (step.actor === "child") {
            childStatus.textContent = step.title;
            if (step.dataAfter?.decrypted)
                childData.textContent = step.dataAfter.decrypted;
            else if (step.dataAfter?.finalMessage)
                childData.textContent = step.dataAfter.finalMessage;
        }

        // Animate sending through pipe
        if (step.pipeData) {
            await animatePipe(step.pipeData);
        }

        await sleep(600);
    }

    // Show logs
    for (const log of data.logs) addLogToUI(log);

    runBtn.disabled = false;
};
