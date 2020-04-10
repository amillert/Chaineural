cd /opt/gopath/src/github.com/chaincode/chaineural/typescript
echo
if [ -d node_modules ]; then
	echo "============== node modules installed already ============="
else
	echo "============== Installing node modules ============="
	npm install
fi
echo
npm run build