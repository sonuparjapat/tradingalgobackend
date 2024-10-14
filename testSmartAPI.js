const smartApiModule = require('smartapi-javascript');
console.log(smartApiModule)// or try named export as above

try {
    console.log(  smartApiModule.default || smartApiModule.SmartAPI)

    // const smart_api = new SmartAPI({
    //     api_key: 'your_api_key_here', // Replace with your actual API key
    //     access_token: 'your_access_token_here' // Replace with a valid access token
    // });

    // console.log('SmartAPI instantiated successfully:', smart_api);
} catch (error) {
    console.error('Error instantiating SmartAPI:', error);
}