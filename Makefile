build :
	docker build -t hello-kube .	
run :
	docker rm hello-kube && docker run -p 3000:3000 --name hello-kube hello-kube

