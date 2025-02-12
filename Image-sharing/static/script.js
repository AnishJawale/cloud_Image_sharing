async function uploadImage() {
    const input = document.getElementById("imageInput");
    if (input.files.length === 0) {
        alert("Please select an image first.");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();
     // Base64 conversion 
    reader.onloadend = async function () {
        const base64String = reader.result.split(",")[1];  
        const payload = {
            file_name: file.name,
            file_content: base64String
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                const imageUrl = `https://image-sharing2.s3.eu-north-1.amazonaws.com/${file.name}`;
                
                //  Download Link 
                const downloadLink = document.getElementById("downloadLink");
                downloadLink.href = imageUrl;
                downloadLink.download = file.name;
                downloadLink.style.display = "block";

                // Show Copy Link 
                const copyButton = document.getElementById("copyLinkButton");
                copyButton.setAttribute("data-url", imageUrl);
                copyButton.style.display = "block";
            } else {
                alert("Upload failed: " + data.message);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Upload failed: " + error.message);
        }
    };

    reader.readAsDataURL(file);
}

// Function to copy the download link
function copyDownloadLink() {
    const copyButton = document.getElementById("copyLinkButton");
    const imageUrl = copyButton.getAttribute("data-url");

    navigator.clipboard.writeText(imageUrl).then(() => {
        alert("Download link copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy link: ", err);
        alert("Failed to copy link.");
    });
}
