import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const yuss = (props: any) => {
    const [socket, setsocket] = useState(null);
    const [text, setText] = useState('mazal')
    let initsock = 0;

    useEffect(() => {
        if (socket) {
            console.log("init on")
            initsock = 2;
            setTimeout(() => {
                socket.emit("initUser", props.profile);
            }, 150);
        }
    }, [socket]);
    useEffect(() => {
        if (!initsock) {
            setsocket(io("/chat"));
            initsock = 1;
        }
    }, [socket]);
    return (<>
        <p>{text}</p>
        {/* <Button onClick={test}>test</Button> */}
    </>
    )
}
export default yuss;