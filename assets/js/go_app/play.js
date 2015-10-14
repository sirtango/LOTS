go.moves_log = [];

go.move = function()
{
  for (var x=0; x<this.map_size; x++) {
  	  for (var y=0; y<this.map_size; y++) {

  	    this.map[x][y].addEventListener("click", function() {
  	  	
  	  	var stone = document.createElement('img');

  	  	if (go.moves_log.length < 1 && this.player == null) {
  	  	// first move
  	  		console.log('first move');
  	    }
  		stone.src = go.img_route + go.stone.black;
  		this.appendChild(stone);

  	  	this.player = 'B';
  	  	go.moves_log.push(this.player + ',' + this.coord_x + ',' + this.coord_y);
  	  	console.log(go.moves_log[go.moves_log.length-1]);
  	  	

      });
  	}	  
  }
}


go.play = function()
{
	go.move();
}