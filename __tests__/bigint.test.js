const BigInt = require('../bigint');

describe('bigint', () => {
  it('should work for small values', () => {
    expect(new BigInt('-1').toString()).toBe('-1');
    expect(new BigInt('1').toString()).toBe('1');
    expect(new BigInt('105').toString()).toBe('105');
  });

  it('should work for big numbers', () => {
    expect(new BigInt(factorial(10)).toString()).toBe('3628800');
    expect(new BigInt(factorial(11)).toString()).toBe('39916800');
    expect(new BigInt(factorial(15)).toString()).toBe('1307674368000');
    expect(new BigInt(factorial(20)).toString()).toBe('2432902008176640000');
    expect(new BigInt(factorial(22)).toString()).toBe('1124000727777607680000');
    expect(new BigInt(factorial(24)).toString()).toBe('620448401733239439360000');
    expect(new BigInt(factorial(25)).toString()).toBe('15511210043330985984000000');
    expect(new BigInt(factorial(30)).toString()).toBe('265252859812191058636308480000000');
    expect(new BigInt(factorial(37)).toString()).toBe('13763753091226345046315979581580902400000000');
  });

  it('should add', () => {
    let a = new BigInt('1307674368000');
    a.Add(new BigInt('123'));
    expect(a.toString()).toBe('1307674368123');

    a = new BigInt('555');
    a.Add(new BigInt('555'));
    expect(a.toString()).toBe('1110');

    a = new BigInt('255');
    a.Add(new BigInt(-1));
    expect(a.toString()).toBe('254');

    a = new BigInt('6227020800');
    a.Add(new BigInt('6227020800'));
    expect(a.toString()).toBe('12454041600');
  });

  it('should multiply', () => {
    let a = new BigInt('256');
    a.Multiply(new BigInt('256'));
    expect(a.toString()).toBe('65536');

    a = new BigInt('1024');
    a.Multiply(new BigInt('1024'));
    expect(a.toString()).toBe('1048576');

    a = new BigInt('39916800');
    a.Multiply(new BigInt('12'));
    expect(a.toString()).toBe('479001600');

    a = new BigInt('362880');
    a.Multiply(new BigInt('362880'));
    expect(a.toString()).toBe('131681894400');
  });

  it('should compare equality', () => {
    let a = new BigInt('2048');
    expect(a.Equals(2048)).toBe(true);

    let b = new BigInt('304888344611713860501504000000');
    expect(b.Equals(new BigInt('304888344611713860501504000000'))).toBe(true);
  });
});

function factorial(n) {
  if (!(n instanceof BigInt)) {
    n = new BigInt(n);
  }
  if (n.Equals(0)) return new BigInt(1);

  let sum = new BigInt(1);
  let multiplicand = new BigInt(1);
  while (!multiplicand.Equals(n)) {
    sum.Multiply(multiplicand);
    multiplicand.Add(new BigInt(1));
  }
  sum.Multiply(multiplicand);
  return sum;
}
