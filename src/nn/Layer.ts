import Neural, { INeural } from './Neural'

export interface ILayer {
  neurals: INeural[]
}

const ReLu = (e: number): number => {
  return Math.max(0, e)
}

const create = (input_count: number, neural_count: number): ILayer => {
  const neurals: INeural[] = []

  for (let i = 0; i < neural_count; i++) {
    neurals.push(Neural.create(input_count))
  }

  return {
    neurals
  }
}

const feed = (nnl: ILayer, inputs: number[]): number[] => {
  const outputs: number[] = []

  for (let neural of nnl.neurals) {
    const output: number = Neural.feed(neural, inputs)
    outputs.push(ReLu(output))
  }

  return outputs
}

const mutate = (nnl: ILayer, mutate_rate: number): void => {
  for (let neural of nnl.neurals) {
    Neural.mutate(neural, mutate_rate)
  }
}

export default {
  create,
  feed,
  mutate
}
