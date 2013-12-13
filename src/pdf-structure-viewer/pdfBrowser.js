var PdfBrowser = (function () {
    function PdfBrowser() {
    }
    PdfBrowser.prototype.init = function (arrayBuffer) {
        this.pdfDocument = this.buildPdfDocument(arrayBuffer);

        //console.log(this.pdfDocument)
        this.fetchPositions(this.pdfDocument);
        //this.outputDocument(this.pdfDocument)
    };

    PdfBrowser.prototype.listPhysicalStructure = function () {
        var stream = this.pdfDocument.stream;
        stream.reset();

        var structureElements = [];
        for (var index = 0; index < this.objectPositions.length; index++) {
            var pos = this.objectPositions[index];
            var nextPos = this.objectPositions[index + 1];
            var length = nextPos - pos - 1;
            var subStream = stream.makeSubStream(pos, length, stream.dict);

            var type = "object";
            if (pos == this.headerPosition) {
                type = "header";
            } else if (pos == this.xrefPosition) {
                type = "xref";
            }

            var structureElement = {
                type: type,
                pos: pos,
                end: nextPos,
                bytes: subStream.getBytes()
            };
            if (pos != this.endPosition) {
                structureElements.push(structureElement);
            }
        }
        return structureElements;
    };

    PdfBrowser.prototype.buildPdfDocument = function (arrayBuffer) {
        var doc = new PDFDocument(null, arrayBuffer);
        doc.parseStartXRef();
        doc.parse();
        return doc;
    };

    PdfBrowser.prototype.fetchPositions = function (doc) {
        var xrefPos = doc.startXRef;
        var xrefEntries = doc.xref.entries;

        this.headerPosition = 0;
        this.xrefPosition = xrefPos;
        this.endPosition = doc.stream.end;

        this.objectPositions = [];
        for (var index = 0; index < xrefEntries.length; index++) {
            var entry = doc.xref.entries[index];
            this.objectPositions.push(entry.offset);
        }
        this.objectPositions.push(xrefPos);
        this.objectPositions.push(this.endPosition);
    };

    PdfBrowser.prototype.outputDocument = function (doc) {
        var stream = doc.stream;
        stream.reset();
        console.log(this.convertArrayBufferToString(stream.getBytes()));
    };

    PdfBrowser.prototype.convertArrayBufferToString = function (arrayBuffer) {
        return String.fromCharCode.apply(null, arrayBuffer);
    };
    return PdfBrowser;
})();
//# sourceMappingURL=pdfBrowser.js.map
