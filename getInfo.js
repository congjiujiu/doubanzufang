"use strict";
const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
const mysql = require('mysql');

let app = new express();

let items = [];
let ps = [];
let res = [];

app.get('/', (req,res,next) => {
  res.header('Access-Control-Allow-Origin', '*');

  for (let id = 0; id <= 100; id+=25) {
    ps.push(new Promise((resolve, reject) => {
      superagent.get(`https://www.douban.com/group/shanghaizufang/discussion?start=${id}`)
        .end((err, sres) => {
          if (err) {
            return next(err);
          }

          const $ = cheerio.load(sres.text);

          let titles = $('.title > a');
          for (let i = 0; i < titles.length-1; i++) {
            items.push({
              "title": $(titles[i]).attr('title'),
              "url": $(titles[i]).attr('href')
            });
          }
          resolve(items);
        });
      })
    );
  };

  Promise.all(ps).then(items => {
    let item = items[0];

    res.send(item);
  });
});

app.listen(3000, (req, res) => {
  console.log('app is running at 3000');
});