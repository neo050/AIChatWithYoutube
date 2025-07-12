// ES-modules only (because package.json has "type":"module")
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import pg from "pg";
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();


// 1)  grab settings from env  -----------------------------
const REGION        = process.env.AWS_REGION      ?? "eu-north-1";
const SECRET_ID     = process.env.DB_SECRET_ID   ??"my/db" ;
 //const SSL_REQUIRED  = true;

// 2)  fetch secret once at startup  ----------------------
const smClient = new SecretsManagerClient({ region: REGION });

 async function fetchDbSecret(id) {
  const { SecretString } = await smClient.send(
    new GetSecretValueCommand({ SecretId: id })
  );
  return JSON.parse(SecretString);
}

// 3)  build a connection pool  ---------------------------
export const pool = await (async () => {
  const { host, port, username, password, dbname } = await fetchDbSecret(SECRET_ID);

  return new Pool({
    host,
    port,
    user:     username,
    password: password,
    database: dbname,
    ssl: { rejectUnauthorized: false } ,
    max: 10,               // # of idle connections
    idleTimeoutMillis: 10_000,
  });
})();

// optional helper
export const query = (text, params) => pool.query(text, params);
