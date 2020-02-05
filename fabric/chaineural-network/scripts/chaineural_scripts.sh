#!/bin/bash
echo
echo "Chaineural scripts"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"
NO_CHAINCODE="$6"
: ${CHANNEL_NAME:="mainchannel"}
: ${CHAINCODE_NAME:="chaineuralcc"}
: ${DELAY:="3"}
: ${LANGUAGE:="node"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
: ${NO_CHAINCODE:="false"}
LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
COUNTER=1
MAX_RETRY=10

CC_SRC_PATH="/opt/gopath/src/github.com/chaincode/chaineural/typescript"

echo "Channel name : "$CHANNEL_NAME
echo "Chaincode name : "$CHAINCODE_NAME

# import utils
. scripts/utils.sh

installDataChaincode() {
  PEER=$1
  ORG=$2
  CC_SRC_PATH=$3
  setGlobals $PEER $ORG
  echo ${LANGUAGE}
  echo ${CC_SRC_PATH}
  set -x
  peer chaincode install -n ${CHAINCODE_NAME} -v 1.0 -l ${LANGUAGE} -p ${CC_SRC_PATH} >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode installation on peer${PEER}.org${ORG} has failed"
  echo "===================== Chaincode is installed on peer${PEER}.org${ORG} ===================== "
  echo
}

instantiateDataChaincode() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  VERSION=${3:-1.0}

  # while 'peer chaincode' command can get the orderer endpoint from the peer
  # (if join was successful), let's supply it directly as we know it using
  # the "-o" option
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode instantiate -o orderer.example.com:7050 -C $CHANNEL_NAME -n ${CHAINCODE_NAME} -l ${LANGUAGE} -v 1.0 -c '{"Args":[]}' -P "AND ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer')" >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode instantiate -o orderer.example.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --collections-config "$GOPATH/src/github.com/chaincode/chaineural/typescript/collections_config.json" -C $CHANNEL_NAME -n ${CHAINCODE_NAME} -l ${LANGUAGE} -v 1.0 -c '{"Args":[]}' -P "AND ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer')" >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Chaincode instantiation on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' failed"
  echo "===================== Chaincode is instantiated on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
  echo
}

dataChaincodeQuery() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  EXPECTED_RESULT=$3
  echo "===================== Querying on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
  local rc=1
  local starttime=$(date +%s)

  # continue to poll
  # we either get a successful response, or reach TIMEOUT
  while
    test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
  do
    sleep $DELAY
    echo "Attempting to Query peer${PEER}.org${ORG} ...$(($(date +%s) - starttime)) secs"
    set -x
    peer chaincode query -C $CHANNEL_NAME -n ${CHAINCODE_NAME} -c '{"Args":["queryData","data2"]}' >&log.txt
    res=$?
    set +x
    test $res -eq 0 && VALUE=$(cat log.txt | awk '/Query Result/ {print $NF}')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
    # removed the string "Query Result" from peer chaincode query command
    # result. as a result, have to support both options until the change
    # is merged.
    test $rc -ne 0 && VALUE=$(cat log.txt | egrep '^[0-9]+$')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
  done
  echo
  cat log.txt
  if test $rc -eq 0; then
    echo "===================== Query successful on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
  else
    echo "!!!!!!!!!!!!!!! Query result on peer${PEER}.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
    echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
    echo
    exit 1
  fi
}

dataChaincodeInvoke() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode invoke -o orderer.example.com:7050 -C $CHANNEL_NAME -n ${CHAINCODE_NAME} $PEER_CONN_PARMS -c '{"Args":["createData","data2","3"]}' >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode invoke -o orderer.example.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CHAINCODE_NAME} $PEER_CONN_PARMS -c '{"Args":["createData","data2","3"]}' >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
}

dataChaincodeInvokePrivateData() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode invoke -o orderer.example.com:7050 -C $CHANNEL_NAME -n ${CHAINCODE_NAME} $PEER_CONN_PARMS -c '{"Args":["getPrivateData","data2"]}' >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode invoke -o orderer.example.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CHAINCODE_NAME} $PEER_CONN_PARMS -c '{"Args":["getPrivateData","data2"]}' >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
}
echo "Install chaincode on peer1.org1..."
sleep 1
  installDataChaincode 0 1 "$CC_SRC_PATH"
  sleep 1
  installDataChaincode 1 1 "$CC_SRC_PATH"
  sleep 1

echo "Install chaincode on peer1.org2..."
# sleep 1
  installDataChaincode 0 2 "$CC_SRC_PATH"
  sleep 1
  installDataChaincode 1 2 "$CC_SRC_PATH"
  sleep 1

echo "Install chaincode on peer1.org3..."
# sleep 1
  installDataChaincode 0 3 "$CC_SRC_PATH"
  sleep 1
  installDataChaincode 1 3 "$CC_SRC_PATH"
  sleep 1

echo "Install chaincode on peer1.org4..."
# sleep 1
  installDataChaincode 0 4 "$CC_SRC_PATH"
  sleep 1
  installDataChaincode 1 4 "$CC_SRC_PATH"
  sleep 1

echo "Instantiate chaincode on peer1.org2..."
sleep 2
  instantiateDataChaincode 1 2

# echo "Invoking chaincode on every orgs peer1"
# dataChaincodeInvoke 1 1 1 2 1 3 1 4
# sleep 9

# echo "Quering chaincode on peer1.org3..."
# dataChaincodeQuery 1 3
# sleep 2

#   echo "Invoking chaincode on every orgs peer1"
# dataChaincodeInvokePrivateData 1 1
# sleep 9
