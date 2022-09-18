#				#
# Plugin build	#
#				#

PLUGIN = Resources/Private/Plugin

install:
	cd ${PLUGIN} && . ${NVM_DIR}/nvm.sh && nvm use
	cd ${PLUGIN} && pnpm install

build:
	cd ${PLUGIN} && pnpm run build

watch:
	cd ${PLUGIN} && pnpm run watch


#								#
# Ddev local test distribution	#
#								#

DISTRIBUTION = Tests/Integration/TestDistribution

installDistribution:
	cd ${DISTRIBUTION} && ddev composer install
	cd ${DISTRIBUTION} && ddev exec ./flow doctrine:migrate
	cd ${DISTRIBUTION} && ddev exec ./flow user:create --roles Neos.Neos:Administrator admin admin Jon Doe
	cd ${DISTRIBUTION} && ddev exec ./flow site:import --package-key Carbon.TestSite
	
up:
	cd ${DISTRIBUTION} && ddev start
	cd ${DISTRIBUTION} && ddev exec ./flow || echo "Hmmm"

down:
	cd ${DISTRIBUTION} && ddev stop

cleanSite:
	cd ${DISTRIBUTION} && ddev exec ./flow site:prune testsite
	cd ${DISTRIBUTION} && ddev exec ./flow site:import --package-key Carbon.TestSite


#				 	#
# Playwright tests 	#
#					#

# @param {g} grep select a test
# @example
# 	test g="typing"
test:
	make testChromiumHeaded

# @param {g} grep select a test
testChromiumHeaded:
	cd Tests/Integration/ && pnpm playwright test --headed --project chromium -g "${g}"

smokeTest:
	cd Tests/Integration/ && pnpm playwright test --project chromium -g 'typing'

installTests:
	cd Tests/Integration/ && pnpm i
	cd Tests/Integration/ && pnpm playwright install chromium firefox
