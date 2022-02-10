class HeatmapExtension extends Autodesk.Viewing.Extension {
    load() {
        console.log('HeatmapExtension is loaded!');
        this._enabled = false;
        this._intensity = 1;
        return true;
    }

    unload() {
        this.viewer.toolbar.removeControl(this.toolbar);
        return true;
    }

    onToolbarCreated() {
        this._createUI();
    }

    _createUI() {
        const viewer = this.viewer;
        this.button = new Autodesk.Viewing.UI.Button('HeatmapButton');
        this.button.onClick = () => {
            this._enabled = !this._enabled;
            //this.panel.setVisible(this._enabled);
            if (this._enabled) {
                this._applyColors();
                this.button.setState(0);
            } else {
                this._removeColors();
                this.button.setState(1);
            }
            viewer.impl.invalidate(true, true, true);
        };
        this.button.icon.classList.add("fas", "fa-fire");
        this.button.setToolTip('Heatmaps');
        this.toolbar = viewer.toolbar.getControl('CustomToolbar') || new Autodesk.Viewing.UI.ControlGroup('CustomToolbar');
        this.toolbar.addControl(this.button);
        viewer.toolbar.addControl(this.toolbar);
    }

    _applyColors() {
        const viewer = this.viewer;
        const tree = this.viewer.model.getData().instanceTree;
        const nodeList = Object.values(tree.nodeAccess.dbIdToIndex);
        const reditems = [5155,5150,5156];
        const yellowitems = [5157,5149];
        for (const id of nodeList) {
            //console.log(item);
            const color = new THREE.Color();
            if (reditems.includes(id)) {
                color.setHSL( 0, 1.0, 0.5);
            }
            else if(yellowitems.includes(id)) { 
                color.setHSL( 0.1, 1.0, 0.5);
            }
            else {
                color.setHSL( 0.33, 1.0, 0.5);
            }
            // color.setHSL(item.heat * 0.33, 1.0, 0.5);
            viewer.setThemingColor(id, new THREE.Vector4(color.r, color.g, color.b, this._intensity));
        }
    }

    _removeColors() {
        this.viewer.clearThemingColors();
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('HeatmapExtension', HeatmapExtension);