import { type } from "os";
import { GameStats } from "./index";

export class UserProfile {
    username: string;
    login42: string;
    avatar: string;

    constructor(user: any) {
        this.username = user.username;
        this.login42 = user.login42;
        this.avatar = user.avatar;
    }
};

export interface UserFullProfile {
    username: string,
    avatar: string,
    friends: UserProfile[],
    games: GameStats[],
}
