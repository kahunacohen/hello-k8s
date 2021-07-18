#load('ext://secret', 'secret_create_generic')
#secret_create_generic('web-secrets', from_file='./secrets')

k8s_yaml([
  'manifests/web-deployment.yaml',
  #'manifests/web-configmap.yaml',
  #'manifests/jobs/web-cron-hello.yaml',
  ])
docker_build('kahunacohen/hello-kube', './')
k8s_resource('web-deployment', port_forwards='9000')

