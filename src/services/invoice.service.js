import api from './api';

const invoiceService = {
    /**
     * Download invoice PDF for an order
     * @param {string} orderId - Order ID
     * @returns {Promise<Blob>} PDF blob
     */
    downloadInvoice: async (orderId) => {
        try {
            const response = await api.get(`/invoices/${orderId}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Download invoice error:', error);
            throw error;
        }
    },

    /**
     * Preview invoice PDF in browser
     * @param {string} orderId - Order ID
     * @returns {Promise<Blob>} PDF blob
     */
    previewInvoice: async (orderId) => {
        try {
            const response = await api.get(`/invoices/${orderId}/preview`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Preview invoice error:', error);
            throw error;
        }
    },

    /**
     * Trigger browser download of PDF blob
     * @param {Blob} blob - PDF blob
     * @param {string} filename - Filename for download
     */
    triggerDownload: (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};

export default invoiceService;
