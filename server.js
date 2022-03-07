const express = require("express")
const cevap = require("express/lib/response")

const dosyaSistemi = require("fs")

const pdfparse = require("pdf-parse")
 
var tezCesit
var hoca = " ", tezYazar = "", donem = "", ozet = "", konu = "", tezAnahtarK = "", danisman = "", juri = ""

let yerelSunucu = express()

const mongoose = require('mongoose')

const veriTabani = "mongodb+srv://yazlabb:yazlabb@cluster.zhjlu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose.connect(veriTabani)
    .then((sonuc) => {
        yerelSunucu.listen(7000)
    })
    .catch((hata) => {
        console.log(hata)
    })
const hocalardb=require("./dbhocalar")
const pdfDatabase=require("./pdfDatabase")
const { log } = require("console")
yerelSunucu.set('view engine', 'ejs')
const upload = require('express-fileupload')
yerelSunucu.use(upload())
yerelSunucu.use(express.urlencoded({ extended: true }))
yerelSunucu.use(express.static('images'))
yerelSunucu.use(express.static('PdfDokümanları'))

yerelSunucu.get("/", (istek, cevap) => {
    cevap.render("firstlogin")
})
yerelSunucu.get("/firstlogin", (istek, cevap) => {
    cevap.render("firstlogin")
})
yerelSunucu.get("/admingiris", (istek, cevap) => {
    cevap.render("admingiris")
})
yerelSunucu.post("/admingiris", (istek, cevap) => {
    if (istek.body.kullanici === "yönetici" && istek.body.sifre === "yönetici") {
        cevap.redirect("adminicerisi")
    }
    else {
        console.log("Yönetici adı ve şifresi hatalı girildi")
    }
})
yerelSunucu.get("/adminicerisi", (istek, cevap) => {
    cevap.render("adminicerisi")
})
yerelSunucu.post("/adminicerisi", (istek, cevap) => {
    if ((typeof istek.body.addkullanc) != 'undefined' || (typeof istek.body.addsifre) != 'undefined') {

        const dbhocalar = new hocalardb({
            hocaAdi: istek.body.addkullanc,
            hocaSoyadi: istek.body.addsifre
        })
        dbhocalar.save()
            .then((sonuc) => {
                cevap.render('adminicerisi')
            })
            .catch((hata) => {
                console.log(hata)
            })

    }
    if ((typeof istek.body.guncadi1) != 'undefined') {
        hocalardb.deleteOne({ kullanici_adi: istek.body.guncadi1 }, (hata) => {
            if (hata) throw hata
        })
        const dbhocalar = new hocalardb({
            hocaAdi: istek.body.guncadi2,
            hocaSoyadi: istek.body.guncsifre
        })
        dbhocalar.save()
            .then((sonuc) => {
                cevap.render('adminicerisi')
            })
            .catch((hata) => {
                console.log(hata)
            })
    }
    if ((typeof istek.body.kullanicisil) != 'undefined') {
        hocalardb.deleteOne({ hocaAdi: istek.body.kullanicisil }, (hata) => {
            if (hata) throw hata
            cevap.render('adminicerisi')
        })
    }
    
})
yerelSunucu.post("/firstlogin",(istek,cevap)=>{
    hocalardb.find().then((sonuc)=>{
        for(var i=0;i<sonuc.length;i++){
            if(istek.body.Kul_adi===sonuc[i].hocaAdi && istek.body.sifre===sonuc[i].hocaSoyadi){
                hoca=istek.body.Kul_adi
                cevap.redirect("kullaniciicerisi")
            }
            else{
                console.log("Kullanıcı adı veya şifresi hatalı girildi")
            }
        }
    })
})
yerelSunucu.post("/",(istek,cevap)=>{
    hocalardb.find().then((cikti)=>{
        for(var i=0;i<cikti.length;i++){
            if(istek.body.Kul_adi===cikti[i].hocaAdi && istek.body.sifre===cikti[i].hocaSoyadi){
                hoca=istek.body.Kul_adi
                cevap.redirect("kullaniciicerisi")
            }
            else{
                console.log("Kullanıcı adı veya şifresi hatalı girildi")
            }
        }
    })
})
yerelSunucu.get("/kullaniciicerisi",(istek,cevap)=>{
    cevap.render("kullaniciicerisi")
})
yerelSunucu.post("/kullaniciicerisi",(istek,cevap)=>{
    
    if (istek.files) {
        console.log("Pdf sisteme yüklendi.")
        var pdfDokumani = istek.files.file_pdf
        var pdfDokumaniAdi = pdfDokumani.name
        pdfDokumani.mv("./PdfDokümanları/" + pdfDokumaniAdi, function (hata) {
            if (hata) {
                console.log(hata)
            }
            else {

                var pdfDosya = dosyaSistemi.readFileSync("./PdfDokümanları/" + pdfDokumaniAdi)
                pdfparse(pdfDosya).then(function (bilgi) {
                    var pdfDizi = []
                    var pdfBilgi = bilgi.text
                    const pdfBöl = bilgi.text.split(' ')

                    tezCesit = pdfBöl[11] + " " + pdfBöl[12]
                    for (var i = 0; i < pdfBöl.length; i++) {
                        if (pdfBöl[i] === "No:") {
                            tezYazar = tezYazar + pdfBöl[i + 1] + " " + pdfBöl[i + 4] + " " + pdfBöl[i + 5] + " "
                            if (pdfBöl[i + 1].charAt(5) == '1') {
                                tezYazar = tezYazar + " 1.Öğretim"
                            }
                            else if (pdfBöl[i + 1].charAt(5) == '2') {
                                tezYazar = tezYazar + "2.Öğretim    "
                            }
                        }

                    }
                    for (var i = 0; i < pdfBöl.length; i++) {
                        if (pdfBöl[i] == "Tarih:") {
                            if (pdfBöl[i + 1].charAt(3) == '0') {
                                if (parseInt(pdfBöl[i + 1].charAt(4)) > 6) {
                                    donem = "Güz"
                                }
                                else {
                                    donem = "Bahar"
                                }
                            }
                            else {
                                donem = "Güz"
                            }
                        }

                    }

                    for (var i = 0; i < pdfBöl.length; i++) {
                        if (pdfBöl[i].charAt(1) == 'Ö' && pdfBöl[i].charAt(2) == 'Z' && pdfBöl[i].charAt(3) == 'E' && pdfBöl[i].charAt(4) == 'T' && pdfBöl[i + 1].length <= 15) {
                            for (var j = i + 1; j < pdfBöl.length; j++) {
                                if (pdfBöl[j].charAt(1) == 'A' && pdfBöl[j].charAt(2) == 'n' && pdfBöl[j].charAt(3) == 'a' && pdfBöl[j].charAt(4) == 'h' && pdfBöl[j].charAt(5) == 't') {
                                    break
                                }
                                ozet = ozet + pdfBöl[j] + " "
                            }
                        }
                    }
                    for (var i = 16; i < 250; i++) {
                        konu = konu + pdfBöl[i] + " "
                        if (pdfBöl[i].length < 2) {
                            break
                        }
                    }
                    for (var i = 0; i < pdfBöl.length; i++) {
                        if (pdfBöl[i] == "kelimeler:") {
                            for (var j = i + 1; j < i + 50; j++) {
                                if (pdfBöl[j].length <= 2 && pdfBöl[j + 1].length <= 2) {
                                    break
                                }
                                tezAnahtarK = tezAnahtarK + pdfBöl[j] + " "
                            }
                        }
                    }
                    var sayac = 0;
                    for (var i = 0; i < 500; i++) {
                        if (pdfBöl[i].charAt(2) == '.' && pdfBöl[i].charAt(20) == '.' && pdfBöl[i].length > 45) {
                            for (var j = i; j > 0; j--) {
                                if (pdfBöl[j].length <= 2) {
                                    sayac = j + 1
                                    break
                                }
                            }
                            for (var t = sayac; t < pdfBöl.length; t++) {
                                if (pdfBöl[t + 1] == "Kocaeli") {
                                    break;
                                }
                                danisman = danisman + pdfBöl[t] + " "
                            }
                            break
                        }
                    }
                    var sayacbreak=0
                    for (var i = 0; i < 70; i++) {
                        if (pdfBöl[i].charAt(25) == '.' && pdfBöl[i].length > 45) {
                            for (var j = i; j > 0; j--) {
                                if (pdfBöl[j].length <= 2) {
                                    sayac = j + 1
                                    break
                                }
                            }
                            for (var t = sayac; t < pdfBöl.length; t++) {
                                if (pdfBöl[t + 1] == "Kocaeli") {
                                    var sayac3=0;
                                    for(var l=t;l<pdfBöl.length;l++){
                                        if(pdfBöl[l].length>45){
                                            sayac3=l
                                            break
                                        }
                                    }
                                    t=sayac3+1
                                    if(pdfBöl[t].length==0 || pdfBöl[t].length==1 || pdfBöl[t].length>45){
                                        break
                                        sayacbreak=1
                                    }
                                    else{
                                        if(pdfBöl[t].charAt(1)=='T' || pdfBöl[t].charAt(0)=='T'){
                                            break
                                            sayacbreak=1
                                        }
                                    }
                                   
                                }
                                juri = juri + pdfBöl[t] + " "

                            }
                            break
                        }
                        
                    }
                    const dbfile = new pdfDatabase({
                        pdf: pdfDokumaniAdi, yazan: tezYazar, adi: tezCesit, ozeti: ozet, donemi: donem, konusu: konu, anahtari: tezAnahtarK, danismani: danisman, jurileri: juri, kullanicisi: hoca
                    })
                    dbfile.save().then((sonuc) => {
                        cevap.render('kullaniciicerisi')
                    })
                        .catch((hata) => {
                            cevap.render(hata)
                        })




                })
            }
        })
    }
})
yerelSunucu.get("/hocasorgular",(istek,cevap)=>{
    cevap.render(__dirname + "/views/hocasorgular", {
        bilgiler: {
            pdf: "", yazan: " ", adi: "", ozeti: "", donemi: "", konusu: "", anahtari: "", danismani: "", jurileri: "", kullanicisi: ""
        }
    })
})

