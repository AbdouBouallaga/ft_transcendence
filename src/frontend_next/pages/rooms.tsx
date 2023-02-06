import Lottie from "lottie-react";
import empty from "../components/icons/empty.json";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "flowbite-react";
import { Lock, Unlock } from "../components/icons";
import axios from "axios";

const rooms = () => {
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    const res = await axios.get("/api/chat/publicChannels");
    const { data } = res;
    setRooms(data);
    console.log("***** data ******", res.data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);
  if (rooms.length > 0) return <Rooms rooms={rooms} />;
  else return <NoRooms />;
};

export default rooms;

const NoRooms = () => {
  return (
    <div className="my-8">
      <h1 className="text-gray-300 text-2xl">no rooms</h1>
      <div className="w-[80%] max-w-[600px] m-auto mt-18">
        <Lottie animationData={empty} />
      </div>
    </div>
  );
};

const Rooms = ({ rooms }) => {
  return (
    <div className="my-8">
      <h1 className="text-gray-300 text-2xl">All Availeble Rooms</h1>
      <div className="flex flex-wrap gap-5 m-10 justify-center md:justify-around">
        {rooms.map((room: any, i: any) => (
          <RoomCard key={i} room={room} />
        ))}
      </div>
    </div>
  );
};

const RoomCard = ({ room }) => {
  const { name, owner, isProtected } = room;
  return (
    <div className="flex justify-center group">
      <div className="flex  flex-row max-w-xl rounded-lg bg-white shadow-lg overflow-hidden relative">
        <div className="w-[200px]">
          <Image
            className=" h-[200px] object-cover rounded-none rounded-l-lg group-hover:scale-110 transition-all duration-300 ease-in-out"
            src={"/static/rooms.jpeg"}
            width={200}
            height={200}
            alt="avatar"
          />
        </div>
        <div className="p-6 flex flex-col justify-start">
          <h5 className="text-gray-900 text-xl font-medium mb-2">{name}</h5>

          <div className="absulute right-2 top-2 absolute">
            {isProtected ? <Lock /> : <Unlock />}
          </div>

          <Button gradientMonochrome="success">Join the room</Button>
        </div>
      </div>
    </div>
  );
};
