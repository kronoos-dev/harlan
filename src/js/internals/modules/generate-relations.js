import times from 'async/times';
import parallel from 'async/parallel';
import _ from 'underscore';

var wrap = require('wordwrap')(20);

var groups = {
    company: {
        shape: 'icon',
        icon: {
            face: 'FontAwesome',
            code: '\uf1ad',
            size: 30,
            color: '#57169a'
        }
    },
    user: {
        shape: 'icon',
        icon: {
            face: 'FontAwesome',
            code: '\uf007',
            size: 30,
            color: '#aa00ff'
        }
    }
};

/* Adaptadores para Compreensão Documental */
var readAdapters = {
    "RFB.CERTIDAO": {
        trackNodes: (relation, legalDocument, document) => {
            return (callback) => {
                return callback(null, $("RFB > socios > socio", document).map((idx, node) => {
                    return relation.createNode(relation.labelIdentification($(node).text()), $(node).text(), "user");
                }).toArray());
            };
        },
        trackEdges: (relation, legalDocument, document) => {
            return (callback) => {
                return callback(null, $("RFB > socios > socio", document).map((idx, node) => {
                    return relation.createEdge(legalDocument, relation.labelIdentification($(node).text()));
                }).toArray());
            };
        },
        purchaseNewDocuments: (relation, legalDocument, document) => {
            return (callback) => {
                callback();
            };
        }
    },
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
    var labelIdentification = {};

    this.createEdge = (vfrom, vto) => {
        return {
            from: vfrom,
            to: vto
        };
    };

    this.createNode = (id, label, group, data = {}) => {

        labelIdentification[label] = id;

        return $.extend({
            id: id,
            label: wrap(label),
            group: group,
        }, data);
    };

    this.labelIdentification = (label) => {
        return labelIdentification[label] || label;
    }

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
                edges: _.uniq(_.flatten(_.pluck(results, "edges")), false, (n) => {
                    let t = n.from >= n.to,
                        a = t ? n.from : n.to,
                        b = !t ? n.from : n.to;
                    
                    return `${b}:${a}`;
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
