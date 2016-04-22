import jDataView from 'jdataview';
import { sprintf } from 'sprintf';
import { CMC7Parser } from './cmc7-parser';

const NON_NUMERIC = /[\D]/g,
      NON_WORD = /[\PL]/g,
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
        this.buffer.setString(0, new Array(this.size).join(' '));
        for (let i = 0; i < this.size; i += ROW_SIZE) {
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
            let start = (this.size - ROW_SIZE) * Math.abs(row);
            return start + col;
        }
        return (ROW_SIZE * row) + col;
    }

    _totalValue() {
        let sum = 0;
        for (let check of this.checks) {
            let value = check.ammount === null ? 0 : check.ammount;
            sum += value;
        }
        return sum;
    }

    generateHeader() {
        let doc = this.company.cnpj || this.company.cpf;

        this.buffer.setString(0, '1');
        // CPF/CNPJ. de 2 a 15. 14.
        this.buffer.setString(1, doc.replace(NON_NUMERIC, '').substring(0, 14));
        // T:CPF/CNPJ. de 16 a 16. 1.
        this.buffer.setString(15, this.company.cnpj ? '1' : '2');
        // Nome do Cedente. de 17 a 56. 40.
        this.buffer.setString(16, this.company.nome.replace(NON_WORD, ' ').substring(0, 40));
        // Endereco. de 57 a 96. 40.
        let endereco = [
            this.company.endereco[0],
            this.company.endereco[1],
            this.company.endereco[2]
        ].join(' ');
        this.buffer.setString(56, endereco.substring(0, 40));
        // Cidade. de 97 a 114. 18.
        this.buffer.setString(96, this.company.endereco[5].substring(0, 18));
        // Estado. de 115 a 116. 2.
        this.buffer.setString(114, this.company.endereco[6].substring(0, 2));
        // CEP. de 117 a 124. 8.
        this.buffer.setString(116, this.company.endereco[4].replace(NON_NUMERIC, '').substring(0, 8));
        // Data de operação. de 180 a 185. 6.
        this.buffer.setString(179, moment().format('DDMMYY'));
        // Fator da operação. de 186 a 192. 7.
        this.buffer.setString(185, '0000000');
        // Tx efetiva min. de 193 a 199. 7.
        this.buffer.setString(192, '0000000');
        // Tx serviço. de 200 a 206. 7.
        this.buffer.setString(199, '0000000');
        // Tx ISS. de 207 a 213. 7.
        this.buffer.setString(206, '0000000');
        // Tarifa por título. de 214 a 220. 7.
        this.buffer.setString(213, '0000000');
        // Tarifa por cheque. de 251 até 257. 7.
        this.buffer.setString(250, '0000000');
        // Tx Serviço Trustee. de 265 até 271. 7.
        this.buffer.setString(264, '0000000');
        // 02.7. de 397 a 400. 4.
        this.buffer.setString(396, BAN_VERSION);
    }

    generateChecks() {
        let currentRow = 1;
        for (let check of this.checks) {
            let cmcParts = new CMC7Parser(check.cmc),
                doc = check.cnpj || check.cpf,
                ammount = check.ammount === null ? 0 : check.ammount;

            /* DOCUMENTO */
            this.buffer.setString(this._goToPosition(currentRow, 0), '2');
            // Documento. de 2 até 7. 6.
            this.buffer.setString(this._goToPosition(currentRow, 1), cmcParts.number.toString().substring(0, 6));
            // CPF/CNPJ. de 18 até 31. 14.
            this.buffer.setString(this._goToPosition(currentRow, 17), doc.replace(NON_NUMERIC, '').substring(0, 14));
            // T:CPF/CNPJ. de 32 até 32. 1.
            this.buffer.setString(this._goToPosition(currentRow, 31), check.cnpj ? '1' : '2');
            // Vencimento. de 250 até 255. 6.
            this.buffer.setString(this._goToPosition(currentRow, 249), moment(check.expire).format('DDMMYY'));
            // Valor. de 256 até 267. 12.
            this.buffer.setString(this._goToPosition(currentRow, 255), sprintf('%012d', ammount));
            // Tipo. de 268 até 268. 1.
            this.buffer.setString(this._goToPosition(currentRow, 267), '2');
            // Emissão. de 301 até 306. 6.
            this.buffer.setString(this._goToPosition(currentRow, 300), moment(check.creation * 1000).format('DDMMYY'));
            // Float. de 357 até 358. 2.
            this.buffer.setString(this._goToPosition(currentRow, 356), '00');
            /* FIM DOCUMENTO */
            currentRow += 1;
            /* CHEQUE */
            this.buffer.setString(this._goToPosition(currentRow, 0), '8');
            // Banco. de 2 a 4. 3.
            this.buffer.setString(this._goToPosition(currentRow, 1), cmcParts.bank.toString().substring(0, 3));
            // Agencia. de 5 até 10. 6.
            this.buffer.setString(this._goToPosition(currentRow, 4), cmcParts.agency.toString().substring(0, 6));
            // N do Cheque. de 21 até 30. 10.
            this.buffer.setString(this._goToPosition(currentRow, 20), cmcParts.number.toString().substring(0, 10));
            // CMC7. de 34 até 67. 34.
            this.buffer.setString(this._goToPosition(currentRow, 33), check.cmc.toString().substring(0, 34));
            /* FIM CHEQUE */
            currentRow += 1;
        }
    }

    generateFooter() {
        this.buffer.setString(this._goToPosition(-1, 0), '3');
        // Quantidade. de 2 até 7. 6.
        this.buffer.setString(this._goToPosition(-1, 1), sprintf('%06d', this.checks.length).substring(0, 6));
        // Valor Total. de 8 até 19. 12.
        this.buffer.setString(this._goToPosition(-1, 7), sprintf('%012d', this._totalValue()).substring(0, 12));
    }
}
