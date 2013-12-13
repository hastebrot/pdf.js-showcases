/// <reference path="../../vendor/pdf.d.ts" />
/// <reference path="../../vendor/jquery.d.ts" />
/// <reference path="pdfBrowser.ts" />
var PdfStructureViewer = (function () {
    function PdfStructureViewer() {
    }
    //-----------------------------------------------------------------------------------------------
    // METHODS.
    //-----------------------------------------------------------------------------------------------
    PdfStructureViewer.prototype.loadAndRender = function () {
        var _this = this;
        //PDFJS.disableWorker = false
        //PDFJS.disableAutoFetch = true
        //PDFJS.disableRange = true
        var promise = PDFJS.getDocument({ url: this.pdfDocumentPath }, null, null, this.onPdfDocumentProgress);
        promise.then(function (pdfDocument) {
            _this.onPdfDocument(pdfDocument);

            var promise = pdfDocument.getPage(_this.pdfPageNumber);
            promise.then(function (pdfPage) {
                _this.onPdfPage(pdfPage);
            });
        });
    };

    //-----------------------------------------------------------------------------------------------
    // PRIVATE METHODS.
    //-----------------------------------------------------------------------------------------------
    PdfStructureViewer.prototype.makePagesPromise = function (pdfDocument) {
        var pagesCount = pdfDocument.numPages;
        var pagesPromise = new PDFJS.Promise();
        var pagesRefs = [];
        for (var pageNumber = 1; pageNumber <= pagesCount; pageNumber++) {
            pdfDocument.getPage(pageNumber).then(function (pdfPage) {
                pagesRefs.push(pdfPage.ref);
                if (pdfPage.pageNumber == pagesCount) {
                    pagesPromise.resolve(pagesRefs);
                }
            });
        }
        return pagesPromise;
    };

    PdfStructureViewer.prototype.makeDestinationsPromise = function (pdfDocument) {
        var destinationsPromise = pdfDocument.getDestinations();
        return destinationsPromise;
    };

    PdfStructureViewer.prototype.outputDocumentData = function (pdfDocument) {
        var _this = this;
        pdfDocument.getData().then(function (arrayBuffer) {
            var pdfDocumentString = _this.convertArrayBufferToString(arrayBuffer);
            var divPhysicalStructure = $("#pdf-physical-structure");
            $("<pre/>").text(pdfDocumentString).appendTo(divPhysicalStructure);
        });
    };

    PdfStructureViewer.prototype.onPdfDocumentProgress = function (pdfProgressData) {
    };

    PdfStructureViewer.prototype.onPdfDocument = function (pdfDocument) {
        var _this = this;
        //console.log(pdfDocument)
        //this.outputDocumentData(pdfDocument)
        pdfDocument.getData().then(function (arrayBuffer) {
            var pdfBrowser = new PdfBrowser();
            pdfBrowser.init(arrayBuffer);

            var structure = pdfBrowser.listPhysicalStructure();

            var divPhysicalStructure = $("#pdf-physical-structure");

            for (var index in structure) {
                var elem = structure[index];
                var text = _this.convertArrayBufferToString(elem.bytes);
                $("<pre/>").text(text).addClass(elem.type).appendTo(divPhysicalStructure);
            }
        });

        var pagesPromise = this.makePagesPromise(pdfDocument);
        var destinationsPromise = this.makeDestinationsPromise(pdfDocument);

        PDFJS.Promise.all([pagesPromise, destinationsPromise]).then(function () {
            pdfDocument.getOutline().then(function (outline) {
                return console.log("outline:", outline);
            });
        });
    };

    PdfStructureViewer.prototype.onPdfPage = function (pdfPage) {
    };

    PdfStructureViewer.prototype.convertArrayBufferToString = function (arrayBuffer) {
        return String.fromCharCode.apply(null, arrayBuffer);
    };
    return PdfStructureViewer;
})();

var viewer = new PdfStructureViewer();
viewer.pdfDocumentPath = "../../assets/hello-world.pdf";
viewer.pdfPageNumber = 1;
viewer.pdfPageScale = 1.5;
viewer.loadAndRender();
//# sourceMappingURL=script.js.map
