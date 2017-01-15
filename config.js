const path = require('path');

const CONFIG = {
  server: {
    base: 'src/server',
    src: {
      js: '**/*.js',
    },
    dist: {
      js: '.',
    },
    babel: {
      presets: [
        ['env', {
          'targets': {
            'node': true,
          },
        }]
      ],
    },
  },
  client: {
    base: 'src/client',
    src: {
      all: '**/*',
    },
    dist: {
      all: 'static',
    },
    babel: {
      presets: [
        ['env', {
          'targets': {
            'chrome': 54,
          },
        }]
      ],
    },
  },
  dist: 'dist',
};

((...args) => {
  for (let obj of args) {
    for (let x in obj.src) {
      obj.src[x] = path.join(obj.base, obj.src[x]);
    }
    for (let x in obj.dist) {
      obj.dist[x] = path.join(CONFIG.dist, obj.dist[x]);
    }
  }
})(CONFIG.server, CONFIG.client);

module.exports = CONFIG;
