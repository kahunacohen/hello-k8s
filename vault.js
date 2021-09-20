const fs = require("fs");
const axios = require("axios").default;
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

module.exports = Vault;