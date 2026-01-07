import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs'; 
import * as path from 'path'; 


const UPLOAD_DIR = path.resolve('./uploads');

export const storageConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
     
      if (!fs.existsSync(UPLOAD_DIR)) {
         fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      
      cb(null, UPLOAD_DIR);     
    },
    filename: (req, file, cb) => {
        
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    // Permite pdf, jpg, jpeg e vídeos (mp4, avi, mov, mkv)
    if (!file.originalname.match(/\.(pdf|jpg|jpeg|mp4|avi|mov|mkv)$/)) {
      return cb(new Error('Apenas arquivos PDF, JPG, JPEG, MP4, AVI, MOV ou MKV são permitidos!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // Limite de 50MB por arquivo (aumentado para vídeos)
  },
};