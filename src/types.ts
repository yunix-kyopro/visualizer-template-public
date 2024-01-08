export type VisualizerSettingInfo = {
  input: string;
  output: string;
  seed: number;
  turn: number;
  maxTurn: number;
};

export type VisualizerResult = {
  svgString: string;
  err: string;
  score: number;
};
