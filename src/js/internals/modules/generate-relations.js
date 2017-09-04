import timesSeries from 'async/times';
import parallel from 'async/parallel';
import eachLimit from 'async/eachLimit';
import _ from 'underscore';
import {
    CPF,
    CNPJ
} from 'cpf_cnpj';

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

module.exports = (controller) => {

    /* Adaptadores para Compreensão Documental */
    var readAdapters = {
        "JUCESP.DOCUMENT": {
            trackNodes: (relation, legalDocument, document) => (callback) => {
                let nodes = [];
                eachLimit(_.uniq($("text", document)
                        .text()
                        .match(/[\d]{3}(\.)?[\d]{3}(\.)?[\d]{3}(\-)?\d{2}?/g)
                        .map(e => e.replace(/[^\d]/g, '')))
                    .filter((c) => CPF.isValid(c)), 2, (cpf_cnpj, cb) => {
                        controller.server.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'", {
                            data: {
                                documento: cpf_cnpj
                            },
                            error : () => nodes.push(relation.createNode(cpf_cnpj, CPF.format(cpf_cnpj), "user", {
                                unlabel: true
                            })),
                            success: (data) => nodes.push(relation.createNode(cpf_cnpj, $("nome", data).text(), "user", {
                                unlabel: true
                            })),
                            complete: () => cb()
                        });
                    }, () => {
                        debugger;
                        callback(null, nodes)
                    });
            },
            trackEdges: (relation, legalDocument, document) => (callback) => {
                let nodes = _.uniq($("text", document)
                        .text()
                        .match(/[\d]{3}(\.)?[\d]{3}(\.)?[\d]{3}(\-)?\d{2}?/g).map(e => e.replace(/[^\d]/g, '')))
                    .filter((c) => CPF.isValid(c))
                    .map(document => relation.createEdge(legalDocument, document));
                debugger;
                return callback(null, nodes);
            },
            purchaseNewDocuments: (relation, legalDocument, document) => callback => callback()
        },
        "CBUSCA.CONSULTA": {
            trackNodes: (relation, legalDocument, document) => {
                return (callback) => {
                    return callback(null, $("socios > socio", document).map((idx, node) => {
                        return relation.createNode($(node).text(), $(node).attr("nome"), "user", {
                            unlabel: true
                        });
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
            purchaseNewDocuments: (relation, legalDocument, document) => callback => callback()
        },
        "FINDER.RELATIONS": {
            trackNodes: (relation, legalDocument, document) => {
                return (callback) => {
                    var response = callback(null, $("localizePessoasRelacionadas > localizePessoasRelacionadas", document).map((idx, node) => {
                        if (/^6/.test($("grupo", node).text())) return;
                        let document = $("documento", node).text();
                        return relation.createNode(document, $("nome", node).text(), CPF.isValid(document) ? "user" : "company", {
                            unlabel: true
                        });
                    }).toArray());
                    return response;
                };
            },
            trackEdges: (relation, legalDocument, document) => {
                return (callback) => {
                    var response = callback(null, $("localizePessoasRelacionadas > localizePessoasRelacionadas", document).map((idx, node) => {
                        if (/^6/.test($("grupo", node).text())) return;
                        return relation.createEdge(legalDocument, $("documento", node).text());
                    }).toArray());
                    return response;
                };
            },
            purchaseNewDocuments: (relation, legalDocument, document) => callback => callback()
        },
        "RFB.CERTIDAO": {
            trackNodes: (relation, legalDocument, document) => {
                return (callback) => {
                    var response = callback(null, $("RFB > socios > socio", document).map((idx, node) => {
                        let label = $(node).text();
                        return relation.createNode(relation.labelIdentification(label), label, "user", {
                            unlabel: true
                        });
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
            purchaseNewDocuments: (relation, legalDocument, document) => callback => callback()
        },
        "CCBUSCA.CONSULTA": {
            trackNodes: (relation, legalDocument, document) => {
                return (callback) => {
                    let nodes = $("parsocietaria empresa", document).map((idx, node) => {
                        return relation.createNode($("cnpj", node).text(), $("nome", node).first().text(), "company", {
                            unlabel: true
                        });
                    }).toArray();

                    nodes = nodes.concat($("qsa socio", document).map((idx, node) => {
                        return relation.createNode($("doc", node).text(), $("nome", node).first().text(), "user", {
                            unlabel: true
                        });
                    }).toArray());


                    nodes.push(relation.createNode(
                        $("cadastro cpf", document).first().text(),
                        $("cadastro nome", document).first().text(),
                        "user", {
                            unlabel: true
                        }));

                    return callback(null, nodes);
                };
            },
            trackEdges: (relation, legalDocument, document) => {
                return (callback) => {

                    let nodes = $("parsocietaria empresa", document).map((idx, node) => {
                        return relation.createEdge($("cadastro cpf", document).first().text(), $("cnpj", node).first().text());
                    }).toArray();

                    nodes = nodes.concat($("qsa socio", document).map((idx, node) => {
                        return relation.createEdge($("cadastro cpf", document).first().text(), $("doc", node).first().text());
                    }).toArray());

                    return callback(null, nodes);
                };
            },
            purchaseNewDocuments: (relation, legalDocument, document) => callback => callback()
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
            for (let documentType in documents) {
                if (!readAdapters[documentType] || !readAdapters[documentType][method]) {
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
                    edges = _.uniq(_.map(_.flatten(_.pluck(results, "edges")), (edge) => {
                        for (let i of ['to', 'from']) {
                            if (unlabers.indexOf(edge[i]) !== -1) {
                                let result = _.findWhere(nodes, {
                                    label: edge[i]
                                });
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
