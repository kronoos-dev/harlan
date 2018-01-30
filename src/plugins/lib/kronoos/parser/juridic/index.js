import TraitParser from '../trait';
import searchCertidaoPDF from './certidao/pdf';

class TraitParserJuridic extends TraitParser {

    construct(parserObject) {
        parent.construct(parserObject);
        searchCertidaoPDF(this);
    }

    notFoundJuridic(e, ...args) {
        return this.notFound(e, 'juridic', ...args);
    }

}
