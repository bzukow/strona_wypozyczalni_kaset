var express = require('express');
var app = express();
var sql = require("mssql/msnodesqlv8");
var db_config = {
    driver: "msnodesqlv8",
    server: "db-mssql",
    database: "s15390",
    options: {
    trustedConnection: true,
    useUTC: true
  }
}
var connection = sql.connect(db_config, function (err) {
    if (err)
        throw err; 
});

module.exports = connection; 

var bodyParser = require('body-parser');
var hbs = require('handlebars');
const handlebars = require('express-handlebars');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const path = require('path');
hbs.registerHelper('list', function(n, block) {
    var index = 0;
    var accum ="";
    for(var i = 0; i < n; ++i){
        if(i%2 == 0){
            var values = Object.values(block.data[i]);
            for(var j = 0 ; j < values.length  ; ++j){
                if(j == 0){
                    index = values[j];
                    accum+="<tr id=\"makeColor\">";
                }
                if(values[j]==null){
                    accum+="<td><div name=\""+index+index+"\" edit_type='click' id=\"doZmiany\">"+""+"</div></td>";
                } else {
                    accum+="<td><div name=\""+index+index+"\" edit_type='click' id=\"doZmiany\">"+values[j]+"</div></td>";
                }
            }
            
            accum+="<td style=\"width: 180px; height: 30px; text-align: center;\"><input style=\"display: none\" name=\"button"+index+index+index+"\" type=\"submit\" value=\"Zatwierdź\" onclick=\"OK(\'"+index+"\')\" /><input style=\"display: none\" name=\"button"+index+index+index+"\" type=\"submit\" value=\"Anuluj\" onclick=\"document.location.reload()\" /> <br /> <input name=\"buttons"+index+"\" id=\""+index+"\" type=\"submit\" value=\"Edytuj\" onclick=\"edit(\'"+index+"\')\" /><br /> <input name=\"buttons"+index+"\" id=\""+index+"\" type=\"submit\" value=\"Usuń\" onclick=\"usun(\'"+index+"\')\" /></td></tr>";
        }else {
            var values = Object.values(block.data[i]);
            for(var j = 0 ; j < values.length  ; ++j){
                if(j == 0){
                    index = values[j];
                    accum+="<tr>";
                }
                if(values[j]==null){
                    accum+="<td><div name=\""+index+index+"\" edit_type='click' id=\"doZmiany\">"+""+"</div></td>";
                } else {
                    accum+="<td><div name=\""+index+index+"\" edit_type='click' id=\"doZmiany\">"+values[j]+"</div></td>";
                }
            }
            
            accum+="<td style=\"width: 180px; height: 30px; text-align: center;\"><input style=\"display: none\" name=\"button"+index+index+index+"\" type=\"submit\" value=\"Zatwierdź\" onclick=\"OK(\'"+index+"\')\" /><input style=\"display: none\" name=\"button"+index+index+index+"\" type=\"submit\" value=\"Anuluj\" onclick=\"document.location.reload()\" /> <br /> <input name=\"buttons"+index+"\" id=\""+index+"\" type=\"submit\" value=\"Edytuj\" onclick=\"edit(\'"+index+"\')\" /><br /> <input name=\"buttons"+index+"\" id=\""+index+"\" type=\"submit\" value=\"Usuń\" onclick=\"usun(\'"+index+"\')\" /></td></tr>";
        }
        
    }
    
    return accum;
});

hbs.registerHelper('klienci', function(n, block) {
    var accum ="<select id=\"idklient\" name=\"kontrolkaIDkli\">";
    for(var i = 0; i < n; ++i){
        var keys = Object.keys(block.data[i]);
        if(keys[0] == "idklient"){
            accum+="<option>";
            var values = Object.values(block.data[i]);
            for(var j = 0 ; j < values.length  ; ++j){
                accum+= values[j] + " ";
            }
            accum+="</option>";
        }
    }
    accum+="</select></br>";
    return accum;
});

