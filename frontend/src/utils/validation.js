/**
 * Utility functions for form validation
 */

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Validate Vietnamese phone number format
export const validatePhoneNumber = (phone) => {
  // Accept formats: 0xxxxxxxxx, +84xxxxxxxxx, 84xxxxxxxxx
  // Where x is a digit and the total length is 10 digits (excluding country code)
  const phoneRegex = /^(0|(\+?84))[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone);
}; 