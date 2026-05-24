import { create } from 'zustand';
import { NearbyPlayer, GameNotification } from '../types';

interface GameState {
  nearbyTerritories: any[];
  nearbyPlayers: NearbyPlayer[];
  notifications: GameNotification[];
  
  setNearbyTerritories: (territories: any[]) => void;
  updateNearbyPlayer: (player: NearbyPlayer) => void;
  removeNearbyPlayer: (userId: string) => void;
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  nearbyTerritories: [],
  nearbyPlayers: [],
  notifications: [],

  setNearbyTerritories: (nearbyTerritories) => set({ nearbyTerritories }),

  updateNearbyPlayer: (player) => {
    set((state) => {
      const idx = state.nearbyPlayers.findIndex((p) => p.userId === player.userId);
      const updated = [...state.nearbyPlayers];
      if (idx >= 0) {
        updated[idx] = player;
      } else {
        updated.push(player);
      }
      return { nearbyPlayers: updated };
    });
  },

  removeNearbyPlayer: (userId) => {
    set((state) => ({
      nearbyPlayers: state.nearbyPlayers.filter((p) => p.userId !== userId),
    }));
  },

  addNotification: (notification) => {
    const newNotif: GameNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50), // cap at 50 notices
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));
export default useGameStore;
