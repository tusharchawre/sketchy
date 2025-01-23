"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const token =  localStorage.getItem("token")

    useEffect(() => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            ws.send(data)
        }
        
    }, [roomId, token])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    console.log(socket)

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} /> 
        </div>
    );
}
