"use strict";
const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
const mysql = require('mysql');

let app = new express();

app.get('/', (req,res,next) => {
  res.header('Access-Control-Allow-Origin', '*');

  let items = [];
  let ps = [];
  let type = req.query.type;

  if (type === 'waterlist') {
    let start = parseInt(req.query.from, 10);
    for (let id = start; id <= start+50; id+=25) {
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
  } else if(type === 'detail') {
    let w_url = req.query.url;

    superagent.get(`https://www.douban.com/group/topic/${w_url}`)
      .end((err, sres) => {
        if (err) {
          return next(err);
        }

        const $ = cheerio.load(sres.text);

        let content = $('.topic-content').html();

        let response = [];
        response.push(content);

        res.send(response);
      });
  }
});

app.listen(3000, (req, res) => {
  console.log('app is running at 3000');
});