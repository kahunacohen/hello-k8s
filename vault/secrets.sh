vault login $1; 
sleep 10; 
vault secrets enable -path=secret kv-v2;
sleep 10
vault kv put secret/webapp/config username="static-user" password="static-password";