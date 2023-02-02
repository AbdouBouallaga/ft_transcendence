import { Channel, ChannelType } from "@prisma/client";

export class ChannelInfo {
	id: number;
	name: string;
	avatar: string;
	lastMessage: string;

	constructor(channel: Channel) {
		this.id = channel.id;
		this.name = channel.name;
		if (channel.type === ChannelType.DIRECT) {
			this.avatar = process.env.DM_AVATAR;
		} else {
			this.avatar = process.env.ROOM_AVATAR;
		}
		this.lastMessage = "Click to open conversation";
	}
}
