<?php
declare(strict_types=1);

namespace Carbon\CodePen\Controller;

use Neos\ContentRepository\Domain\Model\NodeInterface;
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

    public function renderAction(NodeInterface $node, string $propertyName, string $propertyValue)
    {
        $propertyValueDecoded = json_decode($propertyValue, true);
        // todo unwanted side effect!
        $node->setProperty($propertyName, $propertyValueDecoded);
        $this->view->setFusionPath($this->fusionRootPath);
        $this->view->assign('value', $node);
    }
}
