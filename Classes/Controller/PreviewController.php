<?php
declare(strict_types=1);

namespace Carbon\CodePen\Controller;

use Neos\ContentRepository\Domain\Model\Node;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Neos\View\FusionView;
use Neos\Flow\Annotations as Flow;
use Carbon\CodePen\VirtualNodeWithProperty;

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

    public function renderVirtualNodeAction(Node $node, string $additionalPropertyName, string $additionalPropertyValue)
    {
        $propertyValueDecoded = json_decode($additionalPropertyValue, true, 512, JSON_THROW_ON_ERROR);
        if ($propertyValueDecoded === '' || $propertyValueDecoded === []) {
            $propertyValueDecoded = null;
        }
        $mockedNode = $this->getMockedNodeWithProperty($node, $additionalPropertyName, $propertyValueDecoded);
        $this->view->setFusionPath('codePenVirtualNode');
        $this->view->assign('value', $mockedNode);
        $this->view->assign('site', $node->getContext()->getCurrentSiteNode());
    }

    public function renderPreviewFrameAction(Node $node)
    {
        $this->view->setFusionPath('codePenPreviewFrame');
        $this->view->assign('value', $node);
    }

    /**
     * See why this implementation was chosen
     * @link {https://neos-project.slack.com/archives/C050C8FEK/p1650722458764259}
     */
    private function getMockedNodeWithProperty(Node $node, string $propertyName, $propertyValue)
    {
        return new VirtualNodeWithProperty($node->getNodeData(), $node->getContext(), $propertyName, $propertyValue);
    }
}
