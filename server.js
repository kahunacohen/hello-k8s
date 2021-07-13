const process = require("process");
const express = require("express");
const app = express();
const fs = require("fs");


app.get("/", (req, res) => {
  res.send(`<h1>Kubernetes Expressjs Example 0.3</h2>
  <h2>Non-Secret Configuration Example</h2>
  <p>This uses ConfigMaps as env vars.</p>
  <ul>
    <li>MY_NON_SECRET: "${process.env.MY_NON_SECRET}"</li>
    <li>MY_OTHER_NON_SECRET: "${process.env.MY_OTHER_NON_SECRET}"</li>
  </ul>
  <h2>Secret Config Example</h2>
  <p>This uses actual secrets that are stored at /etc/secrets. They are created using
  the kubectl command line program, BUT we don't create a manifest so they are not
  in source control. The deployment mounts a volume with the base64 encoded value at /etc/secrets/{key}.txt</p>
  <ul>
    <li>password: ${Buffer.from(fs.readFileSync("/etc/secrets/password.txt", {encoding: "utf-8"}), "base64")}</li>
  </ul>
  <h2>Cronjobs</h2>
  <p>You can set cronjobs which run in their own pod. Pods are not destroyed after the job completes. You can set 
  successfulJobsHistoryLimit etc. in the cronjob spec to determine how many pods are kept alive.</p>
  <p>To see cron logs follow the log of the pod: <code>kubectl logs -f {CRON-PODNAME}</code> </p>
  `);
});


app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
