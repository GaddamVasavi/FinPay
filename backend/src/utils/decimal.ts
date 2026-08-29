import { Decimal } from 'decimal.js';

// Configure decimal.js for financial precision
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export class Money {
  /**
   * Parse an input into a safe Decimal instance
   */
  static parse(value: string | number | Decimal): Decimal {
    if (value instanceof Decimal) return value;
    return new Decimal(value || 0);
  }

  /**
   * Format a decimal to fixed 4 decimal places string for database persistence
   */
  static toDbString(value: string | number | Decimal): string {
    return this.parse(value).toFixed(4);
  }

  /**
   * Format for display (e.g. 2 decimal places)
   */
  static formatDisplay(value: string | number | Decimal, currency: string = 'USD'): string {
    const num = this.parse(value).toNumber();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  /**
   * Add two amounts
   */
  static add(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return this.parse(a).plus(this.parse(b));
  }

  /**
   * Subtract b from a
   */
  static subtract(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return this.parse(a).minus(this.parse(b));
  }

  /**
   * Check if an amount is positive and greater than zero
   */
  static isPositive(value: string | number | Decimal): boolean {
    return this.parse(value).greaterThan(0);
  }

  /**
   * Check if a >= b
   */
  static isGreaterThanOrEqualTo(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return this.parse(a).greaterThanOrEqualTo(this.parse(b));
  }
}
