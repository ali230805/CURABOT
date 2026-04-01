const net = require('net');
const { spawn } = require('child_process');

const processes = [];
let shuttingDown = false;

const colors = {
  backend: '\x1b[33m',
  frontend: '\x1b[36m',
  reset: '\x1b[0m',
};

const prefixOutput = (name, chunk) => {
  const color = colors[name] || '';
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!line && index === lines.length - 1) {
      return;
    }

    process.stdout.write(`${color}[${name}]${colors.reset} ${line}\n`);
  });
};

const isPortInUse = (port, host) =>
  new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(250);

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });

const findAvailablePort = async (startPort) => {
  let port = startPort;

  while (true) {
    const inUseOnIpv4 = await isPortInUse(port, '127.0.0.1');
    const inUseOnIpv6 = await isPortInUse(port, '::1');

    if (!inUseOnIpv4 && !inUseOnIpv6) {
      return port;
    }

    port += 1;
  }
};

const stopAll = () => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  processes.forEach((childProcess) => {
    if (!childProcess.killed) {
      childProcess.kill('SIGTERM');
    }
  });
};

const spawnNamedProcess = (name, args, extraEnv = {}) => {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const commandArgs =
    process.platform === 'win32' ? ['/d', '/s', '/c', 'npm.cmd', ...args] : args;

  const childProcess = spawn(command, commandArgs, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  processes.push(childProcess);

  childProcess.stdout.on('data', (chunk) => prefixOutput(name, chunk));
  childProcess.stderr.on('data', (chunk) => prefixOutput(name, chunk));

  childProcess.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    process.stdout.write(`${colors[name]}[${name}]${colors.reset} exited with ${reason}\n`);
    stopAll();
    process.exitCode = typeof code === 'number' ? code : 1;
  });
};

const run = async () => {
  const backendPort = await findAvailablePort(5001);
  const frontendPort = await findAvailablePort(3001);

  process.stdout.write(`Using backend on http://localhost:${backendPort}\n`);
  process.stdout.write(`Using frontend on http://localhost:${frontendPort}\n`);

  spawnNamedProcess('backend', ['run', 'dev', '--prefix', 'Backend'], {
    PORT: String(backendPort),
    CLIENT_URL: `http://localhost:${frontendPort}`,
    ALLOWED_ORIGINS: `http://localhost:${frontendPort},http://127.0.0.1:${frontendPort}`,
  });

  spawnNamedProcess('frontend', ['run', 'dev', '--prefix', 'Frontend'], {
    PORT: String(frontendPort),
    BROWSER: 'none',
    REACT_APP_API_URL: `http://localhost:${backendPort}/api`,
    REACT_APP_SOCKET_URL: `http://localhost:${backendPort}`,
  });
};

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

run().catch((error) => {
  console.error(error);
  stopAll();
  process.exit(1);
});
