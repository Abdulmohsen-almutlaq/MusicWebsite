import React from 'react';

const SkeletonCard = () => (
  <div className="bg-brand-medium/40 border border-brand-light/10 p-4 rounded-2xl flex flex-col h-full animate-pulse">
    <div className="aspect-square mb-4 rounded-xl bg-brand-light/10" />
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-brand-light/10 rounded w-3/4" />
      <div className="h-4 bg-brand-light/10 rounded w-1/2" />
    </div>
    <div className="mt-4 pt-4 border-t border-brand-light/5 flex justify-between">
      <div className="h-4 bg-brand-light/10 rounded w-1/4" />
      <div className="h-4 bg-brand-light/10 rounded w-1/4" />
    </div>
  </div>
);

export default SkeletonCard;
