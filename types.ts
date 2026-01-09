
export interface Participant {
  id: string;
  name: string;
  nickname?: string;
  phoneNumber: string; // Format: +258...
  avatar?: string;
  timesPaid: number;
}

export interface DrawHistory {
  id: string;
  participantId: string;
  participantName: string;
  timestamp: number;
}

export interface AppSettings {
  avoidRepeats: boolean;
  notifyAll: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

export enum AppScreen {
  HOME = 'HOME',
  PARTICIPANTS = 'PARTICIPANTS',
  DRAW = 'DRAW',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  ABOUT = 'ABOUT'
}
