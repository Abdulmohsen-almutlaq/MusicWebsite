import React, { useState, useCallback } from 'react';
import * as mm from 'music-metadata-browser';
import api from '../../utils/api';
import { UploadCloud, FileAudio, CheckCircle, AlertCircle, Loader2, FolderInput } from 'lucide-react';

const UploadView = ({ 
  handleUpload, 
  uploadTitle, setUploadTitle, 
  uploadArtist, setUploadArtist, 
  uploadGenre, setUploadGenre, 
  setUploadFile, setUploadCover, 
  isUploading, genres 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [batchQueue, setBatchQueue] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const traverseFileTree = async (item, path = '') => {
    if (item.isFile) {
      const file = await new Promise((resolve) => item.file(resolve));
      return [file];
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      const entries = await new Promise((resolve) => {
        dirReader.readEntries(resolve);
      });
      let files = [];
      for (const entry of entries) {
        files = [...files, ...(await traverseFileTree(entry, path + item.name + '/'))];
      }
      return files;
    }
    return [];
  };

  const processDroppedItems = async (items) => {
    let tasks = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        if (item.isDirectory) {
          const files = await traverseFileTree(item);
          const audioFiles = files.filter(f => f.type.startsWith('audio/'));
          if (audioFiles.length > 0) {
            tasks.push({ type: 'playlist', name: item.name, files: audioFiles });
          }
        } else {
          const files = await traverseFileTree(item);
          const audioFiles = files.filter(f => f.type.startsWith('audio/'));
          audioFiles.forEach(f => tasks.push({ type: 'track', file: f }));
        }
      }
    }
    return tasks;
  };

  const extractMetadata = async (file) => {
    try {
      const metadata = await mm.parseBlob(file);
      const { common } = metadata;
      
      let coverFile = null;
      if (common.picture && common.picture.length > 0) {
        const pic = common.picture[0];
        coverFile = new File([pic.data], 'cover.jpg', { type: pic.format });
      }

      return {
        title: common.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: common.artist || 'Unknown Artist',
        genre: common.genre && common.genre.length > 0 ? common.genre[0] : 'Other',
        cover: coverFile
      };
    } catch (error) {
      console.error("Error parsing metadata for", file.name, error);
      return {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        genre: 'Other',
        cover: null
      };
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = e.dataTransfer.items;
    if (!items) return;

    setIsBatchProcessing(true);
    
    // 1. Analyze structure (Files vs Folders)
    const tasks = await processDroppedItems(items);
    
    let queue = [];

    // 2. Create Playlists & Build Queue
    for (const task of tasks) {
        if (task.type === 'playlist') {
            try {
                // Create Playlist
                const res = await api.post('/playlists', { 
                    name: task.name, 
                    description: `Imported from folder: ${task.name}` 
                });
                const playlistId = res.data.id;
                
                // Add files to queue
                task.files.forEach(file => {
                    queue.push({
                        file,
                        status: 'pending',
                        metadata: null,
                        playlistId: playlistId,
                        playlistName: task.name
                    });
                });
            } catch (err) {
                console.error("Failed to create playlist", task.name, err);
                // Fallback: upload without playlist
                task.files.forEach(file => {
                    queue.push({
                        file,
                        status: 'pending',
                        metadata: null,
                        error: 'Playlist creation failed'
                    });
                });
            }
        } else {
            // Single File
            queue.push({
                file: task.file,
                status: 'pending',
                metadata: null
            });
        }
    }

    setBatchQueue(queue);
    setBatchProgress({ current: 0, total: queue.length });
    
    // 3. Process Queue
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      
      // Update status to extracting metadata
      setBatchQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'extracting' } : q));
      
      const metadata = await extractMetadata(item.file);
      
      // Update status to uploading
      setBatchQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'uploading', metadata } : q));

      const formData = new FormData();
      formData.append('title', metadata.title);
      formData.append('artist', metadata.artist);
      
      // Match genre if possible, else default
      const matchedGenre = genres.find(g => g.toLowerCase() === metadata.genre.toLowerCase()) || 'Other';
      formData.append('genre', matchedGenre);
      
      formData.append('track', item.file);
      if (metadata.cover) {
        formData.append('cover', metadata.cover);
      }

      try {
        const res = await api.post('/tracks', formData);
        const trackId = res.data.id;

        // If part of a playlist, add it
        if (item.playlistId) {
            await api.post(`/playlists/${item.playlistId}/tracks`, { trackId });
        }

        setBatchQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'success' } : q));
      } catch (error) {
        console.error("Upload failed for", item.file.name, error);
        setBatchQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'error', error: error.message } : q));
      }
      
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
    }
    
    setIsBatchProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h2 className="text-3xl font-bold mb-8">Upload Track</h2>
      
      {/* Drag & Drop Zone */}
      <div 
        className={`
          mb-8 border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-brand-beige bg-brand-beige/10 scale-[1.02]' 
            : 'border-brand-light/30 hover:border-brand-beige/50 hover:bg-brand-medium/30'
          }
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-brand-beige text-brand-dark' : 'bg-brand-medium text-brand-light'}`}>
            {isDragging ? <FolderInput size={40} /> : <UploadCloud size={40} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-beige">
              {isDragging ? 'Drop files here' : 'Drag & Drop Files or Folders'}
            </h3>
            <p className="text-brand-light mt-2">
              Supports directories, auto-extracts metadata (MP3, WAV, etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Batch Queue UI */}
      {batchQueue.length > 0 && (
        <div className="mb-8 bg-brand-medium/50 rounded-2xl border border-brand-light/10 overflow-hidden">
          <div className="p-4 border-b border-brand-light/10 flex justify-between items-center bg-brand-medium">
            <h3 className="font-bold text-brand-beige flex items-center gap-2">
              <FolderInput size={18} />
              Batch Upload Queue
            </h3>
            <span className="text-xs font-mono bg-brand-dark px-2 py-1 rounded text-brand-light">
              {batchProgress.current} / {batchProgress.total}
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {batchQueue.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-brand-dark/50 border border-brand-light/5">
                <div className="w-8 h-8 rounded bg-brand-medium flex items-center justify-center flex-shrink-0">
                  <FileAudio size={16} className="text-brand-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-beige truncate">
                    {item.metadata?.title || item.file.name}
                  </p>
                  <p className="text-xs text-brand-light truncate">
                    {item.metadata?.artist || (item.status === 'pending' ? 'Waiting...' : 'Processing...')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {item.status === 'pending' && <span className="text-xs text-brand-light">Pending</span>}
                  {item.status === 'extracting' && <Loader2 size={18} className="animate-spin text-blue-400" />}
                  {item.status === 'uploading' && <Loader2 size={18} className="animate-spin text-brand-beige" />}
                  {item.status === 'success' && <CheckCircle size={18} className="text-green-500" />}
                  {item.status === 'error' && <AlertCircle size={18} className="text-red-500" title={item.error} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single File Form (Divider) */}
      <div className="relative flex items-center py-4 mb-8">
        <div className="flex-grow border-t border-brand-light/20"></div>
        <span className="flex-shrink-0 mx-4 text-brand-light/50 text-sm uppercase tracking-wider">Or Upload Manually</span>
        <div className="flex-grow border-t border-brand-light/20"></div>
      </div>

      <form onSubmit={handleUpload} className="space-y-6 bg-brand-medium p-4 md:p-8 rounded-2xl border border-brand-light/20 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-light">Title</label>
            <input type="text" className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none text-brand-beige transition-colors" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-light">Artist</label>
            <input type="text" className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none text-brand-beige transition-colors" value={uploadArtist} onChange={e => setUploadArtist(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-light">Genre</label>
          <select className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none text-brand-beige transition-colors" value={uploadGenre} onChange={e => setUploadGenre(e.target.value)} required>
            <option value="">Select Genre</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-light">Audio File</label>
            <input type="file" accept="audio/*" className="w-full text-sm text-brand-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-beige hover:file:bg-brand-light/80 cursor-pointer" onChange={e => setUploadFile(e.target.files[0])} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-light">Cover Art</label>
            <input type="file" accept="image/*" className="w-full text-sm text-brand-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-beige hover:file:bg-brand-light/80 cursor-pointer" onChange={e => setUploadCover(e.target.files[0])} />
          </div>
        </div>

        <button disabled={isUploading} className="w-full bg-gradient-to-r from-brand-light to-brand-medium text-brand-beige font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg">
          {isUploading ? 'Uploading...' : 'Upload Track'}
        </button>
      </form>
    </div>
  );
};

export default UploadView;
