#!/usr/bin/env bash
if [[ -z "$DOCKER_HOST" ]]; then
  eval $(minikube docker-env)
fi
containers_ls() {
  docker container ls
}
images() {
  docker images
}
image_del() {
  docker image rm $1 --force
}
container_stop() {
  docker container stop $1
}

kb_create() {
  kubectl create -f manifests/web-configmap.yaml
  kubectl create -f manifests/web-deployment.yaml
  kubectl create -f manifests/web-service.yaml
}
kb_del() {
  kubectl delete configmaps web-configmap
  kubectl delete deployments web-deployment
  kubectl delete services web-service
  kubectl delete cronjobs --all
}
kb_set_image() {
  kubectl set image deployment/web-deployment web=kahunacohen/hello-k8s:$1
}
