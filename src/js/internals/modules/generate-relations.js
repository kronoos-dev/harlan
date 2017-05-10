import timesSeries from 'async/times';
import parallel from 'async/parallel';
import _ from 'underscore';

const START_ZERO = /^0+/;
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
    "CBUSCA.CONSULTA": {
        trackNodes: (relation, legalDocument, document) => {
            return (callback) => {
                return callback(null, $("socios > socio", document).map((idx, node) => {
                    return relation.createNode($(node).text(), $(node).attr("nome"), "user", {unlabel: true});
                }).toArray());
            };
        },
        trackEdges: (relation, legalDocument, document) => {
            return (callback) => {
                return callback(null, $("socios > socio", document).map((idx, node) => {
                    return relation.createEdge(legalDocument, $(node).text());
                }).toArray());
            };
        },
        purchaseNewDocuments: (relation, legalDocument, document) => {
            return (callback) => {
                callback();
            };
        }
    },
    "RFB.CERTIDAO": {
        trackNodes: (relation, legalDocument, document) => {
            return (callback) => {
                var response = callback(null, $("RFB > socios > socio", document).map((idx, node) => {
                    let label = $(node).text();
                    return relation.createNode(relation.labelIdentification(label), label, "user", {unlabel: true});
                }).toArray());
                return response;
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
                    return relation.createNode($("cnpj", node).text(), $("nome", node).text(), "company", {unlabel: true});
                }).toArray();

                nodes = nodes.concat($("qsa socio", document).map((idx, node) => {
                    return relation.createNode($("doc", node).text(), $("nome", node).text(), "user", {unlabel: true});
                }).toArray());


                nodes.push(relation.createNode(
                    $("cadastro cpf", document).text(),
                    $("cadastro nome", document).text(),
                    "user", {unlabel: true}));

                return callback(null, nodes);
            };
        },
        trackEdges: (relation, legalDocument, document) => {
            return (callback) => {

                let nodes = $("parsocietaria empresa", document).map((idx, node) => {
                    return relation.createEdge($("cadastro cpf", document).text(), $("cnpj", node).text());
                }).toArray();

                nodes = nodes.concat($("qsa socio", document).map((idx, node) => {
                    return relation.createEdge($("cadastro cpf", document).text(), $("doc", node).text());
                }).toArray());

                return callback(null, nodes);
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
            from: vfrom.replace(START_ZERO, ''),
            to: vto.replace(START_ZERO, '')
        };
    };

    this.createNode = (id, label, group, data = {}) => {
        labelIdentification[label] = id;
        return $.extend({
            id: id.replace(START_ZERO, ''),
            label: wrap(label),
            group: group,
        }, data);
    };

    this.labelIdentification = (label) => {
        return labelIdentification[label] || label;
    };

    /* Append Document */
    this.appendDocument = (document, legalDocument) => {
        var query = $("BPQL > header > query", document),
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
        console.debug(documents);
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
        return timesSeries(depth, (i, callback) => {
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
            let allNodes = _.uniq(_.flatten(_.pluck(results, "nodes")), false, (a) => a.id),
                unlabers = _.pluck(_.filter(allNodes, (node) => node.unlabel), "label"),
                nodes = _.filter(allNodes, (node) => unlabers.indexOf(node.id) === -1),
                edges =  _.uniq(_.map(_.flatten(_.pluck(results, "edges")), (edge) => {
                    for (let i of ['to', 'from']) {
                        if (unlabers.indexOf(edge[i]) !== -1) {
                            let result = _.findWhere(nodes, {label: edge[i]});
                            if (result) edge[i] = result.id;
                        }
                    }
                    return edge;
                }), false, (n) => {
                    let t = n.from >= n.to,
                        a = t ? n.from : n.to,
                        b = !t ? n.from : n.to;

                    return `${b}:${a}`;
                });

            callback({
                edges: edges,
                nodes: nodes,
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
