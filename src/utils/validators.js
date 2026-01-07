import { VALIDATION_PATTERNS } from './constants'

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) return 'Please enter a valid email address'
  return null
}

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  if (!VALIDATION_PATTERNS.PASSWORD.test(password)) return 'Password must contain at least one letter and one number'
  return null
}

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required'
  if (!VALIDATION_PATTERNS.PHONE.test(phone)) return 'Please enter a valid phone number'
  return null
}

/**
 * Validate name
 */
export const validateName = (name) => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (name.length > 100) return 'Name cannot exceed 100 characters'
  return null
}

/**
 * Validate price
 */
export const validatePrice = (price) => {
  if (price === undefined || price === null) return 'Price is required'
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return 'Price must be a number'
  if (numPrice < 0) return 'Price cannot be negative'
  if (numPrice > 1000000000) return 'Price is too high'
  return null
}

/**
 * Validate stock quantity
 */
export const validateStock = (stock) => {
  if (stock === undefined || stock === null) return 'Stock quantity is required'
  const numStock = parseInt(stock)
  if (isNaN(numStock)) return 'Stock must be a number'
  if (numStock < 0) return 'Stock cannot be negative'
  if (numStock > 1000000) return 'Stock quantity is too high'
  return null
}

/**
 * Validate commission rate
 */
export const validateCommissionRate = (rate) => {
  if (rate === undefined || rate === null) return 'Commission rate is required'
  const numRate = parseFloat(rate)
  if (isNaN(numRate)) return 'Commission rate must be a number'
  if (numRate < 0) return 'Commission rate cannot be negative'
  if (numRate > 50) return 'Commission rate cannot exceed 50%'
  return null
}

/**
 * Validate address
 */
export const validateAddress = (address) => {
  if (!address) return 'Address is required'
  if (address.length < 5) return 'Address must be at least 5 characters'
  if (address.length > 500) return 'Address cannot exceed 500 characters'
  return null
}

/**
 * Validate city
 */
export const validateCity = (city) => {
  if (!city) return 'City is required'
  if (city.length < 2) return 'City must be at least 2 characters'
  if (city.length > 100) return 'City cannot exceed 100 characters'
  return null
}

/**
 * Validate country
 */
export const validateCountry = (country) => {
  if (!country) return 'Country is required'
  return null
}

/**
 * Validate product title
 */
export const validateProductTitle = (title) => {
  if (!title) return 'Product title is required'
  if (title.length < 3) return 'Product title must be at least 3 characters'
  if (title.length > 200) return 'Product title cannot exceed 200 characters'
  return null
}

/**
 * Validate product description
 */
export const validateProductDescription = (description) => {
  if (!description) return 'Product description is required'
  if (description.length < 10) return 'Product description must be at least 10 characters'
  if (description.length > 5000) return 'Product description cannot exceed 5000 characters'
  return null
}

/**
 * Validate category name
 */
export const validateCategoryName = (name) => {
  if (!name) return 'Category name is required'
  if (name.length < 2) return 'Category name must be at least 2 characters'
  if (name.length > 100) return 'Category name cannot exceed 100 characters'
  return null
}

/**
 * Validate store name
 */
export const validateStoreName = (name) => {
  if (!name) return 'Store name is required'
  if (name.length < 3) return 'Store name must be at least 3 characters'
  if (name.length > 100) return 'Store name cannot exceed 100 characters'
  return null
}

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  if (!file) return 'Image file is required'
  
  const { IMAGE_LIMITS } = require('./constants')
  
  if (!IMAGE_LIMITS.ACCEPTED_TYPES.includes(file.type)) {
    return `File type not supported. Accepted types: ${IMAGE_LIMITS.ACCEPTED_TYPES.join(', ')}`
  }
  
  if (file.size > IMAGE_LIMITS.MAX_SIZE) {
    return `File size too large. Maximum size: ${IMAGE_LIMITS.MAX_SIZE / (1024 * 1024)}MB`
  }
  
  return null
}

/**
 * Validate review rating
 */
export const validateRating = (rating) => {
  if (rating === undefined || rating === null) return 'Rating is required'
  const numRating = parseInt(rating)
  if (isNaN(numRating)) return 'Rating must be a number'
  if (numRating < 1 || numRating > 5) return 'Rating must be between 1 and 5'
  return null
}

/**
 * Validate review comment
 */
export const validateReviewComment = (comment) => {
  if (!comment) return 'Review comment is required'
  if (comment.length < 10) return 'Review comment must be at least 10 characters'
  if (comment.length > 2000) return 'Review comment cannot exceed 2000 characters'
  return null
}

/**
 * Format validation errors
 */
export const formatValidationErrors = (errors) => {
  return Object.entries(errors)
    .filter(([_, error]) => error !== null)
    .map(([field, error]) => `${field}: ${error}`)
    .join(', ')
}

/**
 * Validate form data
 */
export const validateFormData = (data, validators) => {
  const errors = {}
  
  Object.keys(validators).forEach(field => {
    const validator = validators[field]
    const value = data[field]
    const error = validator(value)
    
    if (error) {
      errors[field] = error
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}