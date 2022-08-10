import svgtvi from '@svgtvi/core'

svgtvi({
  input: '../../svgs',
  clean: true,
  plugins: [
    {
      name: 'preview',
      params: {}
    }
  ]
})
  .then(() => {
    console.log('Build Successful!')
  })
  .catch(error => {
    console.error('Build Failed! ', error)
  })
