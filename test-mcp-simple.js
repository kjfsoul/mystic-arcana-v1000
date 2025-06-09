const { spawn } = require('child_process');

console.log('Testing MCP Filesystem Server...\n');

// Start the server
const server = spawn('npx', [
  '-y',
  '@modelcontextprotocol/server-filesystem',
  process.cwd()
]);

// Send initialization
setTimeout(() => {
  const initRequest = {
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "0.1.0",
      capabilities: {}
    },
    id: 1
  };
  
  console.log('Sending:', JSON.stringify(initRequest));
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

// Send tools list request
setTimeout(() => {
  const toolsRequest = {
    jsonrpc: "2.0",
    method: "tools/list",
    id: 2
  };
  
  console.log('\nSending:', JSON.stringify(toolsRequest));
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 2000);

// Handle responses
server.stdout.on('data', (data) => {
  console.log('\nReceived:', data.toString());
});

server.stderr.on('data', (data) => {
  if (!data.toString().includes('ExperimentalWarning')) {
    console.error('Error:', data.toString());
  }
});

// Clean exit
setTimeout(() => {
  server.kill();
  console.log('\nTest complete!');
  process.exit(0);
}, 4000);
