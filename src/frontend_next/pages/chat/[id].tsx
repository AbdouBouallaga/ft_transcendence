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
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Games from "../../components/icons/Games";
import Menu from "../../components/icons/Menu";
import { useRouter } from "next/router";
import Add from "../../components/icons/Add";
import axios from "axios";
import ListFriends from "../../components/chat/ListFriends";
import ChatSection from "../../components/chat/ChatSection";

const Chat = ({ profile }:any) => {
  
  return (
    <>
      <div className="flex w-full h-[calc(100vh-60px)]  ">
        <ListFriends />
        <ChatSection profile={profile} />
      </div>
    </>
  );
};

export default Chat;
