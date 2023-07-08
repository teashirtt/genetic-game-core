const game_objects: GameObject[] = []

export class GameObject {
    has_init: boolean
    constructor() {
        game_objects.push(this)
        this.has_init = false
    }
    init(): void {

    }

    update(): void {

    }

    destroy(): void {
        for (let i = 0; i < game_objects.length; i++) {
            if (game_objects[i] === this) {
                game_objects.splice(i, 1)
                break
            }
        }
    }
}

const render = (): void => {
    for (let obj of game_objects) {
        if (!obj.has_init) {
            obj.has_init = true
            obj.init()
        } else {
            obj.update()
        }
    }
    requestAnimationFrame(render)
}

requestAnimationFrame(render)