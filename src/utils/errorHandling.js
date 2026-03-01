/**
 * Formats API errors for easy consumption by UI components (like toast notifications)
 * @param {Error} error - The error object caught from try/catch or react-query
 * @param {string} fallbackMessage - Fallback message if server doesn't provide one
 * @returns {string} The formatted error message
 */
export const handleApiError = (error, fallbackMessage = 'An unexpected error occurred.') => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    // Custom backend error structure (assuming { message: "Error text", code: 400 })
    return error.response.data?.message || fallbackMessage;
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from the server. Please check your network connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || fallbackMessage;
  }
};
