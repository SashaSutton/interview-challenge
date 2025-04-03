export const readFile = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      resolve(ev.target?.result as ArrayBuffer);
    };
    reader.onerror = () => {
      reader.abort();
      reject(reader.error);
    };
    reader.readAsArrayBuffer(file);
  });
