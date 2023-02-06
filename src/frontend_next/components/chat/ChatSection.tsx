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
import Router ,{ useRouter } from "next/router";
import {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Games from "../../components/icons/Games";
import Menu from "../../components/icons/Menu";
import { GeneralContext } from "../../pages/_app";
import { Search } from "../icons";

import Drawer from "./Drawer";
import EditRoom from "./EditRoom";
import { v4 as uuidv4 } from 'uuid';

const ChatSection = ({ profile }: any) => {
  const Context: any = useContext(GeneralContext);
  const socket: any = Context.ChatSocket;
  let init = useRef<boolean>(false);
  const router = useRouter();
  const [messages, setMessages] = useState<any>([]);
  const [data, setData] = useState({});
  const { id } = router.query;

  useEffect(() => {
    if (!init.current) {
      init.current = true;
      socket.emit("enterRoom", {
        login42: profile.login42,
        channelId: parseInt(id as string),
      });
      socket.on("updateChatSection", (data: any) => {
        setMessages((old: any[]) => [...old, data]);
      });
    }
  }, []);
  useEffect(() => {
    id && fetchChat(id as string);
  }, [id]);

  // load chat
  const fetchChat = async (id: string) => {
    setMessages([]);
    const res = await axios.get(`/api/chat/${id}`);
    const {
      status,
      data: { isDM, members, messages, name, isProtected, type, avatar },
    } = res;
    // console.log("****** data *******", res.data);
    status === 200 &&
      (setMessages(messages),
        setData({ isDM, members, name, isProtected, type, avatar }));
  };
  return (
    <div className="grow m-2 flex flex-col ">
      <HeaderOfChat profile={profile} data={data} />
      <BodyOfChat messages={messages} profile={profile} roomid={id} />
    </div>
  );
};

const role = (members: any, username: string) => {
  const role = ["member", "admin", "owner"];
  const member = members?.find((member: any) => member.username === username);
  return member && role[member.role];
};

const HeaderOfChat = ({ profile, data }: any) => {
  const Context: any = useContext(GeneralContext);
  const gameSocket: any = Context.Socket;
  const myprofile: any = Context.Profile;
  const { isDM, members, name, avatar } = data;
  const { username } = profile;
  const myRole = role(members, username);
  const [drawer, setDrawer] = useState(false);
  const [editRoom, setEditRoom] = useState(false);
  const [invite, setInvite] = useState(false);

  return (
    <div className="border-b border-gray-600 flex items-center justify-between mx-3">
      {/* avatar and userName */}
      <div className="flex items-center ">
        <Avatar
          className="w-10 h-10 rounded-full m-2"
          img={avatar}
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
      <button className="flex bg-gray-50 cursor-pointer"
        onClick={() => {
          let room = uuidv4();
          setTimeout(() => {
            if (gameSocket) {
              gameSocket.emit('sendInviteToPlay', { 'from': myprofile.username, 'to': name, 'room': room })
              Router.push("/game/" + room)
            }
          }, 250);
        }}
      >
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
            <Dropdown.Item onClick={() => setInvite(true)}>
              Invite
            </Dropdown.Item>
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
      <Modal
        show={invite}
        size="md"
        popup={true}
        onClose={() => setInvite(false)}
      >
        <Modal.Header>Invite your friends to join chat</Modal.Header>
        <Modal.Body>
          <InviteToRoom />
        </Modal.Body>
      </Modal>
    </div>
  );
};
const Msg = ({ date, message, username }: any) => {
  return (
    <div className="mb-4 flex max-w-[80%]  m-1">
      {/* <Avatar className="mr-2 min-w-[50px] " img="/with.webp" rounded={true} /> */}
      <div>
        <div>
          <span className="text-black font-medium ">{username} &nbsp;</span>
          <span className="text-slate-300 text-xs">{date}</span>
        </div>
        <div className="rounded-r-lg  rounded-b-lg bg-green-100 p-2">
          {message}
        </div>
      </div>
    </div>
  );
};

const MyMsg = ({ date, message, username }: any) => {
  return (
    <div
      className="mb-4 max-w-[80%]
    m-1 flex flex-col items-end self-end"
    >
      <div className="">
        <span className="text-black font-medium ">{username} &nbsp;</span>
        <span className="text-slate-300 text-xs">{date}</span>
      </div>
      <div className="rounded-l-lg  rounded-b-lg bg-yellow-100 p-2">
        {message}
      </div>
    </div>
  );
};

const BodyOfChat = ({ messages, profile, roomid }: any) => {
  const { username: myUserName } = profile;

  function useChatScroll<T>(dep: T): React.MutableRefObject<HTMLDivElement> {
    const ref:any = useRef<HTMLDivElement>();
    useEffect(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, [dep]);
    return ref;
  }

  const ref = useChatScroll(messages);

  return (
    <div className="h-full flex flex-col overflow-hidden justify-between ">
      <div
        ref={ref}
        className="border-gray-2 p-2 w-full h-full  rounded flex flex-col align-start overflow-y-scroll no-scrollbar"
      >
        {messages.map((msg: any, i: any) => {
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
      <SendMsg roomid={roomid} to={myUserName} />
    </div>
  );
};

const SendMsg = (data: any) => {
  const Context: any = useContext(GeneralContext);
  const { Profile, ChatSocket } = Context;
  const [myMessage, setMyMessage] = useState("");
  const handleSubmit = (e: any) => {
    e.preventDefault();
    ChatSocket.emit("sendmessage", {
      login42: Profile.login42,
      channelId: parseInt(data.roomid),
      content: myMessage,
      to: data.to,
    });
    setMyMessage("");
  };

  return (
    <div className="w-full mt-4">
      <form onSubmit={handleSubmit} className="w-full" autoComplete="off">
        <div className="relative w-full">
          <input
            value={myMessage}
            onChange={(e) => {
              setMyMessage(e.target.value);
            }}
            type="search"
            id="default-search"
            className="block w-full p-4  text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Type a message ..."
            required
          />
          <button
            type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

const InviteToRoom = () => {
  const handlSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <>
      <form onSubmit={handlSubmit}>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email4" value="user to add" />
          </div>
          <TextInput
            id="email4"
            type="email"
            rightIcon={Search}
            placeholder="find user to add"
          // required={true}
          />
        </div>
      </form>
      <div className="flex-1 m-2">
        <div className="flex flex-row flex-wrap overflow-auto max-h-[300px]">
          {/* {results.map((e: any, i: number) => (
            <div
            key={i}
            className="relative m-2"
            style={{ width: 80 }}
            onClick={() => {
              setSearchModal(!searchModal);
              setResults([]);
              if (searchRef.current !== null) searchRef.current.value = "";
              Router.push(`/profile/` + e?.username);
            }}
            >
            <Avatar
            alt="Nav Drop settings"
            img={e?.avatar}
            rounded={false}
            size="lg"
            // status="online"
            />
            <div className="font-bold aero w-full">{e.username}</div>
            </div>
          ))} */}
        </div>
      </div>
    </>
  );
};

export default ChatSection;
