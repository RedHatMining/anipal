const { app, BrowserWindow } = require("electron");
const path = require("path");

// Import IPC handlers so Electron registers them
require("./ipcHandlers");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);
