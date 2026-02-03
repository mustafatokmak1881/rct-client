const RemoteTerminalClient = require("./index");

const client = new RemoteTerminalClient({
  onConnect: (socketId, terminalId) => {
    console.log("✅ Connected:", socketId);
    console.log("Terminal ID:", terminalId);
  },
  onDisconnect: (reason) => {
    console.log("❌ Disconnected:", reason);
  },
  onError: (error) => {
    console.error("⚠️ Error:", error.message || error);
  }
});

console.log("Connecting...");
client.connect();

process.on("SIGINT", () => {
  client.disconnect();
  process.exit(0);
});