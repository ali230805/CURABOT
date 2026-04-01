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

const apiUrl = (process.env.REACT_APP_API_URL || '').trim();
const isPlaceholderRenderUrl = (value = '') =>
  /(your|actual)-[a-z0-9-]+\.onrender\.com/i.test(value) ||
  /your-[a-z0-9-]+\.onrender\.com/i.test(value);

if (!apiUrl) {
  console.warn(
    '[env] REACT_APP_API_URL is not set. The frontend will fall back to the same deployed origin with /api in production.'
  );
} else {
  if (isPlaceholderRenderUrl(apiUrl)) {
    console.warn(
      '[env] REACT_APP_API_URL looks like a placeholder Render URL. The frontend will ignore it and fall back to the same deployed origin.'
    );
  }

  if (!/^https?:\/\//i.test(apiUrl)) {
    console.error('[env] REACT_APP_API_URL must start with http:// or https://');
    process.exit(1);
  }

  if (/localhost|127\.0\.0\.1/i.test(apiUrl)) {
    console.warn(
      '[env] Warning: REACT_APP_API_URL points to localhost. This is fine locally, but it will not work for a separately deployed frontend.'
    );
  }
}

const socketUrl = (process.env.REACT_APP_SOCKET_URL || '').trim();

if (socketUrl) {
  if (isPlaceholderRenderUrl(socketUrl)) {
    console.warn(
      '[env] REACT_APP_SOCKET_URL looks like a placeholder Render URL. The frontend will ignore it and fall back to the same deployed origin.'
    );
  }

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
