import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageResizeService {
  constructor() { }

  resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx!.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob as Blob], file.name, { type: 'image/jpeg' });
              resolve(resizedFile);
            },
            'image/jpeg',
            0.9
          );
        };

        img.onerror = (error) => {
          reject(error);
        };

        img.src = event.target.result;
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }
}
