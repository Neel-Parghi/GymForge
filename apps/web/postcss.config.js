module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.html',
        './src/**/*.ts'
      ],
      defaultExtractor: content => content.match(/[^<>'"\s]*[^<>'"\s:]/g) || []
    })
  ]
};
