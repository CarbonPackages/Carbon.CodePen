<?php

namespace Carbon\CodePen;

use Neos\ContentRepository\Domain\Projection\Content\TraversableNodeInterface;

/**
 * @property TraversableNodeInterface node
 */
trait ShallowNodeTrait
{
    public function getDimensionSpacePoint(): \Neos\ContentRepository\DimensionSpace\DimensionSpace\DimensionSpacePoint
    {
        return $this->node->getDimensionSpacePoint();
    }

    public function findParentNode(): \Neos\ContentRepository\Domain\Projection\Content\TraversableNodeInterface
    {
        return $this->node->findParentNode();
    }

    public function findNodePath(): \Neos\ContentRepository\Domain\ContentSubgraph\NodePath
    {
        return $this->node->findNodePath();
    }

    public function findNamedChildNode(\Neos\ContentRepository\Domain\NodeAggregate\NodeName $nodeName): \Neos\ContentRepository\Domain\Projection\Content\TraversableNodeInterface
    {
        return $this->node->findNamedChildNode($nodeName);
    }

    public function findChildNodes(?\Neos\ContentRepository\Domain\NodeType\NodeTypeConstraints $nodeTypeConstraints = NULL, ?int $limit = NULL, ?int $offset = NULL): \Neos\ContentRepository\Domain\Projection\Content\TraversableNodes
    {
        return $this->node->findChildNodes($nodeTypeConstraints, $limit, $offset);
    }

    public function countChildNodes(?\Neos\ContentRepository\Domain\NodeType\NodeTypeConstraints $nodeTypeConstraints = NULL): int
    {
        return $this->node->countChildNodes($nodeTypeConstraints);
    }

    public function findReferencedNodes(): \Neos\ContentRepository\Domain\Projection\Content\TraversableNodes
    {
        return $this->node->findReferencedNodes();
    }

    public function findNamedReferencedNodes(\Neos\EventSourcedContentRepository\Domain\ValueObject\PropertyName $edgeName): \Neos\ContentRepository\Domain\Projection\Content\TraversableNodes
    {
        return $this->node->findNamedReferencedNodes($edgeName);
    }

    public function findReferencingNodes(): \Neos\ContentRepository\Domain\Projection\Content\TraversableNodes
    {
        return $this->node->findReferencingNodes();
    }

    public function findNamedReferencingNodes(\Neos\EventSourcedContentRepository\Domain\ValueObject\PropertyName $nodeName): \Neos\ContentRepository\Domain\Projection\Content\TraversableNodes
    {
        return $this->node->findNamedReferencingNodes($nodeName);
    }

    public function equals(\Neos\ContentRepository\Domain\Projection\Content\TraversableNodeInterface $other): bool
    {
        return $this->node->equals($other);
    }

    public function isRoot(): bool
    {
        return $this->node->isRoot();
    }

    public function isTethered(): bool
    {
        return $this->node->isTethered();
    }

    public function getContentStreamIdentifier(): \Neos\ContentRepository\Domain\ContentStream\ContentStreamIdentifier
    {
        return $this->node->getContentStreamIdentifier();
    }

    public function getNodeAggregateIdentifier(): \Neos\ContentRepository\Domain\NodeAggregate\NodeAggregateIdentifier
    {
        return $this->node->getNodeAggregateIdentifier();
    }

    public function getNodeTypeName(): \Neos\ContentRepository\Domain\NodeType\NodeTypeName
    {
        return $this->node->getNodeTypeName();
    }

    public function getNodeType(): \Neos\ContentRepository\Domain\Model\NodeType
    {
        return $this->node->getNodeType();
    }

    public function getNodeName(): ?\Neos\ContentRepository\Domain\NodeAggregate\NodeName
    {
        return $this->node->getNodeName();
    }

    public function getOriginDimensionSpacePoint(): \Neos\EventSourcedContentRepository\Domain\Context\NodeAggregate\OriginDimensionSpacePoint
    {
        return $this->node->getOriginDimensionSpacePoint();
    }

    public function getProperties(): \Neos\ContentRepository\Domain\Projection\Content\PropertyCollectionInterface
    {
        return $this->node->getProperties();
    }

    public function getProperty($propertyName)
    {
        return $this->node->getProperty($propertyName);
    }

    public function hasProperty($propertyName): bool
    {
        return $this->node->hasProperty($propertyName);
    }

    public function getLabel(): string
    {
        return $this->node->getLabel();
    }

    public function getCacheEntryIdentifier(): string
    {
        return $this->node->getCacheEntryIdentifier();
    }
}
