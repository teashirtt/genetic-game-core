import { GameObject } from "./GameObject"
import Network, { INetwork } from "../nn/Network"

export interface BirdEntity {
    x: number,
    y: number,
    y_speed: number,
    g: number,
    alive: boolean,
    mutate_rate: number
}

export class Bird extends GameObject {
    bird_info: BirdEntity
    ctx: CanvasRenderingContext2D
    nn: INetwork
    constructor(ctx: CanvasRenderingContext2D, mutate_rate: number, nn_structure: number[]) {
        super()
        this.ctx = ctx
        this.bird_info = { x: 600, y: window.innerHeight / 2, y_speed: 0, g: 0, alive: true, mutate_rate: mutate_rate }
        this.nn = Network.creat(nn_structure)
    }

    draw(): void {
        this.ctx.beginPath()
        this.ctx.arc(this.bird_info.x, this.bird_info.y, 10, 0, 2 * Math.PI)
        if (this.bird_info.alive) {
            this.ctx.fillStyle = 'blue'
        }
        this.ctx.fill()
        this.ctx.closePath()
    }

    init(): void {
        this.draw()
        Network.load(this.nn)
        Network.mutate(this.nn, this.bird_info.mutate_rate)
    }

    jump(): void {
        this.bird_info.y_speed = -5.5
        this.bird_info.g = 0
    }

    nn_control(sensor_info: number[]): void {
        const output: number = Network.feed(this.nn, sensor_info)[0]
        if (output > 15) {
            this.jump()
        }
    }

    update(): void {
        if (this.bird_info.alive) {
            this.bird_info.g += 0.007
            if (Math.abs(this.bird_info.y_speed + this.bird_info.g) < 100) {
                this.bird_info.y_speed += this.bird_info.g
            }
            this.bird_info.y += this.bird_info.y_speed
            this.draw()
        }
    }
}