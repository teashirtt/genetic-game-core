import Layer, { ILayer } from "./Layer"

export interface INetwork {
    layers: ILayer[]
}

const creat = (layer_architecture: number[]): INetwork => {
    const layers: ILayer[] = []

    for (let i = 0; i < layer_architecture.length - 1; i++) {
        const layer: ILayer = Layer.create(layer_architecture[i], layer_architecture[i + 1])
        layers.push(layer)
    }

    return {
        layers
    }
}

const feed = (nn: INetwork, inputs: number[]): number[] => {
    let output = Layer.feed(nn.layers[0], inputs)

    for (let i = 1; i < nn.layers.length; i++) {
        output = Layer.feed(nn.layers[i], output)
    }

    return output
}

const mutate = (nn: INetwork, mutate_rate: number): void => {
    for (let neural of nn.layers) {
        Layer.mutate(neural, mutate_rate)
    }
}

const save = (nn: INetwork): void => {
    localStorage.setItem('model', JSON.stringify(nn.layers))
}

const load = (nn: INetwork): void => {
    const model = localStorage.getItem('model')
    if (model) {
        nn.layers = JSON.parse(model)
    }
}

export default {
    creat,
    feed,
    mutate,
    save,
    load
}