import JSZip from 'jszip';
import { gen } from '../../../public/wasm/rust';

export const useDownloadInput = (): {
  downloadInput: (
    seed: number,
    downloadCases: number,
    setButtonText: (content: string) => void
  ) => void;
} => {
  const downloadInput = (
    seed: number,
    downloadCases: number,
    setButtonText: (content: string) => void
  ): void => {
    const zip = new JSZip();
    for (let i = 0; i < downloadCases; i++) {
      const inputString = gen(seed + i);
      zip.file((seed + i).toString().padStart(4, '0') + '.txt', inputString);
    }
    /* eslint-disable*/
    zip
      .generateAsync({ type: 'blob' }, (e) => {
        setButtonText(
          String(Math.round(e.percent)).padStart(3, ' ') + '% finished'
        );
      })
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'in.zip';
        a.click();
        window.URL.revokeObjectURL(a.href);
        setButtonText('Download');
      });
    /* eslint-enable */
  };

  return { downloadInput };
};
