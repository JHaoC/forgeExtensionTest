class StripeExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
    }

    load() {
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
        <p>Load: <span id="Load"></span></p>
        `;
        document.body.appendChild(infoPanelDevice);
        return true;
    }
    unload() {
        console.log('StripeExtension is now unloaded!');
        return true;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('StripeExtension', StripeExtension);

