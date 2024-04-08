import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    const timeStamp = String(new Date()).replace(/:/g, '-')
    cb(null, timeStamp + '_' + file.originalname)
  },
})

const upload = multer({ storage })

export { upload }
