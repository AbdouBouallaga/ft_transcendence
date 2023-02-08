import { Avatar, Tooltip } from "flowbite-react";
import { Block, Mute, Admine, Play, RemoveAdmin, Unmute } from "../icons";
import Router from "next/router";
import axios from "axios";

const Drawer = ({
  drawer,
  setDrawer,
  myRole,
  members,
  profile,

  setTrigger,
}: any) => {
  return (
    <div
      className={`fixed top-[60px] right-0 z-40 h-screen p-4 overflow-y-auto  bg-white w-80 dark:bg-gray-800 ${
        drawer ? "" : "transition-transform translate-x-full"
      }`}
    >
      <h5
        id="drawer-right-label"
        className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        All Members
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

      <div>
        {members?.map((member: any, i: any) => {
          return (
            <MemberCard
              key={i}
              member={member}
              myRole={myRole}
              profile={profile}
              setTrigger={setTrigger}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Drawer;

const MemberCard = ({ member, myRole, profile, setTrigger }: any) => {
  const { avatar, username, role, isMuted } = member;
  const userRoleFunction = (role: number): string => {
    const roles = ["member", "admin", "owner"];
    return roles[role];
  };

  const userRole = userRoleFunction(role);

  return (
    <div className="mb-4 flex items-center">
      <button
        className="max-w-[50px] w-[100%]"
        onClick={() => {
          Router.push("/profile/" + member.username);
        }}
      >
        <Avatar img={avatar} rounded={true} />
      </button>
      <div className="ml-2 flex flex-col max-w-[120px] w-[100%]">
        <span className=" text-sm font-semibold truncate ">{username} </span>
        <span className=" font-semibold text-gray-500  text-xs truncate" />
        {userRole}
        <span />
      </div>
      <div className="ml-4 flex max-w-[150px] w-full justify-end w-[100%]">
        {ShowIcon(
          isMuted,
          myRole,
          userRole,
          profile.username,
          username,
          setTrigger
        )}
      </div>
    </div>
  );
};

const ShowIcon = (
  isMuted: boolean,
  myRole: string,
  userRole: string,
  profile: string,
  username: string,
  setTrigger: any
) => {
  const { id } = Router.query;
  const handleBan = () => {
    axios({
      method: "POST",
      url: "/api/chat/banUserFromChannel",
      data: {
        otherLogin42: username,
        channelId: parseInt(id as string),
      },
    })
      .then((response) => {
        setTrigger((prev: any) => !prev);
      })
      .catch((error) => {
        Router.replace("/");
      });
  };

  const handleUnMute = () => {
    axios({
      method: "POST",
      url: "/api/chat/unmuteUserFromChannel",
      data: {
        otherLogin42: username,
        channelId: parseInt(id as string),
      },
    })
      .then((response) => {
        setTrigger((prev: any) => !prev);
      })
      .catch((error) => {
        Router.replace("/");
      });
  };
  const handleMute = () => {
    axios({
      method: "POST",
      url: "/api/chat/muteUserFromChannel",
      data: {
        otherLogin42: username,
        channelId: parseInt(id as string),
      },
    })
      .then((response) => {
        setTrigger((prev: any) => !prev);
      })
      .catch((error) => {
        Router.replace("/");
      });
  };

  const handleRemoveAdmin = () => {
    axios({
      method: "POST",
      url: "/api/chat/downgradeUserRole",
      data: {
        otherLogin42: username,
        channelId: parseInt(id as string),
      },
    })
      .then((response) => {
        setTrigger((prev: any) => !prev);
      })
      .catch((error) => {
        Router.replace("/");
      });
  };
  const handleAddAdmin = () => {
    axios({
      method: "POST",
      url: "/api/chat/upgradeUserRole",
      data: {
        otherLogin42: username,
        channelId: parseInt(id as string),
      },
    })
      .then((response) => {
        setTrigger((prev: any) => !prev);
      })
      .catch((error) => {
        Router.replace("/");
      });
  };
  if (username !== profile && (myRole === "owner" || myRole === "admin")) {
    if (myRole === "admin" && userRole === "owner") {
      return (
        <Tooltip content={"Play Now"}>
          <Play username={username} />
        </Tooltip>
      );
    } else
      return (
        <>
          <Tooltip content={"Block the user"}>
            <button onClick={handleBan}>
              <Block />
            </button>
          </Tooltip>
          {isMuted ? (
            <Tooltip content={"unMute the user"}>
              <button onClick={handleUnMute}>
                <Unmute />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content={"Mute the user"}>
              <button onClick={handleMute}>
                <Mute />
              </button>
            </Tooltip>
          )}
          {userRole === "admin" ? (
            <Tooltip content={"Remove Admin Role"}>
              <button onClick={handleRemoveAdmin}>
                <RemoveAdmin />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content={"Add admin Role"}>
              <button onClick={handleAddAdmin}>
                <Admine />
              </button>
            </Tooltip>
          )}
          {profile !== username && (
            <Tooltip content={"Play Now"}>
              <Play username={username} />
            </Tooltip>
          )}
        </>
      );
  } else if (myRole === "member" && profile !== username) {
    return (
      <Tooltip content={"Play Now"}>
        <Play username={username} />
      </Tooltip>
    );
  }
};
