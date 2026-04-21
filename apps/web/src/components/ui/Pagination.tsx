'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, maxVisible = 5 }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisible / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          backgroundColor: 'white',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page, idx) => (
        <React.Fragment key={idx}>
          {page === '...' ? (
            <span style={{ color: '#6b7280', fontSize: '14px' }}>...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${currentPage === page ? '#3b82f6' : '#e5e7eb'}`,
                backgroundColor: currentPage === page ? '#3b82f6' : 'white',
                color: currentPage === page ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === page ? '600' : 'normal',
              }}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          backgroundColor: 'white',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
