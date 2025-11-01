/**
 * Reconnection Manager for HTTP Service
 * Exponential backoff pattern from Rocket.Chat: 1s → 2s → 4s → 8s → 16s → 30s max
 */

export interface ReconnectionConfig {
  onReconnect: () => Promise<boolean>;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 2;

/**
 * Manages reconnection with exponential backoff
 */
export class ReconnectionManager {
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentDelay = INITIAL_DELAY;
  private attemptCount = 0;
  private isReconnecting = false;

  constructor(private config: ReconnectionConfig) {}

  /**
   * Start reconnection attempts
   */
  startReconnecting(): void {
    if (this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;
    this.attemptCount = 0;
    this.currentDelay = INITIAL_DELAY;

    this.scheduleReconnect();
  }

  /**
   * Schedule next reconnection attempt
   */
  private scheduleReconnect(): void {
    if (!this.isReconnecting) {
      return;
    }

    this.config.onStatusChange?.('connecting');

    this.reconnectTimeout = setTimeout(async () => {
      this.attemptCount++;

      try {
        const success = await this.config.onReconnect();

        if (success) {
          // Reconnection successful
          this.stopReconnecting();
          this.config.onStatusChange?.('connected');
        } else {
          // Failed, schedule next attempt
          this.increaseDelay();
          this.scheduleReconnect();
        }
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        this.increaseDelay();
        this.scheduleReconnect();
      }
    }, this.currentDelay);
  }

  /**
   * Increase delay with exponential backoff
   */
  private increaseDelay(): void {
    this.currentDelay = Math.min(
      this.currentDelay * BACKOFF_MULTIPLIER,
      MAX_DELAY
    );
  }

  /**
   * Stop reconnection attempts
   */
  stopReconnecting(): void {
    this.isReconnecting = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.currentDelay = INITIAL_DELAY;
    this.attemptCount = 0;
  }

  /**
   * Reset backoff delay
   */
  reset(): void {
    this.currentDelay = INITIAL_DELAY;
    this.attemptCount = 0;
  }

  /**
   * Get current reconnection status
   */
  getStatus(): {
    isReconnecting: boolean;
    attemptCount: number;
    currentDelay: number;
  } {
    return {
      isReconnecting: this.isReconnecting,
      attemptCount: this.attemptCount,
      currentDelay: this.currentDelay,
    };
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopReconnecting();
  }
}
