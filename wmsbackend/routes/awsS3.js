const {S3} = require("aws-sdk");
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");

const {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');

const dotenv=require('dotenv');
dotenv.config();

exports.s3UploadsV3=async(file)=>{
  
    const s3Client = new S3Client(
        {
            credentials:{
                accessKeyId:"AKIAQYREOLTWIOYNJLMR",
                secretAccessKey:"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"
            },
            region:"us-east-2"
        }
    );
    const param={
        Bucket:"wmsproducts",
        Key:file.originalname,
        Body:file.buffer
    };
   return s3Client.send(new PutObjectCommand(param));

}