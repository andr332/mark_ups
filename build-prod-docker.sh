docker build -t gcr.io/markuphero/webapp:prod --build-arg deploy_env=prod .
docker push gcr.io/markuphero/webapp:prod
kubectl rollout restart deployment/webapp --namespace=production