import dotenv from 'dotenv';

dotenv.config();

interface Config {
  DATABASE_URL: string | undefined;
  IAHV_CLIENT_ID: string | undefined;
  HB_CLIENT_ID: string | undefined;
  AOL_CLIENT_ID: string | undefined;
}

export const CONFIG = (serverless: any): Config => ({
  DATABASE_URL: process.env.DATABASE_URL,
  IAHV_CLIENT_ID: process.env.IAHV_CLIENT_ID,
  HB_CLIENT_ID: process.env.HB_CLIENT_ID,
  AOL_CLIENT_ID: process.env.AOL_CLIENT_ID,
});
