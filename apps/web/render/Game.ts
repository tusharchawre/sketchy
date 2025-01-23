import { getRoom } from "@/actions/getRoom"
import { Tool } from "@/canvas/Canvas";
type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export class Game {

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private roomId: string
    private socket: WebSocket
    private existingShape: Shape[]
    private clicked: boolean
    private room: any
    private activeTool: Tool = "grab"
    private startX: number = 0
    private startY: number = 0
    private panX: number = 0
    private panY: number = 0
    private scale: number = 1

    constructor(canvas: HTMLCanvasElement , roomId: string , socket: WebSocket, room: any){
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.roomId = roomId
        this.socket = socket
        this.clicked = false
        this.existingShape = []
        this.canvas.width = document.body.clientWidth
        this.canvas.height = document.body.clientHeight
        this.room = room
        this.init()
        this.initHandler()
        this.initMouseHandler()
        


    }

       async init()  {
        const room = await getRoom(this.room.roomName)
        room.shape.map((shape: any)=>{
            const shapes = JSON.parse(shape.data)
            this.existingShape.push(shapes.shape)
        })
        console.log(this.existingShape)
        this.clearCanvas()
    }

    initHandler(){
        this.socket.onmessage = (event) =>{
            const data = JSON.parse(event.data)

            if(data.type === "draw"){
                const parsedShape = JSON.parse(data.data)
                this.existingShape.push(parsedShape.shape)
                this.clearCanvas()
            }

        }
    }

    initMouseHandler(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
    }

    setTool(tool : Tool){
        this.activeTool = tool
    }

    clearCanvas() {
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
        this.ctx.clearRect(

            -this.panX / this.scale, 
            -this.panY / this.scale, 

            this.canvas.width / this.scale, 
            this.canvas.height/ this.scale);
        this.ctx.fillStyle = "rgba(18, 18, 18)"
        this.ctx.fillRect( 0 , 0, this.canvas.width, this.canvas.height);


        this.existingShape.map((shape)=>{
            if(shape.type == "rect"){
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
        })

       
    
    }

    mouseDownHandler = (e : MouseEvent) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
    }

    mouseMoveHandler = (e: MouseEvent)=>{
        if(this.clicked){
            const width = e.clientX - this.startX
            const height = e.clientY - this.startY
            this.clearCanvas()
            this.ctx.strokeStyle = "rgba(255, 255, 255)";
            this.ctx.strokeRect(this.startX, this.startY , width, height)


        }
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked= false

        const width = e.clientX - this.startX
        const height = e.clientY - this.startY

        let shape : Shape = {
            type: "rect",
            x: this.startX,
            y: this.startY,
            width,
            height
        }

        if(!shape){
            return ;
        }

        this.existingShape.push(shape)

        this.socket.send(JSON.stringify({
            type: "draw",
            data: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))



      

    }


    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
    }




}