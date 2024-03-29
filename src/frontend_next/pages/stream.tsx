import React, { useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { Button, Carousel } from 'flowbite-react';
import { GeneralContext } from './_app';
import axios from 'axios';

const Index = (props: any) => {
    const [rooms, setRooms] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            axios
                .get("/api/users/me/fullprofile")
                .then((response: any) => {
                })
                .catch((e: any) => {
                    Router.replace("/");
                });
        };
        fetchData();
    }, []);
    let init = false;
    let interval: any;
    const fetschRooms = () => {
        props.gameSocket.emit("getRooms");
    }
    useEffect(() => {
        props.gameSocket.on("Won", () => {
            fetschRooms();
        });
        props.gameSocket.on("rooms", (data: any) => {

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
                                                Router.push("/game/" + e['id'])
                                            }
                                        }
                                            className='aero login w-auto rounded-lg  min-h-[300px] shadow-lg m-2 p-2 grid place-items-center ' >
                                            <h1 className='text-2xl font-bold text-center'>Rooms</h1>
                                            <p className='text-center'>id {e['id']}</p>
                                            <p className='text-center'>{e['players']['a']} VS {e['players']['b']}</p>
                                            {/* </div> */}
                                        </div>
                                    </>
                                )
                            })
                        }
                    </Carousel>
                    :
                    <div className='container mx-auto px-4 grid place-items-center min-w-fit'  >
                        <div className='aero login w-auto rounded-lg  min-h-[200px] shadow-lg m-20 p-2 grid place-items-center ' >
                            <h1 className='text-2xl font-bold text-center'>No games</h1>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default Index;