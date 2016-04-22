import jDataView from "jdataview";

const NON_NUMERIC = /[^\d]/g,
      ROW_SIZE = 502,
      BAN_VERSION = '02.7',
      CRLF = '\r\n';

export class BANFactory {
    constructor(results, company) {
        this.checks = results.values;
        this.company = company;
        this.size = this._fileLength();
        this.buffer = new jDataView(new ArrayBuffer(this.size));
    }

    generate() {
        this._fillBuffer();
        this.generateHeader();
        this.generateChecks();
        this.generateFooter();
        return new Blob([this.buffer.getString(this.size, 0)], {type: 'application/octet-binary'});
    }

    _fillBuffer() {
        this.buffer.setString(0, new Array(this.size).join(" "));
        for (var i = 0; i < this.size; i += ROW_SIZE) {
            this.buffer.setString(i + ROW_SIZE - CRLF.length, CRLF);
        }
    }

    _fileLength() {
        // ROW_SIZE * (1HEADER + 1FOOTER + NCHECKS)
        return ROW_SIZE * (2 + this.checks.length * 2);
    }

    _goToPosition(row, col) {
        if (row < 0) {
            // last row is (BUF_SIZE - ROW_SIZE) * MATH.ABS(-1)
            var start = (this.size - ROW_SIZE) * Math.abs(row);
            return start + col;
        }
        return (ROW_SIZE * row) + col;
    }

    generateHeader() {
        let doc = this.company.cnpj || this.company.cpf;

        this.buffer.setString(0, '1');
        this.buffer.setString(1, doc.replace(NON_NUMERIC, '').substring(0, 14));
        this.buffer.setString(15, this.company.cnpj ? "1" : "2");
        this.buffer.setString(179, moment().format('DDMMYY'));
        this.buffer.setString(396, BAN_VERSION);
    }

    generateChecks() {
        var currentRow = 1;
        for (var check in this.checks) {
            /* DOCUMENTO */
            this.buffer.setString(this._goToPosition(currentRow, 0), '2');
            currentRow += 1;
            /* CHEQUE */
            this.buffer.setString(this._goToPosition(currentRow, 0), '8');
            currentRow += 1;
        }
    }

    generateFooter() {
        this.buffer.setString(this._goToPosition(-1, 0), '3');
        this.buffer.setString(this._goToPosition(-1, 1), '23');
    }
}
