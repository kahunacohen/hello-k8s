const process = require("process");
const express = require("express");
const app = express();
const fs = require("fs");
const axios = require('axios').default;


function Vault() {
  const baseUrl = `${process.env.VAULT_ADDR}/v1`;
  const getHealth = async () => {
    try {
      return await axios.get(`${baseUrl}/sys/health?standbyok=true`);
    } catch(e) {
      return null;
    }
  }
  return {
    getHealth
  }
}

const vault = Vault(); 
app.get("/", async (req, res) => {
  // const jwt = fs.readFileSync(process.env.JWT_PATH, {encoding: "utf-8"});
  // console.log(`token: ${jwt}`);
  // const health = await getVaultHealth();
  // console.log(`health: ${health}`);
  // if (health !== 200) {
  //   res.send(`<p>Health is: ${health}`);
  //   return;
  // }

  // axios.post(`${process.env.VAULT_ADDR}/v1/auth/kubernetes/login`, {
  //   jwt,
  //   role: "webapp"
  // }).then(x => console.log(x))
  //   .catch(function (error) {
  //     console.log("HERE IS THE ERROR:")
  //     console.log(error.toJSON());
  // });
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
