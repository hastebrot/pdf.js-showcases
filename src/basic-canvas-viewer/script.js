/// <reference path="../../vendor/pdf.d.ts" />
var BasicCanvasViewer = (function () {
    function BasicCanvasViewer() {
    }
    //-----------------------------------------------------------------------------------------------
    // METHODS.
    //-----------------------------------------------------------------------------------------------
    BasicCanvasViewer.prototype.loadAndRender = function () {
        var _this = this;
        var promise = PDFJS.getDocument({ url: this.pdfDocumentPath }, null, null, this.onPdfDocumentProgress);
        promise.then(function (pdfDocument) {
            _this.onPdfDocument(pdfDocument);
            var promise = pdfDocument.getPage(_this.pdfPageNumber);
            promise.then(function (pdfPage) {
                _this.onPdfPage(pdfPage);
                _this.renderPdfPage(pdfPage);
            });
        });
    };

    //-----------------------------------------------------------------------------------------------
    // PRIVATE METHODS.
    //-----------------------------------------------------------------------------------------------
    BasicCanvasViewer.prototype.renderPdfPage = function (pdfPage) {
        var viewport = pdfPage.getViewport(this.pdfPageScale);
        var canvas = document.getElementById(this.canvasElementId);
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        pdfPage.render(renderContext);
    };

    BasicCanvasViewer.prototype.onPdfDocumentProgress = function (pdfProgressData) {
        console.log("pdfProgressData:", JSON.stringify(pdfProgressData));
    };

    BasicCanvasViewer.prototype.onPdfDocument = function (pdfDocument) {
        console.log("pdfDocument.numPages:", pdfDocument.numPages);
    };

    BasicCanvasViewer.prototype.onPdfPage = function (pdfPage) {
        console.log("pdfPage.ref:", JSON.stringify(pdfPage.ref));
    };
    return BasicCanvasViewer;
})();

var viewer = new BasicCanvasViewer();
viewer.canvasElementId = "pdf-canvas";
viewer.pdfDocumentPath = "../../assets/test-document.pdf";
viewer.pdfPageNumber = 1;
viewer.pdfPageScale = 1.5;
viewer.loadAndRender();
//# sourceMappingURL=script.js.map
