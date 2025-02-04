class AuthenticationsHandler {
  constructor(usersService, authenticationsService, tokenManager, validator) {
    this._usersService = usersService;
    this._authenticationsService = authenticationsService;
    this._tokenManager = tokenManager;
    this._validator = validator;
  }

  async postRefreshTokenHandler(request, h) {
    await this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;

    const id = await this._usersService.verifyUserCredential(username, password);
    const accessToken = await this._tokenManager.generateAccessToken({ id });
    const refreshToken = await this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putRefreshTokenHandler(request) {
    await this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = await this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = await this._tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteRefreshTokenHandler(request) {
    await this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
