import { API_BASE_URL } from './config';

export async function apiFetch(endpoint, method = 'GET', body = null, isFormData = false) {
    const token = localStorage.getItem('authToken');
    const headers = {};

    // Solo establecemos Content-Type si NO es FormData
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        // Si es FormData, lo pasamos directamente.
        // Si no, lo convertimos a JSON.
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // --- LÓGICA DE MANEJO DE RESPUESTA MEJORADA ---
        const contentType = response.headers.get('content-type');
        let data = null;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }

        if (!response.ok) {
            console.error('Error de API:', {
                status: response.status,
                statusText: response.statusText,
                endpoint: endpoint,
                responseData: data
            });
            throw new Error(data?.message || `Error ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error('Fallo en la llamada fetch:', error.message);
        throw error;
    }
}
