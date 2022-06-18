
PLUGIN = Resources/Private/Plugin

build:
	cd ${PLUGIN} && . ${NVM_DIR}/nvm.sh && nvm use
	cd ${PLUGIN} && pnpm install
	cd ${PLUGIN} && pnpm run build


DISTRIBUTION = Tests/Integration/TestDistribution

distributionSetup:
	cd ${DISTRIBUTION} && ddev composer install
	cd ${DISTRIBUTION} && ddev exec ./configureSite.sh

distributionUp:
	cd ${DISTRIBUTION} && ddev start

distributionDown:
	cd ${DISTRIBUTION} && ddev stop

