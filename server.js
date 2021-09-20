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
const path = require("path");
const mustache = require("mustache");

app.set("json spaces", 2);
app.engine("html", function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err);
    var rendered = mustache.render(content.toString(), options);
    return callback(null, rendered);
  });
});

// Setting mustachejs as view engine
app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));

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
    password: secrets.password
  });
  // res.render('sample.html', { data: 'Sample Data' });
});
app.get("/films", async (req, res, next) => {
  let films = await getFilms(pool);
  if (films.length === 0) {
    await populateFilmsTable(pool);
    films = await getFilms();
  }
  res.json(films);

  // let trs = "";
  // for (const film of films) {
  //   trs += `<tr><td>${film.title}</td><td>${film.kind}</td></tr>`;
  // }

  // const html = `
  // <h2>Films</h2>
  // <table border=1>
  //   <thead>
  //     <th>Title</th>
  //     <th>Kind</th>
  //   </thead>
  //   <tbody>
  //     ${trs}
  //   </tbody>
  // </table>
  // `;
  // res.send(html);
  // next();

  // const vaultAuth = await vault.getVaultAuth("webapp");
  // const secrets = await vault.getSecrets(vaultAuth.auth.client_token);
  // res.send(
  // `<h1>Kubernetes Expressjs Test settings</h2>
  // <h2>Non-Secret Configuration Example</h2>
  // <p>This uses ConfigMaps as env vars.</p>
  // <ul>
  //   <li>MY_NON_SECRET: "${process.env.MY_NON_SECRET}"</li>
  //   <li>MY_OTHER_NON_SECRET: "${process.env.MY_OTHER_NON_SECRET}"</li>
  // </ul>
  // <h2>Secrets</h2>
  // <ul>
  //   <li>username: ${secrets.username}</li>
  //   <li>password: ${secrets.password}</li>
  // </ul>
  // `);
});
app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