hbs.registerHelper('kasety', function(n, block) {
    var accum ="<select id=\"idkaseta\" name=\"kontrolkaIDkas\">";
    for(var i = 0; i < n; ++i){
        var keys = Object.keys(block.data[i]);
        if(keys[0] == "IDKaseta"){
            accum+="<option>";
            var values = Object.values(block.data[i]);
            for(var j = 0 ; j < values.length  ; ++j){
                accum+= values[j] + " ";
            }
            accum+="</option>";
        }
    }
    accum+="</select></br>";
    return accum;
});

app.engine('handlebars', handlebars({
    extname: 'handlebars',
    defaultLayout: 'lista_wypozyczen',
    layoutsDir: __dirname + '/views/'
}))
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'handlebars');

app.get('/lista_kaset', function (req, res) {
    var request = new sql.Request();
    request.query('select idkaseta, convert(varchar(10), dataprodukcji, 120), numerseryjny, tytul, typ, rezyser from kaseta', function (err, result) {
        if (err) 
            return next(err);

            res.render('lista_wypozyczen', {layout: 'lista_kaset.handlebars', data: result.recordset});          
    });
});

app.get('/lista_klientow', function (req, res) {
    var request = new sql.Request();
    request.query('select * from klient', function (err, result) {
        if (err) 
            return next(err);
        res.render('lista_wypozyczen', {layout: 'lista_klientow.handlebars', data: result.recordset});      
    });
});

app.get('/lista_wypozyczen', function (req, res) {
    var request = new sql.Request();
    request.query('SELECT Wypozyczenie.IDWypozyczenie, Wypozyczenie.IDKaseta, Kaseta.Tytul, Wypozyczenie.IDKlient, Klient.Nazwisko, (convert(varchar(10), Wypozyczenie.DataWypozyczenia, 120)) as c, (convert(varchar(10), Wypozyczenie.OczekiwanaDataZwrocenia, 120)) as b, (convert(varchar(10), Wypozyczenie.DataZwrocenia, 120)) as a FROM Wypozyczenie INNER JOIN Kaseta ON Kaseta.IDKaseta=Wypozyczenie.IDKaseta INNER JOIN Klient ON Klient.IDKlient=Wypozyczenie.IDKlient;'
        , function (err, result) {
         if (err) 
             return next(err);
            res.render('lista_wypozyczen', {layout: 'lista_wypozyczen.handlebars', data: result.recordset});      
        }   
    );
});
app.get('/', function (req, res) {
    var request = new sql.Request();
    request.query('SELECT  Wypozyczenie.IDWypozyczenie, Wypozyczenie.IDKaseta, Kaseta.Tytul, Wypozyczenie.IDKlient, Klient.Nazwisko, (convert(varchar(10), Wypozyczenie.DataWypozyczenia, 120)) as c, (convert(varchar(10), Wypozyczenie.OczekiwanaDataZwrocenia, 120)) as b, (convert(varchar(10), Wypozyczenie.DataZwrocenia, 120)) as a FROM Wypozyczenie INNER JOIN Kaseta ON Kaseta.IDKaseta=Wypozyczenie.IDKaseta INNER JOIN Klient ON Klient.IDKlient=Wypozyczenie.IDKlient;'
        , function (err, result) {
         if (err) 
             return next(err);
            res.render('lista_wypozyczen', {layout: 'lista_wypozyczen.handlebars', data: result.recordset});      
        }   
    );
});

app.get('/dodaj_klienta', function (req, res) {
    res.render('lista_wypozyczen', {layout: 'dodaj_klienta.handlebars'});  
});

app.get('/dodaj_kasete', function (req, res) {
    res.render('lista_wypozyczen', {layout: 'dodaj_kasete.handlebars'});          
});

