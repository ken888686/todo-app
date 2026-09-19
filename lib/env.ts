import "dotenv/config";
import { getServerEnv } from "./env-validation";

export const serverEnv = getServerEnv(process.env);
