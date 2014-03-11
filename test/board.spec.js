describe('Board', function() {
  var Board = ttt.Board;
  var Move = ttt.Move;

  describe('constructor()', function() {
    it('should create an array Board.state of length width * height', function() {
      var board = new Board();
      expect(board.state.length).toBe(9);
    });
  });


  describe('move()', function() {
    var board;
    beforeEach(function() {
      board = new Board();
    });


    it('should throw if player, x position and y position are not all supplied', function() {
      expect(function() {
        board.move();
      }).toThrow();
      expect(function() {
        board.move('X', 1);
      }).toThrow();
      expect(function() {
        board.move('X', 1, 1);
      }).not.toThrow();
    });


    it('should return true when moving to unoccupied position within bounds', function() {
      expect(board.move("X", 0, 0)).toBe(true);
    });


    it('should return false if moving to an occupied position', function() {
      board.move("X", 0, 0);
      expect(board.move("Y", 0, 0)).toBe(false);
    });


    it('should grow history', function() {
      expect(board.history().length).toBe(0);
      board.move("X", 1, 1);
      expect(board.history().length).toBe(1);
      board.move("Y", 1, 2);
      expect(board.history().length).toBe(2);
    });


    it('should mark state on the board', function() {
      expect(board.state[0]).not.toBeDefined();
      board.move("X", 0, 0);
      expect(board.state[0]).toBeDefined();
      expect(board.state[0].player).toBe("X");
    });


    it('should throw if moving to out of bounds `x` position', function() {
      expect(function() {
        board.move("X", 4, 0);
      }).toThrow();
    });


    it('should throw if moving to out of bounds `y` position', function() {
      expect(function() {
        board.move("X", 0, 4);
      }).toThrow();
    });


    it('should emit victory if top row is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 0, 0);
      board.move('X', 1, 0);
      board.move('X', 2, 0);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit victory if center row is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 0, 1);
      board.move('X', 1, 1);
      board.move('X', 2, 1);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit victory if bottom row is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 0, 2);
      board.move('X', 1, 2);
      board.move('X', 2, 2);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit victory if left column is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 0, 0);
      board.move('X', 0, 1);
      board.move('X', 0, 2);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit victory if center column is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 1, 0);
      board.move('X', 1, 1);
      board.move('X', 1, 2);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit victory if right column is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 2, 0);
      board.move('X', 2, 1);
      board.move('X', 2, 2);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit victory if topleft->bottomright diagonal is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 0, 0);
      board.move('X', 1, 1);
      board.move('X', 2, 2);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit victory if bottomleft->topright diagonal is filled by same player', function() {
      var callback = jasmine.createSpy('victory');
      board.on('victory', callback);
      board.move('X', 2, 2);
      board.move('X', 1, 1);
      board.move('X', 0, 0);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'X');
    });


    it('should emit draw if board is filled and no victory condition met', function() {
      var callback = jasmine.createSpy('draw');
      var victory = jasmine.createSpy('victory');
      board.on('draw', callback);
      board.on('victory', victory);
      board.move('X', 0, 0);
      board.move('Y', 1, 1);
      board.move('X', 0, 1);
      board.move('Y', 0, 2);
      board.move('X', 2, 0);
      board.move('Y', 1, 0);
      board.move('X', 1, 2);
      board.move('Y', 2, 2);
      board.move('X', 2, 1);
      expect(callback.callCount).toBe(1);
      expect(victory).not.toHaveBeenCalled();
    });
  });


  describe('events', function() {
    var board;
    beforeEach(function() {
      board = new Board();
    });


    it('should emit events with private _emit method', function() {
      var callback = jasmine.createSpy('custom');
      board.on('custom', callback);
      board._emit('custom', 123);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 123);
    });


    it('should register event handlers properly', function() {
      var callback = jasmine.createSpy('move/reset/victory/badmove');
      board.on('move reset victory badmove', callback);
      board.move('X', 0, 0);
      board.move('Y', 0, 0);
      board.move('X', 1, 0);
      board.move('Y', 1, 1);
      board.move('X', 2, 0);
      board.reset();
      expect(callback.callCount).toBe(7);
    });


    it('should unregister event handlers properly', function() {
      var callback = jasmine.createSpy('move/reset/victory/badmove');
      board.on('move reset victory badmove', callback).off('move reset victory badmove', callback);
      board.move('X', 0, 0);
      board.move('Y', 0, 0);
      board.move('X', 1, 0);
      board.move('Y', 1, 1);
      board.move('X', 2, 0);
      board.reset();
      expect(callback).not.toHaveBeenCalled();
    });


    it('should unregister all event handlers if no callback is given', function() {
      var callback = jasmine.createSpy('move/reset/victory/badmove');
      var callback2 = jasmine.createSpy('move/reset/victory/badmove 2');
      board.on('move reset victory badmove', callback)
        .on('move reset victory badmove', callback2)
        .off('move reset victory badmove');
      board.move('X', 0, 0);
      board.move('Y', 0, 0);
      board.move('X', 1, 0);
      board.move('Y', 1, 1);
      board.move('X', 2, 0);
      board.reset();
      expect(callback).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });


    it('should set defaultPrevented flag if called', function() {
      var spies = {
        callback: function(event) {
          event.preventDefault();
        },
        callback2: function(event) {
          expect(event.isDefaultPrevented()).toBe(true);
        }
      };
      var callback = spyOn(spies, 'callback').andCallThrough();
      var callback2 = spyOn(spies, 'callback2').andCallThrough(); 
      board.on('reset', callback2).on('reset', callback);
      board.reset();
      expect(callback).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });


    it('should emit badmove event with player, x position and y position data', function() {
      var callback = jasmine.createSpy('badmove');
      board.on('badmove', callback);
      board.move('X', 0, 0);
      board.move('Y', 0, 0);
      expect(callback.callCount).toBe(1);
      expect(callback).toHaveBeenCalledWith(jasmine.any(Object), 'Y', 0, 0);
    });
  });
});
