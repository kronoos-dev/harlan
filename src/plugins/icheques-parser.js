import greenlet from 'greenlet';
import cheerio from 'cheerio';
import registerPromiseWorker from 'promise-worker/register';

const databaseInteger = value => value && /^\d+$/.test(value) ? parseInt(value, 10) : null;

registerPromiseWorker(function (xmlContent) {

    const $ = cheerio.load(xmlContent, {
        normalizeWhitespace: true,
        xmlMode: true
    });

    const getElement = (element, nodeName) => {
        
        const nodeElement = $(nodeName, element);
        return nodeElement.length ? nodeElement.text() : null;
    };

    const documents = $('check').map((i, node) => ({
        creation: parseInt(getElement(node, 'creation'), 10),
        company: getElement(node, 'company'),
        cmc: getElement(node, 'cmc'),
        cpf: getElement(node, 'cpf'),
        cnpj: getElement(node, 'cnpj'),
        observation: getElement(node, 'observation'),
        expire: getElement(node, 'expire'),
        ammount: databaseInteger(getElement(node, 'ammount')),
        pushId: getElement(node, 'pushId'),
        situation: getElement(node, 'situation'),
        display: getElement(node, 'display'),
        queryStatus: databaseInteger(getElement(node, 'queryStatus')),
        ocurrenceCode: databaseInteger(getElement(node, 'ocurrenceCode')),
        ocurrence: getElement(node, 'ocurrence'),
        operation: databaseInteger(getElement(node, 'operation')),
        ccf: databaseInteger(getElement(node, 'ccf')),
        protesto: databaseInteger(getElement(node, 'protesto')),
        debtCollector: getElement(node, 'debtCollector'),
        alinea: getElement(node, 'alinea'),
        lastDebtCollectorMessage: getElement(node, 'lastDebtCollectorMessage'),
        lastUpdate: databaseInteger(getElement(node, 'lastUpdate')),
        image: getElement(node, 'image') === '1' ? 1 : 0
    })).get();

    return documents;
});
