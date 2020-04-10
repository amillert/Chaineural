cd `pwd`/apps/panel-app/
echo
if [ -d node_modules ]; then
	echo "============== node modules installed already ============="
else
	echo "============== Installing node modules ============="
	npm install
fi
echo
node dist/gateway.js