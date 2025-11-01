import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  code?: string; // Error code for programmatic handling
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'phone' | 'custom';
  value?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  // ===============================
  // GENERIC VALIDATION METHODS
  // ===============================

  /**
   * Generic required field validation
   */
  required(value: any, fieldName: string = 'Field'): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, message: `${fieldName} is required`, code: 'REQUIRED' };
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return { isValid: false, message: `${fieldName} cannot be empty`, code: 'REQUIRED' };
    }
    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, message: `${fieldName} must contain at least one item`, code: 'REQUIRED' };
    }
    return { isValid: true };
  }

  /**
   * Generic minimum value validation
   */
  min(value: number, minValue: number, fieldName: string = 'Field'): ValidationResult {
    if (value < minValue) {
      return { isValid: false, message: `${fieldName} must be at least ${minValue}`, code: 'MIN' };
    }
    return { isValid: true };
  }

  /**
   * Generic maximum value validation
   */
  max(value: number, maxValue: number, fieldName: string = 'Field'): ValidationResult {
    if (value > maxValue) {
      return { isValid: false, message: `${fieldName} cannot exceed ${maxValue}`, code: 'MAX' };
    }
    return { isValid: true };
  }

  /**
   * Generic minimum length validation
   */
  minLength(value: string, minLength: number, fieldName: string = 'Field'): ValidationResult {
    if (!value || value.length < minLength) {
      return { isValid: false, message: `${fieldName} must be at least ${minLength} characters`, code: 'MIN_LENGTH' };
    }
    return { isValid: true };
  }

  /**
   * Generic maximum length validation
   */
  maxLength(value: string, maxLength: number, fieldName: string = 'Field'): ValidationResult {
    if (value && value.length > maxLength) {
      return { isValid: false, message: `${fieldName} cannot exceed ${maxLength} characters`, code: 'MAX_LENGTH' };
    }
    return { isValid: true };
  }

  /**
   * Generic pattern validation
   */
  pattern(value: string, pattern: RegExp, fieldName: string = 'Field', message?: string): ValidationResult {
    if (!value || !pattern.test(value)) {
      return {
        isValid: false,
        message: message || `${fieldName} format is invalid`,
        code: 'PATTERN'
      };
    }
    return { isValid: true };
  }

  /**
   * Generic range validation
   */
  range(value: number, minValue: number, maxValue: number, fieldName: string = 'Field'): ValidationResult {
    if (value < minValue) {
      return { isValid: false, message: `${fieldName} must be at least ${minValue}`, code: 'MIN' };
    }
    if (value > maxValue) {
      return { isValid: false, message: `${fieldName} cannot exceed ${maxValue}`, code: 'MAX' };
    }
    return { isValid: true };
  }

  /**
   * Validate multiple rules for a field
   */
  validateField(value: any, rules: ValidationRule[], fieldName: string = 'Field'): ValidationResult {
    for (const rule of rules) {
      let result: ValidationResult;

      switch (rule.type) {
        case 'required':
          result = this.required(value, fieldName);
          break;
        case 'min':
          result = this.min(value, rule.value, fieldName);
          break;
        case 'max':
          result = this.max(value, rule.value, fieldName);
          break;
        case 'minLength':
          result = this.minLength(value, rule.value, fieldName);
          break;
        case 'maxLength':
          result = this.maxLength(value, rule.value, fieldName);
          break;
        case 'pattern':
          result = this.pattern(value, rule.value, fieldName, rule.message);
          break;
        case 'email':
          result = this.email(value);
          break;
        case 'phone':
          result = this.phone(value);
          break;
        default:
          continue;
      }

      if (!result.isValid) {
        return result;
      }
    }

    return { isValid: true };
  }

  // ===============================
  // COMMON FIELD VALIDATIONS
  // ===============================

  /**
   * Email validation
   */
  email(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      return { isValid: false, message: 'Email is required', code: 'REQUIRED' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address', code: 'INVALID_EMAIL' };
    }
    return { isValid: true };
  }

  /**
   * Phone number validation (Indian format)
   */
  phone(phone: string): ValidationResult {
    if (!phone || phone.trim().length === 0) {
      return { isValid: false, message: 'Phone number is required', code: 'REQUIRED' };
    }
    // Indian phone number validation (10 digits, optionally with country code)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, message: 'Please enter a valid Indian phone number', code: 'INVALID_PHONE' };
    }
    return { isValid: true };
  }

  /**
   * Password validation
   */
  password(password: string): ValidationResult {
    if (!password || password.length === 0) {
      return { isValid: false, message: 'Password is required', code: 'REQUIRED' };
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long', code: 'PASSWORD_TOO_SHORT' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        code: 'PASSWORD_WEAK'
      };
    }
    return { isValid: true };
  }

  /**
   * Name validation
   */
  name(name: string, fieldName: string = 'Name'): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: `${fieldName} is required`, code: 'REQUIRED' };
    }
    if (name.length < 2) {
      return { isValid: false, message: `${fieldName} must be at least 2 characters`, code: 'NAME_TOO_SHORT' };
    }
    if (name.length > 100) {
      return { isValid: false, message: `${fieldName} cannot exceed 100 characters`, code: 'NAME_TOO_LONG' };
    }
    // Allow only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: `${fieldName} contains invalid characters`, code: 'INVALID_NAME' };
    }
    return { isValid: true };
  }

  /**
   * PIN code validation (Indian)
   */
  pincode(pincode: string): ValidationResult {
    if (!pincode || pincode.trim().length === 0) {
      return { isValid: false, message: 'PIN code is required', code: 'REQUIRED' };
    }
    const pinRegex = /^[1-9]\d{5}$/;
    if (!pinRegex.test(pincode)) {
      return { isValid: false, message: 'Please enter a valid 6-digit PIN code', code: 'INVALID_PINCODE' };
    }
    return { isValid: true };
  }

  // ===============================
  // MENU MANAGEMENT VALIDATIONS
  // ===============================

  /**
   * Menu item name validation
   */
  menuName(name: string): ValidationResult {
    const requiredCheck = this.required(name, 'Menu name');
    if (!requiredCheck.isValid) return requiredCheck;

    const lengthCheck = this.range(name.length, 2, 100, 'Menu name length');
    if (!lengthCheck.isValid) return lengthCheck;

    // Allow alphanumeric, spaces, and special characters
    const nameRegex = /^[a-zA-Z0-9\s\-'&()]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: 'Menu name contains invalid characters', code: 'INVALID_MENU_NAME' };
    }

    return { isValid: true };
  }

  /**
   * Menu price validation
   */
  menuPrice(price: number, maxPrice: number = 10000): ValidationResult {
    const requiredCheck = this.required(price, 'Price');
    if (!requiredCheck.isValid) return requiredCheck;

    if (price <= 0) {
      return { isValid: false, message: 'Price must be greater than 0', code: 'PRICE_TOO_LOW' };
    }
    if (price > maxPrice) {
      return { isValid: false, message: `Price cannot exceed ₹${maxPrice}`, code: 'PRICE_TOO_HIGH' };
    }
    return { isValid: true };
  }

  /**
   * Menu description validation
   */
  menuDescription(description: string): ValidationResult {
    if (!description || description.trim().length === 0) {
      return { isValid: false, message: 'Description is required', code: 'REQUIRED' };
    }
    if (description.length < 10) {
      return { isValid: false, message: 'Description must be at least 10 characters', code: 'DESCRIPTION_TOO_SHORT' };
    }
    if (description.length > 500) {
      return { isValid: false, message: 'Description cannot exceed 500 characters', code: 'DESCRIPTION_TOO_LONG' };
    }
    return { isValid: true };
  }

  /**
   * Preparation time validation
   */
  preparationTime(time: number): ValidationResult {
    const requiredCheck = this.required(time, 'Preparation time');
    if (!requiredCheck.isValid) return requiredCheck;

    return this.range(time, 1, 180, 'Preparation time (minutes)');
  }

  /**
   * Menu category validation
   */
  menuCategory(category: string): ValidationResult {
    const requiredCheck = this.required(category, 'Category');
    if (!requiredCheck.isValid) return requiredCheck;

    const validCategories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Salads'];
    if (!validCategories.includes(category)) {
      return { isValid: false, message: 'Please select a valid category', code: 'INVALID_CATEGORY' };
    }
    return { isValid: true };
  }

  // ===============================
  // ORDER MANAGEMENT VALIDATIONS
  // ===============================

  /**
   * Order quantity validation
   */
  orderQuantity(quantity: number, availableStock?: number, maxQuantity: number = 99): ValidationResult {
    const requiredCheck = this.required(quantity, 'Quantity');
    if (!requiredCheck.isValid) return requiredCheck;

    if (quantity <= 0) {
      return { isValid: false, message: 'Quantity must be greater than 0', code: 'QUANTITY_TOO_LOW' };
    }
    if (quantity > maxQuantity) {
      return { isValid: false, message: `Quantity cannot exceed ${maxQuantity} items`, code: 'QUANTITY_TOO_HIGH' };
    }
    if (availableStock !== undefined && quantity > availableStock) {
      return { isValid: false, message: `Only ${availableStock} items available in stock`, code: 'INSUFFICIENT_STOCK' };
    }
    return { isValid: true };
  }

  /**
   * Table number validation
   */
  tableNumber(tableNumber: string): ValidationResult {
    const requiredCheck = this.required(tableNumber, 'Table number');
    if (!requiredCheck.isValid) return requiredCheck;

    // Allow alphanumeric table numbers like T-01, TABLE-5, etc.
    const tableRegex = /^[A-Za-z0-9\-]+$/;
    if (!tableRegex.test(tableNumber)) {
      return { isValid: false, message: 'Table number contains invalid characters', code: 'INVALID_TABLE_NUMBER' };
    }
    if (tableNumber.length > 20) {
      return { isValid: false, message: 'Table number cannot exceed 20 characters', code: 'TABLE_NUMBER_TOO_LONG' };
    }
    return { isValid: true };
  }

  /**
   * Order total validation
   */
  orderTotal(total: number, minOrderValue: number = 0, maxOrderValue: number = 50000): ValidationResult {
    if (total < minOrderValue) {
      return { isValid: false, message: `Minimum order value is ₹${minOrderValue}`, code: 'ORDER_TOTAL_TOO_LOW' };
    }
    if (total > maxOrderValue) {
      return { isValid: false, message: `Order total cannot exceed ₹${maxOrderValue}`, code: 'ORDER_TOTAL_TOO_HIGH' };
    }
    return { isValid: true };
  }

  /**
   * Special instructions validation
   */
  specialInstructions(instructions: string): ValidationResult {
    if (instructions && instructions.length > 200) {
      return { isValid: false, message: 'Special instructions cannot exceed 200 characters', code: 'INSTRUCTIONS_TOO_LONG' };
    }
    return { isValid: true };
  }

  // ===============================
  // INVENTORY MANAGEMENT VALIDATIONS
  // ===============================

  /**
   * Stock level validation
   */
  stockLevel(currentStock: number, minStock: number, maxStock?: number): ValidationResult {
    if (currentStock < 0) {
      return { isValid: false, message: 'Stock level cannot be negative', code: 'NEGATIVE_STOCK' };
    }
    if (currentStock < minStock) {
      return { isValid: false, message: `Stock level is below minimum (${minStock})`, code: 'LOW_STOCK' };
    }
    if (maxStock && currentStock > maxStock) {
      return { isValid: false, message: `Stock level cannot exceed maximum (${maxStock})`, code: 'HIGH_STOCK' };
    }
    return { isValid: true };
  }

  /**
   * Unit cost validation
   */
  unitCost(cost: number): ValidationResult {
    const requiredCheck = this.required(cost, 'Unit cost');
    if (!requiredCheck.isValid) return requiredCheck;

    return this.range(cost, 0.01, 50000, 'Unit cost');
  }

  /**
   * SKU validation
   */
  sku(sku: string): ValidationResult {
    const requiredCheck = this.required(sku, 'SKU');
    if (!requiredCheck.isValid) return requiredCheck;

    const skuRegex = /^[A-Z0-9\-_]+$/;
    if (!skuRegex.test(sku)) {
      return { isValid: false, message: 'SKU can only contain uppercase letters, numbers, hyphens, and underscores', code: 'INVALID_SKU' };
    }
    if (sku.length > 50) {
      return { isValid: false, message: 'SKU cannot exceed 50 characters', code: 'SKU_TOO_LONG' };
    }
    return { isValid: true };
  }

  // ===============================
  // PAYMENT VALIDATIONS
  // ===============================

  /**
   * Payment amount validation
   */
  paymentAmount(amount: number, maxAmount: number = 500000): ValidationResult {
    const requiredCheck = this.required(amount, 'Payment amount');
    if (!requiredCheck.isValid) return requiredCheck;

    if (amount <= 0) {
      return { isValid: false, message: 'Payment amount must be greater than 0', code: 'PAYMENT_TOO_LOW' };
    }
    if (amount > maxAmount) {
      return { isValid: false, message: `Payment amount cannot exceed ₹${maxAmount}`, code: 'PAYMENT_TOO_HIGH' };
    }
    return { isValid: true };
  }

  /**
   * Payment method validation
   */
  paymentMethod(method: string): ValidationResult {
    const requiredCheck = this.required(method, 'Payment method');
    if (!requiredCheck.isValid) return requiredCheck;

    const validMethods = ['cash', 'card', 'upi', 'wallet', 'bank_transfer'];
    if (!validMethods.includes(method)) {
      return { isValid: false, message: 'Please select a valid payment method', code: 'INVALID_PAYMENT_METHOD' };
    }
    return { isValid: true };
  }

  // ===============================
  // STAFF MANAGEMENT VALIDATIONS
  // ===============================

  /**
   * Salary validation
   */
  salary(salary: number): ValidationResult {
    const requiredCheck = this.required(salary, 'Salary');
    if (!requiredCheck.isValid) return requiredCheck;

    return this.range(salary, 8000, 200000, 'Salary');
  }

  /**
   * Shift validation
   */
  shift(shift: string): ValidationResult {
    const requiredCheck = this.required(shift, 'Shift');
    if (!requiredCheck.isValid) return requiredCheck;

    const validShifts = ['morning', 'afternoon', 'evening', 'night'];
    if (!validShifts.includes(shift)) {
      return { isValid: false, message: 'Please select a valid shift', code: 'INVALID_SHIFT' };
    }
    return { isValid: true };
  }

  /**
   * Role validation
   */
  staffRole(role: string): ValidationResult {
    const requiredCheck = this.required(role, 'Role');
    if (!requiredCheck.isValid) return requiredCheck;

    const validRoles = ['cashier', 'kitchen_manager', 'waiter', 'restaurant_manager'];
    if (!validRoles.includes(role)) {
      return { isValid: false, message: 'Please select a valid role', code: 'INVALID_ROLE' };
    }
    return { isValid: true };
  }

  // ===============================
  // BUSINESS RULES VALIDATIONS
  // ===============================

  /**
   * Discount percentage validation
   */
  discountPercentage(discount: number, maxDiscount: number = 50): ValidationResult {
    if (discount < 0) {
      return { isValid: false, message: 'Discount cannot be negative', code: 'NEGATIVE_DISCOUNT' };
    }
    if (discount > maxDiscount) {
      return { isValid: false, message: `Discount cannot exceed ${maxDiscount}%`, code: 'DISCOUNT_TOO_HIGH' };
    }
    return { isValid: true };
  }

  /**
   * GST percentage validation
   */
  gstPercentage(gst: number): ValidationResult {
    if (gst < 0) {
      return { isValid: false, message: 'GST percentage cannot be negative', code: 'NEGATIVE_GST' };
    }
    if (gst > 28) {
      return { isValid: false, message: 'GST percentage cannot exceed 28%', code: 'GST_TOO_HIGH' };
    }
    return { isValid: true };
  }

  /**
   * Service charge percentage validation
   */
  serviceChargePercentage(charge: number): ValidationResult {
    if (charge < 0) {
      return { isValid: false, message: 'Service charge cannot be negative', code: 'NEGATIVE_SERVICE_CHARGE' };
    }
    if (charge > 20) {
      return { isValid: false, message: 'Service charge cannot exceed 20%', code: 'SERVICE_CHARGE_TOO_HIGH' };
    }
    return { isValid: true };
  }

  /**
   * Tax amount validation
   */
  taxAmount(amount: number, orderTotal: number): ValidationResult {
    if (amount < 0) {
      return { isValid: false, message: 'Tax amount cannot be negative', code: 'NEGATIVE_TAX' };
    }
    if (amount > orderTotal) {
      return { isValid: false, message: 'Tax amount cannot exceed order total', code: 'TAX_TOO_HIGH' };
    }
    return { isValid: true };
  }

  // ===============================
  // RESTAURANT SETTINGS VALIDATIONS
  // ===============================

  /**
   * Restaurant name validation
   */
  restaurantName(name: string): ValidationResult {
    const requiredCheck = this.required(name, 'Restaurant name');
    if (!requiredCheck.isValid) return requiredCheck;

    return this.range(name.length, 2, 100, 'Restaurant name length');
  }

  /**
   * Opening hours validation
   */
  openingHours(openTime: string, closeTime: string): ValidationResult {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(openTime)) {
      return { isValid: false, message: 'Invalid opening time format (HH:MM)', code: 'INVALID_OPEN_TIME' };
    }
    if (!timeRegex.test(closeTime)) {
      return { isValid: false, message: 'Invalid closing time format (HH:MM)', code: 'INVALID_CLOSE_TIME' };
    }

    const open = new Date(`1970-01-01T${openTime}:00`);
    const close = new Date(`1970-01-01T${closeTime}:00`);

    if (close <= open) {
      return { isValid: false, message: 'Closing time must be after opening time', code: 'INVALID_TIME_RANGE' };
    }

    return { isValid: true };
  }

  /**
   * Table count validation
   */
  tableCount(count: number): ValidationResult {
    const requiredCheck = this.required(count, 'Table count');
    if (!requiredCheck.isValid) return requiredCheck;

    return this.range(count, 1, 200, 'Table count');
  }

  // ===============================
  // FORM VALIDATION HELPERS
  // ===============================

  /**
   * Get field error message from Angular form errors
   */
  getFieldErrorMessage(fieldName: string, errors: any): string {
    if (!errors) return '';

    if (errors['required']) {
      return `${fieldName} is required`;
    }
    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['pattern']) {
      return `${fieldName} format is invalid`;
    }
    if (errors['min']) {
      return `${fieldName} must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${fieldName} cannot exceed ${errors['max'].max}`;
    }

    return 'Invalid value';
  }

  /**
   * Validate entire form object
   */
  validateForm(formData: any, validationRules: { [key: string]: ValidationRule[] }): { [key: string]: ValidationResult } {
    const results: { [key: string]: ValidationResult } = {};

    for (const field in validationRules) {
      if (validationRules.hasOwnProperty(field)) {
        results[field] = this.validateField(formData[field], validationRules[field], field);
      }
    }

    return results;
  }

  /**
   * Check if form has any validation errors
   */
  hasFormErrors(validationResults: { [key: string]: ValidationResult }): boolean {
    return Object.values(validationResults).some(result => !result.isValid);
  }

  // ===============================
  // POS-SPECIFIC BUSINESS LOGIC
  // ===============================

  /**
   * Check if order can be placed
   */
  canPlaceOrder(tableOccupied: boolean, items: any[], minOrderValue: number = 0): ValidationResult {
    if (tableOccupied) {
      return { isValid: false, message: 'Table is currently occupied', code: 'TABLE_OCCUPIED' };
    }
    if (!items || items.length === 0) {
      return { isValid: false, message: 'Order must contain at least one item', code: 'EMPTY_ORDER' };
    }

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (total < minOrderValue) {
      return { isValid: false, message: `Minimum order value is ₹${minOrderValue}`, code: 'MIN_ORDER_VALUE' };
    }

    return { isValid: true };
  }

  /**
   * Validate inventory before order placement
   */
  validateInventoryForOrder(orderItems: any[], inventory: any[]): ValidationResult {
    for (const orderItem of orderItems) {
      const inventoryItem = inventory.find(item => item.id === orderItem.menuItemId);
      if (!inventoryItem) {
        return { isValid: false, message: `Item ${orderItem.name} not found in inventory`, code: 'ITEM_NOT_FOUND' };
      }
      if (inventoryItem.currentStock < orderItem.quantity) {
        return {
          isValid: false,
          message: `Insufficient stock for ${orderItem.name}. Available: ${inventoryItem.currentStock}`,
          code: 'INSUFFICIENT_STOCK'
        };
      }
    }
    return { isValid: true };
  }

  /**
   * Validate payment split
   */
  validatePaymentSplit(totalAmount: number, payments: any[]): ValidationResult {
    if (!payments || payments.length === 0) {
      return { isValid: false, message: 'At least one payment method is required', code: 'NO_PAYMENT_METHOD' };
    }

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (totalPaid !== totalAmount) {
      return {
        isValid: false,
        message: `Payment total (₹${totalPaid}) must equal order total (₹${totalAmount})`,
        code: 'PAYMENT_MISMATCH'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate shift handover
   */
  validateShiftHandover(cashExpected: number, cashCounted: number, tolerance: number = 100): ValidationResult {
    const difference = Math.abs(cashExpected - cashCounted);
    if (difference > tolerance) {
      return {
        isValid: false,
        message: `Cash difference (₹${difference}) exceeds tolerance (₹${tolerance})`,
        code: 'CASH_DISCREPANCY'
      };
    }
    return { isValid: true };
  }
}