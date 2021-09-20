const process = require("process");
const express = require("express");
const app = express();

// Import my fns that interact with postgres.
const {
  createFilmsTable,
  populateFilmsTable,
  getFilms,
  getPool,
} = require("./film");

// Import my fns that interact with Hashicorp Vault.
const Vault = require("./vault");

app.set("json spaces", 2);

// Create db pool.
let pool = getPool();

// Migrate films table.
createFilmsTable(pool);

// config endpoint showing configs, secrets etc.
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

// films endpoint showing interaction with postgres.
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
