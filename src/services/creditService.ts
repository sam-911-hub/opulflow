import { getAdminFirestore } from '@/lib/admin';
import { AppError } from '@/lib/security/errorHandler';
import { logger } from '@/lib/security/logger';

export interface Credits {
  leads: number;
  companies: number;
  emails: number;
  ai: number;
  techstack: number;
  intent: number;
  calls: number;
  crm: number;
  workflows: number;
}

export class CreditService {
  private db = getAdminFirestore();

  async getBalance(userId: string): Promise<Credits> {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new AppError(404, 'User not found');
      }

      const userData = userDoc.data();
      return userData?.credits || this.getDefaultCredits();
    } catch (error) {
      logger.error('Failed to get credit balance', { userId }, error);
      throw error;
    }
  }

  async deductCredits(
    userId: string,
    creditType: keyof Credits,
    amount: number
  ): Promise<void> {
    try {
      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new AppError(404, 'User not found');
      }

      const userData = userDoc.data();
      const credits = userData?.credits || this.getDefaultCredits();

      if (credits[creditType] < amount) {
        throw new AppError(403, 'Insufficient credits');
      }

      await userRef.update({
        [`credits.${creditType}`]: credits[creditType] - amount,
      });

      logger.info('Credits deducted', {
        userId,
        creditType,
        amount,
        remaining: credits[creditType] - amount,
      });
    } catch (error) {
      logger.error('Failed to deduct credits', { userId, creditType, amount }, error);
      throw error;
    }
  }

  async addCredits(
    userId: string,
    creditsToAdd: Partial<Credits>
  ): Promise<void> {
    try {
      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new AppError(404, 'User not found');
      }

      const updates: any = {};
      for (const [key, value] of Object.entries(creditsToAdd)) {
        if (value && value > 0) {
          updates[`credits.${key}`] = (userDoc.data()?.credits?.[key] || 0) + value;
        }
      }

      await userRef.update(updates);

      logger.info('Credits added', { userId, creditsToAdd });
    } catch (error) {
      logger.error('Failed to add credits', { userId, creditsToAdd }, error);
      throw error;
    }
  }

  private getDefaultCredits(): Credits {
    return {
      leads: 0,
      companies: 0,
      emails: 0,
      ai: 0,
      techstack: 0,
      intent: 0,
      calls: 0,
      crm: 0,
      workflows: 0,
    };
  }
}

export const creditService = new CreditService();
