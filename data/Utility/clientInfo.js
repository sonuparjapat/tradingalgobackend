const internalIp = require('internal-ip');
const publicIp = require('public-ip');
const macaddress = require('macaddress');

 const getClientInfo = async () => {
  try {
    const localIP = await internalIp.v4();
    const publicIP = await publicIp.v4();
    const macAddress = await macaddress.one();

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
module.exports=getClientInfo