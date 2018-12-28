"use strict";

// Electronのモジュール
const electron = require("electron");

// その他モジュール
const fs = require('fs')
const os = require('os')
const path = require('path')

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウ
let mainWindow = null;

// プロセス間通信
const ipc = electron.ipcMain

// シェル
const shell = electron.shell

// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});

// PDF印刷
ipc.on('print-to-pdf', function(event) {
  const pdfPath = path.join(os.tmpdir(), 'print.pdf')
  const win = BrowserWindow.fromWebContents(event.sender)
  win.webContents.printToPDF({}, function(error, data) {
    if (error) throw error
      fs.writeFile(pdfPath, data, function(error) {
      if (error) {
        throw error
      }
      shell.openExternal('file://' + pdfPath)
      event.sender.send('wrote-pdf', pdfPath)
    })
  })
})

// Electronの初期化完了後に実行
app.on("ready", () => {

  //ウィンドウサイズを1280*720（フレームサイズを含まない）に設定する
  mainWindow = new BrowserWindow({width: 1280, height: 720, useContentSize: true});

  //使用するhtmlファイルを指定する
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // ウィンドウが閉じられたらアプリ終了
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  
});
