var Random = require('random-js')
    
    fs = require('fs'),
    stackTrace = require('stacktrace-parser')
    ;
var dir = require('node-dir');
const chalk = require('chalk');

var fuzzer = 
{
    random : new Random(Random.engines.mt19937().seed(0)),
    
    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    },

    mutate:
    {
        string: function(val)
        {
          do{            
            // MUTATE IMPLEMENTATION HERE
            var line = val.split('\n')

            // replacing < with > only inside if condition
            if(fuzzer.random.bool(0.5))
            {
              for (var i=0;i<line.length;i++)
              {
                if (line[i].includes('if'))
                {
                    
                    line[i]=line[i].replace('<','>')                  
                }
              }
            }

            // replacing == with !=
            if(fuzzer.random.bool(0.5))
            {
              for (var i=0;i<line.length;i++)
              {
                if (line[i].includes('==') && !line[i].includes('null'))
                {
                  line[i]=line[i].replace('==','!=')
                }
              }
            }

            // replacing 0 with 1
            if(fuzzer.random.bool(0.5))
            {
              for (var i=0;i<line.length;i++)
              {
                line[i]=line[i].replace('0','1')
              }
            }

            /*
            //changing strings
            if(fuzzer.random.bool(0.5))
            {
              for (var i=0;i<line.length;i++)
              {
                if (line[i].includes('"') && !line[i].includes('Pattern') && !line[i].includes('matches') && !line[i].includes('@'))
                {
                  var end = line[i].split('"')
                  var myString = end[1].split('"')
                  var change = myString[0]
                  if (change)
                    line[i]=line[i].replace('"'+change+'"','"cscdevops"')
                }
              }
            }
            */

            /*
            // replacing || with && operator
            if(fuzzer.random.bool(0.5))
            {
              for (var i=0;i<line.length;i++)
              {
                line[i]=line[i].replace('||','&&')
              }
            }
            */
            return line.join('\n')
        }while (fuzzer.random.bool(0.5) );
        }
    }
};

if( process.env.NODE_ENV != "test")
{
    fuzzer.seed(0);

    // running the fuzzer only on the files inside the models folder and its subfolders
    var __dirname='/home/vagrant/itrust/src/main/java/edu/ncsu/csc/itrust2/models/'    

    dir.files(__dirname, function(err, files) {
    if (err) throw err;
        
    
    files.forEach(function(filepath) {
        
        x = Math.random()
        console.log("printing x",x);
        if (x > 0.5){
            mutationTesting([filepath],1);
        }        
    })
    });

}

function mutationTesting(paths,iterations)
{    
    var failedTests = [];
    var reducedTests = [];
    var passedTests = 0;
    
    var markDownA = fs.readFileSync(paths[0],'utf-8');
    //var markDownB = fs.readFileSync(paths[1],'utf-8');
    
    
    for (var i = 0; i < iterations; i++) {

        var mutuatedString = fuzzer.mutate.string(markDownA);        
        fs.writeFile(paths[0], mutuatedString, function(err) {
            if(err) {
                return console.log(err);
            }
        console.log(paths[0]," was saved!");
        });        
        try
        {
            
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
        }
    }
}

exports.mutationTesting = mutationTesting;
exports.fuzzer = fuzzer;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}