app.get('/dodaj_wypozyczenie', function (req, res) {
    var request = new sql.Request();
    //wybiera wszystkie kasety, które były wypożyczone ale zostały zwrócone 
    //wybiera wszystkie kasety, które do tej pory nie były wypożyczane
    request.query('select kaseta.IDKaseta, kaseta.tytul from kaseta left join wypozyczenie on kaseta.IDKaseta=wypozyczenie.IDKaseta where wypozyczenie.idwypozyczenie is null or (wypozyczenie.idwypozyczenie is not null and wypozyczenie.datazwrocenia is not NULL ) group by kaseta.idkaseta, kaseta.tytul EXCEPT select kaseta.IDKaseta, kaseta.tytul from kaseta left join wypozyczenie on kaseta.IDKaseta=wypozyczenie.IDKaseta where wypozyczenie.idwypozyczenie is not null and wypozyczenie.datazwrocenia is NULL group by kaseta.idkaseta, kaseta.tytul;', function (err, result1) {
        if (err) 
            return next(err);

        request.query('SELECT idklient, nazwisko FROM klient;'
            , function (err, result2) {
            if (err) 
                return next(err);
                var final = result1.recordset.concat(result2.recordset);
                res.render('lista_wypozyczen', {layout: 'dodaj_wypozyczenie.handlebars', data: final });
        });
    });
});

app.post('/lista_kaset', function (req, res) {
    var valid = true;
    if(/^[1-2][0-9]{3}\-[0][1-9]\-[0-2][0-9]$/g.test(req.body.dataProdukcji) 
    || /^[1-2][0-9]{3}\-[0][1-9]\-[3][0-1]$/g.test(req.body.dataProdukcji)
    || /^[1-2][0-9]{3}\-[1][0-2]\-[0-2][0-9]$/g.test(req.body.dataProdukcji)
    || /^[1-2][0-9]{3}\-[1][0-2]\-[3][0-1]$/g.test(req.body.dataProdukcji)){
        var dataProdukcji = new Date(req.body.dataProdukcji);
        var dzisiaj = new Date();
        if(dataProdukcji <= dzisiaj){
            if(/^[0-9]{6}$/g.test(req.body.numerSeryjny)){
                if(/^[A-Za-z0-9]+[A-Za-z0-9\s]*$/g.test(req.body.tytul)){
                    if(req.body.typ == "Horror" || 
                        req.body.typ == "Dokumentalny" ||
                        req.body.typ == "Obyczajowy" ||
                        req.body.typ == "Historyczny" ||
                        req.body.typ == "Komediowy"){
                        if(/^[A-Za-z0-9\s]*$/g.test(req.body.rezyser)){
                            var request = new sql.Request();
                            request.query('SELECT max(idkaseta) from kaseta', function (err, result) {
                                if (err) 
                                    return next(err);   
                                    
                                values = Object.values(result.recordset[0]);
                                var maxID = values[0]+1;
                                request = new sql.Request();
                                request.query('INSERT INTO Kaseta VALUES ('+maxID+', \''+req.body.dataProdukcji+'\' , \''+req.body.numerSeryjny+'\', \''+req.body.tytul+'\', \''+req.body.typ+'\', \''+req.body.rezyser+'\')', function (err, result) {
                                    if (err) 
                                        return next(err);    
                                    
                                    res.json({
                                        valid: valid
                                    })   
                                });
                            });
                        } else{
                            valid = false;
                            res.json({
                                valid: valid
                                })
                            }
                    } else{
                        valid = false;
                        res.json({
                            valid: valid
                            })
                        }
                } else{
                    valid = false;
                    res.json({
                        valid: valid
                        })
                    }
            } else{
                valid = false;
                res.json({
                    valid: valid
                    })
            }
        
        } else {
            valid = false;
                res.json({
                    valid: valid
                    })
        }        
    } else{
        valid = false;
        res.json({
            valid: valid
        })
    }
});
app.post('/lista_klientow', function (req, res) {
    var valid = true;
    if(/^[A-Za-z0-9]+[A-Za-z0-9\s]*$/g.test(req.body.Imie)){
        if(/^[A-Za-z0-9]+[A-Za-z0-9\s]*$/g.test(req.body.Nazwisko)){
            if(/^[0-9]{11}$/g.test(req.body.PESEL) || /^\s*$/g.test(req.body.PESEL)){
                if(/^[A-Za-z0-9]+[A-Za-z0-9\s\/\.]*$/g.test(req.body.Adres)){
                    if(/^[0-9]{3}\-[0-9]{3}\-[0-9]{3}$/g.test(req.body.Telefon)){
                        var request = new sql.Request();
                        request.query('SELECT max(idklient) from klient', function (err, result) {
                            if (err) 
                                return next(err);   
                                
                            values = Object.values(result.recordset[0]);
                            var maxID = values[0]+1;
                            request = new sql.Request();
                            request.query('INSERT INTO klient VALUES ('+maxID+', \''+req.body.Imie+'\' , \''+req.body.Nazwisko+'\', \''+req.body.PESEL+'\', \''+req.body.Adres+'\', \''+req.body.Telefon+'\')', function (err, result) {
                                if (err) 
                                    return next(err);    
                                
                                res.json({
                                    valid: valid
                                })    
                            });
                        });
                    } else{
                        valid = false;
                        res.json({
                            valid: valid
                            })
                        }
                } else{
                    valid = false;
                    res.json({
                        valid: valid
                        })
                    }
            } else{
                valid = false;
                res.json({
                    valid: valid
                    })
                }
        } else{
            valid = false;
            res.json({
                valid: valid
                })
        }
    } else{
        valid = false;
        res.json({
            valid: valid
        })
    } 
});

