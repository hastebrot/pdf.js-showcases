/// <reference path="../../vendor/pdf.d.ts" />
/// <reference path="../../vendor/jquery.d.ts" />
/// <reference path="pdfBrowser.ts" />

class PdfStructureViewer {

  //-----------------------------------------------------------------------------------------------
  // FIELDS.
  //-----------------------------------------------------------------------------------------------

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

    var promise = PDFJS.getDocument({url: this.pdfDocumentPath}, null, null,
      this.onPdfDocumentProgress)
    promise.then((pdfDocument: PDFDocumentProxy) => {
      this.onPdfDocument(pdfDocument)

      var promise = pdfDocument.getPage(this.pdfPageNumber)
      promise.then((pdfPage: PDFPageProxy) => {
        this.onPdfPage(pdfPage)
      })
    })
  }

  //-----------------------------------------------------------------------------------------------
  // PRIVATE METHODS.
  //-----------------------------------------------------------------------------------------------

  private makePagesPromise(pdfDocument: PDFDocumentProxy): PDFPromise<PDFRef[]> {
    var pagesCount = pdfDocument.numPages
    var pagesPromise = new PDFJS.Promise()
    var pagesRefs = []
    for (var pageNumber = 1; pageNumber <= pagesCount; pageNumber++) {
      pdfDocument.getPage(pageNumber).then(function(pdfPage: PDFPageProxy) {
        pagesRefs.push(pdfPage.ref)
        if (pdfPage.pageNumber == pagesCount) {
          pagesPromise.resolve(pagesRefs)
        }
      })
    }
    return pagesPromise
  }

  private makeDestinationsPromise(pdfDocument: PDFDocumentProxy): PDFPromise<any> {
    var destinationsPromise = pdfDocument.getDestinations()
    return destinationsPromise
  }

  private outputDocumentData(pdfDocument: PDFDocumentProxy): void {
    pdfDocument.getData().then((arrayBuffer: Uint8Array) => {
      var pdfDocumentString = this.convertArrayBufferToString(arrayBuffer)
      var divPhysicalStructure = $("#pdf-physical-structure")
      $("<pre/>").text(pdfDocumentString).appendTo(divPhysicalStructure)
    })
  }

  private onPdfDocumentProgress(pdfProgressData: PDFProgressData) {}

  private onPdfDocument(pdfDocument: PDFDocumentProxy) {
    //console.log(pdfDocument)
    //this.outputDocumentData(pdfDocument)

    pdfDocument.getData().then((arrayBuffer: Uint8Array) => {
      var pdfBrowser = new PdfBrowser()
      pdfBrowser.init(arrayBuffer)

      var structure = pdfBrowser.listPhysicalStructure()

      var divPhysicalStructure = $("#pdf-physical-structure")

      for (var index in structure) {
        var elem = structure[index]
        var text = this.convertArrayBufferToString(elem.bytes)
        $("<pre/>").text(text).addClass(elem.type)
          .appendTo(divPhysicalStructure)
      }

    })

    var pagesPromise = this.makePagesPromise(pdfDocument)
    var destinationsPromise = this.makeDestinationsPromise(pdfDocument)

    PDFJS.Promise.all([pagesPromise, destinationsPromise]).then(function() {
      pdfDocument.getOutline().then(outline => console.log("outline:", outline))
    })
  }

  private onPdfPage(pdfPage: PDFPageProxy) {}

  private convertArrayBufferToString(arrayBuffer: ArrayBufferView) {
    return String.fromCharCode.apply(null, arrayBuffer)
  }

}

var viewer = new PdfStructureViewer()
viewer.pdfDocumentPath = "../../assets/hello-world.pdf"
viewer.pdfPageNumber = 1
viewer.pdfPageScale = 1.5
viewer.loadAndRender()
