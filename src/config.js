import dotenv from 'dotenv';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env'
      : `.env.${process.env.NODE_ENV}`,
});
