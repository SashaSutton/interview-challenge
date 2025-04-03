import { v4 as uuidv4 } from "uuid";

/*
 * This module exposes some functions to handle authentication.
 *
 * The decisions made here don't reflect good security practices,
 * but are good enough for the purpose of this challenge.
 */

/**
 * Assume the user is a new user,
 * and generate a new token that uniquely identifies them.
 */
export const generateTokenForNewUser = () => {
  // Note, UUIDs don't have enough entropy to be used as a secure token.
  // In a real application, you would use a secure random generator.
  // But for this challenge, it's good enough.
  return uuidv4();
};

export const getUserIdFromToken = (token: string) => {
  // In a real application, you would decode the token and verify it.
  // But for this challenge, we assume the token is valid
  // and is actually the same as the user id
  return token;
};
