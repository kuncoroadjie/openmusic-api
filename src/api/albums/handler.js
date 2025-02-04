class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async editAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Data album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this._validator.validateCoverAlbumImageHeaders(cover.hapi.headers);

    await this._service.getAlbumById(id);
    await this._service.updateAlbumCover({ id, cover });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikesByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.getAlbumById(albumId);
    await this._service.checkUserHasLikedAlbum(credentialId, albumId);
    await this._service.addAlbumLikes(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'likes berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.getAlbumById(id);
    const albumLikesData = await this._service.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: albumLikesData.data,
      },
    });

    if (albumLikesData.isCache) {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);
    return response;
  }

  async deleteAlbumLikesByIdHandler(request) {
    const { id: albumId } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);
    await this._service.deleteAlbumLikes(credentialId, albumId);

    return {
      status: 'success',
      message: 'Likes berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
