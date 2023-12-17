import type { FC } from 'react';
import { useState } from 'react';
import type { VisualizerSettingInfo } from '../../types';

type FileUploaderProps = {
  setVisualizerSettingInfo: React.Dispatch<
    React.SetStateAction<VisualizerSettingInfo>
  >;
};

const FileUploader: FC<FileUploaderProps> = ({ setVisualizerSettingInfo }) => {
  const [selectDisabled, setSelectDisabled] = useState(true);

  const [files, setFiles] = useState<File[]>([]);

  const onFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.sort((a, b) => a.name.localeCompare(b.name));
    if (uploadedFiles.length > 0) {
      setSelectDisabled(false);
      setFiles(uploadedFiles);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fileName = e.target.value;
    const file = files.find((file) => file.name === e.target.value);
    if (file !== undefined) {
      const match = fileName.match(/(?:.*_)?(\d+)\..*/);
      if (match !== null) {
        const seed = parseInt(match[1], 10);
        const fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onload = () => {
          setVisualizerSettingInfo((prev) => ({
            ...prev,
            seed,
            output: fileReader.result as string,
          }));
        };
      }
    }
  };

  /* eslint-disable react/no-unknown-property */
  return (
    <>
      <p>
        <label>
          File:
          <select disabled={selectDisabled} onChange={onSelectFile}>
            {files.map((file, index) => (
              <option key={`option-${index}`}>{file.name}</option>
            ))}
          </select>
        </label>
        <input
          type="file"
          onChange={onFolderUpload}
          directory="" // エディタでエラーが出るが気にしない
          webkitdirectory=""
        />
      </p>
    </>
  );
  /* eslint-enable react/no-unknown-property */
};

export default FileUploader;
