/**
 * Customer AI Service
 * Customer insights, segmentation, and retention strategies
 */

interface CustomerData {
  id: string;
  name: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: Date;
  firstOrderDate: Date;
  favoriteProducts: string[];
  orderFrequency: number; // orders per month
}

interface CustomerSegment {
  segment: 'vip' | 'loyal' | 'regular' | 'at-risk' | 'lost';
  customers: string[];
  characteristics: string[];
  recommendedActions: string[];
  lifetimeValue: number;
}

interface CustomerInsights {
  segments: CustomerSegment[];
  churnRisk: Array<{
    customerId: string;
    customerName: string;
    riskLevel: 'high' | 'medium' | 'low';
    daysSinceLastOrder: number;
    recommendation: string;
  }>;
  opportunities: Array<{
    type: 'upsell' | 'cross-sell' | 'retention' | 'reactivation';
    customersAffected: number;
    potentialRevenue: number;
    action: string;
  }>;
  loyaltyProgram: {
    suggested: boolean;
    structure: string;
    benefits: string[];
    estimatedImpact: string;
  };
}

export class CustomerAIService {
  /**
   * Analyze customer base and generate insights
   */
  async analyzeCustomers(customers: CustomerData[]): Promise<CustomerInsights> {
    const segments = this.segmentCustomers(customers);
    const churnRisk = this.identifyChurnRisk(customers);
    const opportunities = this.identifyOpportunities(customers, segments);
    const loyaltyProgram = this.suggestLoyaltyProgram(segments);

    return {
      segments,
      churnRisk,
      opportunities,
      loyaltyProgram
    };
  }

