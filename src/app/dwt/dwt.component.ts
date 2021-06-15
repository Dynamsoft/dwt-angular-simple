import { Component, OnInit } from '@angular/core';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';

@Component({
  selector: 'app-dwt',
  templateUrl: './dwt.component.html',
  styleUrls: ['./dwt.component.css']
})
export class DwtComponent implements OnInit {
  DWObject: WebTwain;
  selectSources: HTMLSelectElement;
  containerId = 'dwtcontrolContainer';
  bWASM = false;
  constructor() { }

  ngOnInit(): void {
    Dynamsoft.DWT.Containers = [{ WebTwainId: 'dwtObject', ContainerId: this.containerId, Width: '300px', Height: '400px' }];
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => { this.Dynamsoft_OnReady(); });                                                        
	/** v17.1 LICENSE ALERT - README
     * The library requires a license to work, the APIs organizationID and handshakeCode specify how to acquire a license.
     * If nothing is specified, a 7-day (public) trial license will be used by default which is the case in this sample.
     * Note that network connection is required for this license to work.
     */

    /* When using your own license, please uncomment the following lines and fill in your own information. */
    /* For more information, please refer to https://www.dynamsoft.com/license-tracking/docs/about/licensefaq.html?ver=latest#how-to-use-a-trackable-license. */

    // Dynamsoft.DWT.organizationID = "YOUR-ORGANIZATION-ID";
    // Dynamsoft.DWT.handshakeCode = "A-SPECIFIC-HANDSHAKECODE";
    // Dynamsoft.DWT.sessionPassword = "PASSWORD-TO-PROTECT-YOUR-LICENSE"; // Important field to protect your license.
    // Dynamsoft.DWT.licenseServer = ["YOUR-OWN-MAIN-LTS", "YOUR-OWN-STANDBY-LTS"]; // Ignore this line if you are using Dynamsoft-hosting LTS

    /* The API "ProductKey" is an alternative way to license the library, the major difference is that it does not require a network. Contact support@dynamsoft.com for more information. */

    // Dynamsoft.DWT.ProductKey = "YOUR-PRODUCT-KEY";

    /** LICENSE ALERT - THE END */
	
    Dynamsoft.DWT.ResourcesPath = 'assets/dwt-resources';
    let checkScript = () => {
      if (Dynamsoft.Lib.detect.scriptLoaded) {
        Dynamsoft.DWT.Load();
      } else {
        setTimeout(() => checkScript(), 100);
      }
    };
    checkScript();
  }
  /**
   * Dynamsoft_OnReady is called when a WebTwain instance is ready to use.
   * In this callback we do some initialization.
   */
  Dynamsoft_OnReady(): void {
    this.DWObject = Dynamsoft.DWT.GetWebTwain(this.containerId);
	this.bWASM = Dynamsoft.Lib.env.bMobile || !Dynamsoft.DWT.UseLocalService;
    if (this.bWASM) {
      this.DWObject.Viewer.cursor = "pointer";
    } else {
      let sources = this.DWObject.GetSourceNames();
      this.selectSources = <HTMLSelectElement>document.getElementById("sources");
      this.selectSources.options.length = 0;
      for (let i = 0; i < sources.length; i++) {
        this.selectSources.options.add(new Option(<string>sources[i], i.toString()));
      }
    }
  }
  /**
   * Acquire images from scanners or cameras or local files
   */
  acquireImage(): void {
    if (!this.DWObject)
      this.DWObject = Dynamsoft.DWT.GetWebTwain();
    if (this.bWASM) {
      alert("Scanning is not supported under the WASM mode!");
    }
    else if (this.DWObject.SourceCount > 0 && this.DWObject.SelectSourceByIndex(this.selectSources.selectedIndex)) {
      const onAcquireImageSuccess = () => { this.DWObject.CloseSource(); };
      const onAcquireImageFailure = onAcquireImageSuccess;
      this.DWObject.OpenSource();
      this.DWObject.AcquireImage({}, onAcquireImageSuccess, onAcquireImageFailure);
    } else {
      alert("No Source Available!");
    }
  }
  /**
   * Open local images.
   */
  openImage(): void {
    if (!this.DWObject)
      this.DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    this.DWObject.IfShowFileDialog = true;
    /**
     * Note, this following line of code uses the PDF Rasterizer which is an extra add-on that is licensed seperately
     */
    this.DWObject.Addon.PDF.SetConvertMode(Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL);
    this.DWObject.LoadImageEx("", Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
      () => {
        //success
      }, () => {
        //failure
      });
  }
}
