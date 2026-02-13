import axios from 'axios';

const isServer = typeof window === 'undefined';

const baseURL = isServer
    ? (process.env.NEXT_PUBLIC_API_URL_SERVER || 'http://nginx:80')
    : (process.env.NEXT_PUBLIC_API_URL_BROWSER || 'http://localhost:80');

console.log('baseurl', process.env.NEXT_PUBLIC_API_URL_BROWSER );

const api = axios.create({
    baseURL,
    withCredentials: true,
    withXSRFToken: true,
    headers:
        { Accept: "application/json" }
});

export default api;