import { UserProfile } from './index';

export interface GameStats {
  winner: UserProfile;
  winnerScore: number;
  loser: UserProfile;
  loserScore: number;
  won: boolean;
}

export interface UserFullGameStats {}
