"use server";

import path from "path";
import fs from "fs";
import { FILES_DIR } from "./constants";

export const storeFile = async (
  key: string,
  stream: ReadableStream<Uint8Array>,
) => {
  const filePath = path.join(FILES_DIR, key);

  // Ensure the directory exists
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  // Ensure file does not already exist
  if (fs.existsSync(filePath)) {
    throw new Error(`File ${key} already exists`);
  }

  // Convert ReadableStream to Node.js stream
  const nodeStream = stream.pipeTo(
    new WritableStream({
      write(chunk) {
        return new Promise((resolve, reject) => {
          const buffer = Buffer.from(chunk);
          fs.appendFile(filePath, buffer, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    }),
  );

  await nodeStream;
};

export const readFile = async (
  key: string,
): Promise<ReadableStream<Uint8Array>> => {
  const filePath = path.join(FILES_DIR, key);

  // Ensure the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${key} does not exist`);
  }

  // Create a ReadableStream from the file
  const fileStream = fs.createReadStream(filePath);

  return new ReadableStream<Uint8Array>({
    start(controller) {
      fileStream.on("data", (chunk) => {
        if (typeof chunk === "string") {
          throw new Error("Chunk is a string");
        }
        controller.enqueue(new Uint8Array(chunk));
      });

      fileStream.on("end", () => {
        controller.close();
      });

      fileStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      fileStream.destroy();
    },
  });
};

export const deleteFile = async (key: string) => {
  const filePath = path.join(FILES_DIR, key);

  // Ensure the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${key} does not exist`);
  }

  // Delete the file
  await fs.promises.unlink(filePath);
};
