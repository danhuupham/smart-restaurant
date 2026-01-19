import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'smart-restaurant/products' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result!);
                },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string): Promise<any> {
        try {
            return await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Failed to delete image from Cloudinary:', error);
        }
    }
}
