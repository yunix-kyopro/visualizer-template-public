import type { FC } from 'react';

import { type VisualizerSettingInfo } from '../../types';
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
      </div>
      <div>
        <label>
          Input: <br />
          <textarea
            className={styles.textArea}
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
            className={styles.textArea}
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
