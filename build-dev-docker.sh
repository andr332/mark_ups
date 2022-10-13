docker build -t gcr.io/markuphero/webapp:latest --build-arg deploy_env=dev .
docker push gcr.io/markuphero/webapp:latest
kubectl rollout restart deployment/webapp --namespace=default