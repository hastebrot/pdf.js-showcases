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
    var promise = PDFJS.getDocument({url: this.pdfDocumentPath}, null, null,
      this.onPdfDocumentProgress)
    promise.then((pdfDocument: PDFDocumentProxy) => {
      this.onPdfDocument(pdfDocument)
      var promise = pdfDocument.getPage(this.pdfPageNumber)
      promise.then((pdfPage: PDFPageProxy) => {
        this.onPdfPage(pdfPage)
        this.renderPdfPage(pdfPage)
      })
    })
  }

  //-----------------------------------------------------------------------------------------------
  // PRIVATE METHODS.
  //-----------------------------------------------------------------------------------------------

  private renderPdfPage(pdfPage: PDFPageProxy) {
    var viewport = pdfPage.getViewport(this.pdfPageScale)
    var canvas = <HTMLCanvasElement> document.getElementById(this.canvasElementId)
    canvas.width = viewport.width
    canvas.height = viewport.height

    var context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)

    var renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    pdfPage.render(renderContext)
  }

  private onPdfDocumentProgress(pdfProgressData: PDFProgressData) {
    console.log("pdfProgressData:", JSON.stringify(pdfProgressData))
  }

  private onPdfDocument(pdfDocument) {
    console.log("pdfDocument.numPages:", pdfDocument.numPages)
  }

  private onPdfPage(pdfPage) {
    console.log("pdfPage.ref:", JSON.stringify(pdfPage.ref))
  }

}

var viewer = new BasicCanvasViewer()
viewer.canvasElementId = "pdf-canvas"
viewer.pdfDocumentPath = "../../assets/test-document.pdf"
viewer.pdfPageNumber = 1
viewer.pdfPageScale = 1.5
viewer.loadAndRender()