app.post('/usun_kasete', function (req, res) {
    var request = new sql.Request();

    //sprawdzamy czy taka kaseta nie jest wypozyczona, jesli nie jest - mozemy ją usunąć
    request.query('select count(*) from wypozyczenie inner join kaseta on kaseta.idkaseta=wypozyczenie.idkaseta where kaseta.idkaseta = '+req.body.ID, function (err, result) {
        if (err) 
            return next(err);
        
        values = Object.values(result.recordset[0]);
        if(values[0] == 0){
            request.query('delete from kaseta where idkaseta ='+req.body.ID, function (err, result) {
                if (err) 
                    return next(err);   
                    
                var isOk = true;
                res.json({
                    validate: isOk
                });   
            });
        } else {
            var isOk = false;
            res.json({
                validate: isOk
            });
        }          
    });
});

app.post('/edytuj_kasete', function (req, res) {
    var valid = true;
    if(/^[1-2][0-9]{3}\-[0][1-9]\-[0-2][0-9]$/g.test(req.body.dataProdukcji) 
    || /^[1-2][0-9]{3}\-[0][1-9]\-[3][0-1]$/g.test(req.body.dataProdukcji)
    || /^[1-2][0-9]{3}\-[1][0-2]\-[0-2][0-9]$/g.test(req.body.dataProdukcji)
    || /^[1-2][0-9]{3}\-[1][0-2]\-[3][0-1]$/g.test(req.body.dataProdukcji)){
        var dataProdukcji = new Date(req.body.dataProdukcji);
        var dzisiaj = new Date();
        if(dataProdukcji <= dzisiaj){
            if(/^[0-9]{6}$/g.test(req.body.numerSeryjny)){
                if(/^[A-Za-z0-9]+[A-Za-z0-9\s]*$/g.test(req.body.tytul)){
                    if(req.body.typ == "Horror" || 
                        req.body.typ == "Dokumentalny" ||
                        req.body.typ == "Obyczajowy" ||
                        req.body.typ == "Historyczny" ||
                        req.body.typ == "Komediowy"){
                        if(/^[A-Za-z0-9\s]*$/g.test(req.body.rezyser)){
                            //ID nie sprawdzamy bo nie podlega edycji
                            var request = new sql.Request();
                            request.query('UPDATE kaseta SET dataprodukcji=\''+req.body.dataProdukcji+'\', numerseryjny=\''+req.body.numerSeryjny+'\', tytul=\''+req.body.tytul+'\', typ=\''+req.body.typ+'\', rezyser=\''+req.body.rezyser+'\' WHERE idkaseta='+req.body.ID, function (err, result) {
                                if (err) 
                                    return next(err);
                                res.json({
                                    valid: valid
                                })           
                            });
                        } else{
                            valid = false;
                            res.json({
                                valid: valid
                                })
                        }
                    } else{
                        valid = false;
                        res.json({
                            valid: valid
                            })
                    }
                } else{
                    valid = false;
                    res.json({
                        valid: valid
                        })
                }
            } else{
                valid = false;
                res.json({
                    valid: valid
                    })
            }
        } else {
            valid = false;
            res.json({
                valid: valid
            })
        }    
    } else{
        valid = false;
        res.json({
            valid: valid
        })
    } 
});

