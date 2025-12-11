// Utility: sleep function for animation timing
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// DOM Elements
const parentStatus = document.getElementById("parentStatus");
const parentData = document.getElementById("parentData");
const childStatus = document.getElementById("childStatus");
const childData = document.getElementById("childData");
const pipeMessage = document.getElementById("pipeMessage");
const pipeLine = document.querySelector(".pipe-line");
const stepsList = document.getElementById("stepsList");
const logsBox = document.getElementById("logsBox");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");

// Reset UI to idle state
function resetUI() {
    parentStatus.textContent = "Idle";
    childStatus.textContent = "Idle";

    parentStatus.style.color = "#c9d1d9";
    childStatus.style.color = "#c9d1d9";

    parentData.textContent = "-";
    childData.textContent = "-";

    pipeMessage.innerHTML = "";
    pipeMessage.style.left = "0px";

    stepsList.innerHTML = `<li class="placeholder">Click "Run Simulation" to see steps.</li>`;
    logsBox.innerHTML = `<p class="placeholder">Logs will appear here.</p>`;
    pipeLine.style.boxShadow = "none";
}
resetBtn.onclick = resetUI;

// Add step to UI
function addStepToUI(step) {
    const li = document.createElement("li");
    li.innerHTML = `
        <strong>${step.title}</strong><br>
        <em>[${step.actor}]</em> — ${step.description}
    `;
    stepsList.appendChild(li);
}

// Add log
function addLogToUI(log) {
    const p = document.createElement("p");
    p.innerHTML = `[${log.timestamp}] <strong>${log.level}</strong> — ${log.message}`;
    logsBox.appendChild(p);
}

// Animation for sending message through pipe
async function animatePipe(data) {
    pipeMessage.innerHTML = data;
    pipeLine.style.boxShadow = "0 0 15px #238636";

    for (let x = 0; x <= 200; x += 5) {
        pipeMessage.style.left = x + "px";
        await sleep(20);
    }

    pipeLine.style.boxShadow = "none";
}

// Main simulation execution handler
runBtn.onclick = async function () {
    resetUI();
    runBtn.disabled = true;

    const payload = {
        message: document.getElementById("message").value,
        authToken: document.getElementById("authToken").value,
        useEncryption: document.getElementById("useEncryption").checked,
        encKey: document.getElementById("encKey").value
    };

    const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    stepsList.innerHTML = "";
    logsBox.innerHTML = "";

    for (const step of data.steps) {
        addStepToUI(step);

        // Parent updates
        if (step.actor === "parent") {
            parentStatus.textContent = step.title;
            parentStatus.style.color = "#58a6ff";

            if (step.dataAfter?.encrypted)
                parentData.textContent = step.dataAfter.encrypted;
            else if (step.dataAfter?.messagePlain)
                parentData.textContent = step.dataAfter.messagePlain;
        }

        // Child updates
        if (step.actor === "child") {
            childStatus.textContent = step.title;
            childStatus.style.color = "#3fb950";

            if (step.dataAfter?.decrypted)
                childData.textContent = step.dataAfter.decrypted;
            else if (step.dataAfter?.finalMessage)
                childData.textContent = step.dataAfter.finalMessage;
        }

        // Animate message flow
        if (step.pipeData) {
            await animatePipe(step.pipeData);
        }

        await sleep(650);
    }

    // Add logs at the end
    for (const log of data.logs) {
        addLogToUI(log);
    }

    runBtn.disabled = false;
};
