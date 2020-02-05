cd `pwd`/ui/panel-ui
. ~/.nvm/nvm.sh
. ~/.profile
. ~/.bashrc
echo
if [ -d node_modules ]; then
	echo "============== node modules installed already ============="
else
	echo "============== Installing node modules ============="
	npm install
fi
echo
nvm install 10.18.0
nvm use 10.18.0
npm start