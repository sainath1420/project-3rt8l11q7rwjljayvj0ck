import { superdevClient } from "../lib/superdev/client";

// Create fallback functions when Superdev is not available
const createFallbackFunction = (name: string) => {
  return (...args: any[]) => {
    console.warn(`Superdev integration '${name}' is not available. Please set up VITE_APP_ID and VITE_SUPERDEV_BASE_URL environment variables.`);
    return Promise.reject(new Error(`Superdev integration '${name}' is not available`));
  };
};

// Export Superdev integrations if available, otherwise export fallback functions
export const core = superdevClient?.integrations.core || {
  invokeLLM: createFallbackFunction('invokeLLM'),
  generateImage: createFallbackFunction('generateImage'),
  uploadFile: createFallbackFunction('uploadFile'),
  getUploadedFile: createFallbackFunction('getUploadedFile'),
  sendEmail: createFallbackFunction('sendEmail'),
  extractDataFromUploadedFile: createFallbackFunction('extractDataFromUploadedFile'),
};

export const uploadFile = superdevClient?.integrations.core.uploadFile || createFallbackFunction('uploadFile');
export const invokeLLM = superdevClient?.integrations.core.invokeLLM || createFallbackFunction('invokeLLM');
export const generateImage = superdevClient?.integrations.core.generateImage || createFallbackFunction('generateImage');
export const getUploadedFile = superdevClient?.integrations.core.getUploadedFile || createFallbackFunction('getUploadedFile');
export const sendEmail = superdevClient?.integrations.core.sendEmail || createFallbackFunction('sendEmail');
export const extractDataFromUploadedFile = superdevClient?.integrations.core.extractDataFromUploadedFile || createFallbackFunction('extractDataFromUploadedFile');
