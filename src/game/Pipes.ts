import { GameObject } from "./GameObject"

export interface PipeEntity {
    x: number,
    width: number,
    top_height: number,
    bottom_height: number,
}

export class Pipes extends GameObject {
    pipes_info: PipeEntity[]
    ctx: CanvasRenderingContext2D
    total: number
    speed: number
    gap: number
    constructor(ctx: CanvasRenderingContext2D, speed: number, gap: number) {
        super()
        this.ctx = ctx
        this.pipes_info = []
        this.total = 0
        this.speed = speed
        this.gap = gap
    }

    random_int(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    generate(): void {
        const screen_height: number = window.innerHeight
        // 暂定两端间为 1/4 的高度
        const top_height: number = this.random_int(0.1 * (screen_height), 0.65 * (screen_height))
        const new_pipe: PipeEntity = { x: window.innerWidth, width: 40, top_height: top_height, bottom_height: 0.75 * screen_height - top_height }
        this.pipes_info.push(new_pipe)
        this.total += 1
    }

    render() {
        for (let pipe of this.pipes_info) {
            this.ctx.beginPath()
            this.ctx.fillStyle = 'green'
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.top_height)
            this.ctx.fillRect(pipe.x, window.innerHeight - pipe.bottom_height, pipe.width, pipe.bottom_height)
            this.ctx.fill()
            this.ctx.closePath()
        }
    }

    init(): void {
        this.generate()
        this.render()
    }

    update(): void {
        for (let pipe of this.pipes_info) {
            pipe.x -= this.speed
        }
        // 根据最后 pipe 判断新 pipe 的生成时机
        if (window.innerWidth - this.pipes_info[this.pipes_info.length - 1].x > this.gap) {
            this.generate()
        }

        while (this.pipes_info[0].x + 40 < 0) {
            this.pipes_info.shift()
        }

        this.render()
    }
}