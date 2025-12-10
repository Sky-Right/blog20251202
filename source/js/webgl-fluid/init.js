// ...existing code...
(function () {
  // 在 DOM 解析完成后再执行，确保能插入 canvas 并被后续脚本取到
  document.addEventListener('DOMContentLoaded', function () {
    var isIndex = false;
    try {
      isIndex = location.pathname === '/' || document.body.classList.contains('home') || document.body.classList.contains('index');
    } catch (e) {
      isIndex = location.pathname === '/';
    }
    if (!isIndex) return;

    // 在首页添加专属类，且把真实导航高度写入 CSS 变量（不影响其它页面）
    try {
      document.body.classList.add('webgl-fluid-home');
      var headerEl = document.querySelector('header, .header, .site-header, .topbar, .navbar');
      if (headerEl) {
        var h = Math.ceil(headerEl.getBoundingClientRect().height) || 64;
        document.documentElement.style.setProperty('--site-header-height', h + 'px');
      } else {
        document.documentElement.style.setProperty('--site-header-height', '64px');
      }
    } catch (e) {
      console.warn('webgl init: set home class/height failed', e);
    }

    var containerSelectors = ['.index-banner', '.banner', '.home-banner', '#banner', '.hero', 'header', 'main', 'body'];
    var container = null;
    for (var i = 0; i < containerSelectors.length; i++) {
      try {
        container = document.querySelector(containerSelectors[i]);
      } catch (e) { container = null; }
      if (container) break;
    }
    if (!container) container = document.body;
    try {
      if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    } catch (e) { /* ignore */ }

    // 如果已有同 id 的 canvas，且不是本脚本添加的，先移除（避免冲突）
    try {
      var existing = document.getElementById('canvas');
      if (existing && existing.getAttribute('data-added-by') !== 'webgl-fluid-init') {
        existing.remove();
        existing = null;
      }
    } catch (e) { /* ignore */ }

    // 创建或重用 canvas
    var canvas = null;
    try { canvas = document.getElementById('canvas'); } catch (e) { canvas = null; }
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'canvas';
      canvas.setAttribute('data-added-by', 'webgl-fluid-init');
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '0';
      // 允许 canvas 接收交互（若不希望拦截交互改为 'none'）
      canvas.style.pointerEvents = 'auto';
      try { container.insertBefore(canvas, container.firstChild); } catch (e) { document.body.appendChild(canvas); }
    } else {
      // 确保样式与属性
      canvas.style.position = canvas.style.position || 'absolute';
      canvas.style.inset = canvas.style.inset || '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = canvas.style.zIndex || '0';
      canvas.style.pointerEvents = canvas.style.pointerEvents || 'auto';
      canvas.setAttribute('data-added-by', 'webgl-fluid-init');
    }

    // 全局暴露 canvas，兼容 demo 脚本
    try {
      window.canvas = canvas;
      window.CANVAS = canvas;
      window.fluidCanvas = canvas;
      window._webgl_injected_canvas = canvas;
    } catch (e) { /* ignore */ }

    // 让 container 内其它元素置于 canvas 之上
    try {
      Array.prototype.forEach.call(container.children, function (el) {
        if (el === canvas) return;
        if (!el.__webgl_z_adjusted) {
          var s = getComputedStyle(el);
          if (s.position === 'static') el.style.position = 'relative';
          var current = parseInt(s.zIndex, 10);
          if (isNaN(current) || current <= 0) el.style.zIndex = 1;
          el.__webgl_z_adjusted = true;
        }
      });
    } catch (e) { /* ignore */ }

    // 自适应 canvas 尺寸并通知可能的 hook
    function resizeCanvas() {
      try {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = Math.max(1, Math.floor(rect.width * dpr));
        var h = Math.max(1, Math.floor(rect.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          if (typeof window.onResizeFluid === 'function') {
            try { window.onResizeFluid(canvas); } catch (e) { console.error(e); }
          }
        }
      } catch (e) { /* ignore */ }
    }
    function debounce(fn, t) {
      var id;
      return function () {
        clearTimeout(id);
        id = setTimeout(function () { fn(); }, t);
      };
    }
    window.addEventListener('resize', debounce(resizeCanvas, 120));
    setTimeout(resizeCanvas, 50);

    function loadScript(src, cb) {
      try {
        var s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = cb;
        s.onerror = function () { console.error('加载脚本失败:', src); cb && cb(new Error('load error')); };
        document.head.appendChild(s);
      } catch (e) { console.error('loadScript error', e); cb && cb(e); }
    }

    // 移动端默认禁用，以节省性能（可按需修改）
    var isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 720;
    if (isMobile) return;

    var base = '/js/webgl-fluid/';
    // 按序加载，如需跳过 dat.gui 可删除第一项
    loadScript(base + 'dat.gui.min.js', function () {
      setTimeout(function () {
        loadScript(base + 'script.js', function () {
          try {
            if (typeof window.startFluid === 'function') {
              window.startFluid(canvas);
            } else if (typeof window.initFluid === 'function') {
              window.initFluid(canvas);
            } else if (typeof window.main === 'function') {
              try { window.main(canvas); } catch (e) { window.main(); }
            }
          } catch (e) {
            console.error('启动 WebGL-Fluid 出错', e);
          }
          setTimeout(function () {
            try { resizeCanvas(); } catch (e) { /* ignore */ }
          }, 120);
        });
      }, 40);
    });
  }, false);
})();
// ...existing code...
// filepath: c:\Users\kevin\Desktop\blog20251202\source\js\webgl-fluid\init.js
// ...existing code...
(function () {
  // 在 DOM 解析完成后再执行，确保能插入 canvas 并被后续脚本取到
  document.addEventListener('DOMContentLoaded', function () {
    var isIndex = false;
    try {
      isIndex = location.pathname === '/' || document.body.classList.contains('home') || document.body.classList.contains('index');
    } catch (e) {
      isIndex = location.pathname === '/';
    }
    if (!isIndex) return;

    // 在首页添加专属类，且把真实导航高度写入 CSS 变量（不影响其它页面）
    try {
      document.body.classList.add('webgl-fluid-home');
      var headerEl = document.querySelector('header, .header, .site-header, .topbar, .navbar');
      if (headerEl) {
        var h = Math.ceil(headerEl.getBoundingClientRect().height) || 64;
        document.documentElement.style.setProperty('--site-header-height', h + 'px');
      } else {
        document.documentElement.style.setProperty('--site-header-height', '64px');
      }
    } catch (e) {
      console.warn('webgl init: set home class/height failed', e);
    }

    var containerSelectors = ['.index-banner', '.banner', '.home-banner', '#banner', '.hero', 'header', 'main', 'body'];
    var container = null;
    for (var i = 0; i < containerSelectors.length; i++) {
      try {
        container = document.querySelector(containerSelectors[i]);
      } catch (e) { container = null; }
      if (container) break;
    }
    if (!container) container = document.body;
    try {
      if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    } catch (e) { /* ignore */ }

    // 如果已有同 id 的 canvas，且不是本脚本添加的，先移除（避免冲突）
    try {
      var existing = document.getElementById('canvas');
      if (existing && existing.getAttribute('data-added-by') !== 'webgl-fluid-init') {
        existing.remove();
        existing = null;
      }
    } catch (e) { /* ignore */ }

    // 创建或重用 canvas
    var canvas = null;
    try { canvas = document.getElementById('canvas'); } catch (e) { canvas = null; }
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'canvas';
      canvas.setAttribute('data-added-by', 'webgl-fluid-init');
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '0';
      // 允许 canvas 接收交互（若不希望拦截交互改为 'none'）
      canvas.style.pointerEvents = 'auto';
      try { container.insertBefore(canvas, container.firstChild); } catch (e) { document.body.appendChild(canvas); }
    } else {
      // 确保样式与属性
      canvas.style.position = canvas.style.position || 'absolute';
      canvas.style.inset = canvas.style.inset || '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = canvas.style.zIndex || '0';
      canvas.style.pointerEvents = canvas.style.pointerEvents || 'auto';
      canvas.setAttribute('data-added-by', 'webgl-fluid-init');
    }

    // 全局暴露 canvas，兼容 demo 脚本
    try {
      window.canvas = canvas;
      window.CANVAS = canvas;
      window.fluidCanvas = canvas;
      window._webgl_injected_canvas = canvas;
    } catch (e) { /* ignore */ }

    // 让 container 内其它元素置于 canvas 之上
    try {
      Array.prototype.forEach.call(container.children, function (el) {
        if (el === canvas) return;
        if (!el.__webgl_z_adjusted) {
          var s = getComputedStyle(el);
          if (s.position === 'static') el.style.position = 'relative';
          var current = parseInt(s.zIndex, 10);
          if (isNaN(current) || current <= 0) el.style.zIndex = 1;
          el.__webgl_z_adjusted = true;
        }
      });
    } catch (e) { /* ignore */ }

    // 自适应 canvas 尺寸并通知可能的 hook
    function resizeCanvas() {
      try {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = Math.max(1, Math.floor(rect.width * dpr));
        var h = Math.max(1, Math.floor(rect.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          if (typeof window.onResizeFluid === 'function') {
            try { window.onResizeFluid(canvas); } catch (e) { console.error(e); }
          }
        }
      } catch (e) { /* ignore */ }
    }
    function debounce(fn, t) {
      var id;
      return function () {
        clearTimeout(id);
        id = setTimeout(function () { fn(); }, t);
      };
    }
    window.addEventListener('resize', debounce(resizeCanvas, 120));
    setTimeout(resizeCanvas, 50);

    function loadScript(src, cb) {
      try {
        var s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = cb;
        s.onerror = function () { console.error('加载脚本失败:', src); cb && cb(new Error('load error')); };
        document.head.appendChild(s);
      } catch (e) { console.error('loadScript error', e); cb && cb(e); }
    }

    // 移动端默认禁用，以节省性能（可按需修改）
    var isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 720;
    if (isMobile) return;

    var base = '/js/webgl-fluid/';
    // 按序加载，如需跳过 dat.gui 可删除第一项
    loadScript(base + 'dat.gui.min.js', function () {
      setTimeout(function () {
        loadScript(base + 'script.js', function () {
          try {
            if (typeof window.startFluid === 'function') {
              window.startFluid(canvas);
            } else if (typeof window.initFluid === 'function') {
              window.initFluid(canvas);
            } else if (typeof window.main === 'function') {
              try { window.main(canvas); } catch (e) { window.main(); }
            }
          } catch (e) {
            console.error('启动 WebGL-Fluid 出错', e);
          }
          setTimeout(function () {
            try { resizeCanvas(); } catch (e) { /* ignore */ }
          }, 120);
        });
      }, 40);
    });
  }, false);
})();
// ...existing code...