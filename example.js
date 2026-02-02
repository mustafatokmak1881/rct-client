const RemoteTerminalClient = require("remote-terminal-client");

const client = new RemoteTerminalClient({
  host: "umaigames.com",
  port: 3011,
  // If id is not specified, automatically: "rtc-hostname" (remains constant)
  // Example: "rtc-MacBook-Pro" or "rtc-server-01"
  // id: "rtc-myserver",  // Optional
  onConnect: (socketId, terminalId) => {
    console.log("Connected:", socketId);
    console.log("Terminal ID:", terminalId);
  },
  onDisconnect: (reason) => {
    console.log("Disconnected:", reason);
  },
  onError: (error) => {
    console.error("Error:", error);
  }
});

client.connect();

// Check connection status
if (client.isConnected()) {
  console.log("Client is connected");
}

// Close connection
// client.disconnect();
