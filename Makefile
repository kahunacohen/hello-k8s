# Docker
build_image :
	docker build -t kahunacohen/hello-kube:$(tag) .	
push_image :
	docker push kahunacohen/hello-kube:$(tag)
run_image :
	docker rm hello-kube && docker run -p 3000:3000 --name hello-kube hello-kube


# minikube
open_minikube_url :
	minikube service web-service

# kubectl

# Only first time, loads from .env file.
create_configmap :
	kubectl create configmap web-configmap --from-env-file=./.env
create_secrets :
	kubectl create secret generic web-secrets --from-file=./secrets

set_image :
	kubectl set image deployment/web-deployment web=kahunacohen/hello-kube:$(tag)

