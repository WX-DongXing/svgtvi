import svgtvi from '@svgtvi/core'

svgtvi({
  input: '../../svgs',
  clean: true,
  plugins: [
    {
      name: 'preview',
      params: {
        name: 'Svgtvi Icon',
        version: '0.1.0',
        description: 'svgtvi icons',
        repository: 'https://github.com/WX-DongXing/svgtvi.git'
      }
    }
  ]
})
  .then(() => {
    console.log('Build Successful!')
  })
  .catch(error => {
    console.error('Build Failed! ', error)
  })
