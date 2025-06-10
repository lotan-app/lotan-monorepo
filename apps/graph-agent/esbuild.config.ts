const { esbuildDecorators } = require('@anatine/esbuild-decorators');

module.exports = {
  loader: {
    '.node': 'copy',
  },
  outExtension: {
    '.js': '.js',
  },
  keepNames: true,
  plugins: [esbuildDecorators()],
};
