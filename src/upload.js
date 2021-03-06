
const AWS = require("aws-sdk");
//const aws_sns = require("aws-sdk/clients/sns");
const s3 = new AWS.S3();
const sns = new AWS.SNS();

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

module.exports.handler = async (event) => {   
    console.log(event);

    const response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({ message: "Successfully uploaded file to S3!" }),
    };


    

    try {
        const parsedBody = JSON.parse(event.body);
        const base64File = parsedBody.file;
        const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const params = {
            Bucket: BUCKET_NAME,
            Key: `images/${new Date().toISOString()}.jpeg`,
            Body: decodedFile,
            ContentType: "image/jpeg",
        };


        const uploadResult = await s3.upload(params).promise();

        response.body = JSON.stringify({ message: "Successfully uploaded file to s3!", uploadResult });

        // SNS BLOCK
        const sns_params = {
            Message: eventText,
            Subject: "Send SNS when Lambda executes succesfully",
            TopicArn: "arn:aws:sns:ap-south-1:485693203213:LambdaCall"
        };
        if(response===true){
        sns.publish(sns_params, "SuccessCode");
        }
        else{
            console.log("Error");
        }
    
    } catch(e) {
        console.error(e);
        response.body = JSON.stringify({ message: "Failed to upload to s3", errorMessage: e });
        response.statusCode = 500;
    }

    return response;
};
