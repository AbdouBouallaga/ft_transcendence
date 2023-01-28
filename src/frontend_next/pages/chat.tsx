import {
  Avatar,
  Button,
  Dropdown,
  Modal,
  TextInput,
  Label,
  Select,
} from "flowbite-react";
import React, { useState } from "react";
import Image from "next/image";
import Games from "../components/icons/Games";
import Menu from "../components/icons/Menu";

const Chat = () => {
  const [createRoom, setCreateRoom] = useState(false);
  const [dm, setDm] = useState(true);
  return (
    <div className="flex w-full h-[calc(100vh-60px)] border-2 ">
      <div className="basis-1/4 border-r border-red-900 p-1 ">
        <MyInfo setDm={setDm} changeCreateRoom={setCreateRoom} />
        <InfoOfChat dm={dm} />
      </div>

      <ChatSection />

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

export default Chat;

const InfoOfChat = ({ dm }) => {
  return dm === true ? <h1>friends</h1> : <h1>Rooms</h1>;
};

const CreateRoom = () => {
  const [acess, setAcess] = useState("public");
  return (
    <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
      <h3 className="text-xl font-medium text-gray-900 ">Create a Room</h3>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="name" value="Name" />
        </div>
        <TextInput id="name" placeholder="Name of the room" required={true} />
      </div>
      <div>
        <div className="mb-2 block">
          <Label color="failure" htmlFor="access" value="Access" />
        </div>
        <Select
          id="access"
          value={acess}
          onChange={(e) => setAcess(e.target.value)}
          color="failure"
          // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="protected">Protected</option>
        </Select>
      </div>
      {acess === "protected" ? (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password" value="Your password" />
          </div>
          <TextInput id="password" type="password" required={true} />
        </div>
      ) : null}

      <div className="w-full">
        <Button>Create</Button>
      </div>
    </div>
  );
};

const MyInfo = ({ changeCreateRoom, setDm }) => {
  return (
    <div className="bg-white rounded p-3 ">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar rounded img="/avatar-test.jpeg" />
        <div className="font-medium dark:text-white">
          <div>Mouras</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Joined in August 2014
          </div>
        </div>
      </div>
      <div className="flex ">
        <Image
          src="/icons/add-r.svg"
          alt=""
          width={24}
          height={24}
          className="hover:text-orange-900 hover:cursor-pointer"
        />
        <Button.Group>
          <Button onClick={() => setDm(true)} color="gray">
            Friends
          </Button>
          <Button onClick={() => setDm(false)} color="gray">
            Rooms
          </Button>
          <Button
            onClick={() => {
              changeCreateRoom(true);
            }}
            color="gray"
          >
            Room
          </Button>
        </Button.Group>
        {/* <svg
          className="w-6 h-6 red-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          ></path>
        </svg>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          ></path>
        </svg> */}
      </div>
    </div>
  );
};

const HeaderOfChat = () => {
  return (
    <div className="border-b border-gray-600 flex items-center justify-between mx-3">
      {/* avatar and userName */}
      <div className="flex items-center ">
        <Avatar
          className="w-10 h-10 rounded-full m-2"
          img="/with.webp"
          statusPosition="bottom-right"
          rounded={true}
          status="online" // online, offline, busy, away
          alt="user"
        />

        <span className="text-xs text-slate-300 hidden md:block">
          Conversation with &nbsp;
        </span>
        <span className=" text-base"> Aberdai</span>
      </div>

      {/* invite to play games */}
      <button className="flex green-900 cursor-pointer">
        <Games />
        <span> Invite To Game</span>
      </button>

      {/* setting */}
      <Dropdown
        label={
          <div className="hover:rounded-full p-1 hover:bg-slate-300">
            <Menu />
          </div>
        }
        inline={true}
        arrowIcon={false}
      >
        <Dropdown.Item>Settings</Dropdown.Item>
        <Dropdown.Item>Block</Dropdown.Item>
      </Dropdown>
    </div>
  );
};

const SendMsg = () => {
  return (
    <div className="w-full mt-4">
      <form className="w-full">
        <div className="relative w-full">
          <input
            type="search"
            id="default-search"
            className="block w-full p-4  text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Type a message ..."
            required
          />
          <button
            // type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

const Msg = () => {
  return (
    <div className="mb-4 flex max-w-[80%]  m-1">
      <Avatar className="mr-2 min-w-[50px] " img="/with.webp" rounded={true} />
      <div>
        <div>
          <span className="text-black font-medium ">Aberdai &nbsp;</span>
          <span className="text-slate-300 text-xs">13:35 Am</span>
        </div>
        <div className="rounded-r-lg  rounded-b-lg bg-green-100 p-2">
          msg lorem hioasdhkahs jkhaskjhdkjashdk Lorem ipsum dolor sit amet
          consectetur, adipisicing elit. Accusamus ducimus consequuntur
          explicabo doloribus, ex debitis adipisci quos laboriosam maxime,
          laudantium optio accusantium, et ab est dolores id architecto? Eos,
          voluptate!
        </div>
      </div>
    </div>
  );
};

const MyMsg = () => {
  return (
    <div
      className="mb-4 max-w-[80%]
      m-1 flex flex-col items-end self-end"
    >
      <div className="">
        <span className="text-black font-medium ">Mouras &nbsp;</span>
        <span className="text-slate-300 text-xs">13:37 Am</span>
      </div>
      <div className="rounded-l-lg  rounded-b-lg bg-yellow-100 p-2">
        msg lorem hioasdhkahs jkhaskjhdkjashdk Lorem ipsum dolor sit amet
        consectetur, adipisicing elit. Accusamus ducimus consequuntur explicabo
        doloribus, ex debitis adipisci quos laboriosam maxime, laudantium optio
        accusantium, et ab est dolores id architecto? Eos, voluptate!
      </div>
    </div>
  );
};

const BodyOfChat = () => {
  return (
    <div className="h-full flex flex-col overflow-hidden justify-between ">
      <div className="border-gray-2 p-2 w-full h-full  rounded flex flex-col align-start overflow-y-scroll no-scrollbar">
        <Msg />
        <Msg />
        <MyMsg />
        <Msg />
        <MyMsg />
        <MyMsg />
        <Msg />
        <MyMsg />
        <Msg />
        <MyMsg />
      </div>
      <SendMsg />
    </div>
  );
};

const ChatSection = () => {
  return (
    <div className="basis-3/4 m-2 flex flex-col">
      <HeaderOfChat />
      <BodyOfChat />
    </div>
  );
};
