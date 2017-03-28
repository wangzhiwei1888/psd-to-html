/**
 * @yrd
 */
var path = require('path');
var fs = require('fs');
var yrd = module.exports;
var PSD = require('psd');

/**
 * @配置项
 */

yrd.help = function() {
    var content = [];
    content = content.concat([
        '',
        '  Usage: yrd <Command>',
        '',
        '  Command:',
        '',
        '    -cut xxx   cut a psd to local',
        '    -h           get help information',
        '    -v           get the version number'
    ]);
    console.log(content.join('\n'));
}

/**
 * @读取yrd version
 */
yrd.version = function() {
    var package = require('../package.json');
    console.log(package.version);
}

/**
 * @总的初始化函数 from ../index.js
 * @commander
 */
yrd.init = function(argv) {

    //设置全局时间戳    
    var cmd2 = argv[2];
	if (argv.length < 3 || cmd2 === '-h' || cmd2 === '--help') {
        // Log.send('help');
        yrd.help();

    } else if (cmd2 === '-v' || cmd2 === '--version') {
        // Log.send('version');
        yrd.version();

    } else if (cmd2 === 'cut') {
        // Log.send('help');
        yrd.cut(argv);
        
    }
}

yrd.cut = function(argv){

    console.log(argv);

    // fs.mkdirSync('./test');

    var start = new Date();
    var filename = argv[3];

    var psd = PSD.fromFile("./"+filename+".psd");
    psd.parse();
    var psdDetail = psd.tree().export();

    console.log(psdDetail);

    fs.mkdirSync(filename);
    fs.mkdirSync(filename+'/img');



    PSD.open("./"+filename+".psd").then(function (psd) {
      psd.tree().descendants().forEach(function (node) {
        if (node.isGroup()) return true;

        node.saveAsPng(`./${filename}/img/${node.name}.png`).catch(function (err) {
          console.log(err.stack);
        });

      });
    }).then(function () {
      console.log("Finished in " + ((new Date()) - start) + "ms");
      console.log(psdDetail);

      var imgstr = ``;

      if(psdDetail.children.length>0){

        for(var i=0;i<psdDetail.children.length;i++){

            var imgname = psdDetail.children[i].name;
            var width = psdDetail.children[i].width;
            var height = psdDetail.children[i].height;
            var left = psdDetail.children[i].left;
            var top = psdDetail.children[i].top;
            var zIndex = psdDetail.children.length - i;
            imgstr += `<div class="div${i}" style="width:${width}px; height:${height}px; left:${left}px; top:${top}px; position:absolute; z-index:${zIndex};">
                <img src="./img/${imgname}.png">
              </div>`;

        }   
      }
      console.log(imgstr);

      var data = `<!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        
                        <meta name="viewport" content="width=device-width, target-densityDpi=device-dpi, user-scalable=yes">  
                        <meta name="format-detection" content="telephone=no" />
                        <title></title>
                        <style type="text/css">
                        body{ margin: 0; padding: 0; }
                        .container{ width: 640px; margin: 0 auto; position: relative;}
                        
                        </style>
                        <script type="text/javascript" src="https://www.yirendai.com/ccms/js/jquery-1.8.2.min.js"></script>
                        <script type="text/javascript">
                          
                          var viewport = document.querySelector("meta[name=viewport]");
                          var winWidths=$(window).width();
                          var densityDpi=640/winWidths;
                            densityDpi= densityDpi>1?300*640*densityDpi/640:densityDpi;
                          if(isWeixin()){
                            viewport.setAttribute('content', 'width=640, target-densityDpi='+densityDpi);
                          }else{
                            viewport.setAttribute('content', 'width=640, user-scalable=no');
                            window.setTimeout(function(){
                              viewport.setAttribute('content', 'width=640, user-scalable=yes');
                            },1000);
                          }
                          function isWeixin(){
                            var ua = navigator.userAgent.toLowerCase();
                            if(ua.match(/MicroMessenger/i)=="micromessenger") {
                              return true;
                            } else {
                              return false;
                            }
                          }

                        </script>

                      </head>
                      <body>
                        <div class="container">
                          ${imgstr}
                        </div>
                        
                      </body>
                    </html>`



        fs.writeFileSync(`./${filename}/${filename}.html`, data);

    }).catch(function (err) {
      console.log(err.stack);
    });




}

