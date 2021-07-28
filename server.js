const process = require("process");
const express = require("express");
const app = express();


app.get("/", (req, res) => {
  res.send(`<h1>Kubernetes Expressjs</h2>
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
