
interface Stream {
  (arrayBuffer: Uint8Array, start: number, length: number, dict: any)
  bytes: Uint8Array
  start: number
  pos: number
  end: number
  dict: any
  length: number
  getByte(): number
  getBytes(length?: number): Uint8Array
  peekBytes(length: number): Uint8Array
  skip(n: number): void
  reset(): void
  moveStart(): void
  makeSubStream(start: number, length: number, dict: any): Stream
  isStream: boolean
}

interface StructureElement {
  type: string
  pos: number
  end: number
  bytes: Uint8Array
}

class PdfBrowser {

  pdfDocument: any

  // header, list of objects, cross reference table and trailer.
  headerPosition: number
  xrefPosition: number
  endPosition: number

  objectPositions: Array<number>

  init(arrayBuffer: Uint8Array): void {
    this.pdfDocument = this.buildPdfDocument(arrayBuffer)
    //console.log(this.pdfDocument)

    this.fetchPositions(this.pdfDocument)
    //this.outputDocument(this.pdfDocument)
  }

  listPhysicalStructure(): Array<StructureElement> {
    var stream = <Stream> this.pdfDocument.stream
    stream.reset()

    var structureElements = []
    for (var index = 0; index < this.objectPositions.length; index++) {
      var pos = this.objectPositions[index]
      var nextPos = this.objectPositions[index + 1]
      var length = nextPos - pos - 1
      var subStream = stream.makeSubStream(pos, length, stream.dict)

      var type = "object"
      if (pos == this.headerPosition) {
        type = "header"
      }
      else if (pos == this.xrefPosition) {
        type = "xref"
      }

      var structureElement = {
        type: type,
        pos: pos,
        end: nextPos,
        bytes: subStream.getBytes()
      }
      if (pos != this.endPosition) {
        structureElements.push(structureElement)
      }
    }
    return structureElements
  }

  private buildPdfDocument(arrayBuffer: Uint8Array): any {
    var doc = new PDFDocument(null, arrayBuffer)
    doc.parseStartXRef()
    doc.parse()
    return doc
  }

  private fetchPositions(doc: any): void {
    var xrefPos = doc.startXRef
    var xrefEntries = doc.xref.entries

    this.headerPosition = 0
    this.xrefPosition = xrefPos
    this.endPosition = doc.stream.end

    this.objectPositions = []
    for (var index = 0; index < xrefEntries.length; index++) {
      var entry = doc.xref.entries[index]
      this.objectPositions.push(entry.offset)
    }
    this.objectPositions.push(xrefPos)
    this.objectPositions.push(this.endPosition)
  }

  private outputDocument(doc: any): void {
    var stream = <Stream> doc.stream
    stream.reset()
    console.log(this.convertArrayBufferToString(stream.getBytes()))
  }

  private convertArrayBufferToString(arrayBuffer: ArrayBufferView) {
    return String.fromCharCode.apply(null, arrayBuffer)
  }

}
