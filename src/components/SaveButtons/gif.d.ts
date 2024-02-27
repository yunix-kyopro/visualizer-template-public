declare module 'gif.js' {
  export default class GIF {
    constructor(options: {
      workers: number;
      quality: number;
      workerScript: string;
    });
    on(event: string, callback: (p: number) => void): void;
    addFrame(canvas: HTMLCanvasElement, options: { delay: number }): void;
    render(): void;
  }
}
