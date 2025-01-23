import { Circle, Eraser, HandIcon, Pencil, RectangleHorizontalIcon, Slash } from "lucide-react"
import { ToolButton } from "./ToolButton"
import { Tool } from "@/canvas/Canvas"
import { ReactNode } from "react"

interface ToolbarProps{
    activeTool : Tool
    setActiveTool: (s: Tool) => void
}

export const Toolbar = ({activeTool, setActiveTool}: ToolbarProps) => {

    const Tool : {tool: Tool, icon: ReactNode , shortcut: number}[] = [{
        tool: "grab",
        icon: <HandIcon />,
        shortcut: 1
    },
    {
        tool: "rect",
        icon: <RectangleHorizontalIcon />,
        shortcut: 2
    },
    {
        tool: "ellipse",
        icon: <Circle />,
        shortcut: 3
    },
    {
        tool: "line",
        icon: <Slash />,
        shortcut: 4
    },
    {
        tool: "pencil",
        icon: <Pencil />,
        shortcut: 1
    },
    {
        tool: "erase",
        icon: <Eraser />,
        shortcut: 6
    }

]



    return(
        <div className="w-fit py-2 px-4 fixed top-5 left-[50%] -translate-x-[50%]">
            <div className="flex bg-[#232329] px-4 py-1 rounded-md gap-3">
            {Tool.map((tool)=>(
                <ToolButton active={activeTool === tool.tool} onClick={()=>setActiveTool(tool.tool)} icon={tool.icon} shortcut={tool.shortcut} tool={tool.tool} />
            ))}
            </div>
            
        </div>
    )
}