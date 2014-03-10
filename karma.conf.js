module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    reporters: ['dots', 'coverage'],

    files: [
      'tictactoe.js',
      'test/**/*.spec.js'
    ],

    preprocessors: {
      'tictactoe.js': ['coverage']
    },

    coverageReporter: {
      reporters: [{
        type: 'text' 
      }, {
        type: 'lcov',
        dir: 'coverage/'
      }],
    },

    browsers: ['Chrome']
  });

  function arrayRemove(array, item) {
    var index = array.indexOf(item);
    if (index >= 0) array.splice(index, 1);
  }

  if (process.argv.indexOf('--watch') >= 0) {
    config.set({
      singleRun: false,
      autoWatch: true
    });
  }

  if (process.argv.indexOf('--debug') >= 0) {
    arrayRemove(config.reporters, 'coverage');
    arrayRemove(config.reporters, 'coveralls');
    for (var key in config.preprocessors) {
      arrayRemove(config.preprocessors[key], 'coverage');
    }
  } else if (process.env.TRAVIS) {
    config.reporters.push('coveralls');
  }
};
