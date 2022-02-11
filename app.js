// Take token from Forge or https://mdskdtpdev.azurewebsites.net/api/forge/SignIn
const tokenInfo = { "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiTHpoeXJDeEZHVDZzdmdyRXRHOXRpM2pYdTdUcHR3ejUiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiWG5TeHJrSzJvNWVPdXlReGg0RlFxSU4zTndIeU5WN1RvSzRrT3EwMXg2R1h3OUluQW1aQ1JQTkZxYjB0NWU0RCIsInVzZXJpZCI6IlpOWkpORk4yUk5BVCIsImV4cCI6MTY0NDYxNDE1M30.HuiNA1yLEVruw_uVVgtNBFqbXE09llfAqgWHu9ex1I2pjzchOvw6dwqcn8wRu-VFk3ziVtSRc7A2yddJiGYHc654pf6hwyfdflYjaz55U3PasogDIP6CntdooyllUFgCK9GwqxpBhUAMhDBC05-FD2TSJnDIIsvbDqIEtPae7E6fW3PAB3z3rgr5BABNTs7f3aqgQADZbsZScLLJN3HU8LFi3jrqbgy55k6ep_HiIUFqjlcLr_ekNz-OIbqVzSwM7lZrlMjMXS6tuIN2ji2LFZ8tiNt6T-XsdmcVvpL8FtoPxZgSuE7SC36WdytEEQRq5_4CeL3U4uo4dv8iSFumyg", "refresh_token": "zCh7jdc61XRd7t5MlQzZ6V16TcVw227N7miEp4YNHV", "expires_in": "3599", "token_type": "Bearer" }

// const myDataList = [
//   {
//     Id: 5221, position: { x: -21.62, y: -20.40, z: 50.96 }, DeviceInfo:
//     {
//       sensorManufacturer: "Imaginary Co. Ltd.",
//       sensorModel: "BTE-2903x",
//     }
//   },
//   {
//     Id: 5155, position: { x: 13.12, y: 14.34, z: 5.10 }, DeviceInfo:
//     {
//       sensorManufacturer: "Imaginary Co. Ltd.",
//       sensorModel: "BTE-2903x",
//     }
//   },
//   {
//     Id: 5233, position: { x: 39.31, y: -38.09, z: -90.57 }, DeviceInfo:
//     {
//       sensorManufacturer: "Imaginary Co. Ltd.",
//       sensorModel: "BTE-2903x",
//     }
//   }
// ];

let devices = [
  {
    id: "CORRIDOR 490 [1779842]",
    dbId: 102249,
    position: {
      x: -82.79,
      y: -12.35,
      z: -8.02,
    },
    type: "temperature",
    sensorTypes: ["temperature"],
    DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2903x",
    }
  },
  {
    id: "CIRCULATION 486 [1779838]",
    dbId: 102246,
    position: {
      x: -3.255,
      y: -91.55,
      z: -8.02,
    },
    type: "temperature",
    sensorTypes: ["co2", "temperature"],
    DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2903x",
    }
  },
];

function setupViewer(divId, documentId, exrtensionArray) {

  let options = {
    env: 'AutodeskProduction',
    api: "derivativeV2",
    //api: 'derivativeV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : ''), // handle BIM 360 US and EU regions
    getAccessToken: (onGetAccessToken) => {
      onGetAccessToken(tokenInfo["access_token"], tokenInfo["expires_in"]);
    }
  };

  var config3d = { extensions: exrtensionArray };
  let viewer;
  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId), config3d);
    //viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId));
    viewer.start(null, null, null, null,
      // {
      //   webglInitParams: {
      //     useWebGL2: false
      //   }
      // }
      options
    );

    console.log("Initialization complete, loading a model next...");
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onModelLoaded, {
      once: true,
    });

    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });

  function onDocumentLoadSuccess(doc) {
    var viewables = doc.getRoot().getDefaultGeometry(true);
    viewer.loadDocumentNode(doc, viewables).then(i => {
      // documented loaded, any action?
    });
  }

  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }
}


async function onModelLoaded(data) {
  let viewer = data.target;
  console.log(data);

  // Sprite loading and rendering

  // Load 'Autodesk.DataVisualization' and store it as a variable for later use

  console.log('Autodesk.DataVisualization loaded');
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
  console.log(devices);
  devices.forEach((myData) => {
    const dbId = myData.dbId;
    const position = myData.position;
    const spriteViewable = new DataVizCore.SpriteViewable(position, style, dbId);

    spriteViewable.myContextData = myData.DeviceInfo;
    viewableData.addViewable(spriteViewable);
  });

  await viewableData.finish();
  dataVizExtn.addViewables(viewableData);

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
      document.getElementById("Load").innerText = (2500 + 100 * Math.random()).toFixed(2);
      // document.getElementById("Pressure").innerText = (25 + Math.random()).toFixed(1);
    }

    // console.log(event);
  }

  // Register event handlers for these two events.
  viewer.addEventListener(DataVizCore.MOUSE_CLICK, onSpriteClicked);


  // Load level data
  let viewerDocument = data.model.getDocumentNode().getDocument();
  const aecModelData = await viewerDocument.downloadAecModelData();
  let levelsExt;
  if (aecModelData) {
    levelsExt = await viewer.loadExtension("Autodesk.AEC.LevelsExtension", {
      doNotCreateUI: true,
    });
  }

  // Select Level 3.
  const floorData = levelsExt.floorSelector.floorData;
  const floor = floorData[2];
  levelsExt.floorSelector.selectFloor(floor.index, true);

  // Generate surfaceshading data by mapping devices to rooms.
  const structureInfo = new Autodesk.DataVisualization.Core.ModelStructureInfo(
    data.model
  );
  console.log(structureInfo);

  const heatmapData = await structureInfo.generateSurfaceShadingData(devices);
  //const heatmapData = await structureInfo.generateSurfaceShadingData();
  console.log(heatmapData);

  // Setup surfaceshading
  await dataVizExtn.setupSurfaceShading(data.model, heatmapData);

  // dataVizExt.registerSurfaceShadingColors("co2", [0x00ff00, 0xff0000]);
  dataVizExtn.registerSurfaceShadingColors("temperature", [0xff0000, 0x0000ff]);

  // dataVizExt.registerSurfaceShadingColors("co2", [0x00ff00]);
  //dataVizExt.registerSurfaceShadingColors("temperature", [0xff0000]);

  /**
   * Interface for application to decide the current value for the heatmap
   * @param {Object} device device
   * @param {string} sensorType sensor type
   */
  function getSensorValue(device, sensorType) {
    let value = Math.random();
    return value;
  }

  dataVizExtn.renderSurfaceShading(floor.name, "temperature", getSensorValue);



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