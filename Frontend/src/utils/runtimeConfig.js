const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const isLocalBrowser = () =>
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const isPlaceholderRenderUrl = (value = '') =>
  /(your|actual)-[a-z0-9-]+\.onrender\.com/i.test(value) ||
  /your-[a-z0-9-]+\.onrender\.com/i.test(value);

const getUsableEnvUrl = (value = '') => {
  const normalizedValue = trimTrailingSlash((value || '').trim());

  if (!normalizedValue || isPlaceholderRenderUrl(normalizedValue)) {
    return '';
  }

  return normalizedValue;
};

export const getApiBaseUrl = () => {
  const envApiUrl = getUsableEnvUrl(process.env.REACT_APP_API_URL || '');

  if (envApiUrl) {
    return envApiUrl;
  }

  if (typeof window !== 'undefined') {
    if (isLocalBrowser()) {
      return 'http://localhost:5000/api';
    }

    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

export const getSocketBaseUrl = () => {
  const envSocketUrl = getUsableEnvUrl(process.env.REACT_APP_SOCKET_URL || '');

  if (envSocketUrl) {
    return envSocketUrl;
  }

  const envApiUrl = getUsableEnvUrl(process.env.REACT_APP_API_URL || '');

  if (envApiUrl) {
    return trimTrailingSlash(envApiUrl.replace(/\/api\/?$/, ''));
  }

  if (typeof window !== 'undefined') {
    if (isLocalBrowser()) {
      return 'http://localhost:5000';
    }

    return window.location.origin;
  }

  return 'http://localhost:5000';
};
