/**
 * The configuration file.
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  IAHV_CLIENT_ID: process.env.IAHV_CLIENT_ID,
  HB_CLIENT_ID: process.env.HB_CLIENT_ID,
  AOL_CLIENT_ID: process.env.AOL_CLIENT_ID,
  IS_LOCAL_DEVELOPMENT: process.env.IS_LOCAL_DEVELOPMENT === 'true',
};
