docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker images -a | grep "chaineuralcc" | awk '{print $3}' | xargs docker rmi
docker volume prune
docker images -a | grep "chaineuralcc" | awk '{print $3}' | xargs docker rmi
rm -r /tmp/fabric-client-kvs_Org1 /tmp/fabric-client-kvs_Org2 /tmp/fabric-client-kvs_Org3 /tmp/fabric-client-kvs_Org4 /tmp/fabric-client-kvs_peerOrg1 /tmp/fabric-client-kvs_peerOrg2 /tmp/fabric-client-kvs_peerOrg3 /tmp/fabric-client-kvs_peerOrg4