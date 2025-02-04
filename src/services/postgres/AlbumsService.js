const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(storageService, cacheService) {
    this._storageService = storageService;
    this._cacheService = cacheService;
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT into albums VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal dalam membuat album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT id, name, year, cover FROM albums where id = $1',
      values: [id],
    };

    const album = await this._pool.query(queryAlbum);

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songs = await this._pool.query(querySongs);

    if (!album.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const albumData = album.rows[0];
    const coverUrl = albumData.cover ? this._storageService.getFileUrl(albumData.cover) : null;

    const transformedAlbum = {
      id: albumData.id,
      name: albumData.name,
      year: albumData.year,
      coverUrl,
      songs: songs.rows,
    };

    return transformedAlbum;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
    }
  }

  async updateAlbumCover({ id, cover }) {
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET cover = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [filename, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async checkUserHasLikedAlbum(userId, albumId) {
    const query = {
      text: 'SELECT 1 FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length) {
      throw new InvariantError('Gagal menambahkan likes. Anda sudah menyukai album ini');
    }
  }

  async addAlbumLikes(userId, albumId) {
    const id = `likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan likes');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async getAlbumLikes(id) {
    try {
      const albumLikesCount = await this._cacheService.get(`album_likes:${id}`);

      return {
        isCache: true,
        data: JSON.parse(albumLikesCount),
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const albumLikesCount = await this._pool.query(query);

      await this._cacheService.set(`album_likes:${id}`, albumLikesCount.rowCount);

      return {
        isCache: false,
        data: albumLikesCount.rowCount,
      };
    }
  }

  async deleteAlbumLikes(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus likes');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }
}

module.exports = AlbumsService;
