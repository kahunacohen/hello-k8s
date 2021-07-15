# Docker
dk_build :
	docker build -t kahunacohen/hello-kube:$(tag) .	&& docker build -t kahunacohen/helo-kube:latest .
dk_push :
	docker push kahunacohen/hello-kube:$(tag) && docker push kahunacohen/hello-kube:latest
dk_run :
	docker rm hello-kube && docker run -p 3000:3000 --name hello-kube hello-kube

# minikube
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
	kubectl set image deployment/web-deployment web=kahunacohen/hello-kube:$(tag)

# tag=x.x.x make deploy
deploy : build_image push_image set_image
	kubectl get pods


