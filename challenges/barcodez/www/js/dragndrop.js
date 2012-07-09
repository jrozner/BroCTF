$(document).ready(function() {
  init();
});

function init() {
  // Add drag handling to target elements
  document.querySelector('#dropzone').addEventListener("dragenter", onDragEnter, false);
  document.querySelector('#dropzone').addEventListener("dragleave", onDragLeave, false);
  document.querySelector('#dropzone').addEventListener("dragover", noopHandler, false);

  // Add drop handling
  document.querySelector('#dropzone').addEventListener("drop", onDrop, false);
}

function noopHandler(evt) {
  evt.stopPropagation();
  evt.preventDefault();
}

function onDragEnter(evt) {
  document.querySelector('#dropzone p').innerText = 'Release File to Upload';
}

function onDragLeave(evt) {
  document.querySelector('#dropzone p').innerText = 'Drop Barcode Here';
}

function onDrop(evt) {
  // Consume the event.
  noopHandler(evt);
  document.querySelector('#dropzone p').innerText = 'Drop Barcode Here';

  // Get the dropped files.
  var files = evt.dataTransfer.files;

  // If anything is wrong with the dropped files, exit.
  if(typeof files === "undefined" || files.length !== 1)
    return;

  uploadFile(files[0]);
}

function uploadFile(file) {
  var reader = new FileReader();

  // Handle errors that might occur while reading the file (before upload).
  reader.onerror = function(evt) {
    var message;

    // REF: http://www.w3.org/TR/FileAPI/#ErrorDescriptions
    switch(evt.target.error.code) {
      case 1:
        message = file.name + " not found.";
        break;

      case 2:
        message = file.name + " has changed on disk, please re-try.";
        break;

      case 3:
        messsage = "Upload cancelled.";
        break;

      case 4:
        message = "Cannot read " + file.name + ".";
        break;

      case 5:
        message = "File too large for browser to upload.";
        break;
    }

    document.querySelector('p#msg').innerText = message;
  }

  // When the file is done loading, POST to the server.
  reader.onloadend = function(evt) {
    var data = evt.target.result;

    // Make sure the data loaded is long enough to represent a real file.
    if (data.length > 128) {
      /*
       * Per the Data URI spec, the only comma that appears is right after
       * 'base64' and before the encoded content.
       */
      var base64StartIndex = data.indexOf(',') + 1;

      /*
       * Make sure the index we've computed is valid, otherwise something 
       * is wrong and we need to forget this upload.
       */
      if (base64StartIndex < data.length) {
        $.ajax({
          type: 'POST',
          url: '/upload.php',
          data: 'file='+data.substring(base64StartIndex), // Just send the Base64 content in POST body
          processData: false, // No need to process
          timeout: 60000, // 1 min timeout
          beforeSend: function onBeforeSend(xhr, settings) {
            // Put the important file data in headers
            xhr.setRequestHeader('x-file-name', file.name);
            xhr.setRequestHeader('x-file-size', file.size);
            xhr.setRequestHeader('x-file-type', file.type);

            // Update status
            document.querySelector('p#msg').innerText = "Uploading and Processing " + file.name + "...";
          },
          error: function onError(XMLHttpRequest, status, error) {
            if(textStatus === 'timeout') {
              document.querySelector('msg#p').innerText = 'Upload was taking too long and was stopped.';
            } else {
              document.querySelector('p#msg').innerText = 'An error occurred while uploading the image.';
            }
          },
          success: function onUploadComplete(data, status) {
            // If the parse operation failed (for whatever reason) bail
            if ((status === undefined) || (status !== 'success')) {
              // Error, update the status with a reason as well.
              document.querySelector('p#msg').innerText = 'Upload failed.';
              return;
            }

            document.querySelector('p#msg').innerText = data.msg;
          }
        });
      }
    }
  }

  // Start reading the image off disk into a Data URI format.
  reader.readAsDataURL(file);
}
