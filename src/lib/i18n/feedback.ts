import { getDictionary } from "./dictionaries";
import { getLocale } from "./locale";

// The visitor's language for messages returned from Server Actions and route
// handlers (errors, rate limits, "sign in first"). Reads the same locale as the
// pages do, so a message never switches language relative to the UI around it.
export async function getFeedback() {
  return getDictionary(await getLocale()).feedback;
}
