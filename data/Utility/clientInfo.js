const os = require('os');
const axios = require('axios');
const macaddress = require('macaddress');

const getLocalIP = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaceInfo = networkInterfaces[interfaceName];
    for (const addressInfo of interfaceInfo) {
      if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
        return addressInfo.address;
      }
    }
  }
  return null;
};

const getPublicIP = async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching public IP:', error);
    return null;
  }
};

const getMacAddress = async () => {
  return await macaddress.one();
};

const getClientInfo = async () => {
  try {
    const localIP = getLocalIP();  // Synchronous
    const publicIP = await getPublicIP();  // Asynchronous
    const macAddress = await getMacAddress();  // Asynchronous

    return {
      localIP,
      publicIP,
      macAddress
    };
  } catch (error) {
    console.error('Error fetching client info:', error);
    throw new Error('Unable to retrieve client information.');
  }
};

module.exports = {
  getClientInfo
};