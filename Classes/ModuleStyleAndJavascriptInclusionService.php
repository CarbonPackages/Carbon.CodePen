<?php

namespace Carbon\CodePen;

use Neos\Eel\CompilingEvaluator;
use Neos\Eel\Utility;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Utility\PositionalArraySorter;

/**
 * Version of the original StyleAndJavascriptInclusionService that tolerates the additional property of `type: module`
 * {@see Neos\Neos\Ui\Domain\Service\StyleAndJavascriptInclusionService}
 *
 * Configured in the Objects.yaml
 *
 * @Flow\Scope("singleton")
 */
class ModuleStyleAndJavascriptInclusionService
{
    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @Flow\Inject(lazy=false)
     * @var CompilingEvaluator
     */
    protected $eelEvaluator;

    /**
     * @Flow\InjectConfiguration(package="Neos.Fusion", path="defaultContext")
     * @var array
     */
    protected $fusionDefaultEelContext;

    /**
     * @Flow\InjectConfiguration(package="Neos.Neos.Ui", path="configurationDefaultEelContext")
     * @var array
     */
    protected $additionalEelDefaultContext;

    /**
     * @Flow\InjectConfiguration(package="Neos.Neos.Ui", path="resources.javascript")
     * @var array
     */
    protected $javascriptResources;

    /**
     * @Flow\InjectConfiguration(package="Neos.Neos.Ui", path="resources.stylesheets")
     * @var array
     */
    protected $stylesheetResources;

    public function getHeadScripts()
    {
        return $this->build($this->javascriptResources, function ($uri, $additionalAttributes) {
            return '<script src="' . $uri . '" ' . $additionalAttributes . '></script>';
        });
    }

    public function getHeadStylesheets()
    {
        return $this->build($this->stylesheetResources, function ($uri, $additionalAttributes) {
            return '<link rel="stylesheet" href="' . $uri . '" ' . $additionalAttributes . '/>';
        });
    }

    protected function build(array $resourceArrayToSort, \Closure $builderForLine)
    {
        $sortedResources = (new PositionalArraySorter($resourceArrayToSort))->toArray();

        $result = '';
        foreach ($sortedResources as $element) {
            $resourceExpression = $element['resource'];
            if (substr($resourceExpression, 0, 2) === '${' && substr($resourceExpression, -1) === '}') {
                $resourceExpression = Utility::evaluateEelExpression(
                    $resourceExpression,
                    $this->eelEvaluator,
                    [],
                    array_merge($this->fusionDefaultEelContext, $this->additionalEelDefaultContext)
                );
            }

            $hash = null;

            if (strpos($resourceExpression, 'resource://') === 0) {
                // Cache breaker
                $hash = substr(md5_file($resourceExpression), 0, 8);
                $resourceExpression = $this->resourceManager->getPublicPackageResourceUriByPath($resourceExpression);
            }
            $finalUri = $hash ? $resourceExpression . '?' . $hash : $resourceExpression;
            $additionalAttributes = [];
            $additionalAttributes[] = isset($element['defer']) && $element['defer'] ? 'defer' : null;
            $additionalAttributes[] = isset($element['type']) ? 'type="' . $element['type'] . '"' : null;
            $additionalAttributes = $additionalAttributes !== [] ? join(' ', $additionalAttributes) : '';
            $result .= $builderForLine($finalUri, $additionalAttributes);
        }

        return $result;
    }
}
