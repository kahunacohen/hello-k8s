const process = require("process");
const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios").default;
const {
  createFilmsTable,
  populateFilmsTable,
  getFilms,
  getPool,
} = require("./film");

app.set("json spaces", 2);

function Vault() {
  const axiosInst = axios.create({ baseURL: `${process.env.VAULT_ADDR}/v1` });
  const getHealth = async () => {
    const resp = await axiosInst.get(`/sys/health?standbyok=true`);
    return resp.data;
  };

  const getAPIToken = () => {
    return fs.readFileSync(process.env.JWT_PATH, { encoding: "utf-8" });
  };
  const getVaultAuth = async (role) => {
    const resp = await axiosInst.post("/auth/kubernetes/login", {
      jwt: getAPIToken(),
      role,
    });
    return resp.data;
  };
  const getSecrets = async (vaultToken) => {
    const resp = await axiosInst("/secret/data/webapp/config", {
      headers: { "X-Vault-Token": vaultToken },
    });
    return resp.data.data.data;
  };
  return {
    getAPIToken,
    getHealth,
    getSecrets,
    getVaultAuth,
  };
}

let pool = getPool();
createFilmsTable(pool);

app.get("/config", async (req, res) => {
  const vault = Vault();
  const vaultAuth = await vault.getVaultAuth("webapp");
  const secrets = await vault.getSecrets(vaultAuth.auth.client_token);
  res.json({
    MY_NON_SECRET: process.env.MY_NON_SECRET,
    MY_OTHER_NON_SECRET: process.env.MY_OTHER_NON_SECRET,
    username: secrets.username,
    password: secrets.password,
  });
});
app.get("/films", async (req, res, next) => {
  let films = await getFilms(pool);
  if (films.length === 0) {
    await populateFilmsTable(pool);
    films = await getFilms();
  }
  res.json(films);
});
app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
