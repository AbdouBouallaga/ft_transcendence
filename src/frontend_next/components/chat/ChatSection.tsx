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
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Games from "../../components/icons/Games";
import Menu from "../../components/icons/Menu";

const ChatSection = ({ profile }) => {
  const [messages, setMessages] = useState([]);

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
      data: { isDm, members, messages },
    } = res;
    status === 200 && setMessages(messages);
    console.log(res.data);
  };
  return (
    <div className="grow m-2 flex flex-col ">
      <HeaderOfChat />
      <BodyOfChat messages={messages} profile={profile} />
    </div>
  );
};

export default ChatSection;
const Msg = ({ date, message, username }) => {
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

const MyMsg = ({ date, message, username }) => {
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

const BodyOfChat = ({ messages, profile }) => {
  const { avatar, username: myUserName } = profile;
  console.log("the message", messages);
  return (
    <div className="h-full flex flex-col overflow-hidden justify-between ">
      <div className="border-gray-2 p-2 w-full h-full  rounded flex flex-col align-start overflow-y-scroll no-scrollbar">
        {messages.map((msg, i) => {
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
