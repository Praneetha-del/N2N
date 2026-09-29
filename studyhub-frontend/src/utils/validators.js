export const validators = {
  required: (value, message = 'This field is required') => {
    if (!value || value.toString().trim() === '') {
      return message;
    }
    return null;
  },

  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return null;
  },

  password: (value, message = 'Password must be at least 6 characters') => {
    if (!value) return null;
    if (value.length < 6) {
      return message;
    }
    return null;
  },

  confirmPassword: (value, confirmValue, message = 'Passwords do not match') => {
    if (value !== confirmValue) {
      return message;
    }
    return null;
  },

  youtubeUrl: (value, message = 'Please enter a valid YouTube URL') => {
    if (!value) return null;
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!pattern.test(value)) {
      return message;
    }
    return null;
  },

  fileSize: (maxSize, message) => (file) => {
    if (!file) return null;
    if (file.size > maxSize) {
      return message || `File size must be less than ${maxSize / 1024 / 1024}MB`;
    }
    return null;
  },

  fileType: (allowedTypes, message) => (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return message || `File type must be one of: ${allowedTypes.join(', ')}`;
    }
    return null;
  },
};

export const validate = (validations, values) => {
  const errors = {};
  Object.keys(validations).forEach((field) => {
    const fieldValidations = Array.isArray(validations[field]) 
      ? validations[field] 
      : [validations[field]];
    
    for (const validation of fieldValidations) {
      const error = validation(values[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  return errors;
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url);
};

export const isValidFileType = (filename, allowedTypes) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
};

export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};