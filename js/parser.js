function Compile(el, vm) {
  this.$vm = vm;
  this.$el = this.isElementNode(el) ? el : document.querySelector(el);
  if (this.$el) {
    // 转换成 文档碎片
    this.$flagment = this.node2Flagment(this.$el);
    this.compileElement(this.$flagment);
    this.$el.appendChild(this.$flagment);
  }
}

Compile.prototype = {
  isDirective: function (attr) {
    return attr.indexOf('v-') > -1;
  },
  isElementNode: function(node) {
    return node.nodeType === 1;
  },
  isTextNode: function(node) {
    return node.nodeType === 3;
  },
  node2Flagment: function (el) {
    var flagment = document.createDocumentFragment(),
        child;
    while (el.firstChild) {
      flagment.appendChild(el.firstChild);
    }
    return flagment;
  },
  compileElement: function (el) {
    var reg = /\{\{(.*)\}\}/;
    [].slice.call(el.childNodes).forEach(function(node) {
      var text = node.textContent;

      if (this.isElementNode(node)) {
        this.compile(node);
      }else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, CompileUtil.trim(RegExp.$1));
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node);
      }
    }.bind(this));
  },
  compile: function (node) {
    [].slice.call(node.attributes).forEach(function (attr) {
      // 普通指令处理,只支持model
      if (this.isDirective(attr.name) && attr.name === 'v-model') {
        CompileUtil.model(node, this.$vm, attr.value);
      }
    }.bind(this));
  },
  compileText: function (node, exp) {
    CompileUtil.text(node, this.$vm, exp);
  }
};

// 指令处理集合
var CompileUtil = {
  trim: function (str) {
    return str.replace(/(^\s)|(\s$)/g,'');
  },
  text: function (node, vm, exp) {
    CompileUtil.bind(node, vm, exp, 'text');
  },
  model: function (node, vm, exp) {
    CompileUtil.bind(node, vm, exp, 'model');
    node.addEventListener('input', function (e) {
      CompileUtil.__setVmVal(vm, exp, e.target.value);
    }.bind(this), false);
  }.bind(this),
  bind: function (node, vm, exp, dir) {
    var updaterFn = updater[dir + 'Updater'];

    updaterFn && updaterFn(node, this.__getVMVal(vm, exp));

    new Watcher(vm, exp, function(value, oldValue) {
        updaterFn && updaterFn(node, value, oldValue);
    });
  },
  __getVMVal: function (vm, exp) {
    var newVal = '';
    exp.split('.').forEach(function(key, i) {
      newVal = vm[this.trim(key)];
    }.bind(this));
    return newVal;
  },
  __setVmVal: function (vm, exp, val) {
    exp.split('.').forEach(function (key, i) {
      vm[key] = val;
    });
  }
};
var updater = {
  textUpdater: function(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  modelUpdater: function(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};
