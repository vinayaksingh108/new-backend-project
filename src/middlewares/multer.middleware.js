
import multer from 'multer'
//disk storgae is better bcz memo stoarge is more limited than disk 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
  
    cb(null, file.originalname)
  }
})

export const upload = multer({
    storage,})