  /**
   * Segment customers into categories
   */
  private segmentCustomers(customers: CustomerData[]): CustomerSegment[] {
    const now = new Date();
    
    // Calculate averages for comparison
    const avgSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;
    const avgOrders = customers.reduce((sum, c) => sum + c.orderCount, 0) / customers.length;

    const segments: Record<string, CustomerData[]> = {
      vip: [],
      loyal: [],
      regular: [],
      'at-risk': [],
      lost: []
    };

    customers.forEach(customer => {
      const daysSinceLastOrder = Math.floor(
        (now.getTime() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // VIP: High spend + frequent orders
      if (customer.totalSpent > avgSpent * 2 && customer.orderCount > avgOrders * 1.5) {
        segments.vip.push(customer);
      }
      // Loyal: Regular orders, good spend
      else if (customer.orderCount > avgOrders && daysSinceLastOrder < 30) {
        segments.loyal.push(customer);
      }
      // At-risk: Was active but hasn't ordered recently
      else if (customer.orderCount > 3 && daysSinceLastOrder > 30 && daysSinceLastOrder < 90) {
        segments['at-risk'].push(customer);
      }
      // Lost: No orders in 90+ days
      else if (daysSinceLastOrder > 90) {
        segments.lost.push(customer);
      }
      // Regular: Active but not frequent
      else {
        segments.regular.push(customer);
      }
    });

    return Object.entries(segments).map(([segment, customerList]) => {
      const totalValue = customerList.reduce((sum, c) => sum + c.totalSpent, 0);
      
      return {
        segment: segment as CustomerSegment['segment'],
        customers: customerList.map(c => c.id),
        characteristics: this.getSegmentCharacteristics(segment as CustomerSegment['segment']),
        recommendedActions: this.getSegmentActions(segment as CustomerSegment['segment']),
        lifetimeValue: customerList.length > 0 ? totalValue / customerList.length : 0
      };
    });
  }

  /**
   * Get characteristics for each segment
   */
  private getSegmentCharacteristics(segment: CustomerSegment['segment']): string[] {
    const characteristics: Record<CustomerSegment['segment'], string[]> = {
      vip: [
        'Top 20% revenue contributors',
        'Frequent orders (>2x average)',
        'High average order value',
        'Strong brand loyalty'
      ],
      loyal: [
        'Regular ordering pattern',
        'Consistent engagement',
        'Good lifetime value',
        'Refer others'
      ],
      regular: [
        'Occasional orders',
        'Price-sensitive',
        'Opportunity for growth',
        'Need engagement'
      ],
      'at-risk': [
        'Previously active',
        'Decreasing frequency',
        'Potential churn',
        'Need re-engagement'
      ],
      lost: [
        'No recent orders (90+ days)',
        'Requires reactivation',
        'High reacquisition cost',
        'Win-back opportunity'
      ]
    };

    return characteristics[segment];
  }

  /**
   * Get recommended actions for each segment
   */
  private getSegmentActions(segment: CustomerSegment['segment']): string[] {
    const actions: Record<CustomerSegment['segment'], string[]> = {
      vip: [
        'Provide exclusive perks and early access',
        'Personalized service and communication',
        'Request testimonials and referrals',
        'Offer VIP loyalty program tier'
      ],
      loyal: [
        'Maintain engagement with regular updates',
        'Offer loyalty rewards',
        'Ask for feedback',
        'Introduce new products'
      ],
      regular: [
        'Increase order frequency with promotions',
        'Send personalized product recommendations',
        'Introduce subscription/membership',
        'Educate about product value'
      ],
      'at-risk': [
        'Send re-engagement email/WhatsApp',
        'Offer special comeback discount',
        'Survey for feedback',
        'Show new products/updates'
      ],
      lost: [
        'Win-back campaign with strong offer',
        'Understand reason for leaving',
        'Highlight improvements made',
        'Consider if worth reacquiring'
      ]
    };

    return actions[segment];
  }

  /**
   * Identify customers at risk of churning
   */
  private identifyChurnRisk(customers: CustomerData[]): CustomerInsights['churnRisk'] {
    const now = new Date();
    
    return customers
      .map(customer => {
        const daysSinceLastOrder = Math.floor(
          (now.getTime() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const avgDaysBetweenOrders = customer.orderFrequency > 0 
          ? 30 / customer.orderFrequency 
          : 60;

        let riskLevel: 'high' | 'medium' | 'low';
        let recommendation: string;

        if (daysSinceLastOrder > avgDaysBetweenOrders * 2) {
          riskLevel = 'high';
          recommendation = `Urgent: Reach out immediately with personalized offer. Customer hasn't ordered in ${daysSinceLastOrder} days (normal: ${avgDaysBetweenOrders.toFixed(0)} days)`;
        } else if (daysSinceLastOrder > avgDaysBetweenOrders * 1.5) {
          riskLevel = 'medium';
          recommendation = `Send friendly reminder with new product highlights`;
        } else {
          riskLevel = 'low';
          recommendation = 'Continue normal engagement';
        }

        return {
          customerId: customer.id,
          customerName: customer.name,
          riskLevel,
          daysSinceLastOrder,
          recommendation
        };
      })
      .filter(risk => risk.riskLevel !== 'low')
      .sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      });
  }

  /**
   * Identify business opportunities
   */
  private identifyOpportunities(
    customers: CustomerData[],
    segments: CustomerSegment[]
  ): CustomerInsights['opportunities'] {
    const opportunities: CustomerInsights['opportunities'] = [];

    // Upsell opportunity for regular customers
    const regularSegment = segments.find(s => s.segment === 'regular');
    if (regularSegment && regularSegment.customers.length > 0) {
      opportunities.push({
        type: 'upsell',
        customersAffected: regularSegment.customers.length,
        potentialRevenue: regularSegment.lifetimeValue * 0.3 * regularSegment.customers.length,
        action: 'Introduce premium products or larger quantities with bundle discounts'
      });
    }

    // Retention opportunity for at-risk customers
    const atRiskSegment = segments.find(s => s.segment === 'at-risk');
    if (atRiskSegment && atRiskSegment.customers.length > 0) {
      opportunities.push({
        type: 'retention',
        customersAffected: atRiskSegment.customers.length,
        potentialRevenue: atRiskSegment.lifetimeValue * 0.7 * atRiskSegment.customers.length,
        action: 'Launch re-engagement campaign with 15-20% discount + free delivery'
      });
    }

    // Reactivation opportunity for lost customers
    const lostSegment = segments.find(s => s.segment === 'lost');
    if (lostSegment && lostSegment.customers.length > 0) {
      opportunities.push({
        type: 'reactivation',
        customersAffected: lostSegment.customers.length,
        potentialRevenue: lostSegment.lifetimeValue * 0.4 * lostSegment.customers.length,
        action: 'Win-back campaign: "We miss you!" with 25% off next order'
      });
    }

    return opportunities;
  }

  /**
   * Suggest loyalty program structure
   */
  private suggestLoyaltyProgram(segments: CustomerSegment[]): CustomerInsights['loyaltyProgram'] {
    const totalCustomers = segments.reduce((sum, seg) => sum + seg.customers.length, 0);
    const vipCount = segments.find(s => s.segment === 'vip')?.customers.length || 0;
    const loyalCount = segments.find(s => s.segment === 'loyal')?.customers.length || 0;

    const highValueCustomers = vipCount + loyalCount;
    const suggested = highValueCustomers > totalCustomers * 0.2; // If >20% are high value

    return {
      suggested,
      structure: 'Points-based with tiered benefits (Bronze, Silver, Gold)',
      benefits: [
        'Earn 1 point per 10,000 IDR spent',
        'Bronze (0-500 pts): 5% discount + birthday gift',
        'Silver (500-1500 pts): 10% discount + free delivery',
        'Gold (1500+ pts): 15% discount + priority service + exclusive products'
      ],
      estimatedImpact: suggested 
        ? 'Expected 20-30% increase in repeat orders, 15% increase in average order value'
        : 'Build customer base further before implementing full loyalty program'
    };
  }

  /**
   * Calculate Customer Lifetime Value (CLV)
   */
  calculateCLV(
    averageOrderValue: number,
    purchaseFrequency: number, // per year
    customerLifespan: number // years
  ): number {
    return averageOrderValue * purchaseFrequency * customerLifespan;
  }

  /**
   * Calculate RFM Score (Recency, Frequency, Monetary)
   */
  calculateRFMScore(customer: CustomerData): {
    recency: number;
    frequency: number;
    monetary: number;
    totalScore: number;
    category: string;
  } {
    const now = new Date();
    const daysSinceLastOrder = Math.floor(
      (now.getTime() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Score 1-5 (5 being best)
    const recency = daysSinceLastOrder < 30 ? 5 : daysSinceLastOrder < 60 ? 4 : daysSinceLastOrder < 90 ? 3 : daysSinceLastOrder < 180 ? 2 : 1;
    const frequency = customer.orderCount > 20 ? 5 : customer.orderCount > 10 ? 4 : customer.orderCount > 5 ? 3 : customer.orderCount > 2 ? 2 : 1;
    const monetary = customer.totalSpent > 5000000 ? 5 : customer.totalSpent > 2000000 ? 4 : customer.totalSpent > 1000000 ? 3 : customer.totalSpent > 500000 ? 2 : 1;

    const totalScore = recency + frequency + monetary;
    
    let category: string;
    if (totalScore >= 12) category = 'Champions';
    else if (totalScore >= 10) category = 'Loyal';
    else if (totalScore >= 7) category = 'Potential';
    else category = 'At Risk';

    return { recency, frequency, monetary, totalScore, category };
  }
}

// Export singleton instance
export const customerAI = new CustomerAIService();
