docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker images -a | grep "chaineuralcc" | awk '{print $3}' | xargs docker rmi
docker volume prune
docker images -a | grep "chaineuralcc" | awk '{print $3}' | xargs docker rmi