app.post('/usun_klienta', function (req, res) {
    var request = new sql.Request();
    //sprawdzamy czy taka klient nie ma wypozyczonej kasety, jesli nie jest - mozemy go usunąć
    request.query('select count(*) from wypozyczenie inner join klient on klient.idklient=wypozyczenie.idklient where klient.idklient = '+req.body.ID, function (err, result) {
        if (err) 
            return next(err);
        
        values = Object.values(result.recordset[0]);
        if(values[0] == 0){
            request.query('delete from klient where idklient ='+req.body.ID, function (err, result) {
                if (err) 
                    return next(err);   
                    
                var isOk = true;
                res.json({
                    validate: isOk
                });   
            });
        } else {
            var isOk = false;
            res.json({
                validate: isOk
            });
        }          
    });
});

app.post('/edytuj_klienta', function (req, res) {
    var valid = true;
    if(/^[A-Za-z0-9]+[A-Za-z0-9\s]*$/g.test(req.body.Imie)){
        if(/^[A-Za-z0-9]+[A-Za-z0-9\s]*$/g.test(req.body.Nazwisko)){
            if(/^[0-9]{11}$/g.test(req.body.PESEL) || /^\s*$/g.test(req.body.PESEL)){
                if(/^[A-Za-z0-9]+[A-Za-z0-9\s\/\.]*$/g.test(req.body.Adres)){
                    if(/^[0-9]{3}\-[0-9]{3}\-[0-9]{3}$/g.test(req.body.Telefon)){
                        //ID nie sprawdzamy bo nie podlega edycji
                        var request = new sql.Request();
                        request.query('UPDATE klient SET imie=\''+req.body.Imie+'\', nazwisko=\''+req.body.Nazwisko+'\', PESEL=\''+req.body.PESEL+'\', Adres=\''+req.body.Adres+'\', Telefon=\''+req.body.Telefon+'\' WHERE idklient='+req.body.ID, function (err, result) {
                            if (err) 
                                return next(err);
                            res.json({
                                valid: valid
                            })           
                        });
                    } else{
                        valid = false;
                        res.json({
                            valid: valid
                            })
                        }
                } else{
                    valid = false;
                    res.json({
                        valid: valid
                        })
                    }
            } else{
                valid = false;
                res.json({
                    valid: valid
                    })
                }
        } else{
            valid = false;
            res.json({
                valid: valid
                })
        }
    } else{
        valid = false;
        res.json({
            valid: valid
        })
    } 
});

