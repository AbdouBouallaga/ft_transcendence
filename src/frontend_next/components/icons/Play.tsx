import React, { useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import Router, { useRouter } from 'next/router';
import { GeneralContext } from "../../pages/_app";



const Play = (username: any) => {
  const context:any = useContext(GeneralContext);
  const gameSocket:any = context.Socket;
  const myprofile:any = context.Profile;

  return (
    <button
      onClick={() => {
        let room = uuidv4();
        setTimeout(() => {
          if (gameSocket) {
            gameSocket.emit('sendInviteToPlay', { 'from': myprofile.username, 'to': username.username, 'room': room })
            Router.push("/game/" + room)
          }
        }, 250);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="rgba(48, 113, 36, 1)"
      >
        <path d="M20.937 7.53C19.227 4.119 15.803 2 12 2 6.486 2 2 6.486 2 12s4.486 10 10 10c3.803 0 7.227-2.119 8.937-5.53a1 1 0 0 0-.397-1.316L15.017 12l5.522-3.153c.461-.264.636-.842.398-1.317zm-8.433 3.602a.999.999 0 0 0 0 1.736l6.173 3.525A7.949 7.949 0 0 1 12 20c-4.411 0-8-3.589-8-8s3.589-8 8-8a7.95 7.95 0 0 1 6.677 3.606l-6.173 3.526z"></path>
        <circle cx="11.5" cy="7.5" r="1.5"></circle>
      </svg>
    </button>
  );
};

export default Play;
