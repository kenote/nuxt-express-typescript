// Backpack Configuration file
const path = require('path')

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry = {
      index: './server/index.ts',
      initialize: './tools/initialize.ts'
    }

    config.resolve = {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@': __dirname,
        '~': path.join(__dirname, 'server')
      }
    }

    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader',
      options: {
        configFileName: 'server/tsconfig.json'
      }
    })
    return config
  }
}