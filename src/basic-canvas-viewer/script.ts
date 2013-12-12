/// <reference path="../../vendor/pdf.d.ts" />

class BasicCanvasViewer {

  //-----------------------------------------------------------------------------------------------
  // FIELDS.
  //-----------------------------------------------------------------------------------------------

  canvasElementId: string

  pdfDocumentPath: string
  pdfPageNumber: number
  pdfPageScale: number

  //-----------------------------------------------------------------------------------------------
  // METHODS.
  //-----------------------------------------------------------------------------------------------

  loadAndRender() {
    //PDFJS.disableWorker = false
    //PDFJS.disableAutoFetch = true
    //PDFJS.disableRange = true

    var pdfCanvas = <HTMLCanvasElement> document.getElementById(this.canvasElementId)

    var promise = PDFJS.getDocument({url: this.pdfDocumentPath}, null, null,
      this.onPdfDocumentProgress)
    promise.then((pdfDocument: PDFDocumentProxy) => {
      this.onPdfDocument(pdfDocument)

      var promise = pdfDocument.getPage(this.pdfPageNumber)
      promise.then((pdfPage: PDFPageProxy) => {
        this.onPdfPage(pdfPage)
        this.renderPdfPage(pdfPage, pdfCanvas)
      })
    })
  }

  //-----------------------------------------------------------------------------------------------
  // PRIVATE METHODS.
  //-----------------------------------------------------------------------------------------------

  private renderPdfPage(pdfPage: PDFPageProxy, pdfCanvas: HTMLCanvasElement) {
    var pdfPageViewport = pdfPage.getViewport(this.pdfPageScale)
    pdfCanvas.width = pdfPageViewport.width
    pdfCanvas.height = pdfPageViewport.height

    var pdfCanvasContext = pdfCanvas.getContext("2d")
    pdfCanvasContext.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height)

    var renderContext = {
      canvasContext: pdfCanvasContext,
      viewport: pdfPageViewport
    }
    pdfPage.render(renderContext)
  }

  private onPdfDocumentProgress(pdfProgressData: PDFProgressData) {
    console.log("pdfProgressData:", JSON.stringify(pdfProgressData))
  }

  private onPdfDocument(pdfDocument: PDFDocumentProxy) {
    console.log("pdfDocument.numPages:", pdfDocument.numPages)
  }

  private onPdfPage(pdfPage: PDFPageProxy) {
    console.log("pdfPage.ref:", JSON.stringify(pdfPage.ref))
  }

}

var viewer = new BasicCanvasViewer()
viewer.canvasElementId = "pdf-canvas"
viewer.pdfDocumentPath = "../../assets/test-document.pdf"
viewer.pdfPageNumber = 1
viewer.pdfPageScale = 1.5
viewer.loadAndRender()
