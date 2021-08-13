const process = require("process");
const express = require("express");
const app = express();
const fs = require("fs");
const axios = require('axios').default;


function Vault() {
  const baseUrl = `${process.env.VAULT_ADDR}/v1`;

  const getHealth = async () => {
    const resp = await axios.get(`${baseUrl}/sys/health?standbyok=true`);
    return resp.data;
  }
  
  const getAPIToken = () => {
    return fs.readFileSync(process.env.JWT_PATH, {encoding: "utf-8"});
  }

  const getVaultToken = async () => {
    const resp = await axios.post(`${baseUrl}/auth/kubernetes/login`, {jwt: getAPIToken(), role: "webapp"});
    return resp.data;
    //curl --request POST --data '{"jwt": "eyJh", "role": "webapp"}' http://vault:8200/v1/auth/kubernetes/login
  }
  return {
    getAPIToken,
    getHealth,
    getVaultToken
  }

}

const vault = Vault();
app.get("/", async (req, res) => {
  const health = await vault.getHealth();
  console.log("health:");
  console.log(health);
  console.log("vault token:");
  console.log(await vault.getVaultToken());
  res.send(`<h1>Kubernetes Expressjs Test settings</h2>
  <h2>Non-Secret Configuration Example</h2>
  <p>This uses ConfigMaps as env vars.</p>
  <ul>
    <li>MY_NON_SECRET: "${process.env.MY_NON_SECRET}"</li>
    <li>MY_OTHER_NON_SECRET: "${process.env.MY_OTHER_NON_SECRET}"</li>
  </ul>
  `);
});


app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
