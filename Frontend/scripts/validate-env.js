const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envFiles = [
  '.env.production.local',
  '.env.local',
  '.env.production',
  '.env',
];

const loadEnvFile = (filename) => {
  const filePath = path.join(projectRoot, filename);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  fileContents.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

envFiles.forEach(loadEnvFile);

const requiredEnvVars = ['REACT_APP_API_URL'];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !(process.env[key] || '').trim()
);

if (missingEnvVars.length > 0) {
  console.error(
    `[env] Missing required frontend build variables: ${missingEnvVars.join(', ')}`
  );
  console.error(
    '[env] Example: REACT_APP_API_URL=https://your-backend-service.onrender.com/api'
  );
  process.exit(1);
}

const apiUrl = process.env.REACT_APP_API_URL.trim();

if (!/^https?:\/\//i.test(apiUrl)) {
  console.error('[env] REACT_APP_API_URL must start with http:// or https://');
  process.exit(1);
}

if (/localhost|127\.0\.0\.1/i.test(apiUrl)) {
  console.warn(
    '[env] Warning: REACT_APP_API_URL points to localhost. This is fine locally, but it will not work for a deployed frontend.'
  );
}

const socketUrl = (process.env.REACT_APP_SOCKET_URL || '').trim();

if (socketUrl) {
  if (!/^https?:\/\//i.test(socketUrl)) {
    console.error('[env] REACT_APP_SOCKET_URL must start with http:// or https://');
    process.exit(1);
  }

  if (/\/api\/?$/i.test(socketUrl)) {
    console.error('[env] REACT_APP_SOCKET_URL should be the backend origin only, without /api');
    process.exit(1);
  }
}

console.log('[env] Frontend build variables look valid.');
