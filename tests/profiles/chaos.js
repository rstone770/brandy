require('./common');

delete Map;

if (typeof Map !== 'undefined') {
  throw new Error('Unable to downgrade feature Map.');
}
