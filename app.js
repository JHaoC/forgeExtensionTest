
let viewer = null;

const data = {
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiTHpoeXJDeEZHVDZzdmdyRXRHOXRpM2pYdTdUcHR3ejUiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoicUljSGFjSHhxcXlGOTB5OEh4VFNWcDV6Q3ZqTXU4Y2d2aGdBVVZwMlNGOGN2YzA3MkIwd1hEelRZbUFNeGVNdSIsInVzZXJpZCI6IlpOWkpORk4yUk5BVCIsImV4cCI6MTY0NDMzNzg4M30.e7-z6Xv-bezvf56Ip8KUcP15QSfVQLqAhWHGsgQw4tl9Df3ICSJK0mGqHIGE3bi-h_Yjf96eCEL0-a8E7jjoleeHdFirgRaoWWREIxjaAyqZH6yoSiTA6tpdKbNh6skU_AM6au15K5xaplmoPUnV0M4MH9P-UmRPB3Y5HfG6ZOfEZHVaRtEAxmQNXpgupUGs7oncyBijSAmfg2mdgBbckX9-PAMa0jjV0_cfhOKQhRwo18OSsev08xlTeE6S0VKci83XnJiTwIFOrJtgZJ2_HvwioMlTE4DIwbKaPZ06fEU-oDI05a0dsumLLGF2GYjBM7Cmajf3-gajeZYusxgJmA",
  "refresh_token": "RXonvHeXtrwqi0w6hOjYYjbSqd7KKxECstuDw8Xp9q",
  "expires_in": "3599",
  "token_type": "Bearer"
}

function setupViewer(divId, documentId, tokenFetchingUrl, exrtensionArray) {

  let options = {
    env: 'AutodeskProduction',
    getAccessToken: (onGetAccessToken) => {
      // fetch(tokenFetchingUrl)
      //   .then(response => response.json())
      //   .then(data => {

          let accessToken = data["access_token"];
          let expireTimeSeconds = data["expires_in"];
          onGetAccessToken(accessToken, expireTimeSeconds);
        // })
    }
  };

  var config3d = { extensions: exrtensionArray };
  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId), config3d);
    viewer.start(null, null, null, null, {
      webglInitParams: {
        useWebGL2: false
      }
    });
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });

  function onDocumentLoadSuccess(doc) {
    var viewables = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, viewables).then(i => {
      // documented loaded, any action?
    });
  }

  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }
}
