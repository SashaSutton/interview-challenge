
import { cookies } from "next/headers";
import { z } from "zod";
import { TOKEN_COOKIE } from "../constants";
import { getUserIdFromToken } from "../auth";
import path from "path";
import { USER_DATA_DIR } from "./constants";
import { readFile, mkdir, writeFile } from "fs/promises";


export const AUDIO_SETTINGS_DATA = z.object({
  playbackSpeed: z.number().default(1),
  filter: z.object({
    type: z.enum(['highpass', 'lowpass']).default('lowpass'),
    frequency: z.number().default(1000)
  }).default({})
});

export type AudioSettingsData = z.infer<typeof AUDIO_SETTINGS_DATA>;


export const USER_DATA = z.object({
  firstPageLoad: z.string().nullable(),
  audioSettings: AUDIO_SETTINGS_DATA
});

export type UserData = z.infer<typeof USER_DATA>;

const DEFAULT_DATA: UserData = {
  firstPageLoad: null,
  audioSettings: {
    playbackSpeed: 1,
    filter: {
      type: 'lowpass',
      frequency: 1000
    }
  }
};

export const getUserId = async (): Promise<string> => {
  const cookieStore = await cookies(); // Add await here
  const token = cookieStore.get(TOKEN_COOKIE);
  if (!token) {
    throw new Error("No token found");
  }
  return getUserIdFromToken(token.value);
};

const getFilePath = (userId: string) => {
  return path.join(USER_DATA_DIR, `${userId}.json`);
};

export const getDataForCurrentUser = async () => {
  try {
    const userId = await getUserId();
    const filePath = getFilePath(userId);

    console.log('Attempting to read user data from:', filePath);

    try {
      const json = await readFile(filePath, "utf-8");
      console.log('Read user data:', json);
      const parsed = USER_DATA.parse(JSON.parse(json));
      return parsed;
    } catch (e) {
      if (e instanceof Error && "code" in e && e.code === "ENOENT") {
        console.log('No existing data found, using defaults');
        return DEFAULT_DATA;
      }
      console.error('Error reading user data:', e);
      return DEFAULT_DATA;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return DEFAULT_DATA;
  }
};

export const updateDataForCurrentUser = async (
    update: (current: UserData) => UserData | Promise<UserData>,
): Promise<UserData> => {
  try {
    const userId = await getUserId();
    const filePath = getFilePath(userId);
    const current = await getDataForCurrentUser();
    const updated = await update(current);

    console.log('Saving user data to:', filePath);
    console.log('Data to save:', JSON.stringify(updated, null, 2));

    await mkdir(USER_DATA_DIR, { recursive: true });
    await writeFile(filePath, JSON.stringify(updated, null, 2), "utf-8");

    console.log('Data saved successfully');
    return updated;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};