import type { FC } from 'react';
import { useState, useCallback } from 'react';
import GIF from 'gif.js';
import { vis } from '../../../public/wasm/rust';
import type { VisualizerSettingInfo } from '../../types';

type SvgViewerProps = {
  visualizerSettingInfo: VisualizerSettingInfo;
};

const SvgViewer: FC<SvgViewerProps> = ({ visualizerSettingInfo }) => {
  const [animationButtonDescription, setAnimationButtonDescription] = useState(
    'Save as Aination GIF'
  );

  const [animationButtonDisabled, setAnimationButtonDisabled] = useState(false);

  /* eslint-disable */ // JavaScriptを書くことになるので、ESLintを無効化
  const onSavePng = useCallback(() => {
    const ret = vis(
      visualizerSettingInfo.input,
      visualizerSettingInfo.output,
      visualizerSettingInfo.turn
    );
    const svg = new DOMParser()
      .parseFromString(ret.svg, 'image/svg+xml')
      .getElementById('vis');
    if (svg === null) return;
    const canvas = document.createElement('canvas');
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.width.baseVal.value;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'vis.png';
      a.click();
    };
    image.src =
      'data:image/svg+xml;charset=utf-8;base64,' +
      btoa(unescape(encodeURIComponent(ret.svg)));
  }, [
    visualizerSettingInfo.input,
    visualizerSettingInfo.output,
    visualizerSettingInfo.turn,
  ]);

  const onSaveGif = useCallback(() => {
    setAnimationButtonDisabled(true);
    const input = visualizerSettingInfo.input;
    const output = visualizerSettingInfo.output;
    const maxTurn = visualizerSettingInfo.maxTurn;
    const step = 1;
    const delay = (step * 2000) / 60;
    const gif = new GIF({
      workers: 2,
      quality: 100,
      workerScript: 'node_modules/gif.js/dist/gif.worker.js',
    });
    gif.on('progress', function (p) {
      setAnimationButtonDescription(
        String(Math.round(50 + 50 * p)).padStart(3, ' ') + '% finished'
      );
      /*
      save_gif.value =
        String(Math.round(50 + 50 * p)).padStart(3, ' ') + '% finished';
        */
    });
    function add_frame(t) {
      /*
      save_gif.value =
        String(Math.round((50.0 * t) / max_turn)).padStart(3, ' ') +
        '% finished';
        */

      setAnimationButtonDescription(
        String(Math.round((50.0 * t) / maxTurn)).padStart(3, ' ') + '% finished'
      );
      const svgData = vis(input, output, t).svg;
      const svg = new DOMParser()
        .parseFromString(svgData, 'image/svg+xml')
        .getElementById('vis');
      if (svg === null) return;
      const canvas = document.createElement('canvas');
      canvas.width = svg.width.baseVal.value;
      canvas.height = svg.width.baseVal.value;
      const ctx = canvas.getContext('2d');
      if (ctx === null) return;
      const image = new Image();
      image.onload = function () {
        ctx.drawImage(image, 0, 0);
        if (t == maxTurn) {
          gif.addFrame(canvas, { delay: 3000 });
        } else {
          gif.addFrame(canvas, { delay: delay });
        }
        if (t < maxTurn) {
          add_frame(Math.min(t + step, maxTurn));
        } else {
          gif.on('finished', function (blob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'vis.gif';
            a.click();
            window.URL.revokeObjectURL(a.href);

            setAnimationButtonDescription('Save as Animation GIF');
            setAnimationButtonDisabled(false);
          });
          gif.render();
        }
      };
      image.src =
        'data:image/svg+xml;charset=utf-8;base64,' +
        btoa(unescape(encodeURIComponent(svgData)));
    }
    add_frame(0);
  }, [
    visualizerSettingInfo.input,
    visualizerSettingInfo.output,
    visualizerSettingInfo.maxTurn,
    setAnimationButtonDescription,
    setAnimationButtonDisabled,
  ]);
  /* eslint-enable */

  return (
    <>
      <div>
        <input
          type="button"
          id="save_png"
          value="Save as PNG"
          onClick={onSavePng}
        />
        <input
          type="button"
          id="save_gif"
          value={animationButtonDescription}
          onClick={onSaveGif}
          disabled={animationButtonDisabled}
        />
      </div>
    </>
  );
};

export default SvgViewer;
