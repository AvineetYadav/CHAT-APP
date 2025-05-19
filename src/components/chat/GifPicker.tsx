import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { X } from 'lucide-react';

interface GifPickerProps {
  onSelect: (gif: any) => void;
}

const gf = new GiphyFetch('0HdmdJGzGABJHWXUMg3YZnlF5cwU2dGr');

const GifPicker: React.FC<GifPickerProps> = ({ onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGifs = (offset: number) => {
    if (searchTerm) {
      return gf.search(searchTerm, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  const handleGifClick = (gif: any) => {
    onSelect({ url: gif.images.original.url });
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg overflow-hidden shadow-xl flex flex-col border border-light-300 dark:border-dark-700">
      <div className="flex justify-between items-center p-2 border-b border-light-300 dark:border-dark-700">
        <h3 className="font-medium text-light-900 dark:text-dark-900">Select a GIF</h3>
        <button 
          className="p-1 rounded-full hover:bg-light-200 dark:hover:bg-dark-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </button>
      </div>
      
      <div className="p-2 border-b border-light-300 dark:border-dark-700">
        <input
          type="text"
          placeholder="Search GIFs..."
          className="w-full px-3 py-2 rounded-md bg-light-100 dark:bg-dark-300 border border-light-300 dark:border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div style={{ width: '320px', height: isExpanded ? '400px' : '300px' }} className="overflow-auto">
        <Grid
          onGifClick={handleGifClick}
          fetchGifs={fetchGifs}
          width={320}
          columns={2}
          gutter={6}
        />
      </div>
    </div>
  );
};

export default GifPicker;