var kayitlar = []
var kayit_A = [], kayit_B = [], kayit_C = [], kayit_D = []
var kayit6 = [], kayit7 = [], kayit8 = []

yerelSunucu.post("/hocasorgular",(istek,cevap)=>{
    var i = 0, sayac2 = 0;
    pdfDatabase.find({ kullanicisi: hoca })
        .then((sonuc1) => {
            if (istek.body.Tez_Sahibi.length != 0) {
                for (i = 0; i < sonuc1.length; i++) {

                    if (sonuc1[i].yazan.search(istek.body.Tez_Sahibi) != -1) {
                        kayitlar.push(sonuc1[i])
                    }
                }
            }
            else {
                kayitlar = sonuc1
            }
            if (istek.body.Proje_konusu.length != 0) {
                for (i = 0; i < kayitlar.length; i++) {

                    if (kayitlar[i].konusu.search(istek.body.Proje_konusu) != -1) {
                        kayit_A.push(kayitlar[i])
                    }
                }
            }
            else {
                kayit_A = kayitlar
            }
            if (istek.body.Ders_adi.length != 0) {
                for (i = 0; i < kayit_A.length; i++) {

                    if (kayit_A[i].adi.search(istek.body.Ders_adi) != -1) {
                        kayit_B.push(kayit_A[i])
                    }
                }
            }
            else {
                kayit_B = kayit_A
            }
            if (istek.body.Proje_ozeti.length != 0) {
                for (i = 0; i < kayit_B.length; i++) {

                    if (kayit_B[i].ozeti.search(istek.body.Proje_ozeti) != -1) {
                        kayit_C.push(kayit_B[i])
                    }
                }
            }
            else {
                kayit_C = kayit_B
            }
            if (istek.body.Proje_donemi.length != 0) {
                for (i = 0; i < kayit_C.length; i++) {

                    if (kayit_C[i].donemi.search(istek.body.Proje_donemi) != -1) {
                        kayit_D.push(kayit_C[i])
                    }
                }
            }
            else {
                kayit_D = kayit_C
            }
            if (istek.body.Proje_anahtar.length != 0) {
                for (i = 0; i < kayit_D.length; i++) {

                    if (kayit_D[i].anahtari.search(istek.body.Proje_anahtar) != -1) {
                        kayit6.push(kayit_D[i])
                    }
                }
            }
            else {
                kayit6 = kayit_D
            }
            if (istek.body.Proje_danisman.length != 0) {
                for (i = 0; i < kayit6.length; i++) {

                    if (kayit6[i].danismani.search(istek.body.Proje_danisman) != -1) {
                        kayit7.push(kayit6[i])
                    }
                }
            }
            else {
                kayit7 = kayit6
            }
            if (istek.body.Proje_juri.length != 0) {
                for (i = 0; i < kayit7.length; i++) {

                    if (kayit7[i].jurileri.search(istek.body.Proje_juri) != -1) {
                        kayit8.push(kayit7[i])
                    }
                }
            }
            else {
                kayit8 = kayit7
            }
            cevap.render("hocasorgular", { bilgiler : kayit8 })


        })
})
yerelSunucu.get("/adminsorgular",(istek,cevap)=>{
    cevap.render(__dirname + "/views/adminsorgular", {
        bilgiler: {
            pdf: "", yazan: " ", adi: "", ozeti: "", donemi: "", konusu: "", anahtari: "", danismani: "", jurileri: "", kullanicisi: ""
        }
    })
})
yerelSunucu.post("/adminsorgular",(istek,cevap)=>{
    var i = 0, sayac2 = 0;
    var kayitlar = []
    var kayit_A = [], kayit_B = [], kayit_C = [], kayit_D = [], kayit6 = [], kayit7 = [], kayit8 = []
    var kayitSon = []
    pdfDatabase.find()
        .then((sonuc2) => {
            if (istek.body.Tez_Sahibi.length != 0) {
                for (i = 0; i < sonuc2.length; i++) {

                    if (sonuc2[i].yazan.search(istek.body.Tez_Sahibi) != -1) {
                        kayitlar.push(sonuc2[i])
                    }
                }
            }
            else {
                kayitlar = sonuc2
            }
            if (istek.body.Proje_konusu.length != 0) {
                for (i = 0; i < kayitlar.length; i++) {

                    if (kayitlar[i].konusu.search(istek.body.Proje_konusu) != -1) {
                        kayit_A.push(kayitlar[i])
                    }
                }
            }
            else {
                kayit_A = kayitlar
            }
            if (istek.body.Ders_adi.length != 0) {
                for (i = 0; i < kayit_A.length; i++) {

                    if (kayit_A[i].adi.search(istek.body.Ders_adi) != -1) {
                        kayit_B.push(kayit_A[i])
                    }
                }
            }
            else {
                kayit_B = kayit_A
            }
            if (istek.body.Proje_ozeti.length != 0) {
                for (i = 0; i < kayit_B.length; i++) {

                    if (kayit_B[i].ozeti.search(istek.body.Proje_ozeti) != -1) {
                        kayit_C.push(kayit_B[i])
                    }
                }
            }
            else {
                kayit_C = kayit_B
            }
            if (istek.body.Proje_donemi.length != 0) {
                for (i = 0; i < kayit_C.length; i++) {

                    if (kayit_C[i].donemi.search(istek.body.Proje_donemi) != -1) {
                        kayit_D.push(kayit_C[i])
                    }
                }
            }
            else {
                kayit_D = kayit_C
            }
            if (istek.body.Proje_anahtar.length != 0) {
                for (i = 0; i < kayit_D.length; i++) {

                    if (kayit_D[i].anahtari.search(istek.body.Proje_anahtar) != -1) {
                        kayit6.push(kayit_D[i])
                    }
                }
            }
            else {
                kayit6 = kayit_D
            }
            if (istek.body.Proje_danisman.length != 0) {
                for (i = 0; i < kayit6.length; i++) {

                    if (kayit6[i].danismani.search(istek.body.Proje_danisman) != -1) {
                        kayit7.push(kayit6[i])
                    }
                }
            }
            else {
                kayit7 = kayit6
            }
            if (istek.body.Proje_juri.length != 0) {
                for (i = 0; i < kayit7.length; i++) {

                    if (kayit7[i].jurileri.search(istek.body.Proje_juri) != -1) {
                        kayit8.push(kayit7[i])
                    }
                }
            }
            else {
                kayit8 = kayit7
            }
            if (istek.body.Yukleyen.length != 0) {
                for (i = 0; i < kayit8.length; i++) {

                    if (kayit8[i].kullanicisi.search(istek.body.Yukleyen) != -1) {
                        kayitSon.push(kayit8[i])
                    }
                }
            }
            else {
                kayitSon = kayit8
            }
            cevap.render("adminsorgular", { bilgiler : kayitSon })


        })
})