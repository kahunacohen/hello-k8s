kubectl delete ns kubegres-system
kubectl delete pvc postgres-db-mypostgres-3-0 
kubectl delete pvc postgres-db-mypostgres-2-0
kubectl delete pvc postgres-db-mypostgres-1-0  
kubectl apply -f https://raw.githubusercontent.com/reactive-tech/kubegres/v1.11/kubegres.yaml
