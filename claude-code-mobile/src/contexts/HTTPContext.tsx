/**
 * HTTP Context
 * Provides HTTP service instance to all screens
 * Replaces WebSocketContext with HTTP/SSE architecture
 */

import React, { createContext, useContext } from 'react';
import { HTTPService } from '../services/http';

interface HTTPContextType {
  httpService: HTTPService | null;
}

const HTTPContext = createContext<HTTPContextType>({
  httpService: null,
});

export const useHTTP = () => {
  const context = useContext(HTTPContext);
  // Note: Service being null during initial render is expected behavior.
  // Only warn if service is actually being used (checked by calling components).
  return context;
};

export const HTTPProvider: React.FC<{
  httpService: HTTPService | null;
  children: React.ReactNode;
}> = ({ httpService, children }) => {
  return (
    <HTTPContext.Provider value={{ httpService }}>
      {children}
    </HTTPContext.Provider>
  );
};
