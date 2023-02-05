import { useEffect, useRef, useState } from "react";
import React from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Dropdown, Avatar, Modal, Button, TextInput, Alert } from "flowbite-react";
import Cast from "../icons/Cast";
import Chat from "../icons/Chat";

const Navbar = (props: any) => {
  let profile = props.profile;
  const [searchModal, setSearchModal] = useState(false);
  const [c, setC] = useState(0)
  const [results, setResults] = useState([])
  const searchRef: any = React.useRef(null);
  const [inviteinfo, setInviteinfo] = useState<{ from: string, room: string }>({ from: "", room: "" })
  const [inviteAlert, setInviteAlert] = useState(false)
  let init = useRef<boolean>(false)
  useEffect(() => {
    if (!init.current) {
      props.gameSocket.on("inviteToPlay", (data: any) => {
        console.log(data);
        setInviteinfo(data)
        setInviteAlert(true)
      });
      init.current = true;
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (searchRef.current) {
          searchRef.current.value = "";
        }
        setSearchModal(false)
      }
    });
    if (searchRef?.current?.value)
      axios.get(`/api/users/find/` + searchRef?.current?.value)
        .then((response) => {
          setResults(response.data)
          console.log(response);
        })
    else
      setResults([])
  }, [c]);
  return (
    <>
      <nav id="Navbar" className="z-50 h-[60px] flex items-center min-w-fit sticky">
        <div className=" container mx-auto flex items-center justify-betwee px-2">
          <button onClick={() => { Router.push("/"); }} className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            PingPong
          </button>
          <div className=" w-full flex justify-end">
            <ul className="flex items-center flex-row space-x-3 text-sm font-medium  ">
              <li>
                <button className="m-1">
                  <svg onClick={() => {
                    setSearchModal(!searchModal)
                    setTimeout(() => {
                      if (searchRef.current)
                        searchRef.current.focus();
                    }, 100);
                  }}
                    aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
              </li>
              <li>
                <button className="m-1">
                  <svg onClick={() => {
                    Router.push("/game")
                  }}
                    className="w-6 h-6" fill="#000000" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>ionicons-v5-g</title><path d="M483.13,245.38C461.92,149.49,430,98.31,382.65,84.33A107.13,107.13,0,0,0,352,80c-13.71,0-25.65,3.34-38.28,6.88C298.5,91.15,281.21,96,256,96s-42.51-4.84-57.76-9.11C185.6,83.34,173.67,80,160,80a115.74,115.74,0,0,0-31.73,4.32c-47.1,13.92-79,65.08-100.52,161C4.61,348.54,16,413.71,59.69,428.83a56.62,56.62,0,0,0,18.64,3.22c29.93,0,53.93-24.93,70.33-45.34,18.53-23.1,40.22-34.82,107.34-34.82,59.95,0,84.76,8.13,106.19,34.82,13.47,16.78,26.2,28.52,38.9,35.91,16.89,9.82,33.77,12,50.16,6.37,25.82-8.81,40.62-32.1,44-69.24C497.82,331.27,493.86,293.86,483.13,245.38ZM208,240H176v32a16,16,0,0,1-32,0V240H112a16,16,0,0,1,0-32h32V176a16,16,0,0,1,32,0v32h32a16,16,0,0,1,0,32Zm84,4a20,20,0,1,1,20-20A20,20,0,0,1,292,244Zm44,44a20,20,0,1,1,20-19.95A20,20,0,0,1,336,288Zm0-88a20,20,0,1,1,20-20A20,20,0,0,1,336,200Zm44,44a20,20,0,1,1,20-20A20,20,0,0,1,380,244Z"></path></g></svg>
                </button>
              </li>
              <li>
                <button className="m-1" onClick={() => { Router.push("/stream") }}>
                  <Cast />
                </button>
              </li>
              <li>
                <button className="m-1"
                  // href="#"
                  onClick={() => {
                    Router.push("/chat");
                  }}
                >
                  <Chat />
                </button>
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
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      props.gameSocket.emit("setUserStatus", { login42: profile.username, status: 0 });
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
                {results.map((e: any, i: number) =>
                  <div key={i} className="relative m-2" style={{ width: 80 }} onClick={() => {
                    setSearchModal(!searchModal);
                    setResults([]);
                    if (searchRef.current !== null)
                      searchRef.current.value = "";
                    Router.push(`/profile/` + e?.username)
                  }}>
                    <Avatar
                      alt="Nav Drop settings"
                      img={e?.avatar}
                      rounded={false}
                      size="lg"
                    // status="online"
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
        {inviteAlert &&
          <Alert
            className="z-50 w-auto h-[73px] fixed bottom-0 right-0 m-1 top-20"
            color="success"
            onDismiss={() => {
              setInviteinfo({ from: "", room: "" });
              setInviteAlert(false);
            }}
          >
            <span className="flex">
              <span className="font-medium font-bold m-2">
                {inviteinfo.from} invited you to a game
              </span>
              <span className="block text-sm text-gray-500">
                <Button onClick={() => {
                  Router.push("/game/" + inviteinfo.room);
                  setInviteinfo({ from: "", room: "" });
                  setInviteAlert(false);
                }} className="ml-2" color="success">Join</Button>
              </span>
            </span>
          </Alert>
        }
      </nav>
    </>
  );
};

export default Navbar;
