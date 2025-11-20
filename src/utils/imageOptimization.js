/**
 * Image optimization utilities for faster upload and processing
 */

/**
 * Resize and optimize an image file
 * @param {File} file - The original image file
 * @param {number} maxDimension - Maximum width or height in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<{blob: Blob, dataUrl: string}>} Optimized image blob and data URL
 */
export const optimizeImage = async (file, maxDimension = 1024, quality = 0.85) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error('Failed to read image file'));

        reader.onload = (e) => {
            const img = new Image();

            img.onerror = () => reject(new Error('Failed to load image'));

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDimension) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to create image blob'));
                            return;
                        }

                        // Also create data URL for preview
                        const dataUrl = canvas.toDataURL('image/jpeg', quality);

                        resolve({ blob, dataUrl });
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Get the size reduction percentage
 * @param {number} originalSize - Original file size in bytes
 * @param {number} optimizedSize - Optimized file size in bytes
 * @returns {number} Percentage reduction
 */
export const getSizeReduction = (originalSize, optimizedSize) => {
    return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
};
