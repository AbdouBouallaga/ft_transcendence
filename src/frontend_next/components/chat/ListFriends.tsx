import { Modal } from "flowbite-react";
import React, { useEffect, useState } from "react";

import Add from "../../components/icons/Add";
import axios from "axios";
import CreateRoom from "./CreateRoom";
import FriendCard from "./friendCard";

const ListFriends = () => {
  const [createRoom, setCreateRoom] = useState(false);
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    const res = await axios.get("/api/chat/me");
    const { status, data } = res;
    status === 200 && setFriends(data);
  };
  useEffect(() => {
    fetchFriends();
  }, [createRoom]);

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
        {friends.map((friend, index) => (
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
          <CreateRoom setCreateRoom={setCreateRoom} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListFriends;
