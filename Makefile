
PLUGIN = Resources/Private/Plugin

build:
	cd ${PLUGIN} && . ${NVM_DIR}/nvm.sh && nvm use
	cd ${PLUGIN} && pnpm install
	cd ${PLUGIN} && pnpm run build

watch:
	cd ${PLUGIN} && pnpm run watch

DISTRIBUTION = Tests/Integration/TestDistribution

distributionSetup:
	cd ${DISTRIBUTION} && ddev composer install
	cd ${DISTRIBUTION} && ddev exec ./flow user:create --roles Neos.Neos:Administrator admin admin Jon Doe
	cd ${DISTRIBUTION} && ddev exec ./softSiteDeleteAndSetup.sh

distributionUp:
	cd ${DISTRIBUTION} && ddev start

distributionDown:
	cd ${DISTRIBUTION} && ddev stop

test:
	cd Tests/Integration && pnpm run test
