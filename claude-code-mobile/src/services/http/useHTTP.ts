/**
 * React hooks for HTTP service
 * Provides easy integration with React components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { HTTPService, StreamingChatRequest } from './http.service';
import { ConnectionStatus } from './types';

/**
 * Hook to use HTTP service instance
 */
export function useHTTPService(baseURL: string) {
  const serviceRef = useRef<HTTPService | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Create HTTP service
    const service = new HTTPService({
      baseURL,
      onConnectionChange: (isConnected) => {
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      },
      onError: (err) => {
        setError(err);
        setConnectionStatus('error');
      },
    });

    serviceRef.current = service;

    // Cleanup on unmount
    return () => {
      service.cleanup();
    };
  }, [baseURL]);

  return {
    service: serviceRef.current,
    connectionStatus,
    error,
  };
}

/**
 * Hook for streaming chat
 */
export function useStreamingChat(service: HTTPService | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const streamIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (request: Omit<StreamingChatRequest, 'onChunk' | 'onComplete' | 'onError'>) => {
      if (!service) {
        throw new Error('HTTP service not initialized');
      }

      setIsStreaming(true);
      setStreamedContent('');

      try {
        const streamId = await service.sendMessageStreaming({
          ...request,
          onChunk: (content) => {
            setStreamedContent((prev) => prev + content);
          },
          onComplete: () => {
            setIsStreaming(false);
            streamIdRef.current = null;
          },
          onError: (error) => {
            console.error('Streaming error:', error);
            setIsStreaming(false);
            streamIdRef.current = null;
          },
        });

        streamIdRef.current = streamId;
      } catch (error) {
        console.error('Failed to start streaming:', error);
        setIsStreaming(false);
        throw error;
      }
    },
    [service]
  );

  const cancelStream = useCallback(() => {
    if (service && streamIdRef.current) {
      service.cancelStream(streamIdRef.current);
      streamIdRef.current = null;
      setIsStreaming(false);
    }
  }, [service]);

  return {
    sendMessage,
    cancelStream,
    isStreaming,
    streamedContent,
  };
}

/**
 * Hook for checking connection health
 */
export function useConnectionHealth(service: HTTPService | null, intervalMs = 30000) {
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    if (!service) return;

    const checkHealth = async () => {
      try {
        const healthy = await service.checkConnection();
        setIsHealthy(healthy);
        setLastCheck(new Date());
      } catch (error) {
        setIsHealthy(false);
      }
    };

    // Initial check
    checkHealth();

    // Periodic checks
    const interval = setInterval(checkHealth, intervalMs);

    return () => clearInterval(interval);
  }, [service, intervalMs]);

  return {
    isHealthy,
    lastCheck,
  };
}
