<?php
declare(strict_types=1);

namespace Carbon\CodePen\Controller;

use Neos\ContentRepository\Domain\Model\Node;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Neos\View\FusionView;
use Neos\Flow\Annotations as Flow;

/**
 * @property FusionView view
 */
class PreviewController extends ActionController
{
    /**
     * @var string
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @Flow\InjectConfiguration("preview.fusionRootPath")
     * @var string
     */
    protected $fusionRootPath;

    public function renderAction(Node $node, string $propertyName, string $propertyValue)
    {
        $propertyValueDecoded = json_decode($propertyValue, true, 512, JSON_THROW_ON_ERROR);
        if ($propertyValueDecoded === '' || $propertyValueDecoded === []) {
            $propertyValueDecoded = null;
        }
        $mockedNode = $this->getMockedNodeWithProperty($node, $propertyName, $propertyValueDecoded);
        $this->view->setFusionPath($this->fusionRootPath);
        $this->view->assign('value', $mockedNode);
    }

    /**
     * See why this implementation was chosen
     * @link {https://neos-project.slack.com/archives/C050C8FEK/p1650722458764259}
     */
    private function getMockedNodeWithProperty(Node $node, string $propertyName, $propertyValue)
    {
        $nodeData = $node->getNodeData();

        $nodeDataPropertiesReflection = (new \ReflectionClass($nodeData))->getProperty('properties');
        $nodeDataPropertiesReflection->setAccessible(true);
        $properties = $nodeDataPropertiesReflection->getValue($nodeData);

        $properties[$propertyName] = $propertyValue;
        $nodeDataPropertiesReflection->setValue($nodeData, $properties);
        return $node;
    }
}
