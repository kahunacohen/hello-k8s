vault login $1;
sleep 10;
vault secrets enable -path=secret kv-v2;
sleep 10
vault kv put secret/webapp/config username="static-user" password="static-password";
sleep 10
vault auth enable kubernetes
sleep 10
vault write auth/kubernetes/config \
      token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
      kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" \
      kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt \
      disable_iss_validation=true
sleep 10
vault policy write webapp - <<EOF
path "secret/data/webapp/config" {
  capabilities = ["read"]
}
EOF
sleep 10

vault write auth/kubernetes/role/webapp \
      bound_service_account_names=vault \
      bound_service_account_namespaces=default \
      policies=webapp \
      ttl=24h
sleep 10