app.post('/usun_wypozyczenie', function (req, res) {
    var request = new sql.Request();
    var isOk = true;

    //sprawdzamy czy wprowadzona jest data zwrotu
    request.query('select datazwrocenia from wypozyczenie where idwypozyczenie = '+req.body.ID, function (err, result) {
        if (err) 
            return next(err);

        values = Object.values(result.recordset[0]);
        if(values[0] != null){
            request.query('delete from wypozyczenie where idwypozyczenie ='+req.body.ID, function (err, result) {
                if (err) 
                    return next(err);   
                    
                res.json({
                    validate: isOk
                });   
            });
        } else {
            isOk = false;
            res.json({
                validate: isOk
            });
        }          
    });
});

app.post('/edytuj_wypozyczenie', function (req, res) {
    var valid = true;
    if(/^[1-2][0-9]{3}\-[0][1-9]\-[0-2][0-9]$/g.test(req.body.dataZwrotu) 
    || /^[1-2][0-9]{3}\-[0][1-9]\-[3][0-1]$/g.test(req.body.dataZwrotu)
    || /^[1-2][0-9]{3}\-[1][0-2]\-[0-2][0-9]$/g.test(req.body.dataZwrotu)
    || /^[1-2][0-9]{3}\-[1][0-2]\-[3][0-1]$/g.test(req.body.dataZwrotu)){
        var dataZwrotu = new Date(req.body.dataZwrotu);
        var dataWypozyczenia = new Date(req.body.dataWypozyczenia);
        var dzisiaj = new Date();

        if(dataZwrotu >= dataWypozyczenia){ 
            if(dataZwrotu <= dzisiaj){
                var request = new sql.Request();
                request.query('UPDATE wypozyczenie SET datazwrocenia=\''+req.body.dataZwrotu+'\' WHERE idwypozyczenie='+req.body.ID, function (err, result) {
                    if (err) 
                        return next(err);
                    res.json({
                        valid: valid
                    });        
                });                
            } else {
                valid = false;
                res.json({
                    valid: valid
                });
            } 
        } else {
            valid = false;
            res.json({
                valid: valid
            });
        } 
    } else {
        valid = false;
        res.json({
            valid: valid
        });
    } 
});

app.post('/lista_wypozyczen', function (req, res) {
    var valid = true;
    //sprawdzamy czy na pewno są podane ID w bazie
    var request = new sql.Request();
    request.query('SELECT count(*) FROM kaseta where idkaseta ='+req.body.IDKasety+';'
        , function (err, result) {
         if (err) 
             return next(err);

        values = Object.values(result.recordset[0]);
        if(values[0] != 0){
            request.query('SELECT count(*) FROM klient where idklient ='+req.body.IDKlienta+';'
             , function (err, result) {
                if (err) 
                    return next(err);
                values = Object.values(result.recordset[0]);
                if(values[0] != 0){
                    var request = new sql.Request();
                    request.query('SELECT max(idwypozyczenie) from wypozyczenie', function (err, result) {
                        if (err) 
                            return next(err);   
                                
                        values = Object.values(result.recordset[0]);
                        var maxID = values[0]+1;
                        var dataWypPrzed = new Date();
                        var dataWypozyczenia = format(dataWypPrzed);
                        var oczekiwanaDataZwrPrzed = new Date(dataWypPrzed.setMonth(dataWypPrzed.getMonth()+1));
                        var oczekiwanaDataZwrocenia = format(oczekiwanaDataZwrPrzed);

                        request.query('INSERT INTO wypozyczenie VALUES ('+maxID+', '+req.body.IDKasety+', '+req.body.IDKlienta+', \''+dataWypozyczenia+'\', \''+oczekiwanaDataZwrocenia+'\', '+null+')', function (err, result) {
                            if (err) 
                                return next(err);    
                            
                            res.json({
                                valid: valid
                            })    
                        });
                    });
                } else {
                    valid = false;
                    res.json({
                        valid: valid
                    });
                }

            });     
        } else {
            valid = false;
            res.json({
                valid: valid
            });
        }  
    });
});
function format(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}
var server = app.listen(5000, function () {
    console.log('Server is running...');
});