// src/utils/numberToWordsEn.js

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function convertBelowThousand(num) {
  let result = ''

  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred '
    num %= 100
  }

  if (num > 0) {
    if (num < 20) {
      result += ones[num] + ' '
    } else {
      const ten = tens[Math.floor(num / 10)]
      const one = ones[num % 10]
      result += ten + (one ? ' ' + one : '') + ' '
    }
  }

  return result.trim()
}

/**
 * تحويل الأرقام إلى نص إنجليزي فصيح
 * @param {number|string} amount المبلغ
 * @param {string} currencyCode رمز العملة (افتراضياً SDG)
 * @returns {string} النص الكامل (مثال: SDG Thirty Thousand only)
 */
export function numberToEnglishWords(amount, currencyCode = 'SDG') {
  const numericAmount = Number(amount)
  if (isNaN(numericAmount) || numericAmount === 0) {
    return `${currencyCode} Zero only`
  }

  const [integerStr, decimalStr] = numericAmount.toFixed(2).split('.')
  let integerPart = parseInt(integerStr, 10)
  const decimalPart = parseInt(decimalStr, 10)

  const scales = [
    { value: 1000000000, label: 'Billion' },
    { value: 1000000, label: 'Million' },
    { value: 1000, label: 'Thousand' },
  ]

  let words = ''

  for (const scale of scales) {
    if (integerPart >= scale.value) {
      const count = Math.floor(integerPart / scale.value)
      words += convertBelowThousand(count) + ' ' + scale.label + ' '
      integerPart %= scale.value
    }
  }

  if (integerPart > 0) {
    words += convertBelowThousand(integerPart) + ' '
  }

  words = words.trim()

  if (decimalPart > 0) {
    words += ` and ${decimalPart}/100`
  }

  return `${currencyCode} ${words} only`
}
