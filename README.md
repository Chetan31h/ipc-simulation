📦 IPC Simulation Web App
Flask-based Inter-Process Communication Visualizer (Parent ↔ Pipe ↔ Child)

This project simulates how Linux processes communicate through an anonymous pipe, including:

🔐 Authentication token

🔒 Optional encryption (Caesar cipher)

🔄 Parent → Pipe → Child message flow

📄 Step-by-step IPC execution

🎨 Animated visual demonstration

📝 Real-time logs

This simulation mirrors how your actual C IPC Framework works.

🚀 Features
👨‍👩‍👦 Parent & Child Processes

Simulated fork-like behavior where:

Parent writes to pipe

Child reads and processes data

🔐 Authentication

Parent & child must match an authentication token (SECRET123).

🔒 Encryption (Optional)

Message encrypted using a Caesar Cipher before entering the pipe.

📦 Anonymous Pipe Simulation

A visual line showing message traveling from parent to child.

🪄 Step-by-step Visualizer

Shows each of these operations:

Create pipe

Fork processes

Authenticate

Encrypt

Write to pipe

Read from pipe

Decrypt

Child prints result

📘 Logs

Console-like log panel replicating logs/ipc.log.

📂 Project Structure
ipc_sim/
│── app.py                 # Flask backend
│── requirements.txt       # Python dependencies
│── Procfile               # Render deployment config
│
├── templates/
│    └── index.html        # Frontend UI
│
└── static/
     ├── style.css         # UI styling
     └── script.js         # Animations & API calls

▶️ Running Locally
1. Install dependencies
pip install -r requirements.txt

2. Start the Flask server
python app.py

3. Open in browser
http://127.0.0.1:5000

🌐 Hosting on Render

Project is deployment-ready with:

Procfile

Gunicorn

Dynamic port binding

1. Connect GitHub repo
2. Create new Web Service
3. Use:
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app

🧑‍🏫 Ideal For

College viva

OS / Networking projects

IPC demonstrations

Portfolio showcase

⭐ Author

Chetan
BTech CSE Student, LPU
Passionate about systems programming, data science, and AI.

🚀 Future Enhancements

Add FIFO (named pipe) simulation

Add message queues

Add shared memory visualization

Add real C backend option
🚀 Deployment on Render (Live Hosting)

This project is fully configured for Render free hosting, allowing the Flask backend and UI to run online.

1️⃣ Connect GitHub repository

Login to Render → New → Web Service
Select the repo: ipc-simulation

2️⃣ Set Build & Run Commands

Build Command:

pip install -r requirements.txt


Start Command:

gunicorn app:app

3️⃣ Environment Settings
Setting	Value
Runtime	Python 3
Instance	Free Tier
Auto Deploy	Yes
Region	Any
4️⃣ Repository Requirements

Render needs these files:

File	Purpose
Procfile	Tells Render how to start Flask
requirements.txt	All Python dependencies
app.py	Your Flask backend
static/	CSS + JS
templates/	HTML frontend

✔ You already have all of these.

5️⃣ Deployment Output

After deployment, Render will give you a public URL like:

https://ipc-simulation.onrender.com


Your simulation will run online with full:

animations

logs

parent/child updates

encryption

IPC visualization

browser-based UI

🏁 Final Notes

This project demonstrates:

Linux IPC (pipes)

Parent/child process simulation

Encryption/decryption workflow

Authentication token system

Real-time step visualization

Flask backend + HTML/CSS/JS frontend

Deployment on Render cloud

Perfect for college viva, portfolio, and systems programming learning.

🎉 STEP 2 — Commit #7 (final commit)

Run:

git add README.md
git commit -m "Add Render deployment instructions and finalize documentation"
git push

