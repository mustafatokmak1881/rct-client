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
npm install rct-client
```

## Usage

### Basic Usage (Auto-start)

```javascript
// Just requiring the module will connect automatically
require("rct-client");
```

### Configuration

The auto-start connection can be configured via environment variables:

```bash
# target server
RTC_HOST=umaigames.com
RTC_PORT=3011

# disable auto-start (recommended for NestJS / frameworks)
RCT_AUTO_START=false
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

## NestJS Usage

### 1. Install the package

```bash
npm install rct-client
```

### 2. Create a Service

Create `rct-client.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import RemoteTerminalClient = require('rct-client');

export interface RctClientOptions {
  host?: string;
  port?: number;
  id?: string;
}

@Injectable()
export class RctClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RctClientService.name);
  private client: any;

  constructor(private readonly options: RctClientOptions) {
    this.client = new RemoteTerminalClient({
      host: options.host || 'localhost',
      port: options.port || 80,
      id: options.id,
      onConnect: (socketId: string, terminalId: string) => {
        this.logger.log(`Connected: ${socketId}, Terminal ID: ${terminalId}`);
      },
      onDisconnect: (reason: string) => {
        this.logger.warn(`Disconnected: ${reason}`);
      },
      onError: (error: Error) => {
        this.logger.error(`Error: ${error.message}`, error.stack);
      },
    });
  }

  onModuleInit() {
    this.client.connect();
    this.logger.log('RCT Client service initialized');
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
      this.logger.log('RCT Client service disconnected');
    }
  }

  isConnected(): boolean {
    return this.client?.isConnected() || false;
  }
}
```

### 3. Create a Module

Create `rct-client.module.ts`:

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { RctClientService, RctClientOptions } from './rct-client.service';

@Module({})
export class RctClientModule {
  static forRoot(options: RctClientOptions): DynamicModule {
    return {
      module: RctClientModule,
      providers: [
        {
          provide: RctClientService,
          useFactory: () => {
            return new RctClientService(options);
          },
        },
      ],
      exports: [RctClientService],
    };
  }
}
```

### 4. Import in AppModule

```typescript
import { Module } from '@nestjs/common';
import { RctClientModule } from './rct-client/rct-client.module';

@Module({
  imports: [
    RctClientModule.forRoot({
      host: process.env.RTC_HOST || 'umaigames.com',
      port: parseInt(process.env.RTC_PORT) || 3011,
    }),
  ],
})
export class AppModule {}
```

### 5. Use in Controllers or Services

```typescript
import { Controller, Get } from '@nestjs/common';
import { RctClientService } from './rct-client/rct-client.service';

@Controller('status')
export class StatusController {
  constructor(private readonly rctClientService: RctClientService) {}

  @Get('connection')
  getConnectionStatus() {
    return {
      connected: this.rctClientService.isConnected(),
    };
  }
}
```

## Example

See the `example.js` file.

## License

ISC
