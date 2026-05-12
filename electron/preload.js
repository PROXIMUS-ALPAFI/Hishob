const { contextBridge } = require('electron');

const apiArgument = process.argv.find((arg) => arg.startsWith('--hishob-api-url='));
const apiUrl = apiArgument ? apiArgument.replace('--hishob-api-url=', '') : '';

contextBridge.exposeInMainWorld('hishobDesktop', {
  apiUrl,
});
