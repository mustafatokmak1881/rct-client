# Remote Terminal Client

A remote command execution module that works like an Electron app but without Electron dependencies. Receives commands via Socket.IO and executes them using `child_process`.

## Features

- ✅ Connect to server via Socket.IO
- ✅ Remote command execution (`child_process.exec`)
- ✅ Automatic reconnection
- ✅ Event-based API
- ✅ No Electron dependency
- ✅ Simple cmd commands only - no extra features

## Installation

```bash
npm install remote-terminal-client
```

## Usage

### Basic Usage

```javascript
const RemoteTerminalClient = require("remote-terminal-client");

const client = new RemoteTerminalClient({
  host: "umaigames.com",
  port: 3011
});

client.connect();
```

### Advanced Usage

```javascript
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
```

## API

### Constructor Options

```javascript
{
  host: string,        // Server address (default: "localhost")
  port: number,        // Server port (default: 3011)
  id: string,          // Terminal ID (default: hostname-timestamp)
  onConnect: function, // Connection successful callback
  onDisconnect: function, // Connection closed callback
  onError: function    // Error callback
}
```

### Methods

- `connect()` - Connect to server
- `disconnect()` - Close connection
- `isConnected()` - Check connection status

## Command Formats

Any shell/cmd command can be executed:

```
ls -la
dir
echo "Hello World"
ping google.com
node --version
python --version
```

All commands are executed using `child_process.exec` and results are sent to the server.

## Example

See the `example.js` file.

## License

ISC
