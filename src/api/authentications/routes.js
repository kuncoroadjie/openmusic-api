const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: (request, h) => handler.postRefreshTokenHandler(request, h),
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: (request, h) => handler.putRefreshTokenHandler(request, h),
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: (request, h) => handler.deleteRefreshTokenHandler(request, h),
  },
];

module.exports = routes;
