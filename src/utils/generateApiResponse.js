// utils/generateApiResponse.js
const generateApiResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    message,
    data,
    statusCode,
  };
};

export default generateApiResponse;
