"use client";
import { ChangeEventHandler, FC, useCallback } from "react";

type FilePickerProps = {
  onFileSelect: (file: File) => void;
};

export const FilePicker: FC<FilePickerProps> = ({ onFileSelect }) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  return <input type="file" onChange={onChange} />;
};
