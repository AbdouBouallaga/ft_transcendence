import Lottie from "lottie-react";
import empty from "../components/icons/empty.json";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "flowbite-react";
import { Lock, Unlock } from "../components/icons";

const Rooms = () => {
  const [rooms, setRooms] = useState<any[]>([1, 2, 3, 4, 5]);

  if (rooms.length > 0) return <Roomss rooms={rooms} />;
  else return <NoRooms />;
};

export default Rooms;

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

const Roomss = ({ rooms }:any) => {
  return (
    <div className="my-8">
      <h1 className="text-gray-300 text-2xl">All Availeble Rooms</h1>
      <div className="flex flex-wrap gap-5 m-10 justify-center md:justify-around">
        {rooms.map((room: any, i: any) => (
          <RoomCard key={room} />
        ))}
      </div>
    </div>
  );
};

const RoomCard = () => {
  return (
    <div className="flex justify-center group">
      <div className="flex  flex-row max-w-xl rounded-lg bg-white shadow-lg overflow-hidden">
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
          <h5 className="text-gray-900 text-xl font-medium mb-2">
            my Room Name
          </h5>
          <p className="text-gray-700 text-base mb-4 flex">
            owned by me{" "}
            <span>
              <Lock />
            </span>
          </p>
          <p className="text-gray-600 text-xs">Last updated 3 mins ago</p>
          {/* <div className="flex"> */}
          {/* <Lock /> */}

          {/* <Unlock /> */}
          {/* </div> */}
          <Button gradientMonochrome="success">Join the room</Button>
        </div>
      </div>
    </div>
  );
};
