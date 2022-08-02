const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;

class Observer extends EventEmitter {
  constructor() {
    super();
  }

  watchFolder(folder) {
    try {
      console.log(
        `[${new Date().toLocaleString()}] Watching for folder changes on: ${folder}`
      );

      const watcher = chokidar.watch(
        folder,
        {
          persistent: true,
          awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
          }
        }
      );

      watcher.on('add', async filePath => {
        // Only fire an event if a .json file is created
        if (filePath.includes('.json')) {
          console.log(
            `[${new Date().toLocaleString()}] ${filePath} has been added.`
          );

          // emit an event when new file has been added
          const DELAY_BEFORE_WRITE = 1000;
          setTimeout(() => {
            this.emit('json-file-added', {
              filePath
            });
          }, DELAY_BEFORE_WRITE);
        } else if (filePath.includes('.mp4') && !filePath.includes('-compressed.mp4') && !filePath.includes('.mp4.meta')) {
          console.log(
            `[${new Date().toLocaleString()}] ${filePath} has been added.`
          );

          const DELAY_BEFORE_WRITE = 5000;
          setTimeout(() => {
            this.emit('mp4-file-added', {
              filePath
            });
          }, DELAY_BEFORE_WRITE);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Observer;
