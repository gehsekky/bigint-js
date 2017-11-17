/**
 * BigInt class to represent large integers
 * @param {*} n A value to be parsed into a BigInt
 */
function BigInt(n) {
  this._isPositive = true;
  this.numArray = [];
  this.parse(n);
}

/**
 * Parses value into a BigInt
 * @param {*} n The value to be parsed
 */
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

    const str = n.toFixedSpecial(0);
    for  (let i = 0; i < str.length; i++) {
      this.numArray.push(parseInt(str[i]));
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
        this.numArray.splice(0, 0, a);
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
        this.numArray.push(0);
      }
    }
  }
}

/**
 * Class method to return string
 */
BigInt.prototype.toString = function () {
  let str = this._isPositive ? '' : '-';
  const lim = this.numArray.length;
  for (let i = 0; i < lim; i++) {
    str += this.numArray[i] + '';
  }

  return str;
}

/**
 * Class comparator for equality
 * @param {BigInt} n Compares parent value to passed in value
 * @returns {boolean} Returns true if equal, false otherwise
 */
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

/**
 * Adds BigInt to passed in value
 * @param {*} n The value to add to this BigInt instance
 */
BigInt.prototype.Add = function (n) {
  if (!n) throw new Error('No parameter specified');

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
        thisReversed.push(sum);
      }
    }
  }

  if (carry) {
    thisReversed.push(1);
  }

  this.numArray = reverseArray(thisReversed);

  return this;
}

/**
 * Mulitplies instance value to passed in value
 * @param {*} n The value to multiply instance against
 */
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

  let result = [], i, j;
  for (i = 0; i < smallerLength; i++) {
    if (smaller[i] === 0) {
      result.push(0);
      continue;
    }
    let carry = 0, sumCarry = 0;
    for (j = 0; j < biggerLength; j++) {
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
        result.push(digitBase + sumCarry);
        sumCarry = 0;
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

    if (carry || sumCarry) {
      result.push(carry + sumCarry);
    }
  }

  this.numArray = reverseArray(result);

  return this;
}

/**
 * Returns a copy of the instance's internal numArray
 * @return {number[]} A copy of the instance numArray
 */
BigInt.prototype.getNumArray = function () {
  const lim = this.numArray.length;
  let cloned = [];
  for (let i = 0; i < lim; i++) {
    cloned[i] = this.numArray[i];
  }

  return cloned;
}

/**
 * Class method to see if instance is positive
 * @return {boolean} Whether instance is positive or not
 */
BigInt.prototype.isPositive = function () {
  return this._isPositive;
}

/**
 * Reverses the passed in array
 * @param {*} arr The array to reverse
 * @returns {number[]} Copy of passed in array with contents reversed
 */
function reverseArray(arr) {
  const copied = [], lim = arr.length;
  for (let i = lim - 1; i > -1; i--) {
    copied.push(arr[i]);
  }
  return copied;
}

/**
 * Converts a number to its true value and handles scientific notation
 * @returns {string} String representation of a number of any size
 */
Number.prototype.toFixedSpecial = function() {
  var str = this.toFixed();
  if (str.indexOf('e+') < 0)
    return str;

  // if number is in scientific notation, pick (b)ase and (p)ower
  return str.replace('.', '').split('e+').reduce(function(p, b) {
    return p + Array(b - p.length + 2).join(0);
  });
};

module.exports = BigInt;