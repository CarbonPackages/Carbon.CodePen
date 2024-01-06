.PHONY: help install build watch lint installDistribution up down open cleanSite test testAll testChromiumHeaded testFirefoxHeadless smokeTest installTests fixTests

#				#
# Plugin build	#
#				#

PLUGIN = Resources/Private/Plugin

## Install dependencies
install:
	cd ${PLUGIN} && . ${NVM_DIR}/nvm.sh && nvm use
	cd ${PLUGIN} && pnpm install --frozen-lockfile

## Build plugin for production
build:
	cd ${PLUGIN} && pnpm run build

## Build plugin and watch for changes
watch:
	cd ${PLUGIN} && pnpm run watch

## Run linting
lint:
	cd ${PLUGIN} && pnpm run lint


#								#
# Ddev local test distribution	#
#								#

DISTRIBUTION = Tests/Integration/TestDistribution

## Install distribution for testing
installDistribution:
	cd ${DISTRIBUTION} && ddev composer install
	cd ${DISTRIBUTION} && ddev exec ./flow doctrine:migrate
	cd ${DISTRIBUTION} && ddev exec ./flow user:create --roles Neos.Neos:Administrator admin admin Jon Doe
	cd ${DISTRIBUTION} && ddev exec ./flow user:create --roles Neos.Neos:Administrator admin2 admin2 Hauke Haien
	cd ${DISTRIBUTION} && ddev exec ./flow site:import --package-key Carbon.TestSite

## Start distribution for testing
up:
	cd ${DISTRIBUTION} && ddev start

## Stop distribution for testing
down:
	cd ${DISTRIBUTION} && ddev stop

## Open distribution in browser for testing
open:
	cd ${DISTRIBUTION} && ddev launch && sleep 1

## Clean distribution for testing
cleanSite:
	cd ${DISTRIBUTION} && ddev exec ./flow site:prune testsite || true
	cd ${DISTRIBUTION} && ddev exec ./flow site:import --package-key Carbon.TestSite


#				 	#
# Playwright tests 	#
#					#

# @param {only} grep select a test by (partial) name
# @param {skip} grep ignore a test by (partial) name
# @example
# 	make test only="emmet" skip="@optional"

## Make Firefox tests
test: testFirefoxHeadless

# one needs to do this from time to time
fixTests: cleanSite

# @param {only}
# @param {skip}

## Test all browsers
testAll:
	cd Tests/Integration/ && pnpm playwright test -g "${only}" --grep-invert "${skip}"

# chromium works better headed
# @param {only}
# @param {skip}

## Test Chromium
testChromiumHeaded:
	cd Tests/Integration/ && pnpm playwright test --project chromiumHeaded -g "${only}" --grep-invert "${skip}"

# firefox works better headless
# @param {only}
# @param {skip}

## Test Firefox
testFirefoxHeadless:
	cd Tests/Integration/ && pnpm playwright test --project firefoxHeadless -g "${only}" --grep-invert "${skip}"

## Run smoke test
smokeTest:
	make testFirefoxHeadless only="typing" skip="@optional"

## Install dependencies for tests
installTests:
	cd Tests/Integration/ && pnpm i
	cd Tests/Integration/ && pnpm playwright install chromium firefox

# Define colors
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

# define indention for descriptions
TARGET_MAX_CHAR_NUM=20

## Show help
help:
	@echo ''
	@echo '${GREEN}CLI command list:${RESET}'
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${YELLOW}%-$(TARGET_MAX_CHAR_NUM)s${RESET} ${GREEN}%s${RESET}\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo ''
