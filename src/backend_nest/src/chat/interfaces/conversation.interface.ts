import { UserProfile } from "src/users/interfaces"

export class ConversationMessage {
	login42: string;
	username: string;
	date: Date;
	message: string;

	constructor(message: any) {
		console.log("message", message);
		this.login42 = message.sender.login42;
		this.username = message.sender.username;
		this.date = message.createdAt;
		this.message = message.content;
	}
}

export class Conversation {
	id: number;
	owner: UserProfile;
	admins: UserProfile[];
	members: UserProfile[];
	messages: ConversationMessage[];
}
