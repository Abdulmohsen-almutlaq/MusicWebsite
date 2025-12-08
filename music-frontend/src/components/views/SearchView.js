import React from 'react';
import TrackCard from '../TrackCard';
import { Search as SearchIcon } from 'lucide-react';

const SearchView = ({ searchQuery, searchResults, user, handlePlay, handleLike, handleComment, onDelete }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">
        {searchQuery ? `Results for "${searchQuery}"` : 'Search'}
      </h2>
      
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {searchResults.map(track => (
            <TrackCard 
              key={track.id} 
              track={track} 
              user={user}
              onPlay={handlePlay}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-50">
          <SearchIcon size={64} className="mx-auto mb-4" />
          <p className="text-xl">
            {searchQuery ? 'No tracks found matching your search.' : 'Type in the search bar to find music.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchView;
