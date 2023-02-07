import Lottie from "lottie-react";
import empty from "../components/icons/empty.json";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Modal, TextInput } from "flowbite-react";
import { Lock, Unlock } from "../components/icons";
import axios from "axios";
import { useRouter } from "next/router";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const router = useRouter();

  const fetchRooms = async () => {
    const res = await axios.get("/api/chat/publicChannels").then((res) => { setRooms(res.data) }).catch((err) => { });
    // const { status, data } = res;
    // status === 200 && setRooms(data);

    console.log("ressss", res);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchRooms();
  }, []);
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

const Roomss = ({ rooms }: any) => {
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

const RoomCard = ({ room }: any) => {
  const { name, isProtected, id } = room;
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const joinRoom = async (id: number, password?: string) => {
    const res = await axios.post("/api/chat/joinChannel", {
      channelId: id,
      password,
    })
      .then((res) => {
        if (res.data.success) {
          console.log("error");
          setError(true);
        } else {
          router.push(`/chat/${id}`);
        }
      }
      ).catch((err) => { });
    // const { success } = res.data;
    // if (!success) {
    //   console.log("error");
    //   setError(true);
    // } else {
    //   router.push(`/chat/${id}`);
    // }
  };

  const handleJoinRoom = () => {
    if (isProtected) {
      setShowModal(true);
    } else {
      joinRoom(id);
    }
  };
  return (
    <div className="flex justify-center group max-w-[312px]">
      <div className="flex  flex-row max-w-xl rounded-lg bg-white shadow-lg overflow-hidden relative">
        <div className="w-[140px]">
          <div className="absulute right-2 top-2 absolute">
            {isProtected ? <Lock /> : <Unlock />}
          </div>
          <Image
            className=" h-[150px] object-cover rounded-none rounded-l-lg group-hover:scale-110 transition-all duration-300 ease-in-out"
            src={"/static/rooms.jpeg"}
            width={140}
            height={150}
            alt="avatar"
          />
        </div>
        <div className="mt-6 p-3 flex flex-col justify-start items-center w-[172px] overfole-hidden  truncate">
          <div className="w-[100%]">
            <h5 className="text-gray-900 text-xl font-medium mb-2 whitespace-nowrap  truncate">
              {name}
            </h5>
          </div>

          <Button
            type="button"
            gradientMonochrome="success"
            onClick={handleJoinRoom}
          >
            Join The Room
          </Button>
        </div>
      </div>
      <Modal
        show={showModal}
        size="md"
        popup={true}
        onClose={() => setShowModal(false)}
      >
        <Modal.Header>enter the password</Modal.Header>
        <Modal.Body>
          <div>
            <TextInput
              color={error ? "danger" : "primary"}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log("id", id);
                console.log("pass", password);
                // return;
                joinRoom(id, password);
              }}
            >
              Join
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};
