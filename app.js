
let viewer = null;

const tokenInfo = {"access_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiTHpoeXJDeEZHVDZzdmdyRXRHOXRpM2pYdTdUcHR3ejUiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoib2hEbDdWVWVXcU05QkVWTEE3NkVNa3RVcEdFbEVBWnR6d0QxSFBSdFg2ajZLYzJKUDBHbE8zZG16ZVRYell5dCIsInVzZXJpZCI6IlpOWkpORk4yUk5BVCIsImV4cCI6MTY0NDQ0NTgzNn0.I8nSHyaHbvohWGwKomdsX9kx8_UOEMT_7X_pqXkjskOlpGjfhnRknc39z1QVmRMGKPuDInrMICC4nUMBG883wPQ0BI9PFW0WClAdFP2fU8h4n9-4pLrO9b7iaLUrvm7TKs1He56vHp51DG1ezKC6bfCOjrHziNATXcpNQbVLHmanEU4Qx9Y6piTsK0b7gQMej96zYDCpO-iZcPPC0MB7G_Thk2lNHezStGPIziORMazk5svsq0dO2FPOS2QVHnfRVCTmvmDYEpdfO2EWIK1Pl6PaWjhaxj_u0tTKyquSEoK9u1JdnP5RZl8d-OkMtQGwM1xmGVj3A2UK7QwibfUd3Q","refresh_token":"q84EuZfcjSu5CWpxAieXPUycAHBD0eqH4CssoVMCKv","expires_in":"3599","token_type":"Bearer"}

const myDataList = [
  {
    Id: 3934, position: { x: 0, y: 11.09, z: 170.38 }, DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2903x",
    }
  },
  {
    Id: 5155, position: { x: 13.12, y: 14.34, z: 5.10 }, DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2903x",
    }
  },
  {
    Id: 5339, position: { x: 53.8, y: -40.82, z: -94.11 }, DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2903x",
    }
  }
];

function setupViewer(divId, documentId, exrtensionArray) {

  let options = {
    env: 'AutodeskProduction',
    api: "derivativeV2",
    getAccessToken: (onGetAccessToken) => {
      onGetAccessToken(tokenInfo["access_token"], tokenInfo["expires_in"]);
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

    // myDataList.forEach((myData, index) => {
    //   const dbId = 10 + index;
    myDataList.forEach((myData) => {
      const dbId = myData.Id;
      const position = myData.position;
      const spriteViewable = new DataVizCore.SpriteViewable(position, style, dbId);


      spriteViewable.myContextData = myData.DeviceInfo;
      viewableData.addViewable(spriteViewable);
    });

    await viewableData.finish();
    dataVizExtn.addViewables(viewableData);


    function onSpriteHovering(event) {
      const targetDbId = event.dbId;
      const viewables = viewableData.viewables;
      const viewable = viewables.find((v) => v.dbId === targetDbId);

      if (event.hovering) {
        console.log(`The mouse hovers over ${targetDbId}`);
        console.log(event);
        if (viewable && viewable.myContextData) {
          const data = viewable.myContextData;
          console.log(`Sensor model: ${data.sensorModel}`);

          document.getElementById("DeviceId").innerText = targetDbId;
          document.getElementById("DeviceModel").innerText = data.sensorModel;
          document.getElementById("DeviceManufacturer").innerText = data.sensorManufacturer;
          document.getElementById("Temperature").innerText =  (23 + Math.random()).toFixed(1);
          document.getElementById("Pressure").innerText = (25 + Math.random()).toFixed(1);
        }
      }
      else {
        console.log(`The mouse hovers off ${targetDbId}`);
        document.getElementById("DeviceId").innerText = "";
          document.getElementById("DeviceModel").innerText = "";
          document.getElementById("DeviceManufacturer").innerText = "";
          document.getElementById("Temperature").innerText = "";
          document.getElementById("Pressure").innerText = "";
      }
    }

    function onSpriteClicked(event) {
      console.log(`Sprite clicked: ${event.dbId}`);
      const targetDbId = event.dbId;
      const viewables = viewableData.viewables;
      const viewable = viewables.find((v) => v.dbId === targetDbId);

      if (viewable && viewable.myContextData) {
        const data = viewable.myContextData;
        console.log(`Sensor model: ${data.sensorModel}`);

        document.getElementById("DeviceId").innerText = targetDbId;
        document.getElementById("DeviceModel").innerText = data.sensorModel;
        document.getElementById("DeviceManufacturer").innerText = data.sensorManufacturer;
        document.getElementById("Temperature").innerText = (23 + Math.random()).toFixed(1);
        document.getElementById("Pressure").innerText = (25 + Math.random()).toFixed(1);
      }

      // console.log(event);
    }

    // Register event handlers for these two events.
    //viewer.addEventListener(DataVizCore.MOUSE_HOVERING, onSpriteHovering);
    viewer.addEventListener(DataVizCore.MOUSE_CLICK, onSpriteClicked);

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
