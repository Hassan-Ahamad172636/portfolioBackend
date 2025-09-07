// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (error) {
    console.log(error)
  }
};

export default asyncHandler;
