from flask import Flask, render_template, request, jsonify
import time

app = Flask(__name__)


# --- Utility functions for simulation (Caesar cipher like your C encoder) ---

def caesar_encrypt(text: str, key: int) -> str:
    return "".join(chr((ord(ch) + key) % 0x110000) for ch in text)


def caesar_decrypt(text: str, key: int) -> str:
    return "".join(chr((ord(ch) - key) % 0x110000) for ch in text)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/simulate", methods=["POST"])
def api_simulate():
    data = request.get_json(force=True)

    # Get form data with defaults
    message = data.get("message", "Hello from parent!")
    auth_token_provided = data.get("authToken", "SECRET123")
    expected_token = "SECRET123"
    use_encryption = bool(data.get("useEncryption", True))
    key = int(data.get("encKey", 3))

    # Fake file descriptors for simulation (like your pipe fds)
    read_fd = 3
    write_fd = 4

    steps = []
    logs = []

    def add_step(title, actor, description, data_before=None, data_after=None, pipe_data=None):
        steps.append({
            "title": title,
            "actor": actor,             # "parent", "child", or "system"
            "description": description,
            "dataBefore": data_before,
            "dataAfter": data_after,
            "pipeData": pipe_data
        })

    def add_log(level, msg):
        logs.append({
            "timestamp": int(time.time()),
            "level": level,
            "message": msg
        })

    # 1. Create anonymous pipe
    add_step(
        title="Create Anonymous Pipe",
        actor="system",
        description=f"System creates an anonymous pipe with read_fd={read_fd} and write_fd={write_fd}.",
        data_before=None,
        data_after={
            "read_fd": read_fd,
            "write_fd": write_fd
        }
    )
    add_log("INFO", f"Anonymous pipe created: read_fd={read_fd}, write_fd={write_fd}")

    # 2. Fork processes
    add_step(
        title="Fork Process",
        actor="system",
        description="Parent process forks to create a child process. Both share the same pipe file descriptors.",
        data_before={"process": "parent"},
        data_after={"processes": ["parent", "child"]}
    )
    add_log("INFO", "fork() called: parent and child processes now exist")

    # 3. Authentication check
    auth_ok = (auth_token_provided == expected_token)
    add_step(
        title="Authentication Check",
        actor="system",
        description=(
            f"Parent and child initialize IPC connection with auth token '{auth_token_provided}'. "
            f"Expected token is '{expected_token}'."
        ),
        data_before={"providedToken": auth_token_provided, "expectedToken": expected_token},
        data_after={"authSuccess": auth_ok}
    )

    if not auth_ok:
        add_log("ERROR", "Authentication failed: invalid token")
        add_step(
            title="Authentication Failed",
            actor="system",
            description="Auth token does not match. IPC connection is rejected. No message is sent."
        )
        result_summary = {
            "success": False,
            "reason": "Authentication failed. Provided token does not match expected token."
        }
        return jsonify({
            "steps": steps,
            "logs": logs,
            "summary": result_summary
        })

    add_log("INFO", "Authentication successful: IPC connection established")

    # 4. Parent prepares message
    add_step(
        title="Parent Prepares Message",
        actor="parent",
        description="Parent process prepares the message to send through the pipe.",
        data_before=None,
        data_after={"messagePlain": message}
    )

    # 5. Encryption (optional)
    if use_encryption:
        encrypted = caesar_encrypt(message, key)
        add_step(
            title="Encrypt Message",
            actor="parent",
            description=f"Parent encrypts the message using a simple Caesar cipher with key={key}.",
            data_before={"plain": message},
            data_after={"encrypted": encrypted}
        )
        add_log("INFO", f"Message encrypted using Caesar cipher key={key}")
        pipe_payload = encrypted
    else:
        pipe_payload = message
        add_step(
            title="Skip Encryption",
            actor="system",
            description="Encryption is disabled. Message will be sent in plain text.",
            data_before={"plain": message},
            data_after={"sent": pipe_payload}
        )
        add_log("INFO", "Encryption disabled: sending plain text message")

    # 6. Parent writes to pipe
    add_step(
        title="Write to Pipe",
        actor="parent",
        description=f"Parent writes data to pipe using write_fd={write_fd}.",
        data_before={"write_fd": write_fd},
        data_after={"bytesWritten": len(pipe_payload)},
        pipe_data=pipe_payload
    )
    add_log("INFO", f"Parent wrote {len(pipe_payload)} bytes to pipe")

    # 7. Child reads from pipe
    add_step(
        title="Read from Pipe",
        actor="child",
        description=f"Child reads data from pipe using read_fd={read_fd}.",
        data_before={"read_fd": read_fd},
        data_after={"bytesRead": len(pipe_payload)},
        pipe_data=pipe_payload
    )
    add_log("INFO", f"Child read {len(pipe_payload)} bytes from pipe")

    # 8. Child decrypts (if needed) and displays message
    if use_encryption:
        decrypted = caesar_decrypt(pipe_payload, key)
        add_step(
            title="Decrypt Message",
            actor="child",
            description=f"Child decrypts the received data using the same key={key}.",
            data_before={"encrypted": pipe_payload},
            data_after={"decrypted": decrypted}
        )
        final_message = decrypted
        add_log("INFO", "Child decrypted the message successfully")
    else:
        final_message = pipe_payload
        add_step(
            title="Receive Plain Message",
            actor="child",
            description="Child directly interprets the received data as plain text.",
            data_before={"received": pipe_payload},
            data_after={"finalMessage": final_message}
        )
        add_log("INFO", "Child received message in plain text")

    # 9. Child prints output
    add_step(
        title="Child Prints Output",
        actor="child",
        description='Child prints: "Child received: ' + final_message + '" to stdout.',
        data_before=None,
        data_after={"stdout": f"Child received: {final_message}"}
    )
    add_log("INFO", f'Child printed: "Child received: {final_message}"')

    result_summary = {
        "success": True,
        "finalMessage": final_message,
        "usedEncryption": use_encryption,
        "key": key
    }

    return jsonify({
        "steps": steps,
        "logs": logs,
        "summary": result_summary
    })


if __name__ == "__main__":
    # On Windows this is fine; open http://127.0.0.1:5000
    app.run(host="127.0.0.1", port=5000, debug=True)
