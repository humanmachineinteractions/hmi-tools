function rnd(a) {
  return Math.random() * a;
}
function rndf(a) {
  return Math.floor(rnd(a));
}
function rnda(A) {
  return A[rndf(A.length)];
}
function rndbtw(a, b) {
  return (Math.random() * (b - a)) + a;
}

exports.oneOf = rnda;