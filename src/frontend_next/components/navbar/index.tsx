import { useEffect, useState } from "react";
import React from "react";
import Router, {useRouter} from 'next/router';
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Dropdown, Avatar } from "flowbite-react";

const Navbar = ({ profile } :any) => {

  return (
  <>
    <nav id="Navbar" className="">
      <div className="container flex items-center justify-between mx-auto">
        <Link href="/" className="flex items-center">
          {/* <img src="https://flowbite.com/docs/images/logo.svg" className="h-6 mr-3 sm:h-10" alt="Flowbite Logo" /> */}
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            PingPong
          </span>
        </Link>
        <div className=" w-full flex justify-end">
          <ul className="flex  p-4  items-center  flex-row space-x-8  text-sm font-medium  ">
            <li>
              <a
                onClick={()=>{Router.push("/game")}}
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Game
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={()=>{Router.push("/chat")}}
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="w-6 h-6"
                >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
              </svg>
              </a>
            </li>
            <li>
              <Dropdown label={<Avatar alt="Nav Drop settings" img={profile?.avatar} rounded={true}/>}
                        inline={true} 
                        arrowIcon={false}>
              <Dropdown.Header>
                <span className="block text-sm">
                  Signed in as 
                </span>
                <span className="block text-sm font-medium truncate">
                  {profile?.username}
                </span>
              </Dropdown.Header>
              <Dropdown.Item onClick={()=>{Router.push("/profile")}}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item>
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={()=>{Router.push("/api/auth/logout")}}>
                Sign out
              </Dropdown.Item>
            </Dropdown>
            </li>
          </ul>
        </div>
      </div>
    </nav>
</>
  );
};

export default Navbar;
