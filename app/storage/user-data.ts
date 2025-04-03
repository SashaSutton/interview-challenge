import { cookies } from "next/headers";
import { z } from "zod";
import { TOKEN_COOKIE } from "../constants";
import { getUserIdFromToken } from "../auth";
import path from "path";
import { USER_DATA_DIR } from "./constants";
import { readFile, mkdir, writeFile } from "fs/promises";

/**
 * This object defines the type for the data we store for each user.
 *
 * We use `zod` so that we can validate the data we get from the file system,
 * and avoid causing type-errors.
 */
export const USER_DATA = z.object({
  /**
   * Track the date that the user first loaded the app.
   *
   * This is just used as an example for how we store data
   */
  firstPageLoad: z.string().nullable(),
});

export type UserData = z.infer<typeof USER_DATA>;

const DEFAULT_DATA: UserData = {
  firstPageLoad: null,
};

export const getUserId = async () => {
  const cookieStore = await cookies();
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
  const userId = await getUserId();
  const filePath = getFilePath(userId);
  try {
    const json = await readFile(filePath, "utf-8");
    const parsed = USER_DATA.parse(JSON.parse(json));
    return parsed;
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "ENOENT") {
      return DEFAULT_DATA;
    }
    console.error(e);
    return DEFAULT_DATA;
  }
};

export const updateDataForCurrentUser = async (
  update: (current: UserData) => UserData | Promise<UserData>,
): Promise<UserData> => {
  const current = await getDataForCurrentUser();
  const userId = await getUserId();
  const filePath = getFilePath(userId);
  const updated = await update(current);
  await mkdir(USER_DATA_DIR, { recursive: true });
  await writeFile(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
};
