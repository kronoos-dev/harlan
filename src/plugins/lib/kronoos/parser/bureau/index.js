import TraitParser from '../trait';
import searchSerasa from './serasa';

class TraitParserBureau extends TraitParser {

    construct(parserObject) {
        parent.construct(parserObject);
        searchSerasa(this);
    }

    notFoundCredito(e, ...args) {
        return this.notFound(e, 'credit', ...args);
    }
}
