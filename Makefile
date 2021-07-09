build :
	docker build -t kahunacohen/hello-kube:$(tag) .	
push :
	docker push kahunacohen/hello-kube:$(tag)
run :
	docker rm hello-kube && docker run -p 3000:3000 --name hello-kube hello-kube

