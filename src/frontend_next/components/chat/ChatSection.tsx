import axios from "axios";
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
import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import Games from "../../components/icons/Games";
import Menu from "../../components/icons/Menu";
import Admine from "../icons/Admine";
import Block from "../icons/Block";
import Mute from "../icons/Mute";
import Play from "../icons/Play";
import Drawer from "./Drawer";
import EditRoom from "./EditRoom";

const ChatSection = ({ profile }:any) => {
  const [messages, setMessages] = useState([]);
  const [data, setData] = useState({});
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    id && fetchChat(id as string);
  }, [id]);

  const fetchChat = async (id: string) => {
    setMessages([]);
    const res = await axios.get(`/api/chat/${id}`);
    const {
      status,
      data: { isDM, members, messages, name, isProtected, type },
    } = res;
    status === 200 &&
      (setMessages(messages),
      setData({ isDM, members, name, isProtected, type }));
    console.log(res.data);
  };
  return (
    <div className="grow m-2 flex flex-col ">
      <HeaderOfChat profile={profile} data={data} />
      <BodyOfChat messages={messages} profile={profile} />
    </div>
  );
};

export default ChatSection;

const role = (members: any, username: string) => {
  const role = ["member", "admin", "owner"];
  const member = members?.find((member: any) => member.username === username);
  return member && role[member.role];
};

const HeaderOfChat = ({ profile, data }:any) => {
  const { isDM, members, name } = data;
  const { username } = profile;
  const myRole = role(members, username);
  const [drawer, setDrawer] = useState(false);
  const [editRoom, setEditRoom] = useState(false);

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

        {isDM ? (
          <span className="text-xs text-slate-300 hidden md:block">
            Conversation with &nbsp;
          </span>
        ) : (
          ""
        )}
        <span className=" text-base"> {name}</span>
      </div>

      {/* invite to play games */}
      <button className="flex green-900 cursor-pointer">
        <Games />
        <span> Invite To Game</span>
      </button>

      {/* setting */}
      {isDM ? (
        ""
      ) : (
        <Dropdown
          label={
            <div className="hover:rounded-full p-1 hover:bg-slate-300">
              <Menu />
            </div>
          }
          inline={true}
          arrowIcon={false}
        >
          {(myRole === "owner" || myRole === "admin") && (
            <Dropdown.Item>Invite</Dropdown.Item>
          )}
          {myRole === "owner" && (
            <Dropdown.Item onClick={() => setEditRoom(true)}>
              Edit Room
            </Dropdown.Item>
          )}
          <Dropdown.Item
            onClick={() => {
              setDrawer(true);
            }}
          >
            All Members
          </Dropdown.Item>
          <Dropdown.Item>Leave</Dropdown.Item>
        </Dropdown>
      )}
      <Drawer
        drawer={drawer}
        setDrawer={setDrawer}
        myRole={myRole}
        members={members}
        profile={profile}
      />
      <Modal
        show={editRoom}
        size="md"
        popup={true}
        onClose={() => setEditRoom(false)}
      >
        <Modal.Header />
        <Modal.Body>
          <EditRoom setEditRoom={setEditRoom} data={data} />
        </Modal.Body>
      </Modal>
    </div>
  );
};
const Msg = ({ date, message, username }:any) => {
  return (
    <div className="mb-4 flex max-w-[80%]  m-1">
      {/* <Avatar className="mr-2 min-w-[50px] " img="/with.webp" rounded={true} /> */}
      <div>
        <div>
          <span className="text-black font-medium ">{username} &nbsp;</span>
          <span className="text-slate-300 text-xs">13:35 Am</span>
        </div>
        <div className="rounded-r-lg  rounded-b-lg bg-green-100 p-2">
          {message}
        </div>
      </div>
    </div>
  );
};

const MyMsg = ({ date, message, username }:any) => {
  return (
    <div
      className="mb-4 max-w-[80%]
        m-1 flex flex-col items-end self-end"
    >
      <div className="">
        <span className="text-black font-medium ">{username} &nbsp;</span>
        <span className="text-slate-300 text-xs">13:37 Am</span>
      </div>
      <div className="rounded-l-lg  rounded-b-lg bg-yellow-100 p-2">
        {message}
      </div>
    </div>
  );
};

const BodyOfChat = ({ messages, profile }:any) => {
  const { avatar, username: myUserName } = profile;
  console.log("the message", messages);
  return (
    <div className="h-full flex flex-col overflow-hidden justify-between ">
      <div className="border-gray-2 p-2 w-full h-full  rounded flex flex-col align-start overflow-y-scroll no-scrollbar">
        {messages.map((msg:any, i:any) => {
          const { username, date, message } = msg;
          if (username === myUserName) {
            return (
              <MyMsg
                key={i}
                date={date}
                message={message}
                username={username}
              />
            );
          } else {
            return (
              <Msg key={i} date={date} message={message} username={username} />
            );
          }
        })}
      </div>
      <SendMsg />
    </div>
  );
};

const SendMsg = () => {
  return (
    <div className="w-full mt-4">
      <form className="w-full" autoComplete="off">
        <div className="relative w-full">
          <input
            type="search"
            id="default-search"
            className="block w-full p-4  text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Type a message ..."
            required
          />
          <button
            type="button"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

interface member {
  avatar: string;
  username: string;
  role: number;
  login42: string;
}

// const ShowIcon = () => {

//   return (

// }
