Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i].toString() == obj.toString()) {
            return true;
        }
    }
    return false;
}

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.font = "12px Arial";

function board(boardWidth, cellWidth) {
	var boardArea = boardWidth*boardWidth;
	var clicks = 0;

	function get_surrounding_cells(x,y,cw) {
		surrounding_cells = [[x-cw,y-cw],[x-cw,y],[x-cw,y+cw],[x,y-cw],[x,y+cw],[x+cw,y-cw],[x+cw,y],[x+cw,y+cw]];
		return surrounding_cells;
	}

	this.drawCell = function(top_px, left_px){
		ctx.strokeRect(left_px,top_px,cellWidth,cellWidth);
	}

	this.addMines = function(base_board){
		var num_mines = Math.floor(boardArea / 8)
		var mine_generator = function() {
			var mine_array = [];
			for (var i = num_mines - 1; i >= 0; i--) {
				var xcoord = Math.floor(Math.random() * boardWidth) * cellWidth;
				var ycoord = Math.floor(Math.random() * boardWidth) * cellWidth;
				var new_coord = [xcoord, ycoord]
				var deduper = mine_array.contains(new_coord);
				if (mine_array.contains(new_coord) == true) {
					++i;
				}
				else {
					mine_array.push([xcoord,ycoord]);
				};
			};
			return mine_array
		};
		var mine_positions = mine_generator();

		for (var i = base_board.length - 1; i >= 0; i--) {
			for (var a = mine_positions.length - 1; a >= 0; a--) {
				if (mine_positions[a][0] == base_board[i][0] && mine_positions[a][1] == base_board[i][1]) {
					base_board[i][2] = 'b';
				};
			};
		};

		for (var i = base_board.length - 1; i >= 0; i--) {

			if (base_board[i][2] == "e") {
				var x = base_board[i][0];
				var y = base_board[i][1];
				around_cells = get_surrounding_cells(x,y,cellWidth);
				for (var b = around_cells.length - 1; b >= 0; b--) {
				 	for (var a = base_board.length - 1; a >= 0; a--) {
				 		if (around_cells[b][0] == base_board[a][0] && around_cells[b][1] == base_board[a][1]) {
							if (base_board[a][2] == 'b') {
								base_board[i][3] = base_board[i][3]+1;
							}
						};
				 	};
				};
			};
		};


		var board_dict = [base_board, mine_positions]
		return board_dict;
	};

	this.startGame = function(board_dict){
		var base_board = board_dict[0];
		var mine_positions = board_dict[1];
		$(c).on("click", function(event) {
			clicks++;
			var x_square = Math.floor(event.pageX / cellWidth)*cellWidth;
			var y_square = Math.floor(event.pageY / cellWidth)*cellWidth;
      // Add in ? when shift is pressed
			if (event.shiftKey) {
				ctx.fillStyle = 'black';
				ctx.fillText("?", x_square+5, y_square+15);
			}
      // Detect if mine has been clicked
			else if (mine_positions.contains([x_square, y_square]) == true) {
				var make_mine = function(){
					ctx.fillStyle = 'red';
					ctx.fillRect(x_square, y_square, cellWidth, cellWidth)
					ctx.strokeRect(x_square, y_square, cellWidth, cellWidth)
				};
			  make_mine();
        // TO DO: make something happen when a mine is pressed
			}
      // If not a mine, work out if it's a number or blank square and do something
			else {
				for (var i = base_board.length - 1; i >= 0; i--) {
					if (x_square == base_board[i][0] && y_square == base_board[i][1]) {
            // If square has a number, add it to the board
						if (base_board[i][3] != 0){
							ctx.fillStyle = 'black';
							ctx.fillText(base_board[i][3], x_square+5, y_square+15);
						}
            // If square doesn't have a number, fill it in and start propagation
						else {
							ctx.fillStyle = 'pink';
							ctx.fillRect(x_square, y_square, cellWidth, cellWidth);
							ctx.strokeRect(x_square, y_square, cellWidth, cellWidth);
              var revealed_cells = [[x_square, y_square, 0]];

              function reveal_surrounding_cells(x,y,revealed_cells) {
                var surrounding_cells = get_surrounding_cells(x,y,cellWidth); //Gets coordinates of cells around a clicked cell
                var deduper = [] //Used to remove already revealed cells from surrounding_cells
                var temp_revealed_cells = [] //Used to send appropriate surrounding_cells into recursive loop
                for (var i = 0; i < revealed_cells.length; i++) { //Necessary, as revealed_cells has additional arguments
                  var index = revealed_cells[i];
                  var num_removed = index.slice();
                  var num_removed = num_removed.splice(0,2)
                  deduper.push(num_removed);
                }
                surrounding_cells = surrounding_cells.filter( function( el ) {
                    return deduper.indexOf(el) == -1;
                  });
                for (var b = surrounding_cells.length - 1; b >= 0; b--) {
                  // base_board is a matrix of all cells on board and their starting attributes
                  for (var a = base_board.length - 1; a >= 0; a--) {
                    if (surrounding_cells[b][0] == base_board[a][0] && surrounding_cells[b][1] == base_board[a][1]) {
                      if (base_board[a][2] != 'b' && base_board[a][3] == 0) {
                        revealed_cells.push([surrounding_cells[b][0],surrounding_cells[b][1], 0])
                        temp_revealed_cells.push([surrounding_cells[b][0],surrounding_cells[b][1], 0])
                      }
                      else if (base_board[a][2] != 'b') {
                        revealed_cells.push([surrounding_cells[b][0],surrounding_cells[b][1], base_board[a][3]])
                        temp_revealed_cells.push([surrounding_cells[b][0],surrounding_cells[b][1], 0])
                      };
                    };
                  };
                };
                if (temp_revealed_cells.length > 0) {
                  for (var i = 0; i < temp_revealed_cells.length; i++) {
                    if (temp_revealed_cells[i][2] == 0){
                        var revealed_cells = reveal_surrounding_cells(temp_revealed_cells[i][0], temp_revealed_cells[i][1], revealed_cells);
                    }
                  };
                };
                return revealed_cells;
              };
              var revealed_cells = reveal_surrounding_cells(x_square, y_square, revealed_cells);
              revealed_cells = revealed_cells.filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
              })
              function show_revealed_cells(revealed_cells) {
                for (var i = 0; i < revealed_cells.length; i++) {
                  if (revealed_cells[i][2] == 0) {
                    ctx.fillStyle = 'pink';
                    ctx.fillRect(revealed_cells[i][0], revealed_cells[i][1], cellWidth, cellWidth)
                    ctx.strokeRect(revealed_cells[i][0], revealed_cells[i][1], cellWidth, cellWidth)
                  }
                  else {
                    ctx.fillStyle = 'black';
                    ctx.fillText(revealed_cells[i][2],revealed_cells[i][0]+5, revealed_cells[i][1]+15);
                  }
                };
              }
              show_revealed_cells(revealed_cells);
            };
					};
				};
			};
		});
	};

	this.buildBoard = function(){
		var left_px = 0, top_px = 0, base_board = [];
		for (var a = boardWidth - 1; a >= 0; a--) {
			for (var i = boardWidth - 1; i >= 0; i--) {
				this.drawCell(top_px, left_px);
				base_board.push([top_px,left_px, 'e', 0]);
				left_px = left_px + cellWidth;
			};
			var left_px = 0, top_px = top_px + cellWidth;
		};
		var board_dict = this.addMines(base_board);
		var board_dict = this.startGame(board_dict);
	};

};

var newBoard = new board(5, 20);
newBoard.buildBoard();
