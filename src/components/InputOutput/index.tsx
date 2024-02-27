import type { FC } from 'react';
import { useState } from 'react';
import { type VisualizerSettingInfo } from '../../types';
import { useDownloadInput } from './hooks.ts';

type InputOutputProps = {
  visualizerSettingInfo: VisualizerSettingInfo;
  setVisualizerSettingInfo: React.Dispatch<
    React.SetStateAction<VisualizerSettingInfo>
  >;
};

const InputOutput: FC<InputOutputProps> = ({
  visualizerSettingInfo,
  setVisualizerSettingInfo,
}) => {
  const [downloadCases, setDownloadCases] = useState(100);
  const [buttonText, setButtonText] = useState('Download');
  const { downloadInput } = useDownloadInput();

  const onChangeSeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      seed: Number(e.target.value),
    }));
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      input: e.target.value,
    }));
  };
  const onChangeOutput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      output: e.target.value,
    }));
  };

  return (
    <>
      <div>
        <label>
          Seed:
          <br />
          <input
            type="number"
            value={visualizerSettingInfo.seed}
            min={'0'}
            max={'18446744073709551615'}
            onChange={onChangeSeed}
          />
        </label>
        <label>
          #cases:
          <input
            type="number"
            value={downloadCases}
            onChange={(e) => {
              setDownloadCases(Number(e.target.value));
            }}
            min="1"
            max="10000"
          />
        </label>
        <input
          type="button"
          value={buttonText}
          disabled={buttonText !== 'Download'}
          onClick={() => {
            downloadInput(
              visualizerSettingInfo.seed,
              downloadCases,
              setButtonText
            );
          }}
        />
      </div>
      <div>
        <label>
          Input: <br />
          <textarea
            rows={4}
            value={visualizerSettingInfo.input}
            onChange={onChangeInput}
            style={{ width: '650px' }}
          ></textarea>
        </label>
      </div>
      <div>
        <label>
          Output: <br />
          <textarea
            rows={4}
            value={visualizerSettingInfo.output}
            onChange={onChangeOutput}
            style={{ width: '650px' }}
          ></textarea>
        </label>
      </div>
    </>
  );
};

export default InputOutput;
