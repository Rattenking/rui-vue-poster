var ruiVuePoster = {
  props:{
    posterinfos: {
      type: Object,
      default: res => ({})
    },
    scale: {
      type: Number,
      default: 750
    }
  },
  data(){
    return {
      paintCount: 0,
      imageBase64: ''
    }
  },
  watch: {
    posterinfos: {
      handler(newVal, oldVal) {
        // 监听 posterinfos 是否改变，同时判断改变后 canvas 是否需要刷新
        if (this.isNeedRefresh(newVal, oldVal)) {
          this.paintCount = 0;
          this.startPaint();
        }
      },
      deep: true,
      immediate: true
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");
    })
  },
  methods: {
    isNeedRefresh(newVal, oldVal){
      if (!newVal || this.isEmpty(newVal)) {
        return false
      }
      return true
    },
    isEmpty(object) {
      for (var i in object) {
        return false;
      }
      return true;
    },
    /**
     * 图片适配，按比例放大缩小
     */
    getScale() {
      let windowWidth = window.innerWidth;
      return windowWidth / this.scale;
    },
    startPaint(){
      // 判断 posterinfos 不为空，开始初始化canvas
      if (this.isEmpty(this.posterinfos)) {
        return;
      }
      this.initCanvas();
    },
    getListLen(list = []) {
      // 获取需要绘制的总长度
      this.paintCount += list.length;
      list.forEach(cur => {
        if (cur.list) {
          this.getListLen(cur.list)
        }
      })
    },
    getDrawLength(){
      // 判断初始化canvas后是否需要深入绘制
      let views = this.posterinfos.views;
      if (views) {
        this.getListLen(views);
      }
    },
    /**
     * 处理canvas在高清设备绘制模糊的计算
     */
    getPixelRatio(context) {
      var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
      return (window.devicePixelRatio || 1) / backingStore;
    },
    initCanvas(){
      this.ratio = this.getPixelRatio(this.ctx) * this.getScale();
      // 设置画布宽高、填充画布背景色、初始化绘制数量
      let width = (this.posterinfos.width || 400) * this.ratio;
      let height = (this.posterinfos.height || 500) * this.ratio;
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx.rect(0, 0, width, height);
      this.ctx.fillStyle = this.posterinfos.backgroundColor || '#ffffff';
      this.ctx.fill();
      this.getDrawLength();
      this.drawCanvas();
    },
    _drawImage(view){
      // 绘制当前图片，绘制完成判断当前海报是否绘制完成、是否需要继续深入绘制
      if(!view.url){
        return ;
      }
      let {
        top = 0,left = 0,width = 0,height = 0
      } = view.css;
      top *= this.ratio;
      left *= this.ratio;
      width *= this.ratio;
      height *= this.ratio;
      if (typeof view.url === 'string') {
        this.ctx.fillStyle = '#ddd'
        this.ctx.fillRect(left, top, width, height);
        this.ctx.restore();
        return
      }
      this.ctx.save();
      this.ctx.drawImage(view.url, left, top, width, height);
      this.ctx.restore();
      this.drawOver(view);
    },
    /**
     * 绘制文字 
     **/
    _drawText(view, ctx) {
      let css = {
        color: '#333333',
        lineHeight: 30,
        textAlign: 'start',
        maxLines: 3,
        fontSize: 20,
        top: 0,
        left: 0,
        width: 200,
        textBaseline: 'alphabetic'
      }
      css = {
        ...css,
        ...view.css
      };
      css.lineHeight *= this.ratio;
      css.fontSize *= this.ratio;
      css.top *= this.ratio;
      css.left *= this.ratio;
      css.width *= this.ratio;
      this.ctx.save();
      this.ctx.textAlign = css.textAlign;
      this.ctx.textBaseline = css.textBaseline;
      this.ctx.fillStyle = css.color;
      this.ctx.font = css.fontSize + 'px  Arial';
      let result = this.breakLinesForCanvas(view.text, css.width, ctx);
      for (let i = 0; i < result.length; i++) {
        if (i <= css.maxLines - 1) {
          let str = result[i];
          if ((i === css.maxLines - 1) && (this.ctx.measureText(`${str}...`).width > css.width)) {
            result[i] = `${str.substring(0, str.length - 1)}...`;
          }
        } else {
          break;
        }
        this.ctx.fillText(result[i], css.left, css.top + i * css.lineHeight, css.width);
      }
      this.ctx.restore();
      this.drawOver(view);
    },
    /**
     * 获取文本换行断点
     * */
    findBreakPoint(text, width, ctx) {
      var min = 0;
      var max = text.length - 1;
      while (min <= max) {
        var middle = Math.floor((min + max) / 2);
        var middleWidth = ctx.measureText(text.substr(0, middle)).width;
        var oneCharWiderThanMiddleWidth = ctx.measureText(text.substr(0, middle + 1)).width;
        if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
          return middle;
        }
        if (middleWidth < width) {
          min = middle + 1;
        } else {
          max = middle - 1;
        }
      }
      return -1;
    },
    /**
     * 打断文本，返回给canvas绘制
     * */
    breakLinesForCanvas(text, width, ctx) {
      let result = [];
      let breakPoint = 0;
      while ((breakPoint = this.findBreakPoint(text, width, ctx)) !== -1) {
        result.push(text.substr(0, breakPoint));
        text = text.substr(breakPoint);
      }

      if (text) {
        result.push(text);
      }
      return result;
    },
    /**
     * 绘制完成判断
     **/ 
    drawOver(view){
      if (view.list && view.list.length > 0) {
        view.list.forEach(cur => this.getDrawType(cur));
      }
      this.paintCount -= 1;
      if (this.paintCount <= 0) {
        var imageBase64 = this.canvas.toDataURL('image/png');
        this.imageBase64 = imageBase64;
        this.$emit('success', this.canvas);
      }
    },
    /**
     * 复制 posterinfos，进行深入绘制
     **/ 
    drawCanvas(){
      let posterinfosCopy = JSON.parse(JSON.stringify(this.posterinfos));
      let views = posterinfosCopy.views || [];
      views.forEach(cur => {
        this.getDrawType(cur);
      })
    },
    /**
     * 判断当前绘制对象是图片还是文字
     */
    getDrawType(cur){
      switch (cur.type) {
        case 'image':
          if (cur.url) {
            this.downloadImage(cur.url).then(image => {
              cur.url = image;
              this._drawImage(cur);
            }).catch(err => {
              this.$emit('fail', this.canvas);
            });
          }
          break;
        case 'text':
          this._drawText(cur, this.ctx);
          break;
        default:
          break;
      }
    },
    /**
     * 下载当前图片
     */
    downloadImage(src){
      return new Promise((resolve, reject) => {
        if (src.startsWith('#')) {
          resolve(src);
          return
        }
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
          var url = URL.createObjectURL(this.response);
          var img = new Image();
          img.setAttribute('crossOrigin', 'anonymous');
          img.onload = function () {
            URL.revokeObjectURL(url);
            resolve(img);
          };
          img.onerror = () => reject(`下载图片失败 ${src}`);
          img.src = url;
        };
        xhr.open('GET', src, true);
        xhr.responseType = 'blob';
        xhr.send();
      })
    }
  },
  template: `
    <canvas v-if="!imageBase64" style="display:none;" ref="canvas" id="posterCanvas"></canvas>
    <img v-else-if="imageBase64" :src="imageBase64" :style="'display:block;width:' + this.posterinfos.width * getScale() + 'px;height:' + this.posterinfos.height * getScale() + 'px;'" />
  `
}

Vue.component('rui-vue-poster', ruiVuePoster)