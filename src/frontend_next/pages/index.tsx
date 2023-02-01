import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import Navbar from '../components/Navbar';
import { Button } from 'flowbite-react';

const testcontent = () => {
  return (
    <div className="flex">
      <div className="m-1 flex-1 container">
        <h1>Content here</h1>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p>Welcome to the home page</p>
      </div>

    </div>
  )
}

const index = (props: any) => {
  const [rooms, setRooms] = useState([]);
  let roomsTemp:any = [];
  let init = false;

  const fetschRooms = () => {
    props.gameSocket.emit("getRooms");
  }
  useEffect(() => {
    if (!init) {
      init = true;
      props.gameSocket.on("rooms", (data) => {
        console.log(data);
        for (let r in data.rooms) {
          console.log(data.rooms[r]);
          props.gameSocket.emit("getRoominfo", data.rooms[r]);
        }
      });
      props.gameSocket.on("roomInfo", (date: any) => {
        roomsTemp.push(data);
        console.log(roomsTemp);
        setRooms(roomsTemp);
      });
    }
  }, []);
return (
  <>
    <div className='container min-h-screen mx-auto px-4 grid place-items-center min-w-fit'  >
      <div className='aero login w-auto rounded-lg  min-h-[300px] shadow-lg m-2 p-2 grid place-items-center ' >
        <h1 className='text-2xl font-bold text-center'>TEST</h1>
        {/* {
          rooms.map((e, i) => {
            return (
              <>
                <p className='text-center' key={i}>id {e.id}</p>
                <p className='text-center' key={i}>map {e.map}</p>
                <p className='text-center' key={i}>rounds {e.rounds}</p>
                <p className='text-center' key={i}>players num {e.numOfPlayers}</p>
              </>
            )
          })
        } */}
        <Button onClick={fetschRooms} className='m-2 btn btn-primary'>test</Button>
      </div>
    </div>
  </>
)
}

export default index