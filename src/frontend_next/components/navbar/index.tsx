import { useEffect, useState } from "react";
import React from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Dropdown, Avatar } from "flowbite-react";
import Cast from "../icons/Cast";
import Chat from "../icons/Chat";

const Navbar = ({ profile }: any) => {
  return (

    <>
      <nav id="Navbar" className="h-[60px] flex items-center min-w-fit">
        <div className=" container mx-auto flex items-center justify-betwee px-2">
          <Link href="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              PingPong
            </span>
          </Link>
          <div className=" w-full flex justify-end">
            <ul className="flex items-center flex-row space-x-3 text-sm font-medium  ">
              <li>
                <a
                  onClick={() => {
                    Router.push("/game");
                  }}
                  href="#"
                  className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Game
                </a>
              </li>
              <li>
                <Cast />
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => {
                    Router.push("/chat");
                  }}
                >
                  <Chat />
                </a>
              </li>
              <li>
                <Dropdown
                  label={<div style={{width:40}}>
                    <Avatar
                      alt="Nav Drop settings"
                      img={profile?.avatar}
                      rounded={true}
                    />
                  </div>
                  }
                  inline={true}
                  arrowIcon={false}

                >
                  <Dropdown.Header>
                    <span className="block text-sm">Signed in as</span>
                    <span className="block text-sm font-medium truncate">
                      {profile?.username}
                    </span>
                  </Dropdown.Header>
                  <Dropdown.Item
                    onClick={() => {
                      Router.push("/profile");
                    }}
                  >
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item>Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      Router.push("/api/auth/logout");
                    }}
                  >
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
