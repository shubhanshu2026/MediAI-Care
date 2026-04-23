import apiClient from '../api/axiosConfig';

export const loginUser = async (loginData) => {
    // This hits the http://localhost:8080/api/auth/login endpoint
    const response = await apiClient.post('/api/auth/login', loginData);
    
    if (response.data.token) {
        // Match these keys to what your axiosConfig.ts expects
        localStorage.setItem('mediai_token', response.data.token);
        localStorage.setItem('mediai_user', JSON.stringify({
            username: response.data.username,
            role: response.data.role
        }));
    }
    return response.data;
};

export const signupUser = async (signupData) => {
    return await apiClient.post('/api/auth/signup', signupData);
};