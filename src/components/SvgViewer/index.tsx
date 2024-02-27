import type { FC } from 'react';

type SvgViewerProps = {
  svgString: string;
  err: string;
  score: number;
};

const SvgViewer: FC<SvgViewerProps> = ({ svgString, err, score }) => {
  return (
    <>
      <div>score={score} {err && <span style={{color: "red"}}>({err})</span>}</div>
      <div
        dangerouslySetInnerHTML={{
          __html: svgString,
        }}
      />
    </>
  );
};

export default SvgViewer;
