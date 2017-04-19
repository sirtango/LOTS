
go.player = 'B'; // First Player is Black by Default
go.moves_log = [];
go.board_states = [];


go.attach_event = function(event, action)
{
  for (var x=0; x<this.map_size; x++) {
    for (var y=0; y<this.map_size; y++) {

      this.map[x][y].addEventListener(event, function() {  
        action(this);
      });      
    }
  }
}


go.add_shadow = function()
{  
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


go.remove_shadow = function()
{  
  this.attach_event('mouseout', function(square) {

    var has_img = square.getElementsByTagName('img').length;

    if(square.shadow && !square.state && has_img) {
      
      square.removeChild(square.getElementsByTagName('img')[0]);
      
      square.shadow = false;
    }
    
  });  
}


go.generate_state = function()
{
  var state = '';
  
  for(x=0; x<go.map_size; x++) {
    for(y=0; y<go.map_size; y++) {
      
      switch(go.map[x][y].state) {
        case 'W':
          // white stone
          state += 'W';
        break;
        case 'B':
          // black stone
          state += 'B';
        break;
        default:
          // empty
          state += 'E';
      }
    }
  }

  return state;
}

go.ko = function()
{ 
  
  var ko = false;
  var current_state = go.generate_state();
  
  if(go.board_states.indexOf(current_state) != -1) {
    ko = true;
  }

  console.log(ko);
  return ko;
}


go.back = function()
{
  go.clean_board();
  go.draw_state(go.board_states[go.board_states.length - 1]);
}


go.clean_board = function()
{
  for (var x=0; x<this.map_size; x++) {
    for (var y=0; y<this.map_size; y++) {
      
      var square = this.map[x][y];
      if(square.state) {
        square.state = false;
        square.removeChild(square.getElementsByTagName('img')[0]);
      }
    }
  }
}

go.draw_state = function(state) {
  console.log(state);
  
  var count = 0;
  for (var x=0; x<this.map_size; x++) {
    for (var y=0; y<this.map_size; y++) {
      
      var square = this.map[x][y];
      
      switch(state[count]) {
        case 'B':
          // draw black stone
          console.log('B');
          square.state = 'B';
          go.append_stone('B', square);
        break;
        case 'W':
          // draw white stone
          console.log('W');
          square.state = 'W';
          go.append_stone('W', square);
        break;
        case 'E':
          console.log('E');
          // it's empty, do nothing
        break;
      }
      
      count++;
    }
  }
}

go.move = function()
{
  for (var x=0; x<this.map_size; x++) {
    for (var y=0; y<this.map_size; y++) {

      this.map[x][y].addEventListener("click", function() {

        var square = this;

        if(!square.state) {

          // add state to square
          square.state = go.player;

          go.kill(square);

          // check if there's ko
          if(go.ko()) {
            square.state = false;
            go.back();
            return;
          }

          // check suicide
          if(go.group_is_dead(square, false)) {
            square.state = false;
            return;
          }

          // Append Stone
          go.player == 'B' ? go.append_stone('B', square) : go.append_stone('W', square);

          // add move to the log
          go.log(square);

          go.board_states.push(go.generate_state());

          // set next player's turn
          go.player = go.player == 'B' ? 'W' : 'B';    
          
        }

      });
    }   
  }
}


go.get_siblings = function(square)
{
  var siblings = [];

  if(square.coord_y > 0) {
    // top
    siblings.push( go.map[square.coord_x][square.coord_y-1] );
  }
  
  if(square.coord_y < go.map_size - 1) {
    // bottom
    siblings.push( go.map[square.coord_x][square.coord_y+1] );
  }

  if(square.coord_x > 0) {
    // left
    siblings.push( go.map[square.coord_x-1][square.coord_y] );
  }

  if(square.coord_x < go.map_size - 1) {
    // right
    siblings.push( go.map[square.coord_x+1][square.coord_y] );
  }

  return siblings;
}


go.belongs_togroup = function(square, group)
{

  index = group.indexOf(square.coord_x+'-'+square.coord_y);
  
  if(index > -1) {
    return true;
  }

  return false;
}


go.compare_sibling_state = function(square, sibling)
{
  if(!sibling.state) {
    return 'empty';
  }

  return (square.state == sibling.state) ? 'same':'opposite';
}


go.add_to_group = function(square, group)
{
  var x = square.coord_x;
  var y = square.coord_y;
  
  group.push(x+'-'+y);

  return group;
}


go.group_is_dead = function(square, group) 
{  
  var surrounded = true;
  
  var siblings = go.get_siblings(square);

  var group = group ? group:[];

  
  if(!group.length) {
    // add the original stone the group
    group = go.add_to_group(square, group);
  }
  
  
  for(var i=0; i<siblings.length; i++) {
    var sibling = siblings[i];

    if(go.belongs_togroup(sibling, group)) {
      continue;
    
    } else {

      switch(go.compare_sibling_state(square, sibling)) {
        case 'same':
          group = go.add_to_group(sibling, group);
          
          if(!go.group_is_dead(sibling, group)) {
            surrounded = false;
          }

        break;
        case 'opposite':
          continue;
        break;
        case 'empty':
          // there's a liberty, so it's alive
          return false;
        break;
      }
    }
    
  }

  if(surrounded) {
    return group;
  }
}


go.kill = function(square)
{  
  var siblings = go.get_siblings(square);

  for(var i=0; i<siblings.length; i++) {
    var sibling = siblings[i];

    if(go.compare_sibling_state(square, sibling) == 'opposite') {
      // we are in touch with an enemy stone, lets see if we can kill it
      
      var deadgroup = go.group_is_dead(sibling);

      if(deadgroup) {
        go.remove_stones(deadgroup);
      }

    }
  }
}


go.remove_stones = function(group)
{
  for(var i=0; i<group.length; i++) {
    
    var x = group[i].split('-')[0];
    var y = group[i].split('-')[1];
    
    var square = go.map[x][y];
    square.removeChild(square.getElementsByTagName('img')[0]);

    square.state = false;

  }
  
}


go.append_stone = function(player, square)
{  
  // remove shadow image.
  if(square.getElementsByTagName('img')[0]) {
    square.removeChild(square.getElementsByTagName('img')[0]);  
  }
  
  square.shadow = false;

  var stone = document.createElement('img');

  // set image src
  stone.src = go.img_route;
  stone.src += player == 'B' ? go.stone.black : go.stone.white;

  square.appendChild(stone);
}


go.log = function(square)
{
  go.moves_log.push(go.player + ',' + square.coord_x + ',' + square.coord_y);
}


go.play = function()
{
  go.add_shadow();
  go.remove_shadow();
  go.move();
}