const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const employeeId = req.body.employeeId;
    if (!employeeId) {
      return cb(new Error("Employee ID is missing"), null);
    }

    const employeeDir = `uploads/${employeeId}`;
    if (!fs.existsSync(employeeDir)) {
      fs.mkdirSync(employeeDir, { recursive: true });
    }
    cb(null, employeeDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Helper function to generate possible previous file names
function generatePreviousFileNames(currentFileName) {
  const timestampStr = currentFileName.split(".")[0]; // Extract timestamp part

  const [datePart, timePart] = timestampStr.split("_");
  const utcTime = new Date(`${datePart}T${timePart.replace(/-/g, ":")}.000Z`); // Treat timestamp as UTC

  // Convert UTC to server's local time zone (e.g., EST)
  const localTime = new Date(utcTime.getTime());

  // Generate possible times based on the local time
  const possibleTimes = [
    new Date(localTime.getTime() - 29000), // 29 seconds earlier
    new Date(localTime.getTime() - 30000), // 30 seconds earlier
    new Date(localTime.getTime() - 31000), // 31 seconds earlier
    new Date(localTime.getTime() - 32000), // 32 seconds earlier
  ];

  // Format possible times back to UTC format for comparison
  return possibleTimes.map(
    (time) =>
      `${time.getUTCFullYear()}-${String(time.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${String(time.getUTCDate()).padStart(2, "0")}_` +
      `${String(time.getUTCHours()).padStart(2, "0")}-${String(
        time.getUTCMinutes()
      ).padStart(2, "0")}-${String(time.getUTCSeconds()).padStart(2, "0")}.jpg`
  );
}

// Function to compare images
async function areImagesIdentical(image1Path, image2Path) {
  try {
    // Read both files into buffers
    const [file1Buffer, file2Buffer] = await Promise.all([
      fs.promises.readFile(image1Path),
      fs.promises.readFile(image2Path),
    ]);

    // Create sharp instances from buffers
    const [img1, img2] = [sharp(file1Buffer), sharp(file2Buffer)];

    // Get metadata for both images
    const [img1Metadata, img2Metadata] = await Promise.all([
      img1.metadata(),
      img2.metadata(),
    ]);

    // Crop heights by removing the bottom 60 pixels
    const cropHeight1 = img1Metadata.height - 60;
    const cropHeight2 = img2Metadata.height - 60;

    // Check if dimensions mismatch
    if (
      img1Metadata.width !== img2Metadata.width ||
      cropHeight1 !== cropHeight2
    ) {
      return false;
    }

    // Resize both images to the cropped dimensions for comparison
    const [img1CroppedBuffer, img2CroppedBuffer] = await Promise.all([
      img1
        .extract({
          left: 0,
          top: 0,
          width: img1Metadata.width,
          height: cropHeight1,
        })
        .resize(64, 64)
        .raw()
        .toBuffer(),
      img2
        .extract({
          left: 0,
          top: 0,
          width: img2Metadata.width,
          height: cropHeight2,
        })
        .resize(64, 64)
        .raw()
        .toBuffer(),
    ]);

    // Compare the cropped buffers in chunks for better performance
    const chunkSize = 128; // Compare 1024 bytes at a time
    for (let i = 0; i < img1CroppedBuffer.length; i += chunkSize) {
      const chunk1 = img1CroppedBuffer.slice(i, i + chunkSize);
      const chunk2 = img2CroppedBuffer.slice(i, i + chunkSize);

      if (!chunk1.equals(chunk2)) {
        return false; // Return immediately on mismatch
      }
    }

    // If all chunks match, the images are identical
    return true;
  } catch (error) {
    console.error("Error comparing images:", error);
    return false;
  }
}

// Upload endpoint
router.post("/", upload.single("screenshot"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "File upload failed" });
  }

  const employeeId = req.body.employeeId;
  const employeeDir = `uploads/${employeeId}`;
  const currentFilePath = `${req.file.destination}/${req.file.originalname}`;

  try {
    // Generate possible previous file names
    const possiblePreviousFiles = generatePreviousFileNames(
      req.file.originalname
    );

    // Check if any of the possible previous files exist
    const existingPreviousFile = possiblePreviousFiles.find((file) =>
      fs.existsSync(path.join(employeeDir, file))
    );

    if (existingPreviousFile) {
      const existingFilePath = path.join(employeeDir, existingPreviousFile);

      //   Compare the current file with the existing previous file
      const isIdentical = await areImagesIdentical(
        existingFilePath,
        currentFilePath
      );

      if (isIdentical) {
        try {
          // First change permissions
          await fs.promises.chmod(existingFilePath, 0o666);
          // Then delete
          await fs.promises.unlink(existingFilePath);
          console.log(
            "File deleted successfully by identical check: ",
            existingFilePath
          );
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    }

    console.log("File uploaded successfully: ", currentFilePath);

    res.status(200).send({
      message: "File uploaded successfully",
      filePath: currentFilePath,
    });
  } catch (error) {
    console.error("Error processing uploaded file:", error);
    res
      .status(500)
      .send({ error: "An error occurred while processing the file" });
  }
});

module.exports = router;
