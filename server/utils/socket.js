// Socket.io instance reference
let io;

// Set IO instance
export const setIo = (ioInstance) => {
  io = ioInstance;
};

// Get IO instance
export const getIo = () => {
  return io;
};