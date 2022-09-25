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
	cd ${DISTRIBUTION} && ddev exec ./flow user:create --roles Neos.Neos:Administrator admin2 admin2 Hauke Haien
	cd ${DISTRIBUTION} && ddev exec ./flow site:import --package-key Carbon.TestSite
	
up:
	cd ${DISTRIBUTION} && ddev start

down:
	cd ${DISTRIBUTION} && ddev stop

open:
	cd ${DISTRIBUTION} && ddev launch && sleep 1

cleanSite:
	cd ${DISTRIBUTION} && ddev exec ./flow site:prune testsite || ddev exec ./flow site:prune testsite
	cd ${DISTRIBUTION} && ddev exec ./flow site:import --package-key Carbon.TestSite


#				 	#
# Playwright tests 	#
#					#

# @param {only} grep select a test by (partial) name
# @param {skip} grep ignore a test by (partial) name
# @example
# 	make test only="emmet" skip="@optional"
test:
	make testFirefoxHeadless

# @param {only}
# @param {skip}
testAll:
	cd Tests/Integration/ && pnpm playwright test -g "${only}" --grep-invert "${skip}"

# chromium works better headed
# @param {only}
# @param {skip}
testChromiumHeaded:
	cd Tests/Integration/ && pnpm playwright test --project chromiumHeaded -g "${only}" --grep-invert "${skip}"

# firefox works better headless
# @param {only}
# @param {skip}
testFirefoxHeadless:
	cd Tests/Integration/ && pnpm playwright test --project firefoxHeadless -g "${only}" --grep-invert "${skip}"

smokeTest:
	make testFirefoxHeadless only="typing" skip="@optional"

installTests:
	cd Tests/Integration/ && pnpm i
	cd Tests/Integration/ && pnpm playwright install chromium firefox
