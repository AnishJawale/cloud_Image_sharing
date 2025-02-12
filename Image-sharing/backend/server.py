import boto3
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# AWS S3 Configuration
S3_BUCKET = "image-sharing2"  
AWS_REGION = "eu-north-1"

# Singining process
session = boto3.session.Session()
s3 = session.client(
    "s3",
    region_name=AWS_REGION,
    config=boto3.session.Config(signature_version="s3v4")  # v4 signature
)

@app.route("/upload", methods=["POST"])
def upload_image():
    try:
        data = request.json
        file_name = data.get("file_name")
        file_content = data.get("file_content")

        if not file_name or not file_content:
            return jsonify({"message": "Missing file name or content"}), 400

        # Base64 conv
        image_data = base64.b64decode(file_content)

        # Uploading to S3 
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=file_name,
            Body=image_data,
            ContentType="image/jpeg",
            ContentDisposition=f"attachment; filename={file_name}"  
        )

        # Pre - Signed Url logic
        download_url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": file_name,
                "ResponseContentDisposition": f"attachment; filename={file_name}"  
            },
            ExpiresIn=86400,  # Link life
        )

        return jsonify({"message": "Upload successful", "download_url": download_url}), 200

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
