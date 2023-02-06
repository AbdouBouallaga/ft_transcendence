import { Avatar } from "flowbite-react";
import React from "react";

import { useRouter } from "next/router";

const FriendCard = ({ friend }: any) => {
  const router = useRouter();

  const { lastMessage, name, avatar, id } = friend;
  return (
    <div
      className="flex p-2 cursor-pointer hover:bg-gray-700 hover:rounded-full  group "
      onClick={() => router.push(`/chat/${id}`)}
    >
      <Avatar
        className="mr-2 min-w-[50px] group-hover:animate-bounce"
        img={avatar}
        // status={status}props.status['babdelka']}
        rounded={true}
        statusPosition="bottom-right"
      />
      <div className="text-gray-200 w-[75%]">
        <div className="uppercase">{name}</div>
        <div className="text-sm truncate">{lastMessage}</div>
      </div>
    </div>
  );
};

export default FriendCard;
