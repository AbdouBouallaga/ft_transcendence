import { Avatar, Modal } from "flowbite-react";
import React, { useEffect, useState } from "react";

// import Add from "../../components/icons/Add";
import axios from "axios";
import CreateRoom from "./CreateRoom";
import FriendCard from "./friendCard";
import { Cool, Add } from "../icons";
import Router, { useRouter } from "next/router";

const ListFriends = () => {
  const [createRoom, setCreateRoom] = useState(false);
  const [friends, setFriends] = useState([]);
  const router = useRouter();

  const fetchFriends = async () => {
    const res = await axios
      .get("/api/chat/me")
      .then((res) => {
        setFriends(res.data);
      })
      .catch((err) => {});
    // const { status, data } = res;
    // status === 200 && setFriends(data);
  };

  useEffect(() => {
    fetchFriends();
  }, [createRoom]);

  return (
    <>
      <div className="w-full border-r p-3 max-w-[310px] flex flex-col">
        <h1 className="font-bold text-orange-200 text-left text-2xl">
          Message
        </h1>
        <div
          onClick={() => setCreateRoom(true)}
          className="flex text-gray-200 gap-1 cursor-pointer hover:bg-gray-700 p-2 rounded-md my-2 "
          role="button"
        >
          <Add />
          <span>Create Room</span>{" "}
        </div>
        <div
          onClick={() => router.push("/rooms")}
          className="flex text-gray-200 gap-1 cursor-pointer hover:bg-gray-700 p-2 rounded-md my-2"
          role="button"
        >
          <Cool />
          <span>Join Room</span>{" "}
        </div>
        <div className="mt-5 overflow-y-auto  h-[100%]">
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
    </>
  );
};

export default ListFriends;
