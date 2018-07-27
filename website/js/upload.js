/*global IronMaps _config*/

var IronMaps = window.IronMaps || {};
IronMaps.map = IronMaps.map || {};

(function rideScopeWrapper($) {
    var authToken;
    IronMaps.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });

    //uploads the actual file to s3 using one-time URL
    function uploadFileToS3(result) {
        console.log('Response received from API: ', result);
        // TODO: make this link to the new map
        displayUpdate('Map created at '+result.MapId)

        let fileChooser = document.getElementById('fileChooser');
        let file = fileChooser.files[0];
        // Specify the S3 upload parameters

        $.ajax({
            method: 'PUT',
            url: result.url,
            // headers: {
            //   ContentType: "image/gif"
            //     Authorization: authToken
            // },
            processData: false,
            data: file,
            success: displayUpdate,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                displayUpdate('An error occured when uploading your map file:\n' + jqXHR.responseText);
            }
        });
    }

    function getMapTitle() {
      return document.getElementById('mapTitle').value;
    }

    function getMapInfo() {
      return document.getElementById('mapInfo').value;
    }

    function getMapDescription() {
      return document.getElementById('mapDescription').value;
    }

    // Grab a reference to the upload button
    let uploadButton = document.getElementById('uploadButton');

    // Make the button respond to clicks
    uploadButton.addEventListener('click', function() {
      console.log('button clicked');
      let fileChooser = document.getElementById('fileChooser');
      let file = fileChooser.files[0];

      // Check that the user has specified a file to upload
      if (!file) {
        displayUpdate("You must choose a file to upload!");
        return;
      }

      // Check the MIME type is an image
      if (file.type.indexOf("image") == -1) {
        displayUpdate("You may only upload images");
        return;
      }

      // Get the gallery name and check that it isn't empty
      let mapTitle = getMapTitle();
      if (!mapTitle) {
        displayUpdate("You need to enter a map title name");
        return;
      }
      let mapInfo = getMapInfo();
      let mapDescription = getMapDescription();


      $.ajax({
          method: 'POST',
          url: _config.api.invokeUrl + '/maps',
          headers: {
              Authorization: authToken
          },
          data: JSON.stringify({
            Title: mapTitle,
            Description: mapDescription,
            IsPublic: true,
            MapInfo: mapInfo
          }),
          contentType: 'application/json',
          success: uploadFileToS3,
          error: function ajaxError(jqXHR, textStatus, errorThrown) {
              console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
              console.error('Response: ', jqXHR.responseText);
              displayUpdate('An error occured when uploading your map:\n' + jqXHR.responseText);
          }
      });
    });

    // Register click handler for #request button
    $(function onDocReady() {
        $('#mapForm').submit(function () {
         // sendContactForm();
         return false;
        });
        $('#request').click(handleRequestClick);
        $('#signOut').click(function() {
            IronMaps.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });

        IronMaps.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
