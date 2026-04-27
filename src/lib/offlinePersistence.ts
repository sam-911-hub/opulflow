/**
 * Offline Persistence Manager for Firestore writes
 * Handles pending writes when offline and retries them automatically
 */

import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebaseClient';

interface PendingWrite {
  id: string;
  type: 'createUser' | 'updateUser' | 'createOrder';
  data: any;
  userId: string;
  timestamp: number;
  retries: number;
}

const PENDING_WRITES_KEY = 'opulflow_pending_writes';
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 30000; // 30 seconds

class OfflinePersistenceManager {
  private db = getFirebaseDb();
  private retryTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    // Start background sync on initialization
    this.startBackgroundSync();
  }

  // Add a pending write to the queue
  addPendingWrite(write: Omit<PendingWrite, 'id' | 'timestamp' | 'retries'>): void {
    const pendingWrite: PendingWrite = {
      ...write,
      id: `${write.type}_${write.userId}_${Date.now()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    const pendingWrites = this.getPendingWrites();
    pendingWrites.push(pendingWrite);
    this.savePendingWrites(pendingWrites);

    console.log('Added pending write:', pendingWrite.id);
  }

  // Process all pending writes
  async processPendingWrites(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    const pendingWrites = this.getPendingWrites();

    if (pendingWrites.length === 0) {
      this.isProcessing = false;
      return;
    }

    console.log(`Processing ${pendingWrites.length} pending writes...`);

    const remainingWrites: PendingWrite[] = [];

    for (const write of pendingWrites) {
      try {
        await this.executeWrite(write);
        console.log(`✅ Successfully processed pending write: ${write.id}`);
      } catch (error) {
        console.warn(`❌ Failed to process pending write: ${write.id}`, error);

        write.retries++;
        if (write.retries < MAX_RETRIES) {
          remainingWrites.push(write);
        } else {
          console.error(`❌ Giving up on pending write after ${MAX_RETRIES} retries: ${write.id}`);
        }
      }
    }

    this.savePendingWrites(remainingWrites);
    this.isProcessing = false;

    if (remainingWrites.length > 0) {
      console.log(`${remainingWrites.length} writes still pending, will retry later...`);
    } else {
      console.log('All pending writes processed successfully! 🎉');
    }
  }

  // Execute a single write operation
  private async executeWrite(write: PendingWrite): Promise<void> {
    switch (write.type) {
      case 'createUser':
        await this.createUserDocument(write.userId, write.data);
        break;
      case 'updateUser':
        await this.updateUserDocument(write.userId, write.data);
        break;
      case 'createOrder':
        await this.createOrderDocument(write.data);
        break;
      default:
        throw new Error(`Unknown write type: ${write.type}`);
    }
  }

  // Create user document
  private async createUserDocument(userId: string, userData: any): Promise<void> {
    const userDocRef = doc(this.db, 'users', userId);
    await setDoc(userDocRef, userData);
  }

  // Update user document
  private async updateUserDocument(userId: string, updateData: any): Promise<void> {
    const userDocRef = doc(this.db, 'users', userId);
    await updateDoc(userDocRef, updateData);
  }

  // Create order document
  private async createOrderDocument(orderData: any): Promise<void> {
    const orderDocRef = doc(this.db, 'orders', orderData.orderId);
    await setDoc(orderDocRef, orderData);
  }

  // Get all pending writes from localStorage
  private getPendingWrites(): PendingWrite[] {
    try {
      const stored = localStorage.getItem(PENDING_WRITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading pending writes:', error);
      return [];
    }
  }

  // Save pending writes to localStorage
  private savePendingWrites(writes: PendingWrite[]): void {
    try {
      localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify(writes));
    } catch (error) {
      console.error('Error saving pending writes:', error);
    }
  }

  // Start background sync process
  private startBackgroundSync(): void {
    // Process immediately on start
    setTimeout(() => this.processPendingWrites(), 2000);

    // Then process every 30 seconds
    this.retryTimer = setInterval(() => {
      this.processPendingWrites();
    }, RETRY_INTERVAL);
  }

  // Stop background sync (cleanup)
  stopBackgroundSync(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
  }

  // Get status for debugging
  getStatus(): { pendingCount: number; isProcessing: boolean } {
    return {
      pendingCount: this.getPendingWrites().length,
      isProcessing: this.isProcessing,
    };
  }
}

// Create singleton instance
export const offlinePersistence = new OfflinePersistenceManager();

// Export convenience functions
export const addPendingUserCreation = (userId: string, userData: any) => {
  offlinePersistence.addPendingWrite({
    type: 'createUser',
    data: userData,
    userId,
  });
};

export const addPendingUserUpdate = (userId: string, updateData: any) => {
  offlinePersistence.addPendingWrite({
    type: 'updateUser',
    data: updateData,
    userId,
  });
};

export const addPendingOrderCreation = (orderData: any) => {
  offlinePersistence.addPendingWrite({
    type: 'createOrder',
    data: orderData,
    userId: orderData.userId,
  });
};