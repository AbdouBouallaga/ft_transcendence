import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import ListFriends from "../../components/chat/ListFriends";
import chat from "../../components/icons/chat.json";

const Chat = () => {
  return (
    <>
      <div className="flex w-full h-[calc(100vh-60px)]  ">
        <ListFriends />
        <div className="grid place-items-center w-full">
          <Lottie animationData={chat} />
        </div>
      </div>
    </>
  );
};

export default Chat;
