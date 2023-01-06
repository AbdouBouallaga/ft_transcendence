import { type } from "os";
import { GameStats } from "./index";

export class UserProfile {
    username: string;
    login42: string;
    avatar: string;
    tfaEnabled: boolean;

    constructor(user: any) {
        this.username = user.username;
        this.login42 = user.login42;
        this.avatar = user.avatar;
        this.tfaEnabled = user.tfaEnabled;
    }
};

export interface UserFullProfile {
    username: string,
    avatar: string,
    friends: UserProfile[],
    games: GameStats[],
}
