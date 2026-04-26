import httpClient from './httpClient';

const login = (data) => httpClient.post('/api/v1/auth/login', data).then((res) => res.data);
const register = (data) => httpClient.post('/api/v1/auth/register', data).then((res) => res.data);
const googleAuth = (idToken) => httpClient.post('/api/v1/auth/google', { idToken }).then((res) => res.data);
const googleRegister = (accessToken, data) => httpClient.post('/api/v1/auth/google/register', { accessToken, ...data }).then((res) => res.data);

export default { login, register, googleAuth, googleRegister };
