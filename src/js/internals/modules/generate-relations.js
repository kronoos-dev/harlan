import times from 'async/times';
import parallel from 'async/parallel';
import _ from 'underscore';

var groups = {
    groups: {
        company: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf1ad',
                size: 50,
                color: '#57169a'
            }
        },
        user: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf007',
                size: 50,
                color: '#aa00ff'
            }
        }
    }
};

/* Adaptadores para Compreensão Documental */
var readAdapters = {
    "CCBUSCA.CONSULTA": {
        trackNodes: (relation, legalDocument, document) => {
            return (callback) => {
                let nodes = $("parsocietaria empresa", document).map((idx, node) => {
                    return relation.createNode($(node).find("cnpj").text(), $(node).find("nome").text(), "company");
                }).toArray();

                nodes.push(relation.createNode(
                    $(document).find("cadastro cpf").text(),
                    $(document).find("cadastro nome").text(),
                    "user"));
                callback(null, nodes);
            };
        },
        trackEdges: (relation, legalDocument, document) => {
            return (callback) => {
                return callback(null, $("parsocietaria empresa", document).map((idx, node) => {
                    return relation.createEdge($(document).find("cadastro cpf").text(), $(node).find("cnpj").text());
                }).toArray());
            };
        },
        purchaseNewDocuments: (relation, legalDocument, document) => {
            return (callback) => {
                callback();
            };
        }
    }
};

var GenerateRelations = function() {

    /* Documents */
    var documents = {};

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

    var executeAdapter = (method, callback) => {
        let jobs = [];
        for (let documentType in documents) {
            if (!readAdapters[documentType][method]) {

                continue;
            }

            for (let legalDocument in documents[documentType]) {
                for (let document of documents[documentType][legalDocument]) {
                    jobs.push(readAdapters[documentType][method](this, legalDocument, document));
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
        return times(depth, (i, callback) => {
            this.trackNodes((err, nodes) => {
                this.trackEdges((err, edges) => {
                    this.purchaseNewDocuments((err, documents) => {
                        callback(null, {
                            iteraction: i,
                            nodes: nodes,
                            edges: edges
                        });
                    });
                });
            });
        }, (err, results) => {
            callback({
                edges: _.uniq(_.flatten(_.pluck(results, "edges")), false, (a) => {
                    return `${a.to}:${a.from}`;
                }),
                nodes: _.uniq(_.flatten(_.pluck(results, "nodes")), false, (a) => {
                    return a.id;
                }),
                groups: groups
            });
        });
    };
};

module.exports = (controller) => {

    controller.registerCall("generateRelations", () => {
        return new GenerateRelations();
    });

    controller.registerCall("generateRelations::createAdapter", (adapterName, adapter, group = null) => {
        readAdapters[adapterName] = adapter;
        if (group) {
            $.extend(groups, group);
        }
    });

};
