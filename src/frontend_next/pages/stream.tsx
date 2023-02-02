import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import { Button, Carousel } from 'flowbite-react';

const index = (props: any) => {
    const [rooms, setRooms] = useState([]);
    let init = false;
    let interval: any;

    const te = () => {
        props.gameSocket.emit("connectchat", props.profile);
      }

    const fetschRooms = () => {
        props.gameSocket.emit("getRooms");
    }
    useEffect(() => {
        props.gameSocket.on("Won", () => {
            fetschRooms();
        });
        props.gameSocket.on("rooms", (data: any) => {
            console.log(data);
            setRooms(data.rooms);
        });
        fetschRooms();
        interval = setInterval(() => {
            fetschRooms();
        }, 2000);
        init = true;
    }, []);

    useEffect(() => {
        return () => {
            console.log("unmount");
            props.gameSocket.off("rooms");
            clearInterval(interval);
            document.removeEventListener("keydown", (e) => { });
        }
    }, []);
    return (
        <>
            <div className="">
                {rooms.length > 0 ?
                    <Carousel>
                        {
                            rooms.map((e, i) => {
                                return (
                                    <>
                                        {/* <div className='container min-h-screen mx-auto px-4 grid place-items-center min-w-fit'  > */}
                                        <div onClick={
                                            () => {
                                                Router.push("/game/" + e.id)
                                            }
                                        }
                                            className='aero login w-auto rounded-lg  min-h-[300px] shadow-lg m-2 p-2 grid place-items-center ' >
                                            <h1 className='text-2xl font-bold text-center'>Rooms</h1>
                                            <p className='text-center'>id {e.id}</p>
                                            <p className='text-center'>{e.players.a} VS {e.players.b}</p>
                                            {/* </div> */}
                                        </div>
                                    </>
                                )
                            })
                        }
                    </Carousel>
                    :
                    <div className='container min-h-screen mx-auto px-4 grid place-items-center min-w-fit'  >
                        <div className='aero login w-auto rounded-lg  min-h-[300px] shadow-lg m-2 p-2 grid place-items-center ' >
                            <h1 className='text-2xl font-bold text-center'>No games</h1>
                        </div>
                    </div>
                }
            </div>
            <Button onClick={te} className='m-2 btn btn-primary'>test</Button>
        </>
    )
}

export default index