"use client"

import { Toolbar } from "@/components/Toolbar"
import { Game } from "@/render/Game"
import { useEffect, useRef, useState } from "react"

interface CanvasProps {
    roomId: string
    socket: WebSocket
    room: any
}

export type Tool = "rect" | "ellipse" | "grab" | "line" | "pencil" | "erase"

export const Canvas = ({roomId, socket , room}: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Game>()

    const [activeTool, setActiveTool] = useState<Tool>("grab")

    useEffect(()=>{
        game?.setTool(activeTool)
    })

    useEffect(()=>{
        if(canvasRef.current){
            const g = new Game(canvasRef.current , roomId, socket , room)
            setGame(g)

            return () =>{
                g.destroy()
            }
        }

    }, [canvasRef])


    return(
        <div className="w-full h-screen">

        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />

            <canvas ref={canvasRef} />

        </div>
    )
}