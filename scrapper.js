const request = require('request')
const cherrio = require('cheerio')
const Promise = require('bluebird')
const axios = require('axios')

var url = "https://www.bola.net/inggris/index4.html"
var fs = require("fs")

var newsUrls = []
var newsContent = []

axios.get(url).then(function(response){
    var $ = cherrio.load(response.data)
    $('.newslist').children('.item').each(function(i, elem){
      var newsUrl = $(elem).find("a").attr('href')
      newsUrls.push(newsUrl)
    })
    return  Promise.resolve(1)
}).then(function(response){
  var getArticleJobs = []
  for (var index in newsUrls) {
    var job = axios.get(newsUrls[index]).then(function(response){
      var $ = cherrio.load(response.data)
      newsContent.push($('.ncont').text())
      return Promise.resolve(1)
    })
    getArticleJobs.push(job)
  }
  Promise.all(getArticleJobs).then(function(result){
    for (var index in newsContent) {
      fs.appendFile('temp.txt', newsContent[index]+"\n"+"\n"+"\n", function(err){
        console.log("news added!")
      })
    }
  })
})
