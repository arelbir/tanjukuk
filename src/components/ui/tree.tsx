import * as React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TreeNode as LookupTreeNode } from '@/hooks/useLookups'

interface TreeNode extends Omit<LookupTreeNode, 'children'> {
  children?: TreeNode[]
}

interface TreeProps {
  data: TreeNode[]
  onNodeClick?: (node: TreeNode) => void
  onNodeToggle?: (node: TreeNode) => void
  renderNode?: (node: TreeNode) => React.ReactNode
  className?: string
}

interface TreeNodeProps {
  node: TreeNode
  level: number
  onNodeClick?: (node: TreeNode) => void
  onNodeToggle?: (node: TreeNode) => void
  renderNode?: (node: TreeNode) => React.ReactNode
}

function TreeNodeComponent({ node, level, onNodeClick, onNodeToggle, renderNode }: TreeNodeProps) {
  const [expanded, setExpanded] = React.useState(false)
  const hasChildren = node.children && node.children.length > 0

  const handleToggle = () => {
    setExpanded(!expanded)
    onNodeToggle?.(node)
  }

  const handleClick = () => {
    onNodeClick?.(node)
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors',
          level > 0 && 'ml-4'
        )}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        {renderNode ? (
          renderNode(node)
        ) : (
          <>
            <span className={cn(
              'text-sm font-medium',
              !node.is_active && 'text-muted-foreground line-through'
            )}>
              {node.label}
            </span>
            {!node.is_active && (
              <span className="text-xs text-muted-foreground ml-2">(Pasif)</span>
            )}
          </>
        )}
      </div>
      
      {hasChildren && expanded && (
        <div className="mt-1">
          {node.children?.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
              onNodeToggle={onNodeToggle}
              renderNode={renderNode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Tree({ data, onNodeClick, onNodeToggle, renderNode, className }: TreeProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          onNodeClick={onNodeClick}
          onNodeToggle={onNodeToggle}
          renderNode={renderNode}
        />
      ))}
    </div>
  )
}
