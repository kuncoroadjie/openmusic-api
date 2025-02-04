const fs = require('fs');
const config = require('../../utils/config');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    this._baseUrl = `http://${config.app.host}:${config.app.port}/albums/covers`;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  getFileUrl(filename) {
    return `${this._baseUrl}/${filename}`;
  }
}

module.exports = StorageService;
