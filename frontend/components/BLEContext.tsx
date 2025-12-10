import React, { createContext, useContext, ReactNode } from 'react';
import useBLE from '@/hooks/useBLE';

const BLEContext = createContext<any>(null);

export const BLEProvider = ({ children }: { children: ReactNode }) => {
  const ble = useBLE();
  return <BLEContext.Provider value={ble}>{children}</BLEContext.Provider>;
};

export const useBLEContext = () => useContext(BLEContext);

export default BLEContext;
