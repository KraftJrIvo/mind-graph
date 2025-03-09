var fs = require('fs');

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

fs.readFile('index.html.in', function(err, data) {
    fs.writeFile('index.html', data.toString().replace(/__RAND__/g, makeid(5)), function (err) {
        if (err) throw err;
        console.log('Created index.html!');
    }); 
});

fs.readFile('404.in', function(err, data) {
    fs.writeFile('index.html', data.toString().replace(/__RAND__/g, makeid(5)), function (err) {
        if (err) throw err;
        console.log('Created index.html!');
    }); 
});