import type { FC } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { type VisualizerSettingInfo } from '../../types';

type TurnSliderProps = {
  visualizerSettingInfo: VisualizerSettingInfo;
  setVisualizerSettingInfo: React.Dispatch<
    React.SetStateAction<VisualizerSettingInfo>
  >;
};

const TurnSlider: FC<TurnSliderProps> = ({
  visualizerSettingInfo,
  setVisualizerSettingInfo,
}) => {
  const [sliderContent, setSliderContent] = useState('▶');
  const [sliderSpeed, setSliderSpeed] = useState(30);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const onChangeSliderSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderSpeed(Number(e.target.value));
  };

  const onChangeTurn = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      turn: Number(e.target.value),
    }));
  };

  const stopSlider = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setSliderContent('▶');
  }, [setIntervalId, intervalId, setSliderContent]);

  const incrementTurn = useCallback(() => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      turn: prev.turn + 1,
    }));
  }, [setVisualizerSettingInfo]);

  const startSlider = useCallback(() => {
    setSliderContent('■');
    const tickMilliSec =
      (1000 * 300) / visualizerSettingInfo.maxTurn / sliderSpeed; // 1000 / sliderSpeed;
    const id = setInterval(incrementTurn, tickMilliSec);
    setIntervalId(id);
  }, [
    setIntervalId,
    setSliderContent,
    visualizerSettingInfo.maxTurn,
    sliderSpeed,
    incrementTurn,
  ]);

  // turnがmaxturnになったらタイマーを止める
  useEffect(() => {
    if (visualizerSettingInfo.turn === visualizerSettingInfo.maxTurn) {
      stopSlider();
    }
  }, [stopSlider, visualizerSettingInfo.turn, visualizerSettingInfo.maxTurn]);

  const onClickSliderButton = () => {
    if (sliderContent === '▶') {
      startSlider();
    } else {
      stopSlider();
    }
  };

  return (
    <>
      <p style={{ display: 'flex' }}>
        <input
          type="button"
          value={sliderContent}
          onClick={onClickSliderButton}
          style={{
            position: 'relative',
            top: '5px',
            width: '32px',
            height: '32px',
          }}
        />
        <label style={{ marginRight: '10px', marginLeft: '10px' }}>
          slow
          <input
            type="range"
            min="1"
            max="60"
            value={sliderSpeed}
            onChange={onChangeSliderSpeed}
            style={{ width: '200px' }}
          />
          fast
        </label>
        <label>
          turn:
          <input
            type="number"
            value={visualizerSettingInfo.turn}
            min="0"
            max={visualizerSettingInfo.maxTurn}
            onChange={onChangeTurn}
            style={{ width: '70px', textAlign: 'right' }}
          />{' '}
        </label>
      </p>
      <p>
        <input
          type="range"
          min="0"
          max={visualizerSettingInfo.maxTurn}
          value={visualizerSettingInfo.turn}
          onChange={onChangeTurn}
          style={{ width: '780px' }}
        />
      </p>
    </>
  );
};

export default TurnSlider;
