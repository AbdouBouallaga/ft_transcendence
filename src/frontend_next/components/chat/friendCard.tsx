import { Avatar } from "flowbite-react";
import React from "react";

import { useRouter } from "next/router";

const FriendCard = ({ friend }: any) => {
  const router = useRouter();

  const { lastMessage, name, avatar, id } = friend;
  return (
    <div className="flex p-2 " onClick={() => router.push(`/chat/${id}`)}>
      <Avatar
        className="mr-2 min-w-[50px]"
        img={avatar}
        // status={status}props.status['babdelka']}
        rounded={true}
        statusPosition="bottom-right"
      />
      <div className="w-[75%]">
        <div>{name}</div>
        <div className="truncate">{lastMessage}</div>
      </div>
    </div>
  );
};

export default FriendCard;
