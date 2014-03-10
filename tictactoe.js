;(function (global) { 'use strict';

function main() {
  var defineProperty = Object.defineProperty || function(obj, prop, descriptor) {};
  var freeze = Object.freeze || function(obj) {};
  function readonly(obj, prop, value) {
    defineProperty(obj, prop, {
      configurable: false,
      enumerable: true,
      writable: false,
      value: value
    });
  }
  function hidden(obj, prop) {
    defineProperty(obj, prop, {
      configurable: false,
      enumerable: false,
      writable: true
    });
  }

  var LEADING_SPACE = /^\s+/;
  var TRAILING_SPACE = /\s+$/;
  function trim(str) {
    return ('' + str).replace(LEADING_SPACE, '').replace(TRAILING_SPACE, '');
  }

  function get(board, x, y) {
    var index = (y * board.width) + x;
    return board.state[index] || null;
  }

  function set(board, x, y, data) {
    var index = (y * board.width) + x;
    return (board.state[index] = data);
  }

  function Event(name) {
    this.name = name;
    this.defaultPrevented = false;
    hidden(this, 'defaultPrevented');
  }
  Event.prototype = {
    constructor: Event,
    preventDefault: function() {
      this.defaultPrevented = true;
    },
    isDefaultPrevented: function() {
      return this.defaultPrevented;
    }
  };

  function emit(self, name, data) {
    var handlers = self._handlers[name];
    if (!handlers) return;
    var event = new Event(name);
    var args = [event].concat(Array.prototype.slice.call(arguments, 2));
    for (var i=handlers.length; i >= 0; --i) {
      if (typeof handlers[i] === "function") {
        handlers[i].apply(null, args);
      }
    }
    return event;
  }

  function Board() {
    this.width = 3;
    this.height = 3;
    this._historyHead = this._historyTail = null;
    this._handlers = {};
    readonly(this, 'width', 3);
    readonly(this, 'height', 3);
    hidden(this, '_handlers');
    hidden(this, '_historyHead');
    hidden(this, '_historyTail');
    hidden(this, '_moves');
    this.reset();
  }

  Board.prototype = {
    reset: function() {
      // TODO: walk list of move history, cut references, and reset board markers
      this._historyHead = this._historyTail = null;

      // Reset board by creating a new one.
      this.state = new Array(9);
      this._moves = 0;
      emit(this, 'reset');
      return this;
    },

    isAvailable: function(x, y) {
      return !(get(this, x, y) instanceof Move);
    },

    move: function(player, x, y) {
      if (arguments.length < 3) throw new Error("Arguments for `player`, `x` and `y` are required");
      if (x < 0 || y < 0 || x >= this.width || y >= this.width)
        throw new Error("Index out of range");
      if (this.isAvailable(x, y)) {
        var item = new Move(player, x, y);
        if (this._historyHead === null) {
          this._historyHead = this._historyTail = item;
        } else {
          item._previousMove = this._historyTail;
          this._historyTail._nextMove = item;
          this._historyTail = item;
        }

        // Set board tile for player
        set(this, x, y, item);

        this._moves++;
        emit(this, 'move', item);

        // Perform victory detection algorithm
        if (this.detectVictory(player, x, y)) {
          emit(this, 'victory', player);
        } else if (this._moves === this.state.length) {
          emit(this, 'draw');
        }

        return true;
      }
      emit(this, 'badmove', x, y);
      return false;
    },

    detectVictory: function(player) {
      var nw, n, ne, e, se, s, sw, w, c;
      nw = (nw = get(this, 0, 0)) && nw.player === player;
      n = (n = get(this, 1, 0)) && n.player === player;
      ne = (ne = get(this, 2, 0)) && ne.player === player;
      if (nw && n && ne) return true;

      w = (w = get(this, 0, 1)) && w.player === player;
      c = (c = get(this, 1, 1)) && c.player === player;
      e = (e = get(this, 2, 1)) && e.player === player;
      if (w && c && e) return true;

      sw = (sw = get(this,0, 2)) && sw.player === player;
      s = (s = get(this, 1, 2)) && s.player === player;
      se = (se = get(this, 2, 2)) && se.player === player;
      if (sw && s && se) return true;

      if (nw && w && sw) return true;
      if (n && c && s) return true;
      if (ne && e && se) return true;

      if (c && ((nw && se) || (ne && sw))) return true;
      return false;
    },

    history: function() {
      var moves = [];
      var move = this._historyHead;
      while (move !== null) {
        moves.push(move.toObject());
        move = move._nextMove;
      }
      return moves;
    },

    // register an event handler
    on: function(events, handler) {
      if (typeof events === "string") events = trim(events).split(/\s+/);
      if (Array.isArray(events)) {
        for (var i=0, ii=events.length; i<ii; ++i) {
          var event = events[i];
          var handlers = (this._handlers[event] || (this._handlers[event] = []));
          if (handlers.indexOf(handler) < 0) handlers.push(handler);
        }
      }
      return this;
    },

    // deregister an event handler
    off: function(events, handler) {
      if (typeof events === "string") events = trim(events).split(/\s+/);
      if (Array.isArray(events)) {
        var handlers = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;
        for (var i=0, ii=events.length; i<ii; ++i) {
          var event = events[i];
          var _handlers = this._handlers[event];
          if (handlers && _handlers) {
            for (var j=0, jj=handlers.length; j<jj; ++j) {
              var index = handlers.indexOf(_handlers[j]);
              if (index >= 0) _handlers.splice(index, 1);
            }
          } else {
            delete this._handlers[event];
          }
        }
      }
      return this;
    }
  };
  freeze(Board.prototype);

  function Move(player, x, y) {
    this.player = player;
    this.x = x;
    this.y = y;
    this.time = new Date();
    this._previousMove = this._nextMove = null;
    readonly(this, 'player', player);
    readonly(this, 'x', x);
    readonly(this, 'y', y);
    hidden(this, '_previousMove');
    hidden(this, '_nextMove');
  }

  Move.prototype = {
    constructor: Move,
    toObject: function() {
      return {
        player: this.player,
        x: this.x,
        y: this.y,
        time: this.time
      };
    }
  }
  freeze(Move.prototype);

  return {
    Board: Board,
    Move: Move
  };
}

//
// Export:
//
var freeExports = typeof exports === "object" && exports && !exports.nodeType && exports;
var freeModule = typeof module === "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
var ttt = main();

// some AMD build optimizers like r.js check for condition patterns like the following:
if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
  define(function() {
    return ttt;
  });
} else if (freeExports && freeModule) {
  if (moduleExports) {
    // in Node.js or RingoJS
    freeModule.exports = ttt;
  } else {
    // in Narwhal or Rhino -require
    freeExports.ttt = ttt;
  }
} else {
  // browser or RequireJS
  global.ttt = ttt;
}

}).call(this, this);
