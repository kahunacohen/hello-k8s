const process = require("process");
const express = require("express");
const app = express();
const fs = require("fs");

function getSecret(key) {
  // No error handling or caching.
  try {
    return Buffer.from(fs.readFileSync(`/etc/secrets/${key}`, {encoding: "utf-8"}), "base64");
  } catch(e) {
    console.error(`Problem getting sercret file: /etc/secrets/${key}`);
    return null;
  }
}

app.get("/", (req, res) => {
  res.send(`<h1>Kubernetes Expressjs Example</h2>
  <h2>Non-Secret Configuration Example</h2>
  <p>This uses ConfigMaps as env vars.</p>
  <ul>
    <li>MY_NON_SECRET: "${process.env.MY_NON_SECRET}"</li>
    <li>MY_OTHER_NON_SECRET: "${process.env.MY_OTHER_NON_SECRET}"</li>
  </ul>
  <h2>Secret Config Example</h2>
  <p>This uses actual secrets that are stored at <code>/etc/secrets</code> in the pod. They are created using
  the kubectl command line program, BUT we don't create a manifest so they are not
  in source control. The deployment mounts a volume with the base64 encoded value at <code>/etc/secrets/</code>. The app
  reads the files. Each file corresponds to each secret. See below.</p>
  <p>For demo purposes, the directory <code>./secrets</code> is in VCS and there's a <code>create_secret</code> task in the Makefile. 
  The secret files on the host are base64 encoded, and thus they need to be decoded in the app. This is not to secure the data,
  as they could be easily decoded. Rather they are base64 encoded to allow binary data.</p>
  <p>In real life you'd NOT commit the secrets directory on the host or it would defeat the purpose of secrets! I've done this
  to document how to create secrets. See the <code>Makefile</code>.</p>
  <ul>
    <li>username: ${getSecret("username")}</li>
    <li>password: ${getSecret("password")}</li>
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
