import { useEffect, useState } from "react";
import React from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Dropdown, Avatar, Modal, Button, TextInput } from "flowbite-react";
import Cast from "../icons/Cast";
import Chat from "../icons/Chat";

const Navbar = ({ profile }: any) => {
  const [searchModal, setSearchModal] = useState(false);
  const [c, setC] = useState(0)
  const [results, setResults] = useState([])
  const searchRef = React.useRef(null);
  useEffect(() => {
    console.log(searchRef?.current?.value);
    if (searchRef?.current?.value)
    axios.get(`/api/users/find/`+searchRef?.current?.value)
      .then((response) => {
        setResults(response.data)
        console.log(response);
      })
    else
      setResults([])
  }, [c]);
  return (
    <>
      <nav id="Navbar" className="h-[60px] flex items-center min-w-fit sticky">
        <div className=" container mx-auto flex items-center justify-betwee px-2">
            <button onClick={() => {Router.push("/");}} className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              PingPong
            </button>
          <div className=" w-full flex justify-end">
            <ul className="flex items-center flex-row space-x-3 text-sm font-medium  ">
              <li>
                <button className="m-1">
                  <svg onClick={() => { setSearchModal(!searchModal) }} aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    Router.push("/game");
                  }}
                  // href="#"
                  className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Game
                </button>
              </li>
              <li>
                <Cast />
              </li>
              <li>
                <a
                  // href="#"
                  onClick={() => {
                    Router.push("/chat");
                  }}
                >
                  <Chat />
                </a>
              </li>
              <li>
                <Dropdown
                  label={<div style={{ width: 40 }}>
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
        <Modal
          show={searchModal}
          size="xl"
          onClose={() => {
            setSearchModal(!searchModal);
            setResults([]);
            if (searchRef.current) {
              searchRef.current.value = "";
            }
          }}
        >
          <Modal.Header>
            Search for a user
          </Modal.Header>
          <Modal.Body>
            <form>
              <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input onChange={() => { setC(c + 1) }} ref={searchRef} className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Username" required />
              </div>
            </form>
            <div className="flex-1 m-2">
              <div className="flex flex-row flex-wrap overflow-auto max-h-[300px]">
                {results.map((e, i) =>
                  <div className="relative m-2" style={{ width: 80 }} onClick={() => {
                    setSearchModal(!searchModal);
                    setResults([]);
                    if (searchRef.current !== null)
                      searchRef.current.value = "";
                    Router.replace(`/profile/`+e?.login42)
                  }}>
                    <Avatar
                      alt="Nav Drop settings"
                      img={e?.avatar}
                      rounded={false}
                      size="lg"
                      status="online"
                    />
                    <div className="font-bold aero w-full" >
                      {e.username}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </nav>
    </>
  );
};

export default Navbar;
