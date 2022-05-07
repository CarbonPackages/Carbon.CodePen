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
