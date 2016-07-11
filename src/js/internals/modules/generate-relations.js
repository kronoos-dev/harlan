import series from 'async/series';
import queue from 'async/queue';

module.exports = (controller) => {

    var GenerateRelations = function(report, ccbusca, document) {

        /* Documents */
        this.documents = {};

        this.createEdge = (vfrom, vto) => {
            return {
                from: vfrom,
                to: vto
            };
        };

        this.createNode = (id, label, group, data = {}) => {
            return {
                id: id,
                label: label,
                group: group,
                data: data
            };
        };

        /* Append Document */
        this.appendDocument = (document, legalDocument) => {
            var query = $(document).find("BPQL > header > query"),
                key = `${query.attr('database')}.${query.attr('table')}`;

            if (!documents[key]) {
                documents[key] = {};
            }

            if (!documents[key][legalDocument]) {
                documents[key][legalDocument] = [];
            }

            documents[key][legalDocument].push(document);
        };

        /* First Document */
        this.appendDocument(ccbusca, document);

        /* Name Legal Document Relation */
        this.nameIDRelation = {};
        this.forceEdge = [];

        /* Adaptadores para Compreensão Documental */
        this.readAdapters = {
            "CCBUSCA.CONSULTA": {
                trackNodes: (legalDocument) => {

                },
                trackEdgers: (legalDocument) => {

                },
                purchaseNewDocuments: (legalDocument) => {

                }
            }
        };

        var executeAdapter = (name, callback) => {
            var jobs = [];
            for (let i in documents) {
                if (!readAdapters[i]) {
                    continue;
                }
                for (let legalDocument in documents[i]) {
                    for (let document of documents[i][legalDocument]) {
                        readAdapters[i][name](document);
                    }
                }
            }
            return parallel(jobs, callback);
        };

        this.trackNodes = (callback) => {
            return executeAdapter('trackNodes', callback);
        };

        this.trackEdges = (callback) => {
            return executeAdapter('trackEdges', callback);
        };

        this.purchaseNewDocuments = (callback) => {
            return executeAdapter('purchaseNewDocuments', callback);
        };

        this.track = (callback, depth = 3) => {
            let track = (cb) => {
                this.trackNodes(() => {
                    this.trackEdges(() => {
                        this.puchaseNewDocuments(cb);
                    });
                });
            };
            series([...new Array(depth)].map(() => track), callback);
        };

        return this;
    };

    controller.registerCall("generateRelations", (report, ccbusca, document, description, callback, depth = 3) => {
        let relationsGenerator = GenerateRelations(report, ccbusca);
        return relationsGenerator.track(callback, depth);
    });

};
