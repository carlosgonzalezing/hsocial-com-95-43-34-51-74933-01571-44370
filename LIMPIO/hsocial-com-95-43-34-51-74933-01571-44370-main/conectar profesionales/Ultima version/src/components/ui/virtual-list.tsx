import React from 'react';
import { useVirtualScroll } from '@/hooks/use-virtual-scroll';
import { cn } from '@/lib/utils';

interface VirtualListProps {
  items: any[];
  itemHeight: number;
  height: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualList({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  overscan = 5
}: VirtualListProps) {
  const {
    visibleItems,
    totalHeight,
    containerProps
  } = useVirtualScroll(items, {
    itemHeight,
    containerHeight: height,
    overscan
  });

  return (
    <div
      {...containerProps}
      className={cn("overflow-auto", className)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div
            key={index}
            style={style}
            className="flex items-center"
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}