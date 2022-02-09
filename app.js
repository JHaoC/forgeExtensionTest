
let viewer = null;

const tokenInfo = { "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiTHpoeXJDeEZHVDZzdmdyRXRHOXRpM2pYdTdUcHR3ejUiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiOHZTRUVLV1JOSnVTWVFhNHdwRTViS1VNcE1OR0lyOWpGaEN0aFVLM1BTTHBJbHBtQnlUTHRLWlBCN2VlVzNnTiIsInVzZXJpZCI6IlpOWkpORk4yUk5BVCIsImV4cCI6MTY0NDQzMDIyMH0.eKxfXwK9EN1OgOXnu4OXSQVawxlOhIZrRvi2Npd6tygrkECDuh_tHVc-S-HHK62dIR0ql6q6sehKrp6OxMJ78DYBAqTtpyN9qUyO0HgRKl3TnFMLWm9Vi2ageTSyKybg83v2AbSH5J2fTyMj3JcTx81BvCUEODhlyO1UuAkN-Uc_M5Qkf6p3WSzvGK7i3VsQYzh_aEYkDuzN5sa4ELQSpgmM4RE1o1ibbMdI-d5Cz1onZN4WV7lDYTSh4BeRjJNuM11ziVTwqtD1mob0PZrUaB76spyRghbTW9U_yGlUFSeX8Ns7oSTJOWBkS9YYXAKezvIIp0rj_NynLDhZsPe8NQ", "refresh_token": "oZOmOmdP3SsH4GBOBYMVlVEqJPeE2c7QEaCDkDnXBA", "expires_in": "3599", "token_type": "Bearer" }

const myDataList = [
  {
    Id: 3930,
    position: { x: -13.07, y: 14.35, z: 170.38 },
    DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2900x",
    }
  },
  { Id: 4398, position: { x: -9.87, y: 1.22, z: 170.37 } , DeviceInfo:
  {
    sensorManufacturer: "Imaginary Co. Ltd.",
    sensorModel: "BTE-2901x",
  }},
  { Id: 4365, position: { x: -0, y: -8.65, z: 170.38 } , DeviceInfo:
  {
    sensorManufacturer: "Imaginary Co. Ltd.",
    sensorModel: "BTE-2902x",
  }},
  { Id: 3934, position: { x: 0, y: 11.09, z: 170.38 } , DeviceInfo:
  {
    sensorManufacturer: "Imaginary Co. Ltd.",
    sensorModel: "BTE-2903x",
  }},
  { Id: 4243, position: { x: 9.87, y: 1.22, z: 170.38 } , DeviceInfo:
  {
    sensorManufacturer: "Imaginary Co. Ltd.",
    sensorModel: "BTE-2904x",
  }},
  { Id: 4332, position: { x: 13.07, y: 14.35, z: 170.38 } , DeviceInfo:
  {
    sensorManufacturer: "Imaginary Co. Ltd.",
    sensorModel: "BTE-2905x",
  }}
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
          // Should print "Sensor model: BTE-2900x"
        }
      }
      // else {
      //   console.log(`The mouse hovers off ${targetDbId}`);
      // }
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
        document.getElementById("Temperature").innerText = 100*Math.random();
        document.getElementById("Pressure").innerText = 150*Math.random();
      }

      // console.log(event);
    }

    // Register event handlers for these two events.
    viewer.addEventListener(DataVizCore.MOUSE_HOVERING, onSpriteHovering);
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
