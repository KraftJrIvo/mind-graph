const jsdom = require('jsdom');
const dom = new jsdom.JSDOM("");
const jquery = require('jquery')(dom.window);
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');

const Base64 = require('js-base64');

function arrayBufferToBase64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	return dom.window.btoa( binary );
}

const opentype = require('opentype.js');
const { createHash } = require('crypto');

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded());
app.use(express.json());

app.get('/fontload', (req, res) => {
    const buf = fs.readFileSync(req.query.url.replace("https://mind-book.fun", __dirname))
    const str = arrayBufferToBase64(buf)
    res.jsonp([req.query.callback + '("'+ str + '");']);
});

function download(url, dest) {
  return new Promise((resolve, reject) => {
      const protoc = url.startsWith("https") ? https : http
      protoc.get(url, (res) => {
          if (res.statusCode !== 200) {
              var err = new Error('File couldn\'t be retrieved');
              err.status = res.statusCode;
              return reject(err);
          }
          var chunks = [];
          res.setEncoding('binary');
          res.on('data', (chunk) => {
              chunks += chunk;
          }).on('end', () => {
              var stream = fs.createWriteStream(dest);
              stream.write(chunks, 'binary');
              stream.on('finish', () => {
                  resolve('File Saved !');
              });
              res.pipe(stream);
          })
      }).on('error', (e) => {
          console.log("Error: " + e);
          reject(e.message);
      });
  })
};

app.get('/pngload', (req, res) => {
  let ok = false
  if (req.query.url.indexOf("https://mind-book.fun") != -1) {
    try {
      var img = fs.readFileSync(req.query.url.replace("https://mind-book.fun", __dirname));
      const str = arrayBufferToBase64(img);
      res.writeHead(200, {'Content-Type': 'text/plain' });
      res.end(str);
      ok = true;
    } catch (err) {
    }
  }    
  if (!ok) {
    const filename = require('crypto').createHash('md5').update(req.query.url).digest("hex")
    download(req.query.url, filename).then(()=>{
      try {
        var img = fs.readFileSync(filename);
        const str = arrayBufferToBase64(img);
        fs.unlink(filename, () => {});
        res.writeHead(200, {'Content-Type': 'text/plain' });
        res.end(str);
      } catch (e) {}
    })
  }
});

function writeFileSyncRecursive(filename, content, charset) {
  // -- normalize path separator to '/' instead of path.sep, 
  // -- as / works in node for Windows as well, and mixed \\ and / can appear in the path
  let filepath = filename.replace(/\\/g,'/');  

  // -- preparation to allow absolute paths as well
  let root = '';
  if (filepath[0] === '/') { 
    root = '/'; 
    filepath = filepath.slice(1);
  } 
  else if (filepath[1] === ':') { 
    root = filepath.slice(0,3);   // c:\
    filepath = filepath.slice(3); 
  }

  // -- create folders all the way down
  const folders = filepath.split('/').slice(0, -1);  // remove last item, file
  folders.reduce(
    (acc, folder) => {
      const folderPath = acc + folder + '/';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      return folderPath
    },
    root // first 'acc', important
  ); 
  
  // -- write file
  fs.writeFileSync(root + filepath, content, charset);
}

app.post('/jsonsave', (req, res) => {
  if (req.url.substring(14, req.url.length - 14)) {
    body = Base64.decode(req.body.body)
    writeFileSyncRecursive(req.query.url.replace("https://mind-book.fun", __dirname), body);
    res.send({ status: 'SUCCESS' });
  } else {     
    console.log("?");
  }
});

app.get('/jsonp', (req, res) => {
    const url = req.query.url.replace("https://mind-book.fun", __dirname)
    res.jsonp(req.query.callback + '('+ fs.readFileSync(url) + ');');
});

const server = app.listen(process.env.PORT || 5050, () => {
  const { port } = server.address();
  console.log(`Server running on PORT ${port}`);
});