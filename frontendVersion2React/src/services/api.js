import { API_BASE_URL } from './config';

export async function apiFetch(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {

        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return await response.json();
    } else {
        return null;
    }
}