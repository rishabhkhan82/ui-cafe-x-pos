import { Injectable } from '@angular/core';

export interface PriceBreakdown {
  basePrice: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
}

export interface TaxCalculation {
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  cess?: number;
}

export interface DiscountRule {
  type: 'percentage' | 'fixed' | 'buy_one_get_one' | 'loyalty_points';
  value: number;
  minOrderValue?: number;
  applicableItems?: string[];
  applicableCategories?: string[];
  maxDiscount?: number;
}

export interface PricingConfig {
  currency: string;
  currencySymbol: string;
  gstPercentage: number;
  serviceChargePercentage: number;
  roundToNearest: number; // Round to nearest rupee/paise
  enableLoyaltyDiscounts: boolean;
  enableBulkDiscounts: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyPricingService {

  private config: PricingConfig = {
    currency: 'INR',
    currencySymbol: '₹',
    gstPercentage: 18,
    serviceChargePercentage: 5,
    roundToNearest: 1, // Round to nearest rupee
    enableLoyaltyDiscounts: true,
    enableBulkDiscounts: true
  };

  constructor() { }

  // ===============================
  // PRICE CALCULATION METHODS
  // ===============================

  /**
   * Calculate final price with all components
   */
  calculateFinalPrice(
    basePrice: number,
    quantity: number = 1,
    discountRules: DiscountRule[] = [],
    customerLoyaltyPoints?: number
  ): PriceBreakdown {
    const subtotal = basePrice * quantity;

    // Calculate discounts
    const discountAmount = this.calculateDiscountAmount(subtotal, discountRules, customerLoyaltyPoints);

    // Calculate after discount
    const afterDiscount = subtotal - discountAmount;

    // Calculate taxes
    const taxCalculation = this.calculateTax(afterDiscount);

    // Calculate service charge
    const serviceCharge = this.calculateServiceCharge(afterDiscount);

    // Calculate final price
    const finalPrice = this.roundPrice(afterDiscount + taxCalculation.totalGST + serviceCharge);

    return {
      basePrice: subtotal,
      taxAmount: taxCalculation.totalGST,
      serviceCharge,
      discountAmount,
      finalPrice,
      savings: discountAmount
    };
  }

  /**
   * Calculate tax breakdown
   */
  calculateTax(amount: number, gstPercentage?: number): TaxCalculation {
    const gst = gstPercentage || this.config.gstPercentage;
    const totalGST = (amount * gst) / 100;

    // For intra-state (within Maharashtra), CGST and SGST are equal
    const halfGST = totalGST / 2;

    return {
      cgst: this.roundPrice(halfGST),
      sgst: this.roundPrice(halfGST),
      igst: 0, // For inter-state transactions
      totalGST: this.roundPrice(totalGST)
    };
  }

  /**
   * Calculate service charge
   */
  calculateServiceCharge(amount: number, serviceChargePercentage?: number): number {
    const serviceCharge = serviceChargePercentage || this.config.serviceChargePercentage;
    return this.roundPrice((amount * serviceCharge) / 100);
  }

  /**
   * Calculate discount amount
   */
  calculateDiscountAmount(
    subtotal: number,
    discountRules: DiscountRule[],
    customerLoyaltyPoints?: number
  ): number {
    let totalDiscount = 0;

    for (const rule of discountRules) {
      let discount = 0;

      switch (rule.type) {
        case 'percentage':
          discount = (subtotal * rule.value) / 100;
          break;
        case 'fixed':
          discount = rule.value;
          break;
        case 'loyalty_points':
          if (customerLoyaltyPoints && customerLoyaltyPoints >= rule.value) {
            // Assume 1 point = 1 rupee
            discount = rule.value;
          }
          break;
        case 'buy_one_get_one':
          // This would need more complex logic based on items
          // For now, assume 50% discount on second item
          discount = (subtotal * rule.value) / 100;
          break;
      }

      // Apply maximum discount limit if specified
      if (rule.maxDiscount && discount > rule.maxDiscount) {
        discount = rule.maxDiscount;
      }

      // Check minimum order value
      if (rule.minOrderValue && subtotal < rule.minOrderValue) {
        discount = 0;
      }

      totalDiscount += discount;
    }

    return this.roundPrice(totalDiscount);
  }

  /**
   * Calculate bulk discount based on quantity
   */
  calculateBulkDiscount(quantity: number, unitPrice: number): number {
    if (!this.config.enableBulkDiscounts) return 0;

    // Example bulk discount tiers
    const tiers = [
      { min: 10, discount: 5 },  // 5% off for 10+
      { min: 25, discount: 10 }, // 10% off for 25+
      { min: 50, discount: 15 }, // 15% off for 50+
      { min: 100, discount: 20 } // 20% off for 100+
    ];

    for (const tier of tiers) {
      if (quantity >= tier.min) {
        return (unitPrice * quantity * tier.discount) / 100;
      }
    }

    return 0;
  }

  // ===============================
  // CURRENCY FORMATTING METHODS
  // ===============================

  /**
   * Format price with currency symbol
   */
  formatPrice(amount: number): string {
    return `${this.config.currencySymbol}${this.formatNumber(amount)}`;
  }

  /**
   * Format number with Indian numbering system
   */
  formatNumber(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format price breakdown for display
   */
  formatPriceBreakdown(breakdown: PriceBreakdown): string {
    return `
      Subtotal: ${this.formatPrice(breakdown.basePrice)}
      Discount: -${this.formatPrice(breakdown.discountAmount)}
      Service Charge: ${this.formatPrice(breakdown.serviceCharge)}
      Tax (GST): ${this.formatPrice(breakdown.taxAmount)}
      Total: ${this.formatPrice(breakdown.finalPrice)}
    `.trim();
  }

  // ===============================
  // LOYALTY AND REWARDS
  // ===============================

  /**
   * Calculate loyalty points earned
   */
  calculateLoyaltyPoints(amount: number, pointsPerRupee: number = 1): number {
    return Math.floor(amount * pointsPerRupee);
  }

  /**
   * Calculate loyalty discount
   */
  calculateLoyaltyDiscount(points: number, pointsValue: number = 1): number {
    return points * pointsValue;
  }

  /**
   * Check if customer qualifies for loyalty discount
   */
  qualifiesForLoyaltyDiscount(customerTier: string, minTier: string = 'silver'): boolean {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const customerIndex = tiers.indexOf(customerTier.toLowerCase());
    const minIndex = tiers.indexOf(minTier.toLowerCase());

    return customerIndex >= minIndex;
  }

  // ===============================
  // DYNAMIC PRICING METHODS
  // ===============================

  /**
   * Calculate surge pricing based on demand
   */
  calculateSurgePrice(basePrice: number, demandFactor: number): number {
    // demandFactor: 1.0 = normal, 1.2 = 20% surge, etc.
    const surgeMultiplier = Math.max(1.0, Math.min(2.0, demandFactor));
    return this.roundPrice(basePrice * surgeMultiplier);
  }

  /**
   * Calculate time-based pricing (happy hour, etc.)
   */
  calculateTimeBasedPrice(basePrice: number, timeMultiplier: number): number {
    return this.roundPrice(basePrice * timeMultiplier);
  }

  /**
   * Calculate promotional pricing
   */
  calculatePromotionalPrice(basePrice: number, promotionType: 'flash_sale' | 'clearance' | 'seasonal', discountPercentage: number): number {
    const maxDiscounts = {
      flash_sale: 30,
      clearance: 50,
      seasonal: 25
    };

    const maxDiscount = maxDiscounts[promotionType] || 20;
    const actualDiscount = Math.min(discountPercentage, maxDiscount);

    return this.roundPrice(basePrice * (1 - actualDiscount / 100));
  }

  // ===============================
  // ROUNDING AND PRECISION
  // ===============================

  /**
   * Round price according to business rules
   */
  roundPrice(amount: number): number {
    const roundTo = this.config.roundToNearest;

    if (roundTo === 1) {
      // Round to nearest rupee
      return Math.round(amount);
    } else if (roundTo === 0.01) {
      // Round to nearest paisa
      return Math.round(amount * 100) / 100;
    } else {
      // Round to specified nearest value
      return Math.round(amount / roundTo) * roundTo;
    }
  }

  /**
   * Round tax amounts
   */
  roundTax(amount: number): number {
    // Tax rounding rules (round to nearest 0.01)
    return Math.round(amount * 100) / 100;
  }

  // ===============================
  // COMPARISON AND ANALYSIS
  // ===============================

  /**
   * Calculate price difference percentage
   */
  calculatePriceDifference(oldPrice: number, newPrice: number): number {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  /**
   * Calculate profit margin
   */
  calculateProfitMargin(sellingPrice: number, costPrice: number): number {
    if (costPrice === 0) return 0;
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
  }

  /**
   * Calculate markup percentage
   */
  calculateMarkup(sellingPrice: number, costPrice: number): number {
    if (costPrice === 0) return 0;
    return ((sellingPrice - costPrice) / costPrice) * 100;
  }

  // ===============================
  // VALIDATION METHODS
  // ===============================

  /**
   * Validate price range
   */
  isValidPrice(price: number, minPrice: number = 0, maxPrice: number = 100000): boolean {
    return price >= minPrice && price <= maxPrice;
  }

  /**
   * Validate discount percentage
   */
  isValidDiscount(discount: number, maxDiscount: number = 50): boolean {
    return discount >= 0 && discount <= maxDiscount;
  }

  /**
   * Validate GST percentage
   */
  isValidGST(gst: number): boolean {
    return gst >= 0 && gst <= 28; // India's GST range
  }

  // ===============================
  // CONFIGURATION METHODS
  // ===============================

  /**
   * Update pricing configuration
   */
  updateConfig(config: Partial<PricingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PricingConfig {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.config = {
      currency: 'INR',
      currencySymbol: '₹',
      gstPercentage: 18,
      serviceChargePercentage: 5,
      roundToNearest: 1,
      enableLoyaltyDiscounts: true,
      enableBulkDiscounts: true
    };
  }

  // ===============================
  // SPECIAL POS CALCULATIONS
  // ===============================

  /**
   * Calculate split bill amounts
   */
  calculateSplitBill(totalAmount: number, numberOfPeople: number, splitType: 'equal' | 'custom' = 'equal'): number[] {
    if (splitType === 'equal') {
      const baseAmount = Math.floor(totalAmount / numberOfPeople);
      const remainder = totalAmount % numberOfPeople;

      const amounts = new Array(numberOfPeople).fill(baseAmount);
      // Distribute remainder to first few people
      for (let i = 0; i < remainder; i++) {
        amounts[i] += 1;
      }

      return amounts;
    }

    // For custom split, return equal split as default
    return new Array(numberOfPeople).fill(totalAmount / numberOfPeople);
  }

  /**
   * Calculate tip amounts
   */
  calculateTip(totalAmount: number, tipPercentage: number): number {
    return this.roundPrice((totalAmount * tipPercentage) / 100);
  }

  /**
   * Calculate suggested tip amounts
   */
  getSuggestedTips(totalAmount: number): { percentage: number; amount: number; total: number }[] {
    const suggestions = [5, 10, 15, 20];

    return suggestions.map(percentage => {
      const tipAmount = this.calculateTip(totalAmount, percentage);
      return {
        percentage,
        amount: tipAmount,
        total: totalAmount + tipAmount
      };
    });
  }
}