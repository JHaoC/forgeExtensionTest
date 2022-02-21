// Take token from Forge or https://mdskdtpdev.azurewebsites.net/api/forge/SignIn
const tokenInfo = {}

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

let viewer;

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
  //let viewer;
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
      doNotCreateUI: false,
    });
  }

  // Select Level 3.
  const floorData = levelsExt.floorSelector.floorData;
  const floor = floorData[2];
  console.log(floor);
  levelsExt.floorSelector.selectFloor(floor.index, true);

  // Generate surfaceshading data by mapping devices to rooms.
  const structureInfo = new Autodesk.DataVisualization.Core.ModelStructureInfo(
    data.model
  );
  //console.log(structureInfo);


  const heatmapData = await structureInfo.generateSurfaceShadingData(devices);
  //const heatmapData = await structureInfo.generateSurfaceShadingData();
  console.log(heatmapData);

  // Setup surfaceshading
  await dataVizExtn.setupSurfaceShading(data.model, heatmapData);
  dataVizExtn.registerSurfaceShadingColors("temperature", [0xff0000, 0x0000ff]);

  const levels = await structureInfo.getLevelRoomsMap();
  console.log(levels);

  const rooms = await levels.getRoomsOnLevel("Level 3");
  console.log(rooms);

  // const room = rooms.find(a=>a.name=="CORRIDOR 490 [1779842]");
  // console.log(room);
  // room.addDevice(devices[0]);

  const roomswithdevices = await levels.getRoomsOnLevel("Level 3", true);
  console.log(roomswithdevices);



  // dataVizExt.registerSurfaceShadingColors("co2", [0x00ff00, 0xff0000]);



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

  document.getElementById("addSensorBtn").addEventListener("click", async () => {
    const itemType = document.getElementById("infoParent").innerText;
    if (itemType !== "Rooms") return;
    let newdevice = {
      id: document.getElementById("infoName").innerText,
      dbId: Number(document.getElementById("infoId").innerText),
      position: {
        x: Number(document.getElementById("infoX").innerText),
        y: Number(document.getElementById("infoY").innerText),
        z: Number(document.getElementById("infoZ").innerText),
      },
      type: "temperature",
      sensorTypes: ["temperature"],
      DeviceInfo:
      {
        sensorManufacturer: "Imaginary Co. Ltd.",
        sensorModel: "BTE-2903x",
      }
    }
    devices.push(newdevice);

    // const room = rooms.find(a=>a.id==document.getElementById("infoId").innerText);
    // console.log(room);
    // room.addDevice(newdevice);
    // // heatmapData.push(newdevice);

    dataVizExtn.removeSurfaceShading();
    const newheapdateData = await structureInfo.generateSurfaceShadingData(devices);
    await dataVizExtn.setupSurfaceShading(data.model, newheapdateData);
    dataVizExtn.renderSurfaceShading(floor.name, "temperature", getSensorValue);
    // dataVizExtn.updateSurfaceShading(getSensorValue);


  });

  //testForge()

}


///////////////////////////////////////////////////////////////////////////////
// Test use db of Forge
// More details https://forge.autodesk.com/en/docs/viewer/v7/developers_guide/advanced_options/propdb-queries/
///////////////////////////////////////////////////////////////////////////////
function testForge() {

  var thePromise = viewer.model.getPropertyDb().executeUserFunction(userFunction);
  thePromise.then(function (retValue) {

    //if (retValue === 42) {
    //  console.log('We got the expected value back.');
    //}

    if (!retValue) {
      console.log("Model doesn't contain property 'Mass'.");
      return;
    }

    var mostMassiveId = retValue.id;
    viewer.select(mostMassiveId);
    viewer.fitToView([mostMassiveId]);
    console.log('Most massive part is', mostMassiveId, 'with Mass:', retValue.mass);
  });

  function userFunction(pdb) {

    //return 42;

    var attrIdMass = -1;

    // Iterate over all attributes and find the index to the one we are interested in
    pdb.enumAttributes(function (i, attrDef, attrRaw) {

      var name = attrDef.name;
      

      if (name === 'System Classification') {
        attrIdMass = i;
        console.log(attrDef);
        return true; // to stop iterating over the remaining attributes.
      }
    });

    // Early return is the model doesn't contain data for "Mass".
    if (attrIdMass === -1)
      return null;

    // Now iterate over all parts to find out which one is the largest.
    var maxValue = 0;
    var maxValId = -1;
    pdb.enumObjects(function (dbId) {

      // For each part, iterate over their properties.
      pdb.enumObjectProperties(dbId, function (attrId, valId) {

        // Only process 'Mass' property.
        // The word "Property" and "Attribute" are used interchangeably.
        if (attrId === attrIdMass) {

          var value = pdb.getAttrValue(attrId, valId);

          console.log(value);
          // if (value > maxValue) {
          //   maxValue = value;
          //   maxValId = dbId;
          // }

          // Stop iterating over additional properties when "Mass" is found.
          return true;
        }
      });
    });

    // Return results
    // return {
    //   id: maxValId,
    //   mass: maxValue
    // }
  }
}