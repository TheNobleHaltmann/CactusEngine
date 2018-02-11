
var engine = new Engine( document, document.getElementById("canvasName") );
var test = new Text( "test", 100, 100 );
test.onMouseDown = moveDown;
engine.addObject( test );
engine.bindEvents( test );

function moveDown( e ) {
 this.y += 10;
}

engine.start( 30 );



var p1 = new Peer('a123',{key: 'b86f3g5dh0ejyvi'});
var p2 = new Peer('b123',{key: 'b86f3g5dh0ejyvi'});

p1.on('open', function(id) {
   console.log('connected to server');
    var c = p1.connect('b123');
        c.on('open', function(data) {    
            console.log('connected to peer');
            c.send('connection working');
        });    
});

p2.on('connection', function(connection) {
      connection.on('data', function(data) {
          console.log('p2 speaking..got from p1: '+data);
      });
});
