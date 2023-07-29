import { GameObject } from "./GameObject"
import { Bird, BirdEntity } from '../game/Bird'
import { Pipes, PipeEntity } from '../game/Pipes'
import Network from "../nn/Network"

export interface GameArgs {
    bird_count: number
    mutate_rate: number,
    pipe_speed: number,
    pipe_gap: number,
    bird_nn_structure: number[]
}

interface GameInfo {
    epoch: number
    last_mutate_epoch: number
    last_best_epoch: number
    alive_count: number
    last_best_bird: Bird | null
    last_best_score: number
}

export class GameMap extends GameObject {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    pipes: Pipes
    birds: Bird[]
    gameargs: GameArgs
    gameinfo: GameInfo
    constructor(canvas: HTMLCanvasElement, gameargs: GameArgs) {
        super()
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!

        this.gameargs = gameargs
        this.gameinfo = { epoch: 0, last_mutate_epoch: 0, last_best_epoch: 0, alive_count: 100, last_best_bird: null, last_best_score: 0 }

        this.pipes = new Pipes(this.ctx, this.gameargs.pipe_speed, this.gameargs.pipe_gap)
        this.birds = []
    }

    setMap() {
        this.ctx = this.canvas.getContext('2d')!
        this.ctx.fillStyle = '#242424'
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    }

    // 碰撞检测 由于飞行方向的单调性 只判断矩形的左&下&上侧
    is_valid(i: number): boolean {
        // FIXME 由于间距是固定的 所以其实在 pipes[] 长度大于8时 只需检测下标为2的柱子即可 但之后可能会调参所以这里全做判断
        const bird_x: number = this.birds[i].bird_info.x
        const bird_y: number = this.birds[i].bird_info.y

        if (bird_y - 10 <= 0 || bird_y + 10 >= window.innerHeight) {
            return false
        }

        for (let pipe of this.pipes.pipes_info) {
            if (bird_x - 10 >= pipe.x + 40) {
                continue
            }
            // 三种情况 1.和矩形左边距离小于半径 2.和左下角&左上角距离小于半径 3.和矩形下边距离小于半径
            // 这里只用判断 next pipe 即可
            if ((bird_x - pipe.x) * (bird_x - pipe.x) + (bird_y - pipe.top_height) * (bird_y - pipe.top_height) <= 100) {
                if (this.birds[i].bird_info.alive)
                return false
            } else if ((bird_x - pipe.x) * (bird_x - pipe.x) + (bird_y - pipe.bottom_height) * (bird_y - pipe.bottom_height) <= 100) {
                if (this.birds[i].bird_info.alive)
                return false
            } else if (bird_y <= pipe.top_height && pipe.x - bird_x <= 10 || bird_y >= window.innerHeight - pipe.bottom_height && pipe.x - bird_x <= 10) {
                if (this.birds[i].bird_info.alive)
                return false
            } else if (bird_x >= pipe.x && bird_x <= pipe.x + 40 && (bird_y - 10 <= pipe.top_height || bird_y + 10 >= window.innerHeight - pipe.bottom_height)) {
                if (this.birds[i].bird_info.alive)
                return false
            }
            return true
        }
        return true
    }

    // 传感器 作为网络输入层 此处可根据需求定义输入维度
    sensor(i: number): number[] {
        // PlanA: only next pipe [ distance(bird, pipe.x) , distance(y,top_height/center gap) , bird:y_speed, bird:g]
        // center gap 和 top_height 的数据价值是等价的因为 gap 是定值
        const bird: BirdEntity = this.birds[i].bird_info

        // 计算 next pipe 
        let index: number = 0;
        for (; index < this.pipes.pipes_info.length; index++) {
            if (bird.x - 10 >= this.pipes.pipes_info[index].x + 40) {
                continue
            }
            break
        }

        const next_pipe: PipeEntity = this.pipes.pipes_info[index]
        return [next_pipe.x - bird.x, bird.y - next_pipe.top_height, bird.y_speed, bird.g]

        // PlanB more pipe info
    }

    reset_game(): void {
        this.pipes.destroy()
        for (let bird of this.birds) {
            bird.destroy()
        }
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        this.setMap()
        this.pipes = new Pipes(this.ctx, this.gameargs.pipe_speed, this.gameargs.pipe_gap)
        this.birds = []
        for (let i = 0; i < this.gameargs.bird_count; i++) {
            // 这里设置突变率与 epoch 的关系
            this.birds.push(new Bird(this.ctx, this.gameargs.mutate_rate, this.gameargs.bird_nn_structure))
        }
        this.gameinfo.epoch += 1
    }

    show_epoch(): void {
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = '16px Arial'
        this.ctx.fillText(`epoach : ${this.gameinfo.epoch}`, 10, 20)
        this.ctx.fillText(`mutate_rate : ${this.gameargs.mutate_rate.toFixed(4)}`, 10, 45)
        this.ctx.fillText(`best_score:${this.gameinfo.last_best_score}`, 10, 70)
        this.ctx.fillText(`last_best_epoch:${this.gameinfo.last_best_epoch}`, 10, 95)
        this.ctx.fillText(`alive_count:${this.gameinfo.alive_count}`, 10, 120)
    }

    init(): void {
        this.setMap()
        for (let i = 0; i < this.gameargs.bird_count; i++) {
            this.birds.push(new Bird(this.ctx, this.gameargs.mutate_rate, this.gameargs.bird_nn_structure))
        }
    }

    render(): void {
        for (let i = 0; i < this.birds.length; i++) {
            if (!this.is_valid(i)) {
                this.birds[i].bird_info.alive = false
            } else {
                this.birds[i].nn_control(this.sensor(i))
            }
        }

        let best_bird: Bird | undefined = undefined
        this.gameinfo.alive_count = 0
        for (let i = 0; i < this.birds.length; i++) {
            if (this.birds[i].bird_info.alive) {
                this.gameinfo.alive_count += 1
                if (!best_bird) {
                    best_bird = this.birds[i]
                }
            }
        }
        if (!best_bird) {
            if (this.gameinfo.last_best_bird && this.pipes.total > this.gameinfo.last_best_score) {
                // 更新最好模型
                Network.save(this.gameinfo.last_best_bird?.nn)
                this.gameinfo.last_best_score = this.pipes.total

                this.gameargs.mutate_rate = this.pipes.total - this.gameinfo.last_best_score > 5 ? this.gameargs.mutate_rate * 0.2 : this.gameargs.mutate_rate * 0.7
                this.gameinfo.last_mutate_epoch = this.gameinfo.epoch
                this.gameinfo.last_best_epoch = this.gameinfo.epoch
            } else if (this.gameinfo.epoch - this.gameinfo.last_mutate_epoch > 3) {
                // 回调突变率避免陷入局部最小值
                this.gameargs.mutate_rate = Math.min(this.gameargs.mutate_rate * 1.1, 0.2)
                this.gameinfo.last_mutate_epoch = this.gameinfo.epoch
            }
            this.reset_game()
            return
        }

        this.gameinfo.last_best_bird = best_bird
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        this.setMap()
        this.show_epoch()
    }

    update(): void {
        this.render()
    }
}
