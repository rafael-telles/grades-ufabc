var processarDisciplinas = function(todasDisciplinas) {
    var ret = [];

    for (var i in todasDisciplinas) {
        var d = todasDisciplinas[i];
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

    for(var i in d.horarios) {
        var h = d.horarios[i];
        h.horas.pop();
        if(h.semana == 6) {
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
    return d1.codigo == d2.codigo &&
        d1.turno == d2.turno &&
        d1.campus == d2.campus &&
        JSON.stringify(d1.horarios) == JSON.stringify(d2.horarios);
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

var atualizarGrade = function() {
    $('#grade').fullCalendar('removeEvents');


    var qntCreditos = 0;
    for (var i in disciplinasEscolhidas) {
        var d = disciplinasEscolhidas[i];

        qntCreditos += d.creditos;

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
            console.log(inicio + ' - ' + fim);

            $('#grade').fullCalendar('renderEvent', {
                title: d.nome,
                start: inicio,
                end: fim,
            });
        }
    }

    $('#creditos')[0].innerHTML = qntCreditos;
}
