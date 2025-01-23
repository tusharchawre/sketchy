import { Game } from "@/render/Game";
import { getShapes } from "@/render/getShapes";
import { useEffect, useRef, useState } from "react";

interface CanvasProps {
    roomId: string
    socket: WebSocket
}

export function  Canvas ({roomId, socket}: CanvasProps){

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>()

    useEffect(()=>{
        if(canvasRef.current){
            const g = new Game(canvasRef.current , roomId , socket)

            setGame(g)

            return () => {
                g.destroy()
            }
        }
    },[])




    return(
        <div className="w-full h-screen overflow-hidden bg-red-700">
            <canvas  ref={canvasRef}></canvas>

        </div>
    )
}