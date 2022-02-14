// Take token from Forge or https://mdskdtpdev.azurewebsites.net/api/forge/SignIn
const tokenInfo = {};
let devices = [
  {
    dbId: 5221, position: { x: -21.62, y: -20.40, z: 50.96 }, DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2903x",
    }
  },
  {
    dbId: 5155, position: { x: 13.12, y: 14.34, z: 5.10 }, DeviceInfo:
    {
      sensorManufacturer: "Imaginary Co. Ltd.",
      sensorModel: "BTE-2903x",
    }
  },
  {
    dbId: 5233, position: { x: 39.31, y: -38.09, z: -90.57 }, DeviceInfo:
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
  let viewer;
  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId), config3d);
    viewer.start(null, null, null, null,
      options
    );

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
}


async function onModelLoaded(data) {
  let viewer = data.target;
  //console.log(data);

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

  await RenderStripe();

  document.getElementById("addSensorBtn").addEventListener("click", async () => {
    let newdevice = {
      id: document.getElementById("infoName").innerText,
      dbId: Number(document.getElementById("infoId").innerText),
      position: {
        x: Number(document.getElementById("infoX").innerText),
        y: Number(document.getElementById("infoY").innerText),
        z: Number(document.getElementById("infoZ").innerText),
      },
      DeviceInfo:
      {
        sensorManufacturer: "Imaginary Co. Ltd.",
        sensorModel: "BTE-2903x",
      }
    }
    devices.push(newdevice);
    dataVizExtn.removeAllViewables();
    await RenderStripe();
  });

  async function RenderStripe(){
    const viewableData = new DataVizCore.ViewableData();
    viewableData.spriteSize = 24; // Sprites as points of size 24 x 24 pixels
  
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
      }
  
    }
  
    viewer.addEventListener(DataVizCore.MOUSE_CLICK, onSpriteClicked);
  }

}

