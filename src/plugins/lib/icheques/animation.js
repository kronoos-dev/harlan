module.exports = function(lib = {}, img = {}, cjs = {}, ss = {}) {

    var p; // shortcut to reference prototypes
    lib.webFontTxtFilters = {};

    // library properties:
    lib.properties = {
        width: 225,
        height: 225,
        fps: 24,
        color: '#000000',
        webfonts: {},
        manifest: []
    };

    lib.webfontAvailable = function(family) {
        lib.properties.webfonts[family] = true;
        var txtFilters = lib.webFontTxtFilters && lib.webFontTxtFilters[family] || [];
        for (var f = 0; f < txtFilters.length; ++f) {
            txtFilters[f].updateCache();
        }
    };
    // symbols:

    (lib.Símbolo1 = function(mode, startPosition, loop) {
        this.initialize(mode, startPosition, loop, {});

        // Camada 1
        this.shape = new cjs.Shape();
        this.shape.graphics.f('#6D6E71').s().p('AAxBJQgcgLgQgWQgHgMgIgZQgKgcgSgJQgdgOhNAHQh+AMglAvQgJALgCAMIgBAJQABAJgEAGQgFAHgIACQgIABgHgFQgHgEgCgJQgBgJACgMQADgWAQgSQAvg/CQgOQBdgJAoAWQAaAQAPAsQAHARAFAIQAJAMARAGQAtARBggOQBGgLA7gTQAIgCAIAEQAHADADAJQACAIgEAHQgEAIgIACQgbAJgwAKQhSASg9AAQgwAAgfgLg');
        this.shape.setTransform(580.6, 285.5, 0.903, 0.903);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.f('#6D6E71').s().p('AozDCQgIAAgGgFQgGgGgBgIQAAgJAGgGQAGgGAIAAIBYgHQBogLBVgWIgJgNQgUggAQgvQAPgsAxg0QA6g+BAghQBHglAnAUQAtAZgSBVQgaCAi7BJQBDAVBagFQA0gDAzgOQA6gPAqgZQg2gtgDhKQgBgpAPgeQAQgeAdgNQAagLAcAGQAbAFAUAVQAUATAGAfQAKAugbA4QgOAegYAZIACABQAlALAmgIQAmgIAcgXQgMgJgHgJQgXgZgJgfQgJgiAIgeQAFgPALgKQALgLAQgCQAWgDAXAMQAWAMAOAXQAQAagCAgQgCAegUAgQAvAQBAgLQAIgBAHAFQAHAFABAIQABAIgFAHQgEAHgJABQhTAOg9gaQgkAjgzANQg0AMgzgPQgNgDgNgHQgwAhhDATQg8ARhAAEQg6ADg3gIQg/gJgogWQheAchzANQhFAIgmAAgAhwh8QgyAegsAvQglAogPAhQgPAjALATQAHALANAKQDJhBAah4QAMg3gTgLQgFgCgJAAQgcAAgwAcgAC8hwQgRAHgJAUQgJAUABAcQACA/AxAiQAbgXAOgeQAQghAAgcQgBgdgRgRQgPgQgWAAQgJAAgKAEgAF2hLQgFASAGAWQAGAZARARQAHAJAJAGQAhgugWgjQgHgMgLgGQgLgHgJAAIgDAAQgIACgCAHg');
        this.shape_1.setTransform(477.9, 279.9, 0.903, 0.903);

        this.shape_2 = new cjs.Shape();
        this.shape_2.graphics.f('#E6E7E8').s().p('A4SATIAAgmMAwlAAAIAAAmg');
        this.shape_2.setTransform(544.9, 308, 0.903, 0.903);

        this.shape_3 = new cjs.Shape();
        this.shape_3.graphics.f('#E6E7E8').s().p('Eg3NAAUIAAgnMBubAAAIAAAng');
        this.shape_3.setTransform(366.3, 250.4, 0.903, 0.903);

        this.shape_4 = new cjs.Shape();
        this.shape_4.graphics.f('#E6E7E8').s().p('A+nAUIAAgnMA9PAAAIAAAng');
        this.shape_4.setTransform(224.2, 201.8, 0.903, 0.903);

        this.shape_5 = new cjs.Shape();
        this.shape_5.graphics.f('#E6E7E8').s().p('A2WGeIAAs7MAstAAAIAAM7gA1tF1MArcAAAIAArqMgrcAAAg');
        this.shape_5.setTransform(556.1, 166.3, 0.903, 0.903);

        this.shape_6 = new cjs.Shape();
        this.shape_6.graphics.f('#E6E7E8').s().p('AkWCJQguAAghghQghghAAguIAAgyQAAgtAhghQAhggAugBIItAAQAuABAhAgQAhAhAAAtIAAAyQAAAughAhQghAhguAAg');
        this.shape_6.setTransform(653.3, 44.5, 0.903, 0.903);

        this.shape_7 = new cjs.Shape();
        this.shape_7.graphics.f('#E6E7E8').s().p('AkWCIQguABghghQghghABgtIAAgzQgBguAhggQAhghAuABIItAAQAvgBAgAhQAhAggBAuIAAAzQABAtghAhQggAhgvgBg');
        this.shape_7.setTransform(243.7, 295.6, 0.903, 0.903);

        this.shape_8 = new cjs.Shape();
        this.shape_8.graphics.f('#E6E7E8').s().p('AkXCIQguABggghQggghAAgtIAAgzQAAguAgggQAgghAuABIIuAAQAugBAhAhQAgAgABAuIAAAzQgBAtggAhQghAhgugBg');
        this.shape_8.setTransform(163.1, 295.6, 0.903, 0.903);

        this.shape_9 = new cjs.Shape();
        this.shape_9.graphics.f('#E6E7E8').s().p('AkWCIQguABghghQggghgBgtIAAgzQABguAgggQAhghAuABIItAAQAugBAhAhQAgAgAAAuIAAAzQAAAtggAhQghAhgugBg');
        this.shape_9.setTransform(82.6, 295.6, 0.903, 0.903);

        this.shape_10 = new cjs.Shape();
        this.shape_10.graphics.f('#E6E7E8').s().p('AkWCIQguABghghQgggggBgvIAAgyQABgtAgghQAhggAugBIItAAQAuABAhAgQAgAhAAAtIAAAyQAAAvggAgQghAhgugBg');
        this.shape_10.setTransform(82.6, 122, 0.903, 0.903);

        this.shape_11 = new cjs.Shape();
        this.shape_11.graphics.f('#F8C747').s().p('AkXCIQgtAAghggQggghgBguIAAgxQABgvAgggQAhghAtABIIuAAQAugBAhAhQAgAgAAAvIAAAxQAAAuggAhQghAgguAAg');
        this.shape_11.setTransform(316, 86.3, 0.903, 0.903);

        this.shape_12 = new cjs.Shape();
        this.shape_12.graphics.f('#F8C747').s().p('Aw+CIQguAAghggQggghAAguIAAgxQAAgvAgggQAhghAuABMAh9AAAQAtgBAhAhQAhAgAAAvIAAAxQAAAughAhQghAggtAAg');
        this.shape_12.setTransform(155.5, 86.3, 0.903, 0.903);

        this.shape_13 = new cjs.Shape();
        this.shape_13.graphics.f('#35C5CB').s().p('AngCIQguABghghQggghAAguIAAgyQAAguAgggQAhghAuABIPBAAQAugBAhAhQAgAgAAAuIAAAyQAAAuggAhQghAhgugBg');
        this.shape_13.setTransform(100.8, 50.3, 0.903, 0.903);

        this.shape_14 = new cjs.Shape();
        this.shape_14.graphics.f().s('#CCCCCC').ss(1, 1, 1).p('EA1lgb1MhrJAAAQgLABgMABQi9AlgTDBMAAAAwbQABAMACAMQAjC/DBARMBrJAAAQAGgBAGAAQC5gYAfi2QACgNABgMMAAAgwbQgBgMgCgMQgii+jCgSg');
        this.shape_14.setTransform(366.1, 178.2);

        this.shape_15 = new cjs.Shape();
        this.shape_15.graphics.f('#FFFFFF').s().p('Eg1kAb2QjBgRgji/IgDgYMAAAgwbQATjBC9glIAXgCMBrJAAAQDCASAiC+IADAYMAAAAwbIgDAZQgfC2i5AYIgMABg');
        this.shape_15.setTransform(366.1, 178.2);

        this.timeline.addTween(cjs.Tween.get({}).to({
            state: [{
                t: this.shape_15
            }, {
                t: this.shape_14
            }, {
                t: this.shape_13
            }, {
                t: this.shape_12
            }, {
                t: this.shape_11
            }, {
                t: this.shape_10
            }, {
                t: this.shape_9
            }, {
                t: this.shape_8
            }, {
                t: this.shape_7
            }, {
                t: this.shape_6
            }, {
                t: this.shape_5
            }, {
                t: this.shape_4
            }, {
                t: this.shape_3
            }, {
                t: this.shape_2
            }, {
                t: this.shape_1
            }, {
                t: this.shape
            }]
        }).wait(1));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(-1, -1, 734.2, 358.5);

    (lib.Símbolo2 = function(mode, startPosition, loop) {
        this.initialize(mode, startPosition, loop, {});

        // Camada 1
        this.shape = new cjs.Shape();
        this.shape.graphics.f('#FDCAB5').s().p('AoyTNQAAl6C0kGQBaiCBZg2IAC6EQAAjbB0h3QBmhpClgBQCiABBoBuQBzB4AADVIAAV2QkZFxkTGhQkRGikZFxg');
        this.shape.setTransform(244.5, 272.1, 0.721, 0.721);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.f('#E29787').s().p('AoCPiQAAi+gFoyIgFppQAAlPCeicQCCiBDgAAQDfAACKCCQCpCeAAFAIADKBIAELSQg2AAhoAKQhoAKgzAAg');
        this.shape_1.setTransform(257.6, 210.9, 0.721, 0.721);

        this.instance = new lib.Símbolo1();
        this.instance.setTransform(252.7, 123, 0.69, 0.69, 0, 0, 0, 366.1, 178.2);

        this.shape_2 = new cjs.Shape();
        this.shape_2.graphics.f('#FDCAB5').s().p('AHzFQQlDAKkqhYQnDiDjck8QhzipBMhCQA+g2C5APQCKALC6AvQCJAjA5AWQFLCBCjBIQG0DAAABTQAABThlCIQgzBFgyAzg');
        this.shape_2.setTransform(166.6, 434.2, 0.694, 0.694);

        this.shape_3 = new cjs.Shape();
        this.shape_3.graphics.f('#E29787').s().p('AkmATQAeAVA+AHQBHAIBAgRQCtgsAAi/IBpCDIBUC7ImzBNg');
        this.shape_3.setTransform(113, 322.1, 0.694, 0.694);

        this.shape_4 = new cjs.Shape();
        this.shape_4.graphics.f('#E29787').s().p('AloMaIAAmPQAAnrDwkYQBKhYBZg5QAtgcAhgMIBfjoICRDdIhuBIQhZBEhWCRQisEfAAGLIAAGPg');
        this.shape_4.setTransform(211.5, 340.1, 0.694, 0.694);

        this.shape_5 = new cjs.Shape();
        this.shape_5.graphics.f('#E29787').s().p('ArhAAIA1hzIGQg+IHMhfIFshwICrDPIAVDVQAQDNgYgyQgnhOgkgqQgvg4hFgeQiehHlmAgQlmAgivCJQiMBwAACeg');
        this.shape_5.setTransform(147.6, 345.9, 0.694, 0.694);

        this.shape_6 = new cjs.Shape();
        this.shape_6.graphics.f('#E29787').s().p('Ai1E+IjkiHIgKgcQgKgdAAgGQAAgKgNhuQBDB6B4AjQBxAhB1g1QB1g3BFh3QBNiEgLiqIBEDcICUCGIgxCaIhJBtIj3A+g');
        this.shape_6.setTransform(159.8, 310.8, 0.694, 0.694);

        this.shape_7 = new cjs.Shape();
        this.shape_7.graphics.f('#E29787').s().p('AjUA+Ig2hkIA2gFQAfAZBBASQBHASA/gGQCugMAAixIBKAbIAADlIi7Bjg');
        this.shape_7.setTransform(207.1, 299.5, 0.694, 0.694);

        this.shape_8 = new cjs.Shape();
        this.shape_8.graphics.f('#E29787').s().p('ADcE6QntgilVkmIggkxQCEC0DCBwQDmCEEFAAQDsAACPgqQBIgVAYgVIAAENQh+AeihAAQhDAAhIgGg');
        this.shape_8.setTransform(156.4, 443.2, 0.694, 0.694);

        this.shape_9 = new cjs.Shape();
        this.shape_9.graphics.f('#E29787').s().p('AiUsTQAAhqAdhWQB3AuBJBqQBMBuAACGIAASGQAACOhVByQhRBuiDAng');
        this.shape_9.setTransform(230.9, 235.7, 0.694, 0.694);

        this.shape_10 = new cjs.Shape();
        this.shape_10.graphics.f().s('#E29787').ss(12, 1, 0, 3).p('AAAvoQiqAAh5B7Qh4B8AACuIAASHQAACuB4B8QB5B8CqAAQCqAAB6h8QB4h8AAiuIAAyHQAAiuh4h8Qh6h7iqAAg');
        this.shape_10.setTransform(202.6, 235.4, 0.694, 0.694);

        this.shape_11 = new cjs.Shape();
        this.shape_11.graphics.f('#FDBDAB').s().p('AkjNtQh4h7AAiuIAAyHQAAiuB4h8QB5h8CqAAQCqAAB5B8QB5B8AACuIAASHQAACuh5B7Qh5B8iqABQiqgBh5h8g');
        this.shape_11.setTransform(202.6, 235.4, 0.694, 0.694);

        this.shape_12 = new cjs.Shape();
        this.shape_12.graphics.f('#E29787').s().p('AgpKxQgahMAAhRIAC1MQA/A8AiBPQAkBSAABbIAASGQAABdgoBWQgsg+gZhKg');
        this.shape_12.setTransform(180.4, 254.5, 0.694, 0.694);

        this.shape_13 = new cjs.Shape();
        this.shape_13.graphics.f().s('#E29787').ss(12, 1, 0, 3).p('AAAvoQiqAAh5B7Qh5B8AACuIAASHQAACuB5B8QB5B8CqAAQCqAAB5h8QB5h8AAiuIAAyHQAAiuh5h8Qh5h7iqAAg');
        this.shape_13.setTransform(149.4, 259.2, 0.694, 0.694);

        this.shape_14 = new cjs.Shape();
        this.shape_14.graphics.f('#FDBDAB').s().p('AkiNtQh6h7AAivIAAyGQAAiuB6h8QB5h8CpAAQCqAAB6B8QB5B8gBCuIAASGQABCvh5B7Qh6B8iqABQipgBh5h8g');
        this.shape_14.setTransform(149.4, 259.2, 0.694, 0.694);

        this.shape_15 = new cjs.Shape();
        this.shape_15.graphics.f('#E29787').s().p('AhWInQgThXAAhOIAAw8QCeA6AiB2QAMArgBBCQAAAmgDBNIAAJ3QAAAQAIBYQAGBJgFAsQgOCGh5ALQgigxgVhjg');
        this.shape_15.setTransform(127.8, 278.1, 0.694, 0.694);

        this.shape_16 = new cjs.Shape();
        this.shape_16.graphics.f('#FDBDAB').s().p('AkjJmQh4h7AAivIAAp3QAAiuB4h8QB6h8CpAAQCqAAB6B8QB4B8AACuIAAJ3QAACvh4B7Qh6B8iqAAQipAAh6h8g');
        this.shape_16.setTransform(111.3, 279.3, 0.694, 0.694);

        this.shape_17 = new cjs.Shape();
        this.shape_17.graphics.f('#E29787').s().p('AkJEwQhvgzAAhIIHPoXIEiIXQAABIhvAzQhvAzibABQiagBhvgzg');
        this.shape_17.setTransform(118.1, 319.1, 0.694, 0.694);

        this.shape_18 = new cjs.Shape();
        this.shape_18.graphics.f('#EFA693').s().p('EgDYAmuQgJjmABjXQABlnAhh5QAhh1BXikQA3hnCTj4IBkimQCGjiAij+QAYivgCn0IgBjaQAAlumbpHQkimflglYICSiYQBlBlBrB0QC2DICZDJQI/LoAAHyIABDZQABEXgDB0QgFC5gSCEQgpEliaEDIhkCnQiODsgyBeQhSCXgbBjQgWBVgDEoQgDDxALD2g');
        this.shape_18.setTransform(277.8, 334, 0.694, 0.694);

        this.shape_19 = new cjs.Shape();
        this.shape_19.graphics.f('#E29787').s().p('AgjBNIhrmrIEdAaIAAKjg');
        this.shape_19.setTransform(285.4, 274.5, 0.694, 0.694);

        this.shape_20 = new cjs.Shape();
        this.shape_20.graphics.f('#E29787').s().p('Ah+HSI1yAAIAAhGIQDyCIbGmjQBlCOCyEwIjvFkIvnUJIh+EIg');
        this.shape_20.setTransform(193.9, 294.5, 0.694, 0.694);

        this.shape_21 = new cjs.Shape();
        this.shape_21.graphics.f('#E29787').s().p('ADsWPQADhzgCiGQgDkJgYhXQgOgug8hBQgjgkhlhaQjVi/hMh9Qhniwggj0QgJhMgChLIAAubICwjFIAWAAIAAQxIAAAzQACA+AIBAQAaDIBTCMQAnBCBNBPQAuAvBfBVQB2BoAtA0QBLBWAXBSQAcBjAGDwQAECUgECng');
        this.shape_21.setTransform(118.5, 407.2, 0.694, 0.694);

        this.shape_22 = new cjs.Shape();
        this.shape_22.graphics.f('#FDCAB5').s().p('EgO7AmSQADh0gCiFQgDkKgYhXQgOgug8hAQgjglhlhZQjXi/hMh+Qhniwggj1QgJhNgChKIAAuaMAhlgjKICtCyQDQDeCtDgQIpLNAAHNIABJ3QgCBmgOBrQgrFWiSD1IkHG7QhzDNgiB9QgiB5ACGQQACDIAICwg');
        this.shape_22.setTransform(201.4, 336, 0.694, 0.694);

        this.shape_23 = new cjs.Shape();
        this.shape_23.graphics.f('#E29787').s().p('AmSLWQioirAAjvIAAp3QAAjwCoiqQCniqDrAAQDsAACnCqQCoCqAADwIAAJ3QAADvioCrQinCqjsAAQjqAAioiqgAkiplQh5B7AACvIAAJ3QAACuB5B8QB5B8CpAAQCqAAB6h8QB5h8AAiuIAAp3QAAivh5h7Qh6h8iqAAQipAAh5B8g');
        this.shape_23.setTransform(111.2, 279.3, 0.694, 0.694);

        this.timeline.addTween(cjs.Tween.get({}).to({
            state: [{
                t: this.shape_23
            }, {
                t: this.shape_22
            }, {
                t: this.shape_21
            }, {
                t: this.shape_20
            }, {
                t: this.shape_19
            }, {
                t: this.shape_18
            }, {
                t: this.shape_17
            }, {
                t: this.shape_16
            }, {
                t: this.shape_15
            }, {
                t: this.shape_14
            }, {
                t: this.shape_13
            }, {
                t: this.shape_12
            }, {
                t: this.shape_11
            }, {
                t: this.shape_10
            }, {
                t: this.shape_9
            }, {
                t: this.shape_8
            }, {
                t: this.shape_7
            }, {
                t: this.shape_6
            }, {
                t: this.shape_5
            }, {
                t: this.shape_4
            }, {
                t: this.shape_3
            }, {
                t: this.shape_2
            }, {
                t: this.instance
            }, {
                t: this.shape_1
            }, {
                t: this.shape
            }]
        }).wait(1));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(-0.3, -0.3, 506, 506.5);

    // stage content:
    (lib.ichequesanimacao = function(mode, startPosition, loop) {
        this.initialize(mode, startPosition, loop, {});

        // dedo
        this.shape = new cjs.Shape();
        this.shape.graphics.f('#FDCAB5').s().p('AoyTNQAAl6C0kGQBaiCBZg2IAC6EQAAjbB0h3QBmhpClgBQCiABBoBuQBzB4AADVIAAV2QkZFxkTGhQkRGikZFxg');
        this.shape.setTransform(120.1, 157.3, 0.225, 0.225);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.f('#E29787').s().p('AoCPiQAAi+gFoyIgFppQAAlPCeicQCCiBDgAAQDfAACKCCQCpCeAAFAIADKBIAELSQg2AAhoAKQhoAKgzAAg');
        this.shape_1.setTransform(124.2, 138.2, 0.225, 0.225);

        this.timeline.addTween(cjs.Tween.get({}).to({
            state: []
        }).to({
            state: [{
                t: this.shape_1
            }, {
                t: this.shape
            }]
        }, 10).to({
            state: []
        }, 58).to({
            state: []
        }, 1).wait(5));

        // Camada 1
        this.instance = new lib.Símbolo1();
        this.instance.setTransform(122.7, 149.2, 0.216, 0.216, 0, 0, 0, 366.1, 356.4);
        this.instance._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance).wait(26).to({
            _off: false
        }, 0).to({
            rotation: 10
        }, 6).wait(14).to({
            regX: 366.2
        }, 0).to({
            regX: 366.1,
            rotation: 0
        }, 6).to({
            _off: true
        }, 16).wait(6));

        // cheque
        this.instance_1 = new lib.Símbolo1();
        this.instance_1.setTransform(122.7, 110.8, 0.216, 0.216, 0, 0, 0, 366.1, 178.1);
        this.instance_1._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(10).to({
            _off: false
        }, 0).to({
            _off: true
        }, 58).wait(6));

        // Camada 5
        this.instance_2 = new lib.Símbolo1();
        this.instance_2.setTransform(122.7, 149.2, 0.216, 0.216, 0, 0, 0, 366.1, 356.4);
        this.instance_2._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(26).to({
            _off: false
        }, 0).to({
            regX: 366.2,
            regY: 356.5,
            rotation: -10.2
        }, 6).wait(14).to({
            regX: 366.1,
            regY: 356.4,
            rotation: 0
        }, 6).to({
            _off: true
        }, 16).wait(6));

        // Camada 6
        this.instance_3 = new lib.Símbolo1();
        this.instance_3.setTransform(122.7, 149.2, 0.216, 0.216, 0, 0, 0, 366.1, 356.4);
        this.instance_3._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(26).to({
            _off: false
        }, 0).to({
            regX: 366.3,
            rotation: -21.7
        }, 6).wait(14).to({
            regX: 366.1,
            rotation: 0
        }, 6).to({
            _off: true
        }, 16).wait(6));

        // Camada 7
        this.instance_4 = new lib.Símbolo1();
        this.instance_4.setTransform(122.7, 149.2, 0.216, 0.216, 0, 0, 0, 366.1, 356.4);
        this.instance_4._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(26).to({
            _off: false
        }, 0).to({
            regX: 366.2,
            rotation: -33.2
        }, 6).wait(14).to({
            regX: 366.1,
            rotation: 0
        }, 6).to({
            _off: true
        }, 16).wait(6));

        // Camada 8
        this.instance_5 = new lib.Símbolo1();
        this.instance_5.setTransform(122.7, 149.2, 0.216, 0.216, 0, 0, 0, 366.1, 356.4);
        this.instance_5._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(26).to({
            _off: false
        }, 0).to({
            regX: 366.3,
            regY: 356.2,
            rotation: -46.4
        }, 6).wait(14).to({
            regX: 366.4
        }, 0).to({
            regX: 366.1,
            regY: 356.4,
            rotation: 0
        }, 6).to({
            _off: true
        }, 16).wait(6));

        // mao
        this.instance_6 = new lib.Símbolo2();
        this.instance_6.setTransform(122.7, 307.3, 0.313, 0.313, 0, 0, 0, 252.7, 252.8);

        this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(1).to({
            regX: 252.6,
            regY: 252.9,
            y: 274.9
        }, 0).wait(1).to({
            y: 242.7
        }, 0).wait(1).to({
            y: 210.5
        }, 0).wait(1).to({
            y: 178.3
        }, 0).wait(1).to({
            y: 147.2
        }, 0).wait(1).to({
            y: 154.4
        }, 0).wait(1).to({
            y: 151.4
        }, 0).wait(3).to({
            regX: 252.7,
            regY: 252.8,
            y: 151.3
        }, 0).wait(58).to({
            y: 147.2
        }, 0).wait(1).to({
            regX: 252.6,
            regY: 252.9,
            y: 179.5
        }, 0).wait(1).to({
            y: 211.7
        }, 0).wait(1).to({
            y: 243.7
        }, 0).wait(1).to({
            y: 275.6
        }, 0).wait(1).to({
            y: 307.5
        }, 0).wait(1));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(154.1, 338.7, 170, 170);

};
