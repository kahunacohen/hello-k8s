vault login $1; 
sleep 10; 
vault secrets enable -path=secret kv-v2;
sleep 10
vault kv put secret/webapp/config username="static-user" password="static-password";
sleep 10
# Not secure, but to confirm it worked:
vault kv get secret/webapp/config
sleep 10
vault auth enable kubernetes

vault write auth/kubernetes/config \
        token_reviewer_jwt="$2" \
        kubernetes_host="$4" \
        kubernetes_ca_cert="$3"

sleep 10
vault policy write myapp-kv-ro - <<EOF
path "secret/data/webapp/*" {
    capabilities = ["read", "list"]
}
EOF

sleep 10
vault write auth/kubernetes/role/webapp \
        bound_service_account_names=vault-auth \
        bound_service_account_namespaces=default \
        policies=myapp-kv-ro \
        ttl=24h
