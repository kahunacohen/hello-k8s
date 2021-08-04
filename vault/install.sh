#!/usr/bin/env bash


# Install and configure vault in a minikube cluster on MacOS. A minikube cluster must be running.

# Delete pods, blocking until they are all terminated.

kubectl delete all --all
while :
  do
    pds=$(kubectl get pods -ojson | jq '.items|length')
    echo "Waiting for pods to terminate"
    if [ "$pds" -eq "0" ]; then
      break
    fi
    sleep .5
  done

helm uninstall consul
helm uninstall vault

if ! helm &> /dev/null; then
  echo Installing helm
fi
echo helm installed.
echo "Adding hashicorp helm repo"
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update
if ! helm history consul &> /dev/null; then
  echo Installing consul 
  helm install consul hashicorp/consul --values helm-consul-values.yaml
fi
echo consul installed
# Go into consul pod and delete db under /consul/data* 

if ! helm history vault &> /dev/null; then
  echo installing vault
  helm install vault hashicorp/vault --values helm-vault-values.yaml
fi
echo vault installed

echo Waiting for consul and vault pods to start...
while :
  do
    if kubectl get pods -ojson | jq -e '[.items[] | .status.phase] | length == 6 and all(.=="Running")' > /dev/null; then
      echo all pods are running.
      break
    fi
    sleep 1
  done

kubectl port-forward --address=127.0.0.1 vault-0 8200:8200 &
PORT_FWD_PID=$!
echo port forwarding vault in background. Process id: $PORT_FWD_PID
sleep 10

echo Resetting consul data.
kubectl get pods | grep 'consul-' | awk  '{print $1}'
pds=$(kubectl get pods | grep 'consul-' | awk  '{print $1}')
for i in $pds; do  
  kubectl exec "$i" -- rm -rf '/consul/data/raft'
done;
sleep 20
echo initializing vault server and getting keys
kubectl exec vault-0 -- vault operator init -key-shares=5 -key-threshold=5 -format=json > cluster-keys.json

vault_pds=$(kubectl get pods | grep -E 'vault-\d+' | awk  '{print $1}')
for p in $vault_pds; do  
  echo unsealing $p
  cat cluster-keys.json | jq '.unseal_keys_hex[]' | xargs -L1 -I'{}' kubectl exec $p -- vault operator unseal '{}' > /dev/null
done;
sleep 20


kubectl create serviceaccount vault-auth
sleep 10
export VAULT_SA_NAME=$(kubectl get sa vault-auth \
    --output jsonpath="{.secrets[*]['name']}")
echo Get VAULT_SA_NAME
sleep 10
export SA_JWT_TOKEN=$(kubectl get secret $VAULT_SA_NAME \
    --output 'go-template={{ .data.token }}' | base64 --decode)
echo Get SA_JWT_TOKEN
sleep 10
export SA_CA_CRT=$(kubectl config view --raw --minify --flatten \
    --output 'jsonpath={.clusters[].cluster.certificate-authority-data}' | base64 --decode)
echo Get SA_CA_CRT
sleep 10
export K8S_HOST=$(kubectl config view --raw --minify --flatten \
    --output 'jsonpath={.clusters[].cluster.server}')
echo Get K8S_HOST
root_token=$(cat cluster-keys.json | jq -r ".root_token")
secret_script=$(cat ./secrets.sh | sed "s#\$1#$root_token#g" | sed "s#\$2#$SA_JWT_TOKEN#g" | sed "s#\$3#$SA_CA_CERT#g" | sed "s#\$4#$K8S_HOST#g")
echo secret script:
echo "$secret_script"
kubectl exec vault-0 -- sh -c "$secret_script"
#kill -9 $PORT_FWD_PID