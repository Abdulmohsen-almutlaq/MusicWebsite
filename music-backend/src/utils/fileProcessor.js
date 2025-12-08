const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

/**
 * Optimizes an uploaded cover image and deduplicates it using content hashing.
 * Resizes to 500x500, converts to JPEG, and compresses.
 * If an identical image already exists, it reuses it.
 * 
 * @param {string} filePath - The absolute path to the uploaded image.
 * @returns {Promise<string>} - The filename of the optimized image.
 */
exports.optimizeCoverImage = async (filePath) => {
  try {
    const dir = path.dirname(filePath);
    
    // 1. Process image to buffer first
    const buffer = await sharp(filePath)
      .resize(500, 500, { 
        fit: 'cover',
        position: 'center' 
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    // 2. Calculate Hash of the optimized image
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const optimizedFilename = `${hash}.jpg`;
    const optimizedPath = path.join(dir, optimizedFilename);

    // 3. Check if file already exists (Deduplication)
    if (await fs.pathExists(optimizedPath)) {
      // File exists, just delete the temp upload and return existing name
      await fs.remove(filePath);
      return optimizedFilename;
    }

    // 4. Save the new unique file
    await fs.writeFile(optimizedPath, buffer);

    // 5. Delete the original large file
    await fs.remove(filePath);

    return optimizedFilename;
  } catch (error) {
    console.error('Image optimization failed, keeping original:', error);
    // If optimization fails, keep the original file
    return path.basename(filePath);
  }
};
