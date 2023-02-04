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
      data: { isDM, members, messages, name },
    } = res;
    status === 200 && (setMessages(messages), setData({ isDM, members, name }));
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

const role = (members, username) => {
  const role = ["member", "admin", "owner"];
  const member = members?.find((member: any) => member.username === username);
  return member && role[member.role];
};

const HeaderOfChat = ({ profile, data }) => {
  const { isDM, members, name } = data;
  const { username } = profile;
  const myRole = role(members, username);
  const [drawer, setDrawer] = useState(true);

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
          {myRole === "owner" && <Dropdown.Item>Change Pass</Dropdown.Item>}
          <Dropdown.Item
            onClick={() => {
              setDrawer(true);
            }}
          >
            All members
          </Dropdown.Item>
          <Dropdown.Item>Leave</Dropdown.Item>
        </Dropdown>
      )}
      <Drawer drawer={drawer} setDrawer={setDrawer} />
    </div>
  );
};
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
