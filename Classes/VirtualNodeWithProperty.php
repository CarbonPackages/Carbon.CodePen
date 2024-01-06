<?php

namespace Carbon\CodePen;

use Neos\ContentRepository\Domain\Projection\Content\PropertyCollectionInterface;
use Neos\ContentRepository\Domain\Model\Node;
use Neos\ContentRepository\Domain\Model\NodeData;
use Neos\ContentRepository\Domain\Service\Context;

class VirtualNodeWithProperty extends Node
{
    private string $propertyName;
    private $propertyValue;

    public function __construct(NodeData $nodeData, Context $context, string $propertyName, $propertyValue)
    {
        $this->propertyName = $propertyName;
        $this->propertyValue = $propertyValue;
        parent::__construct($nodeData, $context);
    }

    /*
     * Special property handling to virtualize $propertyName and $propertyValue on $node
     */
    public function hasProperty($propertyName): bool
    {
        if ($this->propertyName === $propertyName) {
            return true;
        }
        return parent::hasProperty($propertyName);
    }

    public function getProperty($propertyName, bool $returnNodesAsIdentifiers = false)
    {
        if ($this->propertyName === $propertyName) {
            return $this->propertyValue;
        }
        return parent::getProperty($propertyName, $returnNodesAsIdentifiers);
    }

    public function getProperties(bool $returnNodesAsIdentifiers = false): PropertyCollectionInterface
    {
        $props = parent::getProperties($returnNodesAsIdentifiers);
        $props[$this->propertyName] = $this->propertyValue;
        return $props;
    }
}
