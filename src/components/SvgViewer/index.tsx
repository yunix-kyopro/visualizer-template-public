import type { FC } from 'react';

type SvgViewerProps = {
  svgString: string;
  score: number;
};

const SvgViewer: FC<SvgViewerProps> = ({ svgString, score }) => {
  return (
    <>
      <div>score={score}</div>
      <div
        dangerouslySetInnerHTML={{
          __html: svgString,
        }}
      />
    </>
  );
};

export default SvgViewer;
