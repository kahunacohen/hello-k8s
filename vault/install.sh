#!/usr/bin/env bash

# Install and configure vault in a minikube cluster on MacOS. A minikube cluster must be running.

kubectl delete all --all
echo Waiting for pods to terminate
sleep 20
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
  echo waiting for vault pods to start...
  sleep 20
fi
echo vault installed

kubectl port-forward vault-0 8200:8200 &
PORT_FWD_PID=$!
echo port forwarding vault in background. Process id: $PORT_FWD_PID


echo vault server status:
kubectl exec vault-0 -- vault status

# echo initializing vault server and getting keys
kubectl exec vault-0 -- vault operator init -key-shares=5 -key-threshold=5 -format=json > cluster-keys.json

