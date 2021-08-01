#!/usr/bin/env bash
set +e

# Install and configure vault in a minikube cluster on MacOS. A minikube cluster must be running.

get_num_pods() {
  kubectl get pods -ojson | jq '.items|length'
}

# Delete pods, blocking until they are all terminated.
kubectl delete all --all
while :
  do
    pds=$(get_num_pods)
    echo "Waiting for pods to terminate: $pds"
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
while :
  do
    echo Waiting for pods to start...
    if kubectl get pods -ojson | jq -e '[.items[] | .status.phase] | length == 6 and all(.=="Running")' > /dev/null; then
      echo all pods are running.
      break
    fi
    sleep 1
  done

echo remove consul/data
kubectl get pods

# Reset consul data:
kubectl exec consul-consul-server-0 -- rm -rf '/consul/data/*'
sleep 5

kubectl port-forward vault-0 8200:8200 &
PORT_FWD_PID=$!
echo port forwarding vault in background. Process id: $PORT_FWD_PID

echo vault server status:
kubectl exec vault-0 -- vault status

echo initializing vault server and getting keys
kubectl exec vault-0 -- vault operator init -key-shares=5 -key-threshold=5 -format=json > cluster-keys.json
#kill $PORT_FWD_PID
