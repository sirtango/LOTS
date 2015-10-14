
var go = {
  board: document.getElementById('board'),
  responsive: null, // if not responsive set to null, else set in %

  map: [],
  map_size: 19,
  square_size: 40,

  img_route: '/SirGo/assets/img/',
  background: {
  	top: 'square_top.png',
  	bottom: 'square_bottom.png',
  	left: 'square_left.png',
  	right: 'square_right.png',
  	top_left: 'square_top_left.png',
  	top_right: 'square_top_right.png',
  	bottom_left: 'square_bottom_left.png',
  	bottom_right: 'square_bottom_right.png',
  	common: 'square.png',
  	star_point: 'star_point.png'
  },
  stone: {
    black: 'b_stone.png',
    white: 'w_stone.png'
  },

  set_board_width: function() {

  	if (this.responsive == null) {
  	  // Static width. Inner board divs width and height must be defined through css in px.
  	  this.board.style.width = this.map_size * this.square_size +'px';	
  	}
  	else {
  	  // Responsive width. Builds the map according to the board width defined in %
  	  this.board.style.width = this.responsive + '%';
	  
	  // reduce offset width according to map size
	  var reduce_offset;

	  switch (this.map_size) {
	  	case 19: reduce_offset = 0.5;
	  	break;
	  	case 13: reduce_offset = 1;
	  	break;
	  	case 9: reduce_offset = 2;
	  	break;
	  	default: reduce_offset = 1;
	  }
	  	
	  var square_size = Math.floor(this.board.offsetWidth/this.map_size) - reduce_offset;

	  // set inner squares width and height
	  for (var x=0; x<this.map_size; x++) {
	    this.map[x].style.width = square_size + 'px';
	    for (var y=0; y<this.map_size; y++) {        
	      this.map[x][y].style.width = 100 + '%';
          this.map[x][y].style.height = square_size + 'px';                
	    }
	  }
  	}
  	
  },

  fill_map: function() {
  // Build a matrix with divs into map[]
  	
  	for (var x=0; x<this.map_size; x++) {
  	  this.map[x] = document.createElement('div');
  	  this.board.appendChild(this.map[x]);

  	  for (var y=0; y<this.map_size; y++) {
  	  	this.map[x][y] = document.createElement('div');
  	  	this.map[x].appendChild(this.map[x][y]);
  	  }	  
  	}

  },

  set_backgrounds: function() {
  // Set each of the possible backgrounds into each div

  	for (var x=0; x<this.map_size; x++) {
	    for (var y=0; y<this.map_size; y++) {

		    var background = this.assign_backgrounds(x, y);		
		
	      if (background != null) {
	      // set the valid image as background
	        this.map[x][y].style.backgroundImage = 'url('+this.img_route+background+')';  
	      }

	    background = null;
  	  }
  	}
  },

  set_coordinates: function() {
  // sets the coordinates as properties into each div
    for (var x=0; x<this.map_size; x++) {
      for (var y=0; y<this.map_size; y++) {
        this.map[x][y].coord_x = x;
        this.map[x][y].coord_y = y;
      }
    }
  },

  init: function() {
  	this.fill_map();
  	this.set_board_width();
  	this.set_backgrounds();
    this.set_coordinates();
  }

}

window.onload = function() {
	go.init();
  go.play();
}
