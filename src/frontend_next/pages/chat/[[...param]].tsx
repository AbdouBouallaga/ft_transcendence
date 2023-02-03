import {
  Avatar,
  Button,
  Dropdown,
  Modal,
  TextInput,
  Label,
  Select,
  ToggleSwitch,
  Alert,
} from "flowbite-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Games from "../../components/icons/Games";
import Menu from "../../components/icons/Menu";
import { useRouter } from "next/router";
import Add from "../../components/icons/Add";
import axios from "axios";
import ListFriends from "../../components/chat/ListFriends";

const Chat = () => {
  const router = useRouter();
  const [drawer, setDrawer] = useState(true);
  useEffect(() => {
    console.log("no param");
    if (router.query.param) {
      console.log(router.query.param);
    }
  }, [router.query.param]);
  return (
    <>
     <div className="flex w-full h-[calc(100vh-60px)]  ">
        <ListFriends />
        <ChatSection />
        <Drawer drawer={drawer} setDrawer={setDrawer} />
      </div>
    </>
  );
};

export default Chat;

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
// // create room modal component for chat page
// const CreateRoom = () => {
//   const [acess, setAcess] = useState("public");
//   return (
//     <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
//       <h3 className="text-xl font-medium text-gray-900 ">Create a Room</h3>
//       <div>
//         <div className="mb-2 block">
//           <Label htmlFor="name" value="Name" />
//         </div>
//         <TextInput id="name" placeholder="Name of the room" required={true} />
//       </div>
//       <div>
//         <div className="mb-2 block">
//           <Label color="failure" htmlFor="access" value="Access" />
//         </div>
//         <Select
//           id="access"
//           value={acess}
//           onChange={(e) => setAcess(e.target.value)}
//           color="failure"
//           // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//         >
//           <option value="public">Public</option>
//           <option value="private">Private</option>
//           <option value="protected">Protected</option>
//         </Select>
//       </div>
//       {acess === "protected" ? (
//         <div>
//           <div className="mb-2 block">
//             <Label htmlFor="password" value="Your password" />
//           </div>
//           <TextInput id="password" type="password" required={true} />
//         </div>
//       ) : null}

//       <div className="w-full">
//         <Button>Create</Button>
//       </div>
//     </div>
//   );
// };

// const examleRoom = {
//   isRoom: true,
//   typeOfRoom: "private",
//   name: "famila group",
//   avatar: "",
//   owner: {
//     username: "Aberdai",
//     avatar: "/aberdai.jpeg",
//     status: "online",
//     login42: "aberdai",
//   },
//   admins: [
//     {
//       username: "Aberdai",
//       avatar: "/aberdai.jpeg",
//       status: "online",
//       login42: "aberdai",
//     },
//   ],
//   members: [
//     {
//       username: "Aberdai",
//       avatar: "/aberdai.jpeg",
//       status: "online",
//       login42: "aberdai",
//     },
//   ],
  // discussion: [
  //       {
  //         user: {
  //           username: "Aberdai",
  //           avatar: "/aberdai.jpeg",
  //           status: "online",
  //           login42: "aberdai",
  //         },
  //         message: "hello",
  //         date: "2021-08-01T12:00:00.000Z",
  //       },
// };

// const examplechat = [
//   {
//     discussion: [
//       {
//         user: {
//           username: "Aberdai",
//           avatar: "/aberdai.jpeg",
//           status: "online",
//           login42: "aberdai",
//         },
//         message: "hello",
//         date: "2021-08-01T12:00:00.000Z",
//       },
//       // ORDER BY data DESC
//     ],
//   },
// ];
// chat Header for dm and room
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
        <Dropdown.Item>Room Setting</Dropdown.Item>
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

//  Drawer component for chat page

const Drawer = ({ drawer, setDrawer }) => {
  return (
    <div
      className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto  bg-white w-80 dark:bg-gray-800 ${
        drawer ? "" : "transition-transform translate-x-full"
      }`}
    >
      <h5
        id="drawer-right-label"
        className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        Right drawer
      </h5>
      <button
        onClick={() => setDrawer(false)}
        type="button"
        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
    </div>
  );
};
// list of all friends

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
    <div className="grow m-2 flex flex-col ">
      <HeaderOfChat />
      <BodyOfChat />
    </div>
  );
};
