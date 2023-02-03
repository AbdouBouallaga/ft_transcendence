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
import ChatSection from "../../components/chat/ChatSection";

const Chat = () => {
  const [drawer, setDrawer] = useState(false);

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
