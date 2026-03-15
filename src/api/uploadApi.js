import axiosClient from './axiosClient';

/**
 * Upload one or multiple images
 * @param {FormData} formData - FormData containing the file(s) under key 'image' or based on backend spec
 * @returns {Promise<any>}
 */
export const uploadImage = (formData) => {
    return axiosClient.post('/files/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
