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
 * Reverses the passed in array
 * @param {*} arr The array to reverse
 * @returns {number[]} Copy of passed in array with contents reversed
 */
function reverseArray(arr) {
  const copied = [];
  const lim = arr.length;

  for (let i = lim - 1; i > -1; i--) {
    copied.push(arr[i]);
  }

  return copied;
}

/**
 * Checks for and initializes parameter if need be
 * @param {*} n Passed in parameter value
 * @returns {BigInt} A BigInt instance of the parameter
 */
function initializeParam(n) {
  if (typeof (n) === 'undefined' || n === null) {
    throw new Error('No parameter found');
  }

  if (n instanceof BigInt) {
    return n;
  }

  return new BigInt(n);
}

/**
 * Removes leading zeroes from array
 * @param {number[]} n Array potentially containing leading zeroes
 */
function removeLeadingZeroes(n) {
  if (!n.length) return n;

  while (n[0] === 0 && n.length > 1) {
    n.splice(0, 1);
  }

  return n;
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
    for (let i = 0; i < str.length; i++) {
      this.numArray.push(parseInt(str[i], 10));
    }

    return;
  }

  // check if we're parsing string
  if (typeof (n) === 'string') {
    // check if string is of regular number
    if (/^-?\d+$/.test(n)) {
      if (n < 0) {
        n = n.substring(1);
        this._isPositive = false;
      }

      this.numArray = n.split('').map(char => parseInt(char, 10));
      return;
    }

    // check if string is in scientific notation
    const match = /^(\d+(\.\d+)?)e[-+](\d+)$/.exec(n);
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
};

/**
 * Class method to return string
 * @returns The string representation of the BigInt instance
 */
BigInt.prototype.toString = function () {
  let str = this._isPositive ? '' : '-';
  const lim = this.numArray.length;
  for (let i = 0; i < lim; i++) {
    str += this.numArray[i].toString();
  }

  return str;
};

/**
 * Class comparator for equality
 * @param {BigInt} n Compares parent value to passed in value
 * @returns {boolean} Returns true if equal, false otherwise
 */
BigInt.prototype.Equals = function (n) {
  n = initializeParam(n);

  const numToCompare = new BigInt(n);
  const numToCompareArr = numToCompare.getNumArray();
  const thisLength = this.numArray.length;

  if (thisLength !== numToCompareArr.length) {
    return false;
  }

  for (let i = 0; i < thisLength; i++) {
    if (this.numArray[i] !== numToCompareArr[i]) {
      return false;
    }
  }

  return true;
};

/**
 * Adds BigInt to passed in value
 * @param {*} n The value to add to this BigInt instance
 * @returns {BigInt} Returns itself
 */
BigInt.prototype.Add = function (n) {
  n = initializeParam(n);

  const thisReversed = reverseArray(this.numArray);
  const thisLength = this.numArray.length;
  const nArray = n.getNumArray();
  const nLength = nArray.length;
  const nReversed = reverseArray(nArray);

  const lengthMax = nLength > thisLength ? nLength : thisLength;

  let carry = false;
  for (let i = 0; i < lengthMax; i++) {
    let sum = 0;
    let remainder = 0;

    if (i < thisLength) {
      if (i < nLength) {
        sum = (Number(thisReversed[i]) * (this.isPositive() ? 1 : -1)) +
          (Number(nReversed[i]) * (n.isPositive() ? 1 : -1)) + (carry ? 1 : 0);
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

  removeLeadingZeroes(this.numArray);

  if (this.Equals(0) && !this.isPositive()) {
    this._isPositive = true;
  }

  return this;
};

/**
 * Subtracts value from BigInt instance
 * @param {*} n
 */
BigInt.prototype.Subtract = function (n) {
  n = initializeParam(n);

  n._isPositive = !n._isPositive;
  return this.Add(n);
};

/**
 * Mulitplies instance value to passed in value
 * @param {*} n The value to multiply instance against
 * @returns {BigInt} Returns itself
 */
BigInt.prototype.Multiply = function (n) {
  n = initializeParam(n);

  const nArray = n.getNumArray();
  const nLength = nArray.length;
  const thisLength = this.numArray.length;
  let bigger = null;
  let smaller = null;
  let smallerLength;
  let biggerLength;

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

  const result = [];
  for (let i = 0; i < smallerLength; i++) {
    if (smaller[i] === 0) {
      result.push(0);
      continue;
    }
    let carry = 0;
    let sumCarry = 0;
    for (let j = 0; j < biggerLength; j++) {
      const product = (smaller[i] * bigger[j]) + carry;
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
};

/**
 * Returns a copy of the instance's internal numArray
 * @returns {number[]} A copy of the instance numArray
 */
BigInt.prototype.getNumArray = function () {
  const lim = this.numArray.length;
  const cloned = [];
  for (let i = 0; i < lim; i++) {
    cloned[i] = this.numArray[i];
  }

  return cloned;
};

/**
 * Class method to see if instance is positive
 * @return {boolean} Whether instance is positive or not
 */
BigInt.prototype.isPositive = function () {
  return this._isPositive;
};

/**
 * Factorial method for BigInt
 * @returns {BigInt} A new BigInt of the factorial value
 */
BigInt.prototype.Factorial = function () {
  if (this.Equals(0)) return new BigInt(1);

  const sum = new BigInt(1);
  const multiplicand = new BigInt(1);
  while (!multiplicand.Equals(this)) {
    sum.Multiply(multiplicand);
    multiplicand.Add(new BigInt(1));
  }
  sum.Multiply(multiplicand);
  return sum;
};

/**
 * Converts a number to its true value and handles scientific notation
 * @returns {string} String representation of a number of any size
 */
Number.prototype.toFixedSpecial = function () {
  const str = this.toFixed();
  if (str.indexOf('e+') < 0) {
    return str;
  }

  // if number is in scientific notation, pick (b)ase and (p)ower
  return str.replace('.', '').split('e+').reduce((p, b) => {
    return p + Array(b - p.length + 2).join(0);
  });
};

module.exports = BigInt;
