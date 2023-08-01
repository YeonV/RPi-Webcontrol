const { exec } = require("child_process");
const path = require('path');
const config = require('./config.json');
var express = require('express')
var cors = require('cors')
var app = express() 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

const port = 8881

app.get('/pa/setvol/:vol', function (req, res, next) {
  res.json({msg: 'Set PA Volume to ' + req.params.vol})
    exec("pulsemixer --set-volume " + req.params.vol, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`Volume: ${req.params.vol} | ${stdout}`);
    });
})

app.get('/pa/getvol', function (req, res, next) {
  
    exec("pulsemixer --get-volume ", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        res.json({volume: stdout.split(' ')[0]})
    });
})

app.post('/command', function (req, res, next) {
    console.log(req.body.command)
    exec(req.body.command, (error, stdout, stderr) => {
        let err = null
        if (error) {
            console.log(`error: ${error.message}`);
            err = error.message
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            err = stderr
        }
        res.send(`<code style="color: #fff;">${(err || stdout).replaceAll('\n', '<br />')}</code>`)
    });
})

app.get('/restart', function (req, res, next) {
    res.json({msg: 'restarting'})
    process.on("exit", function () {
        require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached : true,
            stdio: "inherit"
        });
    });
    process.exit();
})

app.get('/config', function (req, res, next) {
  res.sendFile(path.join(__dirname, '/config.json'));
})

app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '/index.html'));
})
 
app.listen(config.port, function () {
  console.log('CORS-enabled web server listening on ' + config.port)
})