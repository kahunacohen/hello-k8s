const express = require("express");
const app = express();


app.get("/", (req, res) => {
  res.send(`<h1>Kubernetes Expressjs Example</h2>
  <h2>Non-Secret Configuration Example</h2>
  <p>This uses ConfigMaps as env vars.</p>
  <ul>
    <li>my_non_secret: "${process.env.my_non_secret}"</li>
    <li>my_other_non_secret: "${process.env.my_other_non_secret}"</li>
  </ul>
  `);
});


app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
