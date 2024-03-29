// 给定一个无序的数组 nums，返回 数组在排序之后，相邻元素之间最大的差值 。如果数组元素个数小于 2，则返回 0
let nums = [1, 3, 5, 10, 4]

function getMaxDiffValue(arr) {
  if (arr.length < 2) return 0;

  const newNums = nums.sort((a, b) => a - b)
  let diffValueList = [];
  for(let i = 0; i < newNums.length - 1; i++) {
    let value = Math.abs(newNums[i] - newNums[i+1])
    diffValueList.push(value)
  }

  return Math.max(...diffValueList)
}

console.log(getMaxDiffValue(nums));



// 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。
// 你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。
{
  let nums = [1, 3, 4, 7, 2]
  function getTarget(nums, target) {
    const map = new Map()
    const result = []
    for(let i = 0; i < nums.length; i++) {
      const otherVal = target - nums[i];
      if (map.has(otherVal)) {
        result.push(map.get(otherVal), i)
      }
      map.set(nums[i], i)
    }
    return result;
  }
  console.log(getTarget([1, 3, 4, 7, 2], 5));
}


// 统计一个字符串出现最多的字母
// afjghdfraaaasdenas

function getMostLetter(str) {
  const map = new Map() // 存储key和该key出现的次数，默认出现次数为1
  for (let i = 0; i < str.length; i++) {
    const item = str[i];
    map.set(item, map.has(item) ? map.get(item) + 1 : 1)
  }

  // 表示出现最多的次数
  let maxLength = 1;
  let mostLetter;
  // 遍历map，如果value大于maxLength，将value赋值给maxLength
  // 遍历结束，将会得到最大的value
  for (let [key, value] of map) {
    if (value > maxLength) {
      maxLength = value
      mostLetter = key
    }
  }
  return mostLetter
}
console.log(getMostLetter('afjghdfraaaasdenas'));
