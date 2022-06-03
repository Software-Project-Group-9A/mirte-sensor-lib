/**
 * Convert Euler angle notation rotation to Quaternion notation.
 * @param {number} x the Euler x coordinate
 * @param {number} y the Euler angle y coordinate
 * @param {number} z as Euler angle z coordinate
 * @return {*} object containing Quaternian coordinates.
 */
function quatFromEuler(x, y, z) {
  // This code was copied and modified from Three.js/src/math/Quaternion.js
  // The modification of this code is allowed by the MIT license claimed by the Three.js project.

  // http://www.mathworks.com/matlabcentral/fileexchange/
  // 20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
  // content/SpinCalc.m

  const cos = Math.cos;
  const sin = Math.sin;

  const c1 = cos( x / 2 );
  const c2 = cos( y / 2 );
  const c3 = cos( z / 2 );

  const s1 = sin( x / 2 );
  const s2 = sin( y / 2 );
  const s3 = sin( z / 2 );


  const _x = s1 * c2 * c3 + c1 * s2 * s3;
  const _y = c1 * s2 * c3 - s1 * c2 * s3;
  const _z = c1 * c2 * s3 + s1 * s2 * c3;
  const _w = c1 * c2 * c3 - s1 * s2 * s3;

  return {'x': _x, 'y': _y, 'z': _z, 'w': _w};
}

module.exports = {
  quatFromEuler: quatFromEuler,
};
