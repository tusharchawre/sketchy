"use client"

import { Scale } from "@/components/Scale."
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
    const [scale, setScale] = useState<number>(1)
    const [activeTool, setActiveTool] = useState<Tool>("grab")

    useEffect(()=>{
        game?.setTool(activeTool)
    })

    useEffect(()=>{
        if(canvasRef.current){
            const g = new Game(
                canvasRef.current , 
                roomId, 
                socket , 
                room,
                (newScale) => setScale(newScale)
            )
            setGame(g)


            return () =>{
                g.destroy()
            }
        }

    }, [canvasRef])


    useEffect(()=>{
        setScale(game?.outputScale || 1)
    }, [game?.outputScale])


    


    return(
        <div className="w-full h-screen">

        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
        <Scale scale={scale} />
            <canvas ref={canvasRef} />

        </div>
    )
}