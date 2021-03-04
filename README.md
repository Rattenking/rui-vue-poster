### 介绍
> 海报插件，用于分享和保存海报，便于快捷开发！

### 引入
1. 下载插件包
[海报插件]()

2. 引入
```
  <script src="./js/rui-vue-poster.js"></script>
```

### 代码演示

#### HTML 代码演示
```
  <div class="rui-create-poster" @click="showPopup()">点击生成海报去分享</div>
  <div class="rui-layer-mark" v-show="popupshow" @click="popupshow=false">
    <div class="rui-layer-content" @click.stop="stop()">
      <div class="rui-poster-content">
        <rui-vue-poster :posterinfos="posterInfos" :scale="500" @success="success"></rui-vue-poster>
      </div>
      <div class="rui-poster-text">长按图片3秒可直接分享好友，与好友共享此刻心情或保存至手机</div>
    </div>
  </div>
```

#### JS 代码演示
```
  var app = new Vue({
    el: '#app',
    data:{
      popupshow: false,
      posterInfos: {},
      index: 0,
      posters: [
        {
          imgurl: './images/imgfengjing1.jpg',
          text: '一个背包，几本书，所有喜欢的歌，一张单程车票，一颗潇洒的心。'
        },
        {
          imgurl: './images/imgfengjing2.jpg',
          text: '下一站，家。'
        },
        {
          imgurl: './images/imgfengjing3.jpg',
          text: '在路上，永远年轻，永远热泪盈眶。'
        },
      ]
    },
    methods: {
      showPopup(){
        this.popupshow = true; 
        this.canvasDataInit();
      },
      changeImg(){
        if(this.index < this.posters.length - 1){
          this.index += 1;
        } else {
          this.index = 0;
        }
      },
      stop(){
        this.posterInfos = {};
        return false;
      },
      success(canvas) {
        this.canvas = canvas;
      },
      // 海报数据
      canvasDataInit() {
        let shareInfos = {
          width: 400,
          height: 485,
          backgroundColor: '#fff',
          views: [{
              type: 'image',
              url: this.posters[this.index].imgurl,
              css: {
                top: 0,
                left: 0,
                width: 400,
                height: 400
              },
              list: [
                {
                  type: 'text',
                  text: this.posters[this.index].text,
                  css: {
                    color: '#ffffff',
                    lineHeight: 32,
                    maxLines: 2,
                    textAlign: 'left',
                    width: 360,
                    fontSize: 20,
                    top: 345,
                    left: 20
                  }
                }
              ]
            },
            {
              type: 'image',
              url: './images/qrcode.jpg',
              css: {
                top: 413,
                left: 20,
                width: 60,
                height: 60
              }
            },
            {
              type: 'text',
              text: `长按识别二维码，在[WX-RUI]体验更多效果`,
              css: {
                color: '#222222',
                lineHeight: 32,
                maxLines: 1,
                textAlign: 'left',
                width: 280,
                fontSize: 13,
                top: 435,
                left: 100
              }
            },
            {
              type: 'text',
              text: `再体验，在[WX-RUI]`,
              css: {
                color: '#222222',
                lineHeight: 32,
                maxLines: 1,
                textAlign: 'left',
                width: 280,
                fontSize: 16,
                top: 460,
                left: 100
              }
            }
          ]
        };
        this.posterInfos = shareInfos;
      }
    }
  })
```

### API

#### props
|参数|说明|类型|默认值|
|----|----|---|------|
|posterinfos|海报绘制数据|Object|{}|
|scale|海报设计的为宽度|Number|750|

#### posterinfos
|参数|说明|类型|默认值|
|----|----|---|------|
|width|绘制海报的设计宽度|Number|400|
|height|绘制海报的设计高度|Number|500|
|backgroundColor|海报的背景色|String|#ffffff|
|views|绘制海报的图片和文字|Array|[]|

#### posterinfos.views
|参数|说明|类型|默认值|
|----|----|---|------|
|type|绘制海报的类型 image/text|String|''|
|css|绘制海报的类型的样式|Object|{}|
|url|绘制海报是图片类型时|String|''|
|text|绘制海报是文本类型时|String|''|
|list|当前类型绘制后需要绘制等同views|Array|[]|
 
#### css
1. image

|参数|说明|类型|默认值|
|----|----|---|------|
|top|当前图片的起始top值|Number|0|
|left|当前图片的起始left值|Number|0|
|width|当前图片的宽度|Number|0|
|height|当前图片的高度|Number|0|

2. text

|参数|说明|类型|默认值|
|----|----|---|------|
|top|当前文本的起始top值|Number|0|
|left|当前文本的起始left值|Number|0|
|width|当前文本的显示宽度|Number|200|
|fontSize|当前文本的字的大小|Number|20|
|lineHeight|当前文本的行间距|Number|30|
|maxLines|当前文本的最大行数|Number|3|
|color|当前文本的颜色|String|#333333|
|textAlign|当前文本的对齐方式|String|start|
|textBaseline|在绘制文本时的当前文本基线|String|alphabetic|

#### textAlign
|值|描述|
|----|----|
|start|默认。文本在指定的位置开始。|
|end|文本在指定的位置结束。|
|center|文本的中心被放置在指定的位置。|
|left|文本左对齐。|
|right|文本右对齐。|

#### textBaseline
|值|描述|
|----|----|
|alphabetic|默认。文本基线是普通的字母基线。|
|top|文本基线是 em 方框的顶端。|
|hanging|文本基线是悬挂基线。|
|middle|文本基线是 em 方框的正中。|
|ideographic|文本基线是表意基线。|
|bottom|文本基线是 em 方框的底端。|

#### Events
|事件|说明|回调参数|
|----|----|-------|
|success|海报绘制完成后的回调|canvas|
|fail|海报绘制失败的回调|canvas|