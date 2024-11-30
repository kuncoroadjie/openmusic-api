class AlbumsHandler {
  constructor(services, validator){
    this._services = services;
    this._validator = validator;
  };

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._services.addAlbum({name, year});

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  };

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._services.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album
      },
    };
  };

  async editAlbumByIdHandler(request, h) {    
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._services.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Data album berhasil diperbarui',
    };
  };

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._services.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus'
    };
  };
  
}

module.exports = AlbumsHandler;