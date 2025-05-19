import React, { useState, useRef, useEffect } from 'react';
import { Smile, Image, Send, X, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { messageAPI } from '../../utils/api';
import EmojiPicker from 'emoji-picker-react';
import GifPicker from './GifPicker';
import Button from '../ui/Button';

interface MessageInputProps {
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const { id: conversationId } = useParams<{ id: string }>();
  const { startTyping, stopTyping } = useSocket();
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'image/*': []
    },
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      handleFileSelect(acceptedFiles[0]);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEmojiPickerOpen && 
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }

      if (
        isGifPickerOpen && 
        gifPickerRef.current && 
        !gifPickerRef.current.contains(event.target as Node)
      ) {
        setIsGifPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEmojiPickerOpen, isGifPickerOpen]);

  useEffect(() => {
    if (conversationId) {
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
    }
  }, [conversationId]);

  const handleTyping = () => {
    if (!conversationId) return;
    
    startTyping(conversationId);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      stopTyping(conversationId);
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
    setIsGifPickerOpen(false);
  };

  const toggleGifPicker = () => {
    setIsGifPickerOpen(!isGifPickerOpen);
    setIsEmojiPickerOpen(false);
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.emoji);
    setIsEmojiPickerOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleGifSelect = (gif: any) => {
    handleSendMessage(undefined, gif.url);
    setIsGifPickerOpen(false);
  };

  const handleSendMessage = async (e?: React.FormEvent, gifUrl?: string) => {
    if (e) {
      e.preventDefault();
    }
    
    if ((!message && !selectedFile && !gifUrl) || !conversationId) return;
    
    try {
      let imageUrl = '';
      
      // If there's a GIF URL, use it directly
      if (gifUrl) {
        imageUrl = gifUrl;
      }
      // If there's a file, upload it first
      else if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const response = await messageAPI.uploadImage(formData);
        imageUrl = response.data.imageUrl;
        setIsUploading(false);
      }
      
      // Send the message
      await messageAPI.sendMessage({
        content: message,
        conversationId,
        image: imageUrl || undefined
      });
      
      // Reset form
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      
      // Notify parent component to refresh messages
      onSendMessage();
      
      // Stop typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      stopTyping(conversationId);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-light-300 dark:border-dark-700 bg-white dark:bg-dark-200">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        
        {/* File preview */}
        {filePreview && (
          <div className="mb-3 relative">
            <div className="inline-block rounded-lg border border-light-300 dark:border-dark-700 overflow-hidden relative">
              <img src={filePreview} alt="Upload preview" className="max-h-32 object-contain" />
              <button
                onClick={clearSelectedFile}
                className="absolute top-1 right-1 bg-light-900/80 dark:bg-dark-900/80 rounded-full p-1"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-end">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="resize-none w-full border border-light-300 dark:border-dark-600 bg-light-100 dark:bg-dark-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-3 bottom-2 flex space-x-2">
              <button
                type="button"
                onClick={toggleEmojiPicker}
                className="text-light-500 dark:text-dark-500 hover:text-light-700 dark:hover:text-dark-300"
              >
                <Smile size={18} />
              </button>
              <button
                type="button"
                onClick={open}
                className="text-light-500 dark:text-dark-500 hover:text-light-700 dark:hover:text-dark-300"
              >
                <Image size={18} />
              </button>
              <button
                type="button"
                onClick={toggleGifPicker}
                className="text-light-500 dark:text-dark-500 hover:text-light-700 dark:hover:text-dark-300"
              >
                <span className="font-medium text-sm">GIF</span>
              </button>
            </div>
            
            {/* Emoji Picker */}
            {isEmojiPickerOpen && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-12 right-0 z-10 shadow-lg rounded-lg"
              >
                <EmojiPicker 
                  onEmojiClick={handleEmojiSelect}
                  searchDisabled={false}
                  skinTonesDisabled
                  width={300}
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
            
            {/* GIF Picker */}
            {isGifPickerOpen && (
              <div 
                ref={gifPickerRef}
                className="absolute bottom-12 right-0 z-10 shadow-lg rounded-lg"
              >
                <GifPicker onSelect={handleGifSelect} />
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="ml-2"
            disabled={(!message && !selectedFile) || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? <Loader size={18} /> : <Send size={18} />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;