import express, { Request, Response, NextFunction } from 'express';

export const fileHandlerMiddleware = express.Router();

interface FileRequest extends Request {
  body: {
    files?: {
      profileImage?: string;
      cv?: string;
    };
  };
}

// Add middleware to handle base64 data and validate sizes
const handleFiles = async (
    req: FileRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
  if (req.body?.files) {
    const { files } = req.body;
    
    try {
      // Handle profile image
      if (files.profileImage) {
        const base64Data = files.profileImage.replace(/^data:image\/\w+;base64,/, '');
        // Check decoded size (base64 is about 33% larger than the original)
        const decodedSize = Buffer.from(base64Data, 'base64').length;
        if (decodedSize > 5 * 1024 * 1024) { // 5MB
          res.status(413).json({ 
            error: 'Profile image size exceeds limit of 5MB' 
          });
          return;
        }
        req.body.files.profileImage = base64Data;
      }
      
      // Handle CV
      if (files.cv) {
        const base64Data = files.cv.replace(/^data:application\/\w+;base64,/, '');
        const decodedSize = Buffer.from(base64Data, 'base64').length;
        if (decodedSize > 5 * 1024 * 1024) { // 5MB
          res.status(413).json({ 
            error: 'CV file size exceeds limit of 5MB' 
          });
          return;
        }
        req.body.files.cv = base64Data;
      }
      
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Invalid file data' 
      });
      return;
    }
  } else {
    next();
  }
};

fileHandlerMiddleware.use(handleFiles); 