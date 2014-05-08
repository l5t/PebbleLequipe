console.log('lequipe feed with simply.js, kimono and lequipe.fr!');

//Pebble app configuration
simply.fullscreen(true); 
simply.scrollable(false);//for the menu screen set to false
simply.style('small'); //use smallest text
var apptitle = "L'equipe";
var api_key = "e0410419639a90c0e2ac742009fffaf6";//kimono
var api_route_live = "3jugnfpo";
var api_route_feed = "4o27nrmg";
 
var notrequesting = true;
var feedtimer,status = null;//timers for both status while requesting the feed and for updating the feed
var ipending = 0; //nbr of period
var currentstatus = "";
var bmenu =true; //state

simply.on('singleClick', function(e) {
  console.log('Pressed ' + e.button + '!');
  if(bmenu)
  {
    if (e.button === 'up') {
      bmenu = false;
      apptitle += "-feed"
      simply.scrollable(true);
      startfeed(15*60,false);//feed every 15 min
    }
    else if (e.button === 'down') {
      bmenu = false;
      apptitle += "-live"
      simply.scrollable(true);
      startfeed(2*60,true);//live every minute
    }
  }
  else
  {
    if (e.button === 'select') {
      //update feed or live
      startfeedtimer();
    }
    else if (e.button === 'back') {
      clearInterval(feedtimer);
      console.log('Timer OFF');
    } 
  }
});

simply.on('longClick', function(e) {
  //console.log(util2.format('long clicked $button!', e));
  //simply.vibe();
  setmenu();
  //simply.scrollable(e.button !== 'select');
});

simply.on('accelTap', function(e) {
  console.log(util2.format('tapped accel axis $axis $direction!', e));
  //simply.subtitle('Tapped ' + (e.direction > 0 ? '+' : '-') + e.axis + '!');
});

setmenu();

function setmenu() {
  apptitle = "L'equipe";
  simply.setText({
    title: apptitle,
     body: 'Welcome to the feed from l\'equipe.fr by l5t\n\n' + 
           'Click UP for the feed\n' +
           'Click DOWN for the live\n Long click to go back to this menu'
    }, true);
  bmenu=true;
  simply.scrollable(false);
}

function setstatus(st) {
  simply.title(apptitle + st);
  console.log('status:'+ st);
  if(status)
  {
    clearInterval(status);
    console.log("clear status");
  }
  if(st)
  {
    currentstatus = apptitle + st; //stored the current status
    status = setInterval(function()
      {
        ipending++;
        if(ipending > 4)
          currentstatus = currentstatus.substr(0, currentstatus.length - 4);
        else
        {
          currentstatus = currentstatus + ".";
        }
        console.log('status interval:' + ipending + '-'+ currentstatus);
        simply.title(currentstatus);
      }, 500);
  }
  else
    simply.title(apptitle);
}

function startfeed(isec,blive) {
  console.log('Feed ON');
  requestfeed(blive); 
  if(feedtimer)
     clearInterval(feedtimer);
   feedtimer = setInterval(function(){
      console.log('Requesting Feed Again');
      requestfeed(blive);
    }, isec * 1000); //Currently Kimono provide update every 15 min
  
}
function cleangamesummary(gamesum) {
  var res = gamesum.replace(/(commenté |Pariez|Terminé)/g, "");
  //store the score
  res = res.replace(/\(\d+\)0(\d+h\d+)0/g, "$1");
  //remove the rank
  res = res.replace(/\(\d+\)/g, "");
  console.log("res: " +res);
  return res;
}
function requestfeed(blive) {
  setstatus("   ");
  notrequesting = false;
  var api_url = 'http://www.kimonolabs.com/api/'+ (blive? api_route_live: api_route_feed)+ '?apikey='+ api_key;
  ajax({ url: api_url  }, function(data){
    var news = JSON.parse(data);
    var arr = news.results.collection1;
    var ne ='';
    var gamesum ='';
    console.log("arr.length:" + arr.length);
    for(var i=0;i<10 && i<arr.length;i++){
      
      if(blive) {
        if(arr[i]["game"]["text"])
          gamesum = arr[i]["game"]["text"];
        else
          gamesum = arr[i]["game"];
        gamesum = cleangamesummary(gamesum);
        ne += '- '+ gamesum + '\n'; //arr[i]["compet"]
      }
      else {
        ne += arr[i]["news-date"] +' - '+ arr[i]["sport-new"]["text"] + '\n';
      }
    }
    setstatus("");
    notrequesting = true;
    simply.body(ne);
  });
}
