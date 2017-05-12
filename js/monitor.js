function monitor(data) {
  if (!data || typeof data !== 'object') {
    return;
  }
  var dep = new Dep();
  Object.keys(data).forEach(function (key) {
    var val = data[key];
    monitor(val); // 监听子属性
    Object.defineProperty(data, key, {
      enumerable: true, // 可枚举
      configurable: false, // 不能再define
      get: function () {
        if (Dep.target) {
          dep.depend();
        }
        return val;
      },
      set: function (newVal) {
        if (val === newVal) {
          return;
        }
        val = newVal;
        // 通知订阅者
        dep.notify();
      }
    });
  });
}

var uid = 0;

function Dep() {
  this.id = uid++;
  this.subs = [];
}

Dep.prototype = {
  add: function (sub) {
    this.subs.push(sub);
  },
  depend: function () {
    Dep.target.addDep(this);
  },
  notify: function () {
    this.subs.forEach(function (sub) {
      sub.update();
    });
  }
};
Dep.target = null;
