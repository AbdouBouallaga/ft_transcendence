import { Modal } from "flowbite-react";
import React, { useEffect, useState } from "react";

import Add from "../../components/icons/Add";
import axios from "axios";
import CreateRoom from "./CreateRoom";
import FriendCard from "./friendCard";

const ListFriends = () => {
  const [createRoom, setCreateRoom] = useState(false);

  const fetchFriends = async () => {
    const res = await axios.get("/api/chat/publicChannels");
    console.log(res.data);
  };
  useEffect(() => {
    fetchFriends();
  }, []);

  const friendsExample = [
    {
      id: 1,
      name: "Aberdai",
      avatar: "/aberdai.jpeg",
      lastmessage:
        "ymta nsawliw had project hjjfhdksjhfsd hj dsjkfhdklshfajksdhfk khsadklfhajkshfl skjhadsklfhdjkshf adslk ?",
      status: "online",
      room: {
        isRoom: false,
        typeOfRoom: "",
      },
    },
    {
      id: 2,
      name: "mmeski",
      avatar: "/mmeski.jpeg",
      lastmessage: "fokma briti ",
      status: "offline",
      room: {
        isRoom: false,
        typeOfRoom: "",
      },
    },
    {
      id: 3,
      name: "babdelka",
      avatar: "/babdelka.jpeg",
      lastmessage: "hello",
      status: "away",
      room: {
        isRoom: false,
        typeOfRoom: "",
      },
    },
    {
      id: 4,
      name: "famila group",
      avatar: "",
      lastmessage: "a fin a famila",
      status: "online" || "offline" || "ingame",
      room: {
        isRoom: true,
        typeOfRoom: "",
      },
    },
    {
      id: 4,
      name: "shit group",
      avatar: "",
      lastmessage: "a fin a famila",
      status: "online" || "offline" || "ingame",
      room: {
        isRoom: true,
        typeOfRoom: "private",
      },
    },
  ];
  return (
    <div className="w-full border-r p-3 max-w-[310px] flex flex-col">
      <h1 className="font-bold text-left text-2xl">Message</h1>
      <div
        onClick={() => setCreateRoom(true)}
        className="flex gap-1 cursor-pointer "
        role="button"
      >
        <Add />
        <span>Create Room</span>{" "}
      </div>
      <div className=" overflow-y-auto  h-[100%]">
        {friendsExample.map((friend, index) => (
          <FriendCard key={index} friend={friend} />
        ))}
      </div>
      <Modal
        show={createRoom}
        size="md"
        popup={true}
        onClose={() => setCreateRoom(false)}
      >
        <Modal.Header />
        <Modal.Body>
          <CreateRoom />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListFriends;
