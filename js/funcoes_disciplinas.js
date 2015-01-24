var processarDisciplinas = function (ds) {
    var ret = [];

    for (var i in ds) {
        var d = ds[i];
        completarDisciplina(d);

        var temDuplicata = false;
        for (var j in ret) {
            var unica = ret[j];
            if (verificarDuplicata(d, unica)) {
                unica.turmas = unica.turmas.concat(d.turmas);

                temDuplicata = true;
                break;
            }
        }
        if (!temDuplicata) {
            ret.push(d);
        }
    }
    return ret;
};

var completarDisciplina = function(d) {
    var patt = /(.*) (\w+(?=-))-(\w+) \((.*)\)/;
    var match = patt.exec(d.nome);
    d.nome = match[1];
    d.turmas = [match[2]];
    d.periodo = match[3];
    d.campus = match[4];

    for (var i in d.horarios) {
        var h = d.horarios[i];
        h.horas.pop();
        if (h.semana == 6) {
            h.semana = 0;
        }
    }

    d.sigla = "";
    var partes = d.nome.split(" ");
    for (var i in partes) {
        var caractere = partes[i].charAt(0);
        if (caractere == caractere.toUpperCase()) {
            d.sigla += caractere;
        }
    }

    d.descricao = (d.codigo + ' ' + d.nome + ' ' + d.sigla + ' ' + d.turmas.join(', ') + ' ' + d.periodo + ' ' + d.campus).toUpperCase();
    d.descricao = normalizarTexto(d.descricao);
        
};

var verificarDuplicata = function(d1, d2) {
    return false;
    /* return d1.codigo == d2.codigo &&
        d1.turno == d2.turno &&
        d1.campus == d2.campus &&
        JSON.stringify(d1.horarios) == JSON.stringify(d2.horarios); */
};

var buscarDisciplinas = function(termo) {
    termo = termo || '';
    termo = normalizarTexto(termo);
    var partes = termo.split(" ");
    var ret = [];
    for (var i in todasDisciplinas) {
        var encontrou = true;
        for (var j in partes) {
            if (todasDisciplinas[i].descricao.indexOf(partes[j]) == -1) {
                encontrou = false;
                break;
            }
        }
        if (encontrou) {
            ret.push(todasDisciplinas[i]);
        }
    }
    return ret;
};

var verificarConflito = function(d1, d2) {
    for (var i in d1.horarios) {
        var h1 = d1.horarios[i];
        for (var j in d2.horarios) {
            var h2 = d2.horarios[j];

            if (h1.periodicidade_extenso == h2.periodicidade_extenso ||
                h1.periodicidade_extenso == " - semanal" ||
                h2.periodicidade_extenso == " - semanal") {
                if (h1.semana == h2.semana) {
                    for (var m in h1.horas) {
                        var hs1 = h1.horas[m];
                        for (var n in h2.horas) {
                            var hs2 = h2.horas[n];
                            if (hs1 == hs2) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}

var gerarCor = function(i) {
    return ['#F44336', //Red
            '#9C27B0', //Purple
            '#009688', //Teal
            '#8BC34A', //Light Green
            '#607D8B', //Blue Grey
            '#FF5722', //Deep Orange
            '#4CAF50', //Green
            '#03A9F4', //Light Blue
            '#E91E63', //Pink
            '#795548', //Brown
           ][i];
}

var normalizarTexto = function(texto) {
    return texto.toUpperCase()
        .replace(/[ÂÁÃÀ]/g, "A")
        .replace(/[ÊÉÈ]/g, "E")
        .replace(/[ÍÌÎ]/g, "I")
        .replace(/[ÓÔÕÒ]/g, "O")
        .replace(/[ÚÙÛ]/g, "U")
        .replace(/Ç/g, "C")
        .trim();
};

var todasDisciplinas = processarDisciplinas(todasDisciplinas);
var disciplinasEscolhidas = [];

var atualizarHash = function() {
    var ids = $.map(disciplinasEscolhidas, function(el, i) {
        return todasDisciplinas.indexOf(el);
    });
    window.location.hash = ids.join(',');
}

var resgatarHash = function() {
    var ids = window.location.hash.substring(1).split(',');
    disciplinasEscolhidas.length = 0;
    for (var i in ids) {
        var d = todasDisciplinas[ids[i]];
        if (d) {
            disciplinasEscolhidas.push(d);
            d.escolhida = true;
        }
    }
    atualizarGrade();
}

var atualizarGrade = function() {
    atualizarHash();

    $('.grade').fullCalendar('removeEvents');

    for (var i in disciplinasEscolhidas) {
        var d = disciplinasEscolhidas[i];

        for (var j in d.horarios) {
            var h = d.horarios[j];
            var dia = moment().utc().day(h.semana);
            var inicio = dia
                .hours(parseInt(h.horas[0].split(':')[0]))
                .minutes(parseInt(h.horas[0].split(':')[1]))
                .seconds(1)
                .toISOString();
            var fim = dia
                .hours(parseInt(h.horas[h.horas.length - 1].split(':')[0]))
                .minutes(parseInt(h.horas[h.horas.length - 1].split(':')[1]) + 30)
                .seconds(0)
                .toISOString();
            var grade = $('.grade');
            if (h.periodicidade_extenso === " - quinzenal (I)") grade = $("#grade-a");
            if (h.periodicidade_extenso === " - quinzenal (II)") grade = $("#grade-b");
            grade.fullCalendar('renderEvent', {
                title: d.sigla,
                url: linkHelp(d),
                start: inicio,
                end: fim,
                color: gerarCor(i)
            });
        }
    }
}
