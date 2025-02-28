import type { FC } from 'react';
import { useState } from 'react';
import { type VisualizerSettingInfo } from '../../types';
import { useDownloadInput } from './hooks.ts';

import styles from './index.module.css';

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

  const onChangeProblemId = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      problemId: e.target.value,
    }));
  };

  return (
    <>
      <div>
        <label>
          Seed:
          <input
            type="number"
            value={visualizerSettingInfo.seed}
            min={'0'}
            max={'18446744073709551615'}
            onChange={onChangeSeed}
          />
        </label>
        <label
          className={styles.leftMargin} //eslint-disable-line
        >
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
              visualizerSettingInfo.problemId,
              downloadCases,
              setButtonText,
            );
          }}
        />

        <label
          className={styles.leftMargin} //eslint-disable-line
        >
          問題番号:
          <select
            value={visualizerSettingInfo.problemId}
            onChange={(e) => {
              onChangeProblemId(e);
            }}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Input: <br />
          <textarea
            className={styles.textArea} //eslint-disable-line
            rows={4}
            value={visualizerSettingInfo.input}
            onChange={onChangeInput}
          ></textarea>
        </label>
      </div>
      <div>
        <label>
          Output: <br />
          <textarea
            className={styles.textArea} //eslint-disable-line
            rows={4}
            value={visualizerSettingInfo.output}
            onChange={onChangeOutput}
          ></textarea>
        </label>
      </div>
    </>
  );
};

export default InputOutput;
