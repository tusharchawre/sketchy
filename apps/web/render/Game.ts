import { getRoom } from "@/actions/getRoom"
import { Tool } from "@/canvas/Canvas";
type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "ellipse";
    centerX: number,
    centerY: number,
    radX: number,
    radY: number
} | {
    type: "line";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
} | {
    type: "pencil"
    points : {x: number, y:number}[]

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
            else if(data.type === "erase"){
                const parsedShape = JSON.parse(data.data)
                this.existingShape = this.existingShape.filter(
                    (shape) => JSON.stringify(shape) !== JSON.stringify(parsedShape.shape)
                );
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
        this.ctx.strokeStyle = "rgba(255, 255, 255)"


        this.existingShape.map((shape: Shape)=>{
            if(shape.type == "rect"){
                this.drawRect(shape.x, shape.y, shape.width, shape.height);
            }
            else if (shape.type === "ellipse"){
                this.drawEllipse(shape.centerX , shape.centerY, shape.radX, shape.radY)
            }
            else if (shape.type === "line"){
                this.drawLine(shape.fromX, shape.fromY, shape.toX, shape.toY)
            }
            else if (shape.type === "pencil"){
                this.drawPencil(shape.points)
            }
        })

       
    
    }

    mouseDownHandler = (e : MouseEvent) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY

        if(this.activeTool === "pencil"){
            this.existingShape.push({
                type: "pencil",
                points: [{x: this.startX, y: this.startY}]
            })
        }
        else if (this.activeTool === "erase") {
            this.erase(this.startX, this.startY);
        }
    }

    mouseMoveHandler = (e: MouseEvent)=>{
        if(this.clicked){
            const width = e.clientX - this.startX
            const height = e.clientY - this.startY
            this.clearCanvas()
            this.ctx.strokeStyle = "rgba(255, 255, 255)";

            const activeTool = this.activeTool

            if(activeTool === "rect"){
                this.drawRect(
                    this.startX,
                    this.startY,
                    width,
                    height
                )
            } else if(activeTool === "ellipse"){
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                const radX = Math.abs(width / 2);
                const radY = Math.abs(height / 2);
                this.drawEllipse(
                    centerX,
                    centerY,
                    radX,
                    radY
                )
            } else if(activeTool === "line"){
                this.drawLine(this.startX,this.startY,e.clientX,e.clientY)
            } else if(activeTool === "pencil"){
                const currentShape = this.existingShape[this.existingShape.length - 1]
                if(currentShape?.type === "pencil" ){
                    currentShape.points.push({x: e.clientX , y: e.clientY})
                    this.drawPencil(currentShape.points)
                }
            } else if (activeTool === "erase"){
                const x = e.clientX
                const y = e.clientY
                this.erase(x, y)
            }


        }
    }


    // Collision Detection => Chat GPT

    isPointInShape(x: number, y: number, shape: Shape): boolean {
        if (shape.type === "rect") {
            return (
                x >= shape.x &&
                x <= shape.x + shape.width &&
                y >= shape.y &&
                y <= shape.y + shape.height
            );
        } else if (shape.type === "ellipse") {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            return (
                (dx * dx) / (shape.radX * shape.radX) +
                (dy * dy) / (shape.radY * shape.radY) <= 1
            );
        } else if (shape.type === "line") {
            const length = Math.hypot(
                shape.toX - shape.fromX,
                shape.toY - shape.fromY
            );
            const distance =
                Math.abs(
                    (shape.toY - shape.fromY) * x -
                    (shape.toX - shape.fromX) * y +
                    shape.toX * shape.fromY -
                    shape.toY * shape.fromX
                ) / length;
            return distance < 5; 
        } else if (shape.type === "pencil") {
            return shape.points.some(
                (point) => Math.hypot(point.x - x, point.y - y) < 5 
            );
        }
        return false;
    }
    




    drawRect(x:number , y:number , width: number, height: number){
        // If we draw right to left, width is -ve and so postion of mouse + (-ve width) gives top left corner
        const posX = width < 0 ? x + width : x;
        const posY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);
    
        const radius = Math.min(Math.abs(Math.max(normalizedWidth, normalizedHeight) / 20), normalizedWidth / 2, normalizedHeight / 2);
    

        // RoundRect : https://stackoverflow.com/a/3368118
        this.ctx.beginPath();
        this.ctx.moveTo(posX + radius, posY);
        this.ctx.lineTo(posX + normalizedWidth - radius, posY);
        this.ctx.quadraticCurveTo(posX + normalizedWidth, posY, posX + normalizedWidth, posY + radius);
        this.ctx.lineTo(posX + normalizedWidth, posY + normalizedHeight - radius);
        this.ctx.quadraticCurveTo(posX + normalizedWidth, posY + normalizedHeight, posX + normalizedWidth - radius, posY + normalizedHeight);
        this.ctx.lineTo(posX + radius, posY + normalizedHeight);
        this.ctx.quadraticCurveTo(posX, posY + normalizedHeight, posX, posY + normalizedHeight - radius);
        this.ctx.lineTo(posX, posY + radius);
        this.ctx.quadraticCurveTo(posX, posY, posX + radius, posY);
        this.ctx.closePath();
        this.ctx.stroke();
        // this.ctx.strokeRect(x , y, width, height)
    }

    drawEllipse(x: number, y:number, width: number , height: number){
        this.ctx.beginPath()
        this.ctx.ellipse(x, y, width, height, 0 , 0  , 2* Math.PI)
        this.ctx.stroke();

    }

    drawLine(fromX:number, fromY:number , toX:number, toY:number ){
        this.ctx.beginPath()
        this.ctx.moveTo(fromX, fromY)
        this.ctx.lineTo(toX, toY)
        this.ctx.stroke()
    }

    drawPencil(points: {x:number, y:number}[]){
        this.ctx.beginPath()
        if(points[0] === undefined) return null;
        this.ctx.moveTo(points[0].x , points[0].y)
        points.forEach(point => this.ctx.lineTo(point.x, point.y))
        this.ctx.stroke()
    }

    erase(x: number , y:number){

        const shapeIndex = this.existingShape.findIndex((shape) =>
            this.isPointInShape(x, y, shape)
        );
    
        if (shapeIndex !== -1) {
            const erasedShape = this.existingShape[shapeIndex]
            this.existingShape.splice(shapeIndex, 1);
            this.clearCanvas(); 
            
            this.socket.send(JSON.stringify({
                type: "erase",
                data: JSON.stringify({
                    shape: erasedShape
                }),
                roomId : this.roomId 
            }))
            
        }

    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked= false

        const width = e.clientX - this.startX
        const height = e.clientY - this.startY

        let shape : Shape | null = null
        if(this.activeTool === "rect"){
            shape  = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height
            } 
        } else if(this.activeTool === "ellipse"){

            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;
            const radX = Math.abs(width / 2);
            const radY = Math.abs(height / 2);

            shape = {
                type: "ellipse",
                centerX,
                centerY,
                radX,
                radY
            }
        } else if (this.activeTool === "line"){
            shape = {
                type: "line",
                fromX: this.startX,
                fromY: this.startY,
                toX: e.clientX,
                toY: e.clientY
            }
        } else if (this.activeTool === "pencil"){
            const currentShape = this.existingShape[this.existingShape.length - 1]
            if(currentShape?.type === "pencil"){
                shape={
                    type: "pencil",
                    points: currentShape.points
                }
            }
            
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