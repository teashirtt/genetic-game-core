export interface INeural {
  bias: number
  weights: number[]
}

const random_arg = (min: number, max: number): number => {
  return min + (max - min) * Math.random()
}

const create = (weight_count: number): INeural => {
  const weights: number[] = []
  for (let i = 0; i < weight_count; i++) {
    weights.push(random_arg(-1, 1))
  }
  return {
    bias: random_arg(-1, 1),
    weights
  }
}

const feed = (neural: INeural, inputs: number[]): number => {
  const sum = inputs
    .map((value, index) => {
      return value * neural.weights[index]
    })
    .reduce((pre, cur) => pre + cur)
  return sum + neural.bias
}

const mutate = (neural: INeural, mutate_rate: number): void => {
  const is_bias_mutate: boolean = Math.random() >= 1 - mutate_rate
  if (is_bias_mutate) {
    neural.bias = random_arg(-1, 1)
  }

  for (let i = 0; i < neural.weights.length; i++) {
    const is_wight_mutate: boolean = Math.random() >= 1 - mutate_rate
    if (is_wight_mutate) {
      neural.weights[i] = random_arg(-1, 1)
    }
  }
}

export default {
  create,
  feed,
  mutate
}
