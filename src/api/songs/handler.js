class SongsHandler {
  constructor(services, validator) {
    this._services = services;
    this._validator = validator;
  };

  async postSongHandler(request, h) {
    await this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } = request.payload;
    
    const songId = await this._services.addSong({title, year, genre, performer, duration, albumId});

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  };

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;


    const songs = await this._services.getSongs(title, performer);
    
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  };

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._services.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    await this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const { title, year, genre, performer, duration, albumId } = request.payload;

    await this._services.editSongById(id, { title, year, genre, performer, duration, albumId });

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  };

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._services.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song berhasil dihapus'
    }
  };
};

module.exports = SongsHandler;