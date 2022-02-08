
let viewer = null;

const data = {"access_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiTHpoeXJDeEZHVDZzdmdyRXRHOXRpM2pYdTdUcHR3ejUiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiaE1YeFliQUhqdkxJV0xEcFVEdTVPYVZ4aFFrTXI3UEZQbk8weDhjUGlpYm9laEF4UmIxb2p6OTdZTDdQNkd5NCIsInVzZXJpZCI6IlpOWkpORk4yUk5BVCIsImV4cCI6MTY0NDM1MjY1M30.Co9WPcELLSY-mlrW0j-uwZNi0UburE2wt3mA8iZhJJ6i-6KCKMjw-QiiQmTK6ihhndeyA9tb3UjyKH_e-wRhoDZu1dPBWvqu4jZwkZOn27vCu7vxMQzP4ERUmRT5fxEuNcSH-D1gWRlOc_wo4_C4emv_er1jBk3cql7CN4hQ2Vt9gS78dAoidx8BEDqPepvhgcIQ6OkxffAuTZDfRNBlf3GDxyMwF6ecOkXbarY2gGYwk4VTYR6KyXd1fpvnleZcMdaCvlkoQP5B8QwXIHCMNUIGg0he1P6T_CBc9OIhCyzjl-R3ORZuZyut0O_IJakRD7F1riRsOa6dXKPhkthQng","refresh_token":"4vHEAKTaHnP5uLeTDTEXpof7G8g8bOCsUwIvNiwcC6","expires_in":"3599","token_type":"Bearer"}

function setupViewer(divId, documentId, exrtensionArray) {

  let options = {
    env: 'AutodeskProduction',
    api: "derivativeV2",
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
    //viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId));
    viewer.start(null, null, null, null, {
      webglInitParams: {
        useWebGL2: false
      }
    });

    console.log("Initialization complete, loading a model next...");
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onModelLoaded, {
      once: true,
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

  async function onModelLoaded() {
    // Load 'Autodesk.DataVisualization' and store it as a variable for later use
    const dataVizExtn = await viewer.loadExtension("Autodesk.DataVisualization");

    const DataVizCore = Autodesk.DataVisualization.Core;
    const viewableType = DataVizCore.ViewableType.SPRITE;
    const spriteColor = new THREE.Color(0xffffff);
    const baseURL = "https://shrikedoc.github.io/data-visualization-doc/_static/";
    const spriteIconUrl = `${baseURL}fan-00.svg`;

    const style = new DataVizCore.ViewableStyle(
      viewableType,
      spriteColor,
      spriteIconUrl
    );

    const viewableData = new DataVizCore.ViewableData();
    viewableData.spriteSize = 24; // Sprites as points of size 24 x 24 pixels

    const myDataList = [
      // { position: { x: 10, y: 2, z: 3 } },
      // { position: { x: 20, y: 22, z: 3 } },
      // { position: { x: -106, y: -402, z: -53 } },
      { position: { x: 0, y: 0, z: 0 } },
      { position: { x: 19.49, y: 32.99, z: -21.25 } },
      // { position: { x: -13.07, y: 14.35, z: 170.38 } }
    ];

    myDataList.forEach((myData, index) => {
      const dbId = 10 + index;
      const position = myData.position;
      const viewable = new DataVizCore.SpriteViewable(position, style, dbId);

      viewableData.addViewable(viewable);
    });

    await viewableData.finish();
    dataVizExtn.addViewables(viewableData);

    // function startCameraTransition() {
    //     viewer.hide(20524); // Hide Roof Panels
    //     viewer.autocam.shotParams.destinationPercent = 3; // slow down camera movement
    //     viewer.autocam.shotParams.duration = 10;
    //     // move camera to hero view
    //     viewer.setViewFromArray([
    //         1.5082,
    //         -30.912,
    //         88.6316,
    //         -13.5,
    //         -1.87081,
    //         21.0,
    //         0,
    //         0,
    //         1,
    //         1.865,
    //         1.22,
    //         1,
    //         0,
    //     ]);
    // }
    // startCameraTransition(viewer);
  }
}
