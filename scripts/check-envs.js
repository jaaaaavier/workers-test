/* eslint-disable no-console */

const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const path = require('path');
const envExample = require('dotenv').config({ path: path.join(__dirname, '..', '.env.local.example') }).parsed;
// En CI las variables llegan por el entorno; en local se leen de .env.local
const env =
  process.env.CI === 'true'
    ? process.env
    : require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') }).parsed;

const keysExample = Object.keys(envExample);
const keysEnv = Object.keys(env);

let error = false;
keysExample.forEach((envName) => {
  const index = keysEnv.indexOf(envName);
  if (index < 0 || !env[envName]) {
    error = true;
    console.error('Missing env variable: %s', envName);
  }
});

if (error) {
  process.exit(1);
}
