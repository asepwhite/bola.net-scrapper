const request = require('request')
const cherrio = require('cheerio')
const Promise = require('bluebird')
const axios = require('axios')
const sleep =  require('sleep')
const https = require('https')
const http = require('http')


//liga indonesia, inggris, spanyol, italia, liga champion

var section = "Liga inggris"
var fs = require("fs")

var newsUrls = []
var newsContent = []
var sections = ['inggris', 'italia', 'spanyol', 'champions', 'indonesia']
var docID = 1;

var getAllSectionUrlJobs = []


for (var a = 0; a < 5; a++) {
  for (var b = 1; b < 9; b++) {
    var url = "https://www.bola.net/"+sections[a]+"/index"+b+".html"
    var getNewsUrl = axios({method: "get", url:url, timeout: 10000, httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 100}),  httpAgent: new http.Agent({ keepAlive: true })}).then(function(response){
        var $ = cherrio.load(response.data)
        $('.newslist').children('.item').each(function(i, elem){
          var newsUrl = $(elem).find("a").attr('href')
          newsUrls.push(newsUrl)
        })
        return Promise.resolve(1)
    })
    getAllSectionUrlJobs.push(getNewsUrl)
  }
}




Promise.all(getAllSectionUrlJobs).then(function(response){
  var getArticleJobs = []

  for (var index in newsUrls) {
    var job = axios.get(newsUrls[index]).then(function(response){
      var $ = cherrio.load(response.data)
      var requestUrl = "www.bola.net"+response.request.path
      var newsDate = $('.newsdatetime').text().split("|")[0]
      var newsTitle = $('.newstitle').text()
      var newsSection = "Liga "+response.request.path.split("/")[1]
      var articleData = newsDate+"\n"+newsTitle+"\n"+newsSection+"\n"+requestUrl+"\n"+$('.ncont').text()
      newsContent.push(articleData)
      return Promise.resolve(1)
    })
    getArticleJobs.push(job)
  }
  Promise.all(getArticleJobs).then(function(result){
    for (var index in newsContent) {
      var metaData = newsContent[index].split('\n');
      var newsInXMLFormat = "<DOC>"+"\n"+"<DOCID> "+"Artikel "+docID+ "</DOCID>"+"\n"+"<SO> BOLA.NET </SO>"+"\n"+"<SECTION> "+metaData[2]+" </SECTION>"+"\n"+"<DATETIME> "+metaData[0]+" </DATETIME>"+"\n"+"<DOC URL> "+metaData[3]+" </DOC URL>"+"\n"+"<TITLE> "+metaData[1]+" </TITLE>"+"\n"+"<TEXT>"
      docID++;
      newsContent[index] = metaData.slice(4).join("")
      fs.appendFile('temp.txt', newsInXMLFormat+"\n"+newsContent[index].trim()+"\n"+"</TEXT>"+"\n"+"</DOC>"+"\n"+"\n", function(err){
        console.log("news added!")
      })
    }
  })
})
