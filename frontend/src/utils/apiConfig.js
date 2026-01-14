export const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  return `https://${hostname}/api/v1`;
};
