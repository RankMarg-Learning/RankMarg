
const buffer = require('buffer');
if (!buffer.SlowBuffer) {
    console.log('SlowBuffer is missing, shimmed.');
    buffer.SlowBuffer = buffer.Buffer;
}
const bufferEq = require('buffer-equal-constant-time');
console.log('Successfully loaded buffer-equal-constant-time');
