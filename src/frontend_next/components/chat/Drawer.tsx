import { Avatar } from "flowbite-react";
import { Block, Mute, Admine, Play, RemoveAdmin } from "../icons";

const Drawer = ({ drawer, setDrawer, myRole, members, profile }) => {
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
        {members?.map((member, i) => {
          return (
            <MemberCard
              key={i}
              member={member}
              myRole={myRole}
              profile={profile}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Drawer;

const MemberCard = ({ member, myRole, profile }) => {
  const { avatar, username, role } = member;
  const userRoleFunction = (role: number): string => {
    const roles = ["member", "admin", "owner"];
    return roles[role];
  };

  const userRole = userRoleFunction(role);

  return (
    <div className="mb-4 flex items-center">
      <Avatar img={avatar} rounded={true} />
      <div className="ml-2 flex flex-col">
        <span className=" text-sm font-semibold  ">{username} </span>
        <span className=" font-semibold text-gray-500 text-xs" />
        {userRole}
        <span />
      </div>
      <div className="flex">
        {/* {username !== profile.username &&
          (myRole === "owner" || myRole === "admin") &&
          myRole === "admin" &&
          userRole === "owner" && (
            <>
              <Block />
              <Mute />
              <Admine />
            </>
          )}

        <Play /> */}
        {ShowIcon(myRole, userRole, profile.username, username)}
      </div>
    </div>
  );
};

const ShowIcon = (
  myRole: string,
  userRole: string,
  profile: string,
  username: string
) => {
  if (username !== profile && (myRole === "owner" || myRole === "admin")) {
    if (myRole === "admin" && userRole === "owner") {
      return <Play />;
    } else
      return (
        <>
          <Block />
          <Mute />
          {userRole === "admin" ? <RemoveAdmin /> : <Admine />}
          {profile !== username && <Play />}
        </>
      );
  } else if (myRole === "member" && profile !== username) {
    return <Play />;
  }
};
