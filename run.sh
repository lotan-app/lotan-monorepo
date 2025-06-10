docker tag graph-agent:latest core-application-privateregistry-f2hhr1-475e08-161-97-157-18.traefik.me/docker/graph-agent:latest
docker tag graph-be:latest core-application-privateregistry-f2hhr1-475e08-161-97-157-18.traefik.me/docker/graph-be:latest
docker tag graph-edge:latest core-application-privateregistry-f2hhr1-475e08-161-97-157-18.traefik.me/docker/graph-edge:latest
docker push core-application-privateregistry-f2hhr1-475e08-161-97-157-18.traefik.me/docker/graph-agent:latest
docker push core-application-privateregistry-f2hhr1-475e08-161-97-157-18.traefik.me/docker/graph-be:latest
docker push core-application-privateregistry-f2hhr1-475e08-161-97-157-18.traefik.me/docker/graph-edge:latest