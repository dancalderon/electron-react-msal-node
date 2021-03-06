/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config()

const path = require('path');
const { app, ipcMain, BrowserWindow } = require('electron');
const { IPC_MESSAGES } = require('./constants');

const { callEndpointWithToken } = require('./fetch');
const AuthProvider = require('./AuthProvider');

const authProvider = new AuthProvider();
let mainWindow;
const isProd = process.env.NODE_ENV === 'production';

function createWindow () {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: __dirname + '/preload.js',
      }
    })


    if (!isProd) {
        console.log('loading prod url');
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, './index.html'));
    }
    
  }

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});


// Event handlers
ipcMain.on(IPC_MESSAGES.LOGIN, async() => {
    const account = await authProvider.login(mainWindow);

    await mainWindow.loadFile(path.join(__dirname, './index.html'));

    mainWindow.webContents.send(IPC_MESSAGES.SHOW_WELCOME_MESSAGE, account);
});

ipcMain.on(IPC_MESSAGES.LOGOUT, async() => {
    await authProvider.logout();
    await mainWindow.loadFile(path.join(__dirname, './index.html'));
});

ipcMain.on(IPC_MESSAGES.GET_PROFILE, async() => {

    const tokenRequest = {
        scopes: ['User.Read'],
    };

    const token = await authProvider.getToken(mainWindow, tokenRequest);
    const account = authProvider.account

    await mainWindow.loadFile(path.join(__dirname, './index.html'));

    const graphResponse = await callEndpointWithToken(`https://graph.microsoft.com/v1.0/me`, token);

    mainWindow.webContents.send(IPC_MESSAGES.SHOW_WELCOME_MESSAGE, account);
    mainWindow.webContents.send(IPC_MESSAGES.SET_PROFILE, graphResponse);
});

ipcMain.on(IPC_MESSAGES.GET_MAIL, async() => {

    const tokenRequest = {
        scopes: ['Mail.Read'],
    };

    const token = await authProvider.getToken(mainWindow, tokenRequest);
    const account = authProvider.account;

    await mainWindow.loadFile(path.join(__dirname, './index.html'));

    const graphResponse = await callEndpointWithToken(`https://graph.microsoft.com/v1.0/me/messages`, token);

    mainWindow.webContents.send(IPC_MESSAGES.SHOW_WELCOME_MESSAGE, account);
    mainWindow.webContents.send(IPC_MESSAGES.SET_MAIL, graphResponse);
});
