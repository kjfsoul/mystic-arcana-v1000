const { spawn } = require('child_process');

console.log('�� Testing MCP Filesystem Server for Mystic Arcana\n');

const server = spawn('npx', [
  '-y',
  '@modelcontextprotocol/server-filesystem',
  process.cwd()
]);

let requestId = 1;

function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    method: method,
    params: params,
    id: requestId++
  };
  
  console.log(`\n�� Sending: ${method}`);
  server.stdin.write(JSON.stringify(request) + '\n');
}

server.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    
    if (response.error) {
      console.log('❌ Error:', response.error.message);
    } else if (response.result) {
      if (response.id === 2) {
        console.log('✅ Available tools:', response.result.tools.map(t => t.name).join(', '));
      } else if (response.id === 3) {
        console.log('✅ Package.json contents:');
        console.log(response.result.content.substring(0, 200) + '...');
      } else if (response.id === 4) {
        console.log('✅ Files in docs directory:');
        const files = response.result.contents.filter(f => f.includes('[FILE]'));
        files.slice(0, 5).forEach(f => console.log(`   ${f}`));
        console.log(`   ... and ${files.length - 5} more files`);
      }
    }
  } catch (e) {
  }
});

server.stderr.on('data', (data) => {
  const msg = data.toString();
  if (!msg.includes('ExperimentalWarning') && !msg.includes('Secure MCP')) {
    console.error('Error:', msg);
  }
});

setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: "0.1.0",
    capabilities: {},
    clientInfo: {
      name: "mystic-arcana-test",
      version: "1.0.0"
    }
  });
}, 500);

setTimeout(() => {
  sendRequest('tools/list');
}, 1000);

setTimeout(() => {
  sendRequest('tools/call', {
    name: 'read_file',
    arguments: {
      path: 'package.json'
    }
  });
}, 1500);

setTimeout(() => {
  sendRequest('tools/call', {
    name: 'list_directory',
    arguments: {
      path: 'docs'
    }
  });
}, 2000);

setTimeout(() => {
  server.kill();
  console.log('\n✅ All tests complete!');
  process.exit(0);
}, 3000);
