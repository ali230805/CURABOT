const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const isLocalBrowser = () =>
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const getApiBaseUrl = () => {
  const envApiUrl = trimTrailingSlash((process.env.REACT_APP_API_URL || '').trim());

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
  const envSocketUrl = trimTrailingSlash((process.env.REACT_APP_SOCKET_URL || '').trim());

  if (envSocketUrl) {
    return envSocketUrl;
  }

  const envApiUrl = trimTrailingSlash((process.env.REACT_APP_API_URL || '').trim());

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
