import { diskStorage } from 'multer';
import { extname } from 'path';


export const storageConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Pasta onde os arquivos serão salvos
      cb(null, './uploads');
    },
    filename: (req, file, cb) => {
      // Gera um nome único para cada arquivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    // Permite apenas pdf, jpg e jpeg
    if (!file.originalname.match(/\.(pdf|jpg|jpeg)$/)) {
      return cb(new Error('Apenas arquivos PDF, JPG ou JPEG são permitidos!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB por arquivo
  },
};
