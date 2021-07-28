# Docker
dk_build :
	docker build -t $(NS)/hello-k8s .
dk_build_tag :
	docker build -t $(NS)/hello-k8s:$(TAG)
dk_push :
	docker push $(NS)/hello-k8s
dk_push_tag :
	docker push $(NS)/hello-k8s:$(TAG)
dk_run :
	docker run -d -p 3000:3000 $(NS)/hello-k8s

# minikube
mk_image_ls :
	(eval $(minikube docker-env); docker image ls)
mk_start :
	minikube start
mk_open :
	minikube service web-service

# kubectl

# Only first time, loads from .env file.
kb_create_configmap :
	kubectl create configmap web-configmap --from-env-file=./.env
kb_create_secrets :
	kubectl create secret generic web-secrets --from-file=./secrets
kb_set_image :
	kubectl set image deployment/web-deployment web=kahunacohen/hello-k8s:$(tag)
kb_create :
	kubectl create -f manifests/web-configmap.yaml || kubectl create -f manifests/web-deployment.yaml || kubectl create -f manifests/web-service.yaml
kb_delete :
	kubectl delete deployments web-deployment || kubectl delete services web-service || kubectl delete configmaps web-configmap || kubectl delete jobs --all

# tag=x.x.x make deploy
deploy : build_image push_image kb_set_image
	kubectl get pods


