const process = require("process");
const express = require("express");
const app = express();
const fs = require("fs");
const axios = require('axios').default;
const { Pool, Client } = require('pg')


function Vault() {
  const axiosInst = axios.create({baseURL: `${process.env.VAULT_ADDR}/v1`});
  const getHealth = async () => {
    const resp = await axisoInst.get(`/sys/health?standbyok=true`);
    return resp.data;
  }
  
  const getAPIToken = () => {
    return fs.readFileSync(process.env.JWT_PATH, {encoding: "utf-8"});
  }
  const getVaultAuth = async (role) => {
    const resp = await axiosInst.post("/auth/kubernetes/login", {jwt: getAPIToken(), role});
    return resp.data;
  }
  const getSecrets = async (vaultToken) => {
    const resp = await axiosInst("/secret/data/webapp/config", {headers: {"X-Vault-Token": vaultToken}});
    return resp.data.data.data;
  }
  return {
    getAPIToken,
    getHealth,
    getSecrets,
    getVaultAuth
  }
}

const vault = Vault();
app.get("/", async (req, res) => {
  const pool = new Pool({
    user: 'web',
    host: 'mypostgres',
    database: 'web',
    password: 'akhd5',
    port: 5432,
  });
  pool.query('SELECT NOW()', (err, res) => {
    console.log(res.rows)
    pool.end()
})
  const vaultAuth = await vault.getVaultAuth("webapp");
  const secrets = await vault.getSecrets(vaultAuth.auth.client_token);
  res.send(
  `<h1>Kubernetes Expressjs Test settings</h2>
  <h2>Non-Secret Configuration Example</h2>
  <p>This uses ConfigMaps as env vars.</p>
  <ul>
    <li>MY_NON_SECRET: "${process.env.MY_NON_SECRET}"</li>
    <li>MY_OTHER_NON_SECRET: "${process.env.MY_OTHER_NON_SECRET}"</li>
  </ul>
  <h2>Secrets</h2>
  <ul>
    <li>username: ${secrets.username}</li>
    <li>password: ${secrets.password}</li>
  </ul>
  `);
});


app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
