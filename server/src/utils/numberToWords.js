// Helper to convert number to words (Indian Format)
function numberToWords(num) {
  const n = parseInt(num, 10);
  if (isNaN(n) || n === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(v) {
    if (v < 20) return a[v];
    return b[Math.floor(v / 10)] + (v % 10 !== 0 ? ' ' + a[v % 10] : '');
  }

  function convertThreeDigits(v) {
    let str = '';
    if (Math.floor(v / 100) > 0) {
      str += a[Math.floor(v / 100)] + ' Hundred ';
      v %= 100;
    }
    if (v > 0) {
      str += convertTwoDigits(v);
    }
    return str.trim();
  }

  let crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem %= 100000;
  let thousand = Math.floor(rem / 1000);
  rem %= 1000;
  let hundred = rem;

  let res = '';
  if (crore > 0) res += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) res += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) res += convertTwoDigits(thousand) + ' Thousand ';
  if (hundred > 0) res += convertThreeDigits(hundred);

  return res.trim() + ' Rupees Only';
}

module.exports = { numberToWords };

