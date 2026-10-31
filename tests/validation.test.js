const test = require('node:test')
const assert = require('node:assert/strict')
const {
  isValidEmail,
  isPositiveAmount,
  areDifferentAccounts,
} = require('../dist/validation.js')

test('email validation accepts a normal address', () => {
  assert.equal(isValidEmail('qa@example.com'), true)
})

test('email validation rejects malformed addresses', () => {
  for (const value of ['qa.example.com', 'qa@', '@example.com', 'qa @example.com']) {
    assert.equal(isValidEmail(value), false, value)
  }
})

test('amount validation accepts positive finite amounts', () => {
  for (const value of [0.01, 1, '25.50']) {
    assert.equal(isPositiveAmount(value), true, String(value))
  }
})

test('amount validation rejects zero, negative and non-finite values', () => {
  for (const value of [0, -1, '-0.01', 'abc', NaN, Infinity, null, undefined, '']) {
    assert.equal(isPositiveAmount(value), false, String(value))
  }
})

test('transfer validation requires two distinct non-empty account ids', () => {
  assert.equal(areDifferentAccounts('sender-1', 'receiver-1'), true)
  assert.equal(areDifferentAccounts('', 'receiver-1'), false)
  assert.equal(areDifferentAccounts('sender-1', ''), false)
  assert.equal(areDifferentAccounts('same', 'same'), false)
  assert.equal(areDifferentAccounts(null, 'receiver-1'), false)
})
