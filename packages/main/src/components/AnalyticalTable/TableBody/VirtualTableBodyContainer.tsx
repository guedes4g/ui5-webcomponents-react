import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export const VirtualTableBodyContainer = (props) => {
  const {
    tableBodyHeight,
    totalColumnsWidth,
    children,
    parentRef,
    classes,
    infiniteScroll,
    infiniteScrollThreshold,
    onLoadMore,
    rows,
    internalRowHeight,
    handleExternalScroll,
    visibleRows,
    popInRowHeight
  } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (parentRef.current) {
      setIsMounted(true);
    }
  }, [parentRef.current]);

  const classNames = clsx(classes.tbody);

  const lastScrollTop = useRef(0);
  const firedInfiniteLoadEvents = useRef(new Set());
  const prevRowsLength = useRef(rows.length);

  useEffect(() => {
    if (prevRowsLength.current > rows.length) {
      firedInfiniteLoadEvents.current.clear();
      parentRef.current.scrollTop = 0;
      lastScrollTop.current = 0;
    }
  }, [rows.length, prevRowsLength.current]);

  useEffect(() => {
    prevRowsLength.current = rows.length;
  }, [rows.length]);

  const onScroll = useCallback(
    (event) => {
      handleExternalScroll();
      const scrollOffset = event.target.scrollTop;
      const isScrollingDown = lastScrollTop.current < scrollOffset;
      if (isScrollingDown && infiniteScroll) {
        lastScrollTop.current = scrollOffset;
        const currentLastRow =
          Math.floor(scrollOffset / popInRowHeight) +
          (popInRowHeight === internalRowHeight ? visibleRows : Math.floor(tableBodyHeight / popInRowHeight));
        if (rows.length - currentLastRow < infiniteScrollThreshold) {
          if (!firedInfiniteLoadEvents.current.has(rows.length)) {
            const rootNodes = rows.filter((row) => row.depth === 0);
            onLoadMore({
              detail: {
                rowCount: rootNodes.length,
                totalRowCount: rows.length
              }
            });
          }
          firedInfiniteLoadEvents.current.add(rows.length);
        }
      }
    },
    [
      infiniteScroll,
      infiniteScrollThreshold,
      onLoadMore,
      rows.length,
      internalRowHeight,
      firedInfiniteLoadEvents,
      lastScrollTop,
      handleExternalScroll,
      popInRowHeight,
      tableBodyHeight
    ]
  );

  return (
    <div
      className={classNames}
      ref={parentRef}
      onScroll={onScroll}
      style={{
        position: 'relative',
        overflowY: 'auto',
        height: `${tableBodyHeight}px`,
        width: `${totalColumnsWidth}px`
      }}
      data-component-name="AnalyticalTableBody"
    >
      {isMounted && children}
    </div>
  );
};
