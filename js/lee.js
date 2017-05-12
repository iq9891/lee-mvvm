function Lee(params) {
  this.$params = params;
  var data = this._data = this.$params.data;
  // 数据监听器
  monitor(data);
  // 数据代理
  Object.keys(data).forEach(function (key) {
    this.proxyData(key);
  }.bind(this));
  this.$parser = new Compile(params.el || document.body, this);
}

Lee.prototype = {
  proxyData: function (key, setter, getter) {
    var self = this;
    setter = setter || Object.defineProperty(self, key, {
      configurable: false,
      enumerable: true,
      get: function () {
        return this._data[key];
      }.bind(this),
      set: function (newVal) {
        if (this._data[key] === newVal) {
          return;
        }
        this._data[key] = newVal;
      }.bind(this)
    });
  },
};
