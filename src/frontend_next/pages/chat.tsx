import React, { useState, useEffect } from "react";

const Chat = () => {
  // State to store the messages
  const [messages, setMessages] = useState([]);

  // State to store the input field value
  const [input, setInput] = useState("");

  // Function to add a message to the message store
  const addMessage = (message) => {
    setMessages([...messages, message]);
  };

  // Function to handle user input
  const handleInput = (event) => {
    setInput(event.target.value);
  };

  // Function to send a message when the user submits the form
  const handleSubmit = (event) => {
    event.preventDefault();
    addMessage({
      text: input,
      date: new Date(),
    });
    setInput("");
  };

  // Render the chat window and input field
  return (
    // <h1>chat</h1>
    <div className="flex w-full h-[calc(100vh-90px)]">
      <div className="basis-1/4 border-r border-red-900 p-1 ">
        <MyInfo />
        <div>user info</div>
      </div>

      <ChatSection />
    </div>
    // <div>
    //   <ul>
    //     {messages.map((message, index) => (
    //       <li key={index}>{message.text}</li>
    //     ))}
    //   </ul>
    //   <form onSubmit={handleSubmit}>
    //     <input value={input} onChange={handleInput} />
    //     <button type="submit">Send</button>
    //   </form>
    // </div>
  );
};

export default Chat;

const MyInfo = () => {
  return (
    <div className="bg-white rounded p-3 ">
      <div className="flex items-center space-x-4 mb-4">
        <img
          className="w-10 h-10 rounded-full"
          src="/avatar-test.jpeg"
          alt=""
        />
        <div className="font-medium dark:text-white">
          <div>Mouras</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Joined in August 2014
          </div>
        </div>
      </div>
      <div className="flex ">
        <svg
          className="w-6 h-6 red-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          ></path>
        </svg>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

const HeaderOfChat = () => {
  return (
    <div className="border-b border-gray-600 pb-4 flex items-center mb-6 justify-between mx-3">
      <div className="flex items-center ">
        <div className="relative mr-2">
          <img className="w-10 h-10 rounded-full" src="/with.webp" alt="user" />
          <span className="bottom-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
        </div>
        <span className="text-sm text-slate-300">Conversation with &nbsp;</span>
        <span className="text-xl text-base"> Aberdai</span>
      </div>
      <button className="flex green-900 cursor-pointer">
        <svg
          className="green-900 mr-2"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.4695 11.2929C15.0789 10.9024 14.4458 10.9024 14.0553 11.2929C13.6647 11.6834 13.6647 12.3166 14.0553 12.7071C14.4458 13.0976 15.0789 13.0976 15.4695 12.7071C15.86 12.3166 15.86 11.6834 15.4695 11.2929Z"
            fill="currentColor"
          />
          <path
            d="M16.1766 9.17156C16.5671 8.78103 17.2003 8.78103 17.5908 9.17156C17.9813 9.56208 17.9813 10.1952 17.5908 10.5858C17.2003 10.9763 16.5671 10.9763 16.1766 10.5858C15.7861 10.1952 15.7861 9.56208 16.1766 9.17156Z"
            fill="currentColor"
          />
          <path
            d="M19.7121 11.2929C19.3216 10.9024 18.6885 10.9024 18.2979 11.2929C17.9074 11.6834 17.9074 12.3166 18.2979 12.7071C18.6885 13.0976 19.3216 13.0976 19.7121 12.7071C20.1027 12.3166 20.1027 11.6834 19.7121 11.2929Z"
            fill="currentColor"
          />
          <path
            d="M16.1766 13.4142C16.5671 13.0237 17.2003 13.0237 17.5908 13.4142C17.9813 13.8048 17.9813 14.4379 17.5908 14.8284C17.2003 15.219 16.5671 15.219 16.1766 14.8284C15.7861 14.4379 15.7861 13.8048 16.1766 13.4142Z"
            fill="currentColor"
          />
          <path d="M6 13H4V11H6V9H8V11H10V13H8V15H6V13Z" fill="currentColor" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 5C3.13401 5 0 8.13401 0 12C0 15.866 3.13401 19 7 19H17C20.866 19 24 15.866 24 12C24 8.13401 20.866 5 17 5H7ZM17 7H7C4.23858 7 2 9.23858 2 12C2 14.7614 4.23858 17 7 17H17C19.7614 17 22 14.7614 22 12C22 9.23858 19.7614 7 17 7Z"
            fill="currentColor"
          />
        </svg>
        <span> Invite To Game</span>
      </button>
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

const Msg = () => {
  return (
    <div className="block mb-4 flex">
      <div>
        <img className="w-10 h-10 rounded-full" src="/with.webp" alt="user" />
      </div>
      <div>
        <div>username time</div>
        <div>msg</div>
      </div>
    </div>
  );
};

const MyMsg = () => {
  return <div className="block  mb-4 self-end">hi</div>;
};

const BodyOfChat = () => {
  return (
    <div className="h-full ">
      <div className="bg-gray-100 p-4 w-full h-5/6 rounded flex flex-col align-start">
        <Msg />
        <MyMsg />
      </div>
      <SendMsg />
    </div>
  );
};

const ChatSection = () => {
  return (
    <div className="basis-3/4 p-1 h-full">
      <div className=" w-full h-[95%] bg-white rounded p-2">
        <HeaderOfChat />
        <BodyOfChat />
      </div>
    </div>
  );
};
