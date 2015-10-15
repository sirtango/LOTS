go.assign_backgrounds = function(x, y)
{
  // validates and assigns which background corresponds to the square
  
  var background;

  if (x>=1 && x<=this.map_size-2) {
  // assign top and bottom backgrounds
    switch(y){
      case 0:
        background = this.background.top; 
      break;
      case this.map_size-1:
        background = this.background.bottom;
      break;
    }
  }

  else if (y>=1 && y<=this.map_size-2) { 
  // assign left and right backgrounds
    switch(x){
      case 0: 
        background = this.background.left;
      break;
      case this.map_size-1:
        background = this.background.right;
      break;
    }
  }

  else if (x==0) {
  // assign left corners background
    switch(y){
      case 0:
        background = this.background.top_left;;
      break;
      case this.map_size-1:
        background = this.background.bottom_left;
      break;
    } 
  }

  else if (x==this.map_size-1) {
  // assign right corners background
    switch(y){
      case 0:
        background = this.background.top_right;
      break;
      case this.map_size-1:
        background = this.background.bottom_right;
      break;
    } 
  }

  if (x>0 && x<this.map_size-1 && y>0 && y<this.map_size-1) {
  // assign all the rest of the common squares
    background = this.background.common;
  }

  if (this.map_size%2 != 0) {
  // assign the starpoints only in unpair boards (9, 13, 17, 19 ,etc)
    
    // central point of the board relative to the axis
    var central = Math.floor(this.map_size/2);

    if (x==central && y==central) {
    // central starpoint
      background = this.background.star_point;
    }

    // assign 3x3 starpoints for small boards (less than 11x11)
    if (this.map_size<=11)
    {
      if ((x==2 && y==2)
      || (x==2 && y==this.map_size-3)
      || (x==this.map_size-3 && y==2)
      || (x==this.map_size-3 && y==this.map_size-3))
      {
        background = this.background.star_point;
      }
    }

    // assign 4x4 starpoints for big boards (more than 13x13)
    else {
      if ((x==3 && y == 3)
      || (x==3 && y==this.map_size-4)
      || (x==this.map_size-4 && y==3)
      || (x==this.map_size-4 && y==this.map_size-4))
      {
        background = this.background.star_point;
      }
    }

    // assign side starpoints for >= 13x13 boards
    if (this.map_size>=13) 
    {
      if ((x==3 && y==central)
      || (y==3 && x==central)
      || (x==this.map_size-4 && y==central)
      || (y==this.map_size-4 && x==central))
      {
        background = this.background.star_point;
      }
    }
  };

  return background;
}