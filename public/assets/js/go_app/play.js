
go.player = 'B'; // First Player is Black by Default
go.moves_log = [];

go.attach_event = function(event, action) {
  for (var x=0; x<this.map_size; x++) {
    for (var y=0; y<this.map_size; y++) {

      this.map[x][y].addEventListener(event, function() {  
        action(this);
      });      
    }
  }
}

go.add_shadow = function() {
  
  this.attach_event('mouseover', function(square) {

    if(!square.shadow && !square.state) {

      var shadow = document.createElement('img');
      shadow.src = go.img_route;
      shadow.src += go.player == 'B' ? go.stone.black_shadow : go.stone.white_shadow;
      
      square.appendChild(shadow);
      
      square.shadow = true;
    }

  });



}

go.remove_shadow = function() {
  
  this.attach_event('mouseout', function(square) {

    if(square.shadow && !square.state) {
      
      square.removeChild(square.getElementsByTagName('img')[0]);
      
      square.shadow = false;
    }
    
  });  
}

go.move = function()
{
  for (var x=0; x<this.map_size; x++) {
    for (var y=0; y<this.map_size; y++) {

      this.map[x][y].addEventListener("click", function() {
        if(!this.state) {

          go.check_siblings(this);

          // Append Stone
          go.player == 'B' ? go.append_stone('B', this) : go.append_stone('W', this);

          // add stone color to square for later group check
          this.state = go.player;

          // add move to the log
          go.log(this);

          // set next player's turn
          go.player = go.player == 'B' ? 'W' : 'B';    
          
        }

      });
    }   
  }
}

go.check_siblings = function(square) {

  if(square.coord_y > 0) {
    // top
    this.map[square.coord_x][square.coord_y-1].style.outline = '1px solid red';  
  }
  
  if(square.coord_y < go.map_size - 1) {
    // bottom
    this.map[square.coord_x][square.coord_y+1].style.outline = '1px solid red';
  }

  if(square.coord_x > 0) {
    // left
    this.map[square.coord_x-1][square.coord_y].style.outline = '1px solid red';
  }

  if(square.coord_x < go.map_size - 1) {
    // right
    this.map[square.coord_x+1][square.coord_y].style.outline = '1px solid red';
  }


}

go.append_stone = function(player, square) {
  
  // remove shadow image.
  square.removeChild(square.getElementsByTagName('img')[0]);

  var stone = document.createElement('img');

  // set image src
  stone.src = go.img_route;
  stone.src += player == 'B' ? go.stone.black : go.stone.white;

  square.appendChild(stone);
}

go.log = function(square) {
  go.moves_log.push(go.player + ',' + square.coord_x + ',' + square.coord_y);
  console.log(go.moves_log[go.moves_log.length-1]);
}

go.play = function()
{
  go.add_shadow();
  go.remove_shadow();
  go.move();
}