<?php

namespace Carbon\CodePen;

use Neos\ContentRepository\Domain\Projection\Content\PropertyCollectionInterface;
use Neos\ContentRepository\Domain\Projection\Content\TraversableNodeInterface;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
class VirtualNodeWithProperty implements TraversableNodeInterface
{
    use ShallowNodeTrait;

    protected TraversableNodeInterface $node;

    private string $propertyName;
    private $propertyValue;

    public function __construct(TraversableNodeInterface $node, string $propertyName, $propertyValue) {
        $this->node = $node;
        $this->propertyName = $propertyName;
        $this->propertyValue = $propertyValue;
    }

    /**
     * Map all legacy node methods to the node.
     */
    public function __call(string $name, array $arguments)
    {
        return $this->node->{$name}(...$arguments);
    }

    /**
     * `getContext` is not part of the API, but still used in Fusion via `node.context.inBackend`
     * We provide like the new ESCR a wrapper around this - to let fusion think we are not in Backend.
     * @link https://github.com/neos/contentrepository-development-collection/blob/693e65edb54b82a173cb925f72c2b76bd6ff4efb/Neos.EventSourcedContentRepository.LegacyApi/Classes/ContextInNodeBasedReadModel/EmulatedLegacyContext.php#L45
     */
    public function getContext() {
        return new class($this->node->getContext()) {
            private $nodeContext;

            public function __construct($nodeContext)
            {
                $this->nodeContext = $nodeContext;
            }

            public function isInBackend(): bool
            {
                return false;
            }

            public function isLive(): bool
            {
                return true;
            }

            public function __call(string $name, array $arguments)
            {
                return $this->nodeContext->{$name}(...$arguments);
            }
        };
    }

    /*
     * Special property handling to virtualize $propertyName and $propertyValue on $node
     */

    public function hasProperty($propertyName): bool
    {
        if ($this->propertyName === $propertyName) {
            return true;
        }
        return $this->node->hasProperty($propertyName);
    }

    public function getProperty($propertyName)
    {
        if ($this->propertyName === $propertyName) {
            return $this->propertyValue;
        }
        return $this->node->getProperty($propertyName);
    }

    public function getProperties(): PropertyCollectionInterface
    {
        $props = $this->node->getProperties();
        $props[$this->propertyName] = $this->propertyValue;
        return $props;
    }
}
