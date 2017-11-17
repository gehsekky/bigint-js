const BigInt = require('../bigint');

describe('bigint', () => {
  it('should work for small values', () => {
    expect(new BigInt('1').toString()).toBe('1');
    expect(new BigInt('1000000').toString()).toBe('1000000');
  });

  it('should work for big numbers', () => {
    expect(new BigInt(factorial(10)).toString()).toBe('3628800');
    expect(new BigInt(factorial(11)).toString()).toBe('39916800');
    expect(new BigInt(factorial(15)).toString()).toBe('1307674368000');
    expect(new BigInt(factorial(20)).toString()).toBe('2432902008176640000');
    expect(new BigInt(factorial(22)).toString()).toBe('1124000727777607680000');
    expect(new BigInt(factorial(24)).toString()).toBe('620448401733239439360000');
    expect(new BigInt(factorial(25)).toString()).toBe('15511210043330985984000000');
    expect(new BigInt(factorial(38)).toString()).toBe('523022617466601111760007224100074291200000000');
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
  });

  it('should compare equality', () => {
    let a = new BigInt('2048');
    expect(a.Equals(2048)).toBe(true);
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
