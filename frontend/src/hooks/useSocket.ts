'use client';

import { useSocketContext } from '../contexts/socket-context';

export const useSocket = () => {
  const { socket, sendMessage } = useSocketContext();
  return { socket, sendMessage, isConnected: !!socket?.connected };
};
export default useSocket;
