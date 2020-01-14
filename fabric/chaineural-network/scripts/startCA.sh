echo "Running docker compose chaineural CA"
export BYFN_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)
export BYFN_CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk)
export BYFN_CA3_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org3.example.com/ca && ls *_sk)
export BYFN_CA4_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org4.example.com/ca && ls *_sk)
export IMAGE_TAG=1.4.4
docker-compose -f docker-compose-ca.yaml up