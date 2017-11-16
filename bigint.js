/**
 * BigInt class to represent large integers
 * @param {*} n A value to be parsed into a BigInt
 */
function BigInt(n) {
  this.numArray = [];
  this.parse(n);
  this._isPositive = true;
}

BigInt.prototype.parse = function (n) {
  // check if we are parsing another BigInt
  if (typeof (n) === 'object' && n instanceof BigInt) {
    this.numArray = n.getNumArray();
    this._isPositive = n.isPositive();
    return;
  }

  // check if we're parsing a number
  if (typeof (n) === 'number') {
    if (n < 0) {
      n = Math.abs(n);
      this._isPositive = false;
    }
    while (n > 0) {
      let a = n % 10;
      n = Math.trunc(n / 10);
      this.numArray.splice(0, 0, a + '');
    }
    return;
  }

  // check if we're parsing string
  if (typeof (n) === 'string') {
    // check if string is of regular number
    if (/^-?\d+$/.test(n)) {
      if (n < 0) {
        n = Math.abs(n);
        this._isPositive = false;
      }
      while (n > 0) {
        let a = n % 10;
        n = Math.trunc(n / 10);
        this.numArray.splice(0, 0, a + '');
      }
      return;
    }

    // check if string is in scientific notation
    let match = /^(\d+(\.\d+)?)e[-+](\d+)$/.exec(n);
    if (match) {
      let base = match[1].replace('.', '');
      if (n < 0) {
        base = Math.abs(n);
        this._isPositive = false;
      }
      for (let i = 0; i < base.length; i++) {
        this.numArray.push(base[i]);
      }
      for (let i = 0; i <= match[3] - base.length; i++) {
        this.numArray.push('0');
      }
    }
  }
}

BigInt.prototype.toString = function () {
  let str = '';
  const lim = this.numArray.length;
  for (let i = 0; i < lim; i++) {
    str += this.numArray[i] + '';
  }

  return str;
}

BigInt.prototype.Equals = function (n) {
  const numToCompare = new BigInt(n);
  const numToCompareArr = numToCompare.getNumArray();
  const thisLength = this.numArray.length, nLength = numToCompareArr.length;

  if (thisLength !== nLength) {
    return false;
  }

  for (let i = 0; i < thisLength; i++) {
    if (this.numArray[i] !== numToCompareArr[i]) {
      return false;
    }
  }

  return true;
}

BigInt.prototype.Add = function (n) {
  if (!n) throw new Error('No parameter specified');
  console.log('n.isPositive', n.isPositive());

  let thisReversed = reverseArray(this.numArray), thisLength = this.numArray.length;

  const nArray = n.getNumArray();
  const nLength = nArray.length;
  let nReversed = reverseArray(nArray);


  const lengthMax = nLength > thisLength ? nLength : thisLength;

  let carry = false;
  for (let i = 0; i < lengthMax; i++) {
    let sum = 0, remainder = 0;

    if (i < thisLength) {
      if (i < nLength) {
        sum = Number(thisReversed[i]) + (Number(nReversed[i]) * (n.isPositive() ? 1 : -1)) + (carry ? 1 : 0);
      } else {
        sum = Number(thisReversed[i]) + (carry ? 1 : 0);
      }

      if (sum > 9) {
        carry = true;
        remainder = sum % 10;
        thisReversed[i] = remainder;
      } else {
        carry = false;
        thisReversed[i] = sum;
      }
    }

    if (i >= thisLength && i < nLength) {
      sum = Number(nReversed[i]) + (carry ? 1 : 0);
      if (sum > 9) {
        carry = true;
        remainder = sum % 10;
        thisReversed.push(remainder);
      } else {
        carry = false;
        thisReversed.push(sum + '');
      }
    }
  }

  if (carry) {
    thisReversed.push('1');
  }

  this.numArray = reverseArray(thisReversed);
}

BigInt.prototype.Multiply = function (n) {
  if (!n) throw new Error('No parameter specified');

  const nArray = n.getNumArray();
  let thisLength = this.numArray.length, nLength = nArray.length, bigger = null, smaller = null, smallerLength, biggerLength;

  const thisReversed = reverseArray(this.numArray);
  const nReversed = reverseArray(nArray);

  if (nLength > thisLength) {
    bigger = nReversed;
    biggerLength = nLength;
    smaller = thisReversed;
    smallerLength = thisLength;
  } else {
    bigger = thisReversed;
    biggerLength = thisLength;
    smaller = nReversed;
    smallerLength = nLength;
  }

  let result = [];
  for (let i = 0; i < smallerLength; i++) {
    let carry = 0, sumCarry = 0;
    for (let j = 0; j < biggerLength; j++) {
      let product = (smaller[i] * bigger[j]) + carry;
      let digitBase;
      if (product > 9) {
        digitBase = product % 10;
        carry = Math.trunc(product / 10);
      } else {
        digitBase = product;
        carry = 0;
      }

      if (result.length < j + i + 1) {
        result.push(digitBase);
      } else {
        const sum = result[j + i] + digitBase + sumCarry;
        let sumBase;
        if (sum > 9) {
          sumBase = sum % 10;
          sumCarry = Math.trunc(sum / 10);
        } else {
          sumBase = sum;
          sumCarry = 0;
        }

        result[j + i] = sumBase;
      }
    }

    if (carry) {
      result.push(carry);
      carry = 0;
    }
    if (sumCarry) {
      result.push(sumCarry);
    }
  }

  this.numArray = reverseArray(result);
}

BigInt.prototype.getNumArray = function () {
  const lim = this.numArray.length;
  let cloned = [];
  for (let i = 0; i < lim; i++) {
    cloned[i] = this.numArray[i];
  }

  return cloned;
}

BigInt.prototype.isPositive = function () {
  return this._isPositive;
}

function reverseArray(arr) {
  const copied = [], lim = arr.length;
  for (let i = lim - 1; i > -1; i--) {
    copied.push(arr[i]);
  }
  return copied;
}

module.exports = BigInt;