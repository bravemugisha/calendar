const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const BASE_PATH =
  rawBasePath.length > 1 && rawBasePath.endsWith('/')
    ? rawBasePath.slice(0, -1)
    : rawBasePath;

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (BASE_PATH
    ? `https://dayflow-js.github.io${BASE_PATH}`
    : 'http://localhost:3000');

export const SITE_URL = rawSiteUrl.endsWith('/')
  ? rawSiteUrl.slice(0, -1)
  : rawSiteUrl;

export const SITE_METADATA_BASE = new URL(SITE_URL);
