import { getShapes } from "./getShapes";

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

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private scale: number = 1
    private panX: number = 0
    private panY: number = 0
    socket: WebSocket


    constructor(canvas: HTMLCanvasElement , roomId: string, socket: WebSocket){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!
        this.existingShapes = []
        this.roomId = roomId
        this.socket = socket
        this.clicked = false
        this.canvas.width = document.body.clientWidth
        this.canvas.height = document.body.clientHeight
        this.init()
    }


    async init() {
        this.existingShapes = await getShapes(this.roomId)

    }
    


    destroy(){

    }
}
