const path = require('path');
const { app, BrowserWindow, shell } = require('electron');
const { startServer } = require('../server');

const API_PORT = Number(process.env.ELECTRON_API_PORT || 3960);
const API_URL = `http://127.0.0.1:${API_PORT}/api/v1`;

let mainWindow;
let backendServer;

const isDev = Boolean(process.env.ELECTRON_START_URL);

const isAllowedNavigation = (url) => {
  if (isDev) {
    return url.startsWith(process.env.ELECTRON_START_URL);
  }

  return url.startsWith('file://');
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: isDev,
      additionalArguments: [`--hishob-api-url=${API_URL}`],
    },
  });

  const startUrl = process.env.ELECTRON_START_URL;

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }

    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
    }
  });

  if (startUrl) {
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  mainWindow.loadFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
};

const boot = async () => {
  const started = await startServer({ port: API_PORT });
  backendServer = started.server;
  createWindow();
};

app.whenReady().then(boot);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  if (backendServer) {
    await new Promise((resolve, reject) => {
      backendServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    }).catch(() => {});
  }
});
