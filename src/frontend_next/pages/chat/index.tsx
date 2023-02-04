import React, { useEffect, useState } from "react";
import ListFriends from "../../components/chat/ListFriends";

const Chat = () => {
  return (
    <>
      <div className="flex w-full h-[calc(100vh-60px)]  ">
        <ListFriends />
      </div>
    </>
  );
};

export default Chat;
