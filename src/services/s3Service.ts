import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME || "";
if (!S3_BUCKET) {
  throw new Error("AWS_S3_BUCKET_NAME is not defined");
}

export const uploadToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  const fileExtension = file.originalname.split(".").pop();
  const key = `${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();
  return data.Location; // data.Location is the URL of the uploaded file
};
