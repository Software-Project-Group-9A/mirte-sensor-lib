/**
 * This code was copied and modified from Three.js/src/math/Quaternion.js
 * The modification of this code is allowed by the MIT license claimed by the Three.js project.
 *
 *
 * Convert Euler angle notation rotation to Quaternion notation.
 * @param {number} x the x degree
 * @param {number} y the y degree
 * @param {number} z the z degree
 * @return {*} object containing Quaternian coordinates.
 */
function quatFromEuler(x, y, z) {
  // Formula for conversion used from wikipedia
  /**
   * @see {@link https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles}
  */
  U
  const cos = Math.cos;
  const sin = Math.sin;

  const yaw = z;
  const pitch = y;
  const roll = x;

  const cy = parseFloat(cos(yaw * 0.5));
  const sy = parseFloat(sin(yaw * 0.5));
  const cp = parseFloat(cos(pitch * 0.5));
  const sp = parseFloat(sin(pitch * 0.5));
  const cr = parseFloat(cos(roll * 0.5));
  const sr = parseFloat(sin(roll * 0.5));

  const q = {'x': 0, 'y': 0, 'z': 0, 'w': 0};

  q.w = cr * cp * cy + sr * sp * sy;
  q.x = sr * cp * cy - cr * sp * sy;
  q.y = cr * sp * cy + sr * cp * sy;
  q.z = cr * cp * sy - sr * sp * cy;

  return q;
}

module.exports = {
  quatFromEuler: quatFromEuler,
};
