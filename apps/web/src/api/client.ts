import { config } from "@/config";
import { getAccessToken } from "@/auth/token";
import { DirectusClient } from "./directus";

export const directusPublic = new DirectusClient(config.directusUrl);
export const directusAuthed = new DirectusClient(config.directusUrl, getAccessToken);

