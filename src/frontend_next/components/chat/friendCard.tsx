import { Avatar } from "flowbite-react";
import React from "react";

import { useRouter } from "next/router";

const FriendCard = ({ friend }: any) => {
  const router = useRouter();
  // console.log("friend ===================", friend);
  const { lastmessage, status, name, avatar, id } = friend;
  return (
    <div className="flex p-2 " onClick={() => router.push(`/chat/${name}`)}>
      <Avatar
        className="mr-2 min-w-[50px]"
        img={avatar}
        status={status}
        rounded={true}
        statusPosition="bottom-right"
      />
      <div className="w-[75%]">
        <div>{name}</div>
        <div className="truncate">{lastmessage}</div>
      </div>
    </div>
  );
};

export default FriendCard;
