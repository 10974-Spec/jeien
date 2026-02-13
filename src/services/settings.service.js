import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get admin settings
export const getAdminSettings = async () => {
    const response = await axios.get(`${API_URL}/settings/admin`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

// Update admin settings
export const updateAdminSettings = async (settings) => {
    const response = await axios.put(`${API_URL}/settings/admin`, settings, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

// Get vendor settings
export const getVendorSettings = async () => {
    const response = await axios.get(`${API_URL}/settings/vendor`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

// Update vendor settings
export const updateVendorSettings = async (settings) => {
    const response = await axios.put(`${API_URL}/settings/vendor`, settings, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export default {
    getAdminSettings,
    updateAdminSettings,
    getVendorSettings,
    updateVendorSettings
};
