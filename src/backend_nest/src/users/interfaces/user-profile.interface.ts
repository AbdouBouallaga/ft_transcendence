import { GameStats } from "./index";

export interface UserProfile {
    username: string,
    avatar: string,
    tfaEnabled: boolean,
};

export interface UserFullProfile {
    profile: UserProfile,
    friends: UserProfile[],
    games: GameStats[],
}
