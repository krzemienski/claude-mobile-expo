/**
 * Offline Queue for HTTP Service
 * Queues messages when disconnected, sends when reconnected
 * Uses AsyncStorage for persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedMessage {
  id: string;
  timestamp: number;
  model: string;
  content: string;
  session_id?: string;
  project_id?: string;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = '@claude-mobile/offline-queue';
const MAX_RETRY_COUNT = 3;
const MAX_QUEUE_SIZE = 50;

/**
 * Offline message queue with AsyncStorage persistence
 */
export class OfflineQueue {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;

  constructor() {
    this.loadQueue();
  }

  /**
   * Load queue from AsyncStorage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to AsyncStorage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Add message to queue
   */
  async enqueue(message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: `queued-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Enforce max queue size (FIFO)
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.queue.shift(); // Remove oldest
    }

    this.queue.push(queuedMessage);
    await this.saveQueue();

    return queuedMessage.id;
  }

  /**
   * Get all queued messages
   */
  getAll(): QueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Remove message from queue
   */
  async remove(messageId: string): Promise<boolean> {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(msg => msg.id !== messageId);

    if (this.queue.length < initialLength) {
      await this.saveQueue();
      return true;
    }

    return false;
  }

  /**
   * Process queue with send function
   */
  async process(
    sendFn: (message: QueuedMessage) => Promise<boolean>
  ): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const messagesToProcess = [...this.queue];

      for (const message of messagesToProcess) {
        try {
          const success = await sendFn(message);

          if (success) {
            await this.remove(message.id);
          } else {
            // Increment retry count
            message.retryCount++;

            if (message.retryCount >= MAX_RETRY_COUNT) {
              // Remove after max retries
              await this.remove(message.id);
              console.warn(`Message ${message.id} removed after ${MAX_RETRY_COUNT} failed attempts`);
            } else {
              await this.saveQueue();
            }
          }
        } catch (error) {
          console.error(`Failed to send queued message ${message.id}:`, error);

          message.retryCount++;

          if (message.retryCount >= MAX_RETRY_COUNT) {
            await this.remove(message.id);
          } else {
            await this.saveQueue();
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear entire queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    retrying: number;
    oldestTimestamp: number | null;
  } {
    return {
      total: this.queue.length,
      retrying: this.queue.filter(m => m.retryCount > 0).length,
      oldestTimestamp: this.queue.length > 0 ? this.queue[0].timestamp : null,
    };
  }
}
