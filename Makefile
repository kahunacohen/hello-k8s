build_image :
	docker build -t kahunacohen/hello-kube:$(tag) .	
push_image :
	docker push kahunacohen/hello-kube:$(tag)
run_image :
	docker rm hello-kube && docker run -p 3000:3000 --name hello-kube hello-kube
open_minikube_url :
	minikube service web-service

