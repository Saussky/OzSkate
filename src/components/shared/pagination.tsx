'use client';
import React from 'react';
import Button from '../ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): JSX.Element {
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handlePrevPage} variant="smart">
        Previous
      </Button>

      <span className="text-sm text-black">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      <Button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        variant="smart"
      >
        Next
      </Button>
    </div>
  );
}
