///////////////////////////////////////////////////////////////////////////////
// Transformation Explorer extension
// by Denis Grigor, June 2018
//
///////////////////////////////////////////////////////////////////////////////

class TransExplorerExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = null;

        this.infoName = null;
        this.infoParent = null;
        this.infoId = null;
        this.infoX = null;
        this.infoY = null;
        this.infoZ = null;

        this.processSelection = this.processSelection.bind(this);
        this.getFragmentWorldMatrixByNodeId = this.getFragmentWorldMatrixByNodeId.bind(this);
        this.getObjectTree = this.getObjectTree.bind(this);
        this.findNodeNameById = this.findNodeNameById.bind(this);
    }

    load() {
        console.log('TransExplorerExtension is loaded!');
        this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
            this.getObjectTree);
        this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            this.processSelection);

        let infoPanel = document.createElement('div');
        infoPanel.id = "infoPanel";
        infoPanel.style.cssText = `
            position: absolute;
            right: 15px;
            bottom: 55px;
            z-index: 2;
            border: 2px solid #ccc;
            background-color: #ffffff;
            border-radius: 5px;
            padding: 10px;`;

        infoPanel.innerHTML = `
        <p>ID: <span id="infoId"></span></p>
        <p>Name: <span id="infoName"></span></p>
        <p>Parent: <span id="infoParent"></span></p>
        <p>xPosition: <span id="infoX"></span></p>
        <p>yPosition: <span id="infoY"></span></p>
        <p>zPosition: <span id="infoZ"></span></p>
        `;

        document.body.appendChild(infoPanel);
        this.infoName = document.getElementById("infoName");
        this.infoParent = document.getElementById("infoParent");
        this.infoId = document.getElementById("infoId");
        this.infoX = document.getElementById("infoX");
        this.infoY = document.getElementById("infoY");
        this.infoZ = document.getElementById("infoZ");


        let infoPanelDevice = document.createElement('div');
        infoPanelDevice.id = "infoPanelDevice";
        infoPanelDevice.style.cssText = `
            position: absolute;
            left: 15px;
            bottom: 55px;
            z-index: 2;
            border: 2px solid #ccc;
            background-color: #ffffff;
            border-radius: 5px;
            padding: 10px;`;

        infoPanelDevice.innerHTML = `
        <p>Device ID: <span id="DeviceId"></span></p>
        <p>Manufacturer: <span id="DeviceManufacturer"></span></p>
        <p>Model: <span id="DeviceModel"></span></p>
        <p>Temperature (F): <span id="Temperature"></span></p>
        <p>Pressure (PSI): <span id="Pressure"></span></p>
        `;
        document.body.appendChild(infoPanelDevice);
        return true;
    }
    unload() {
        console.log('TransExplorerExtension is now unloaded!');
        this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            this.processSelection);
        return true;
    }

    getObjectTree() {
        this.viewer.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
            this.getObjectTree);
        this.tree = this.viewer.model.getData().instanceTree;

    }

    processSelection(event) {
        let nodeData = {};
        if (event.nodeArray.length !== 0) {
            let selectedNode = event.nodeArray[0];
            nodeData.ID = selectedNode;
            nodeData.Name = this.findNodeNameById(selectedNode);
            nodeData.Parent = this.findNodeNameById(this.tree.getNodeParentId(selectedNode));
            let transMat = this.getFragmentWorldMatrixByNodeId(event.nodeArray[0]);
            //console.log(transMat);
            this.infoName.innerText = nodeData.Name;
            this.infoParent.innerText = nodeData.Parent;
            this.infoId.innerText = nodeData.ID;
            this.infoX.innerText = transMat.matrix.x;
            this.infoY.innerText = transMat.matrix.y;
            this.infoZ.innerText = transMat.matrix.z;

        }

    }

    findNodeIdbyName(name) {
        let nodeList = Object.values(this.tree.nodeAccess.dbIdToIndex);
        for (let i = 1, len = nodeList.length; i < len; ++i) {
            let node_name = this.tree.getNodeName(nodeList[i]);
            if (node_name === name) {
                return nodeList[i];
            }
        }
        return null;
    }

    findNodeNameById(nodeId) {
        return this.tree.getNodeName(nodeId);
    }

    getFragmentWorldMatrixByNodeId(nodeId) {
        let result = {
            fragId: [],
            matrix: [],
        };
        let viewer = this.viewer;

        let bounds = new THREE.Box3();
        const fragList = viewer.model.getFragmentList();

        this.tree.enumNodeFragments(nodeId, function (frag) {
            let box = new THREE.Box3();
            fragList.getWorldBounds( frag, box );
            bounds.union( box );
            result.fragId.push(frag);
            //result.matrix.push(matrix);
        }, true);
        result.matrix = bounds.getCenter();
        console.log(result);
        return result;
    }

}

Autodesk.Viewing.theExtensionManager.registerExtension('TransExplorerExtension',
    TransExplorerExtension);