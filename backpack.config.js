// Backpack Configuration file
module.exports = {
  webpack: (config, options, webpack) => {
    config.entry = {
      index: './server/index.ts'
    }

    config.resolve = {
      extensions: ['.ts', '.js', '.json']
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