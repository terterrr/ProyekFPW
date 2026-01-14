export const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:3001/api/v1`;
};
