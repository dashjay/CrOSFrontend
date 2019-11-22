/**
 * @param {Object} obj 要深拷贝的对象
 * 递归深拷对象
 */
export function deepClone(obj) {
  var construct = Object.prototype.toString.call(obj).slice(8, -1);
  var res;
  if (construct === "Array") {
    res = [];
  } else if (construct === "Object") {
    res = {};
  }
  for (var item in obj) {
    if (typeof obj[item] === "object") {
      res[item] = deepClone(obj[item]);
    } else {
      res[item] = obj[item];
    }
  }
  return res;
};

var parse = function (num) {
  if (num < 10) {
    return "0" + num;
  } else {
    return num.toString();
  }
};

export function nowTime2Str() {
  let today = new Date();

  return today.getFullYear() +
    "-" +
    parse(today.getUTCMonth() + 1) +
    "-" +
    parse(today.getUTCDate());
}

export function str2TimeDict(timeStr){
  let t = timeStr.split("-");
  return {
    year: Number(t[0]),
    month: Number(t[1]),
    day: Number(t[2]),
  };
}