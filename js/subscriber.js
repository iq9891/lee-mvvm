function Watcher(vm, expOrFn, cb) {
  this.cb = cb;
  this.$vm = vm;
  this.expOrFn = expOrFn;
  this.depIds = {};

  // if (typeof expOrFn === 'function') {
  //     this.getter = expOrFn;
  // } else {
      // this.getter = this.parseGetter(expOrFn);
  // }
  this.getter = this.parseGetter(expOrFn);
  // console.log('this.getter', this.getter);
  this.value = this.get();
  console.log('this.value', this.value);
}

Watcher.prototype = {
  update: function() {
    var value = this.get();
    var oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.$vm, value, oldVal);
    }
  },
  get: function () {
    Dep.target = this;
    var value = this.getter.call(this.$vm, this.$vm);
    Dep.target = null;
    return value;
  },
  parseGetter: function (exp) {
    if (/[^\w.$]/.test(exp)) return;
    var exps = exp.split('.');

    return function(obj) {
      for (var i = 0, len = exps.length; i < len; i++) {
          if (!obj) return;
          obj = obj[exps[i]];
      }
      return obj;
    };
  },
  addDep: function (dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.add(this);
      this.depIds[dep.id] = dep;
    }
  }
};
