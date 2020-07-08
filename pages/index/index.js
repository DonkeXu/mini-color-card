//index.js
//获取应用实例
import ColorThief from '../../utils/color-thief.js'
import {
  rgbToHex,
  uuid,
  colorsEqual,
  saveBlendent
} from '../../utils/util.js'
const app = getApp()
const STATE_EMPTY = 0;
const STATE_LOADING = 1;
const STATE_SUCCEED = 2;
var canvaData = null;

Page({
  data: {
    cropsrc: null, // 裁剪图片地址
    cropvisible: false, // 是否显示
    cropsize: { //裁剪尺寸
      width: 300,
      height: 300
    },
    cropSizePercent: 0.7, // 裁剪框显示比例
    cropborderColor: '#0ac864', // 裁剪框边框颜色
    cropresult: '', // 裁剪结果地址

    clientX:0,
    clientY:0,
    tapFirst: 0,
    k:1, // px / rpx
    motto: 'Hello World',
    imgPath: null,
    colors: [
      "#153641",
      "#22556E",
      "#4799B7",
      "#6DB3BF",
      "#94CFC9"
    ],
    imgInfo: {},
    colorCount: 5,
    state: STATE_EMPTY
  },
  editImage(){  // 编辑图片
    var imgPath = this.data.imgPath
    if(imgPath == null){
      wx.showToast({
        title: '先选图片',
        icon: 'none'
      })
      return
    }
    this.setData({
      cropvisible:true,
      cropsrc: imgPath,
      cropsize: {
        width: this.data.canvasWidth,
        height: this.data.canvasHeight
      }
    })
  },
  cropCallback(e){
    console.log("[cropCallback]:", e)
    this.setData({
      newImg: e.detail.resultSrc, // 截取之后的图片地址
      cropvisible:false,
      tapFirst: 0 // 设置为初次
    })
    this.getImgInfo(e.detail.resultSrc)
  },
  closeCallback(e){
    this.setData({
      cropvisible:false
    })
  },
  tap:function(e){
    console.log("[tap]", e, e.detail.x, " ",e.detail.y, "k", this.data.k)
    const x =  e.detail.x-(this.screenWidth - this.data.canvasWidth)/2
    const y = e.detail.y-40*this.data.k
    if(this.data.tapFirst==0){  // 保存刚选过图片的状态
      console.log("等于", 0)
      wx.canvasGetImageData({
        canvasId: 'imageHandler',
        x: 0,
        y: 0,
        width: this.data.canvasWidth,
        height: this.data.canvasHeight,
        success:res=> {
          console.log("[GET]:", res )
          canvaData = res.data
        },
        fail:res=>{
          console.log("[GET error]", res)
        }
      })
    }
    this.setData({tapFirst:this.data.tapFirst+1}) // 指示作用
    // console.log("[tapFirst]:", this.data.tapFirst)
    wx.canvasGetImageData({
      canvasId: 'imageHandler',
      height: 1,
      width: 1,
      x: x,
      y: y,
      success:res=>{
        console.log(res.data, res.data instanceof Uint8ClampedArray) // true
        var colors = this.data.colors
        /**
         * RGB转16进制
         * https://www.cnblogs.com/hlq1028ps/articles/3190515.html
         */
        // var color = "#"
        // for(var i in [0,1,2]){
        //   color = color+Number(res.data[i]).toString(16);
        // }
        var color = '#' + rgbToHex(res.data[0], res.data[1], res.data[2])
        if(colors.length==5){
          colors.push(color)
        }else if(colors.length==6){
          colors[5] = color
        }
        // console.log(colors)
        /**
         * 绘制坐标点
         * https://www.cnblogs.com/cynthia-wuqian/p/10286442.html
         */
        const ctx = wx.createCanvasContext('imageHandler')
        console.log("[ctx]", ctx)
        this.circleImg(ctx, '/res/locate.png', x-4, y-4, 8)
        this.setData({
          colors:colors
        })
      },
      fail:res=>{
        console.log('[fail]', res)
      }
    })
  },
  circleImg: function (ctx, img, x, y, r){
    // ctx.save()
    if(this.data.tapFirst==0){  // 保存刚选过图片的状态
      console.log("等于", 0)
    }else{
      wx.canvasPutImageData({
        canvasId: 'imageHandler',
        data: canvaData,
        height: this.data.canvasHeight,
        width: this.data.canvasWidth,
        x: 0,
        y: 0,
        success:res=>{
          console.log("[PUT]", res)
        },
        fail:err=>{
          console.log("[PUT ERROR]", err)
        }
      })
    }
    var d = 2 * r;
    ctx.drawImage(img, x, y, d, d);
    ctx.draw(true)
    console.log(img, x, y, d)
},
  touch:function(e){
    console.log("[touch]",e)
  },
  chooseImg: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imgPath: res.tempFilePaths[0],
          state: STATE_LOADING,
          tapFirst: 0
        })
        this.getImgInfo(res.tempFilePaths[0])
      }
    })
  },
  getImgInfo(src){  // 获取图片信息，提取颜色
    wx.getImageInfo({
      src: src,
      success: (imgInfo) => {
        let {
          width,
          height,
          imgPath
        } = imgInfo;
        let scale = 0.8 * this.screenWidth / Math.max(width, height);
        let canvasWidth = Math.floor(scale * width);
        let canvasHeight = Math.floor(scale * height);
        let k = this.screenWidth/750
        this.setData({
          imgInfo,
          canvasScale: scale,
          canvasWidth,
          canvasHeight,
          k: k,

        });
        let quality = 1;
        console.log(quality);
        this.colorThief.getPalette({
          width: canvasWidth,
          height: canvasHeight,
          imgPath: src,
          colorCount: this.data.colorCount,
          quality
        }, (colors) => {
          console.log('colors', colors);
          if (colors) {
            colors = colors.map((color) => {
              return ('#' + rgbToHex(color[0], color[1], color[2]))
            })
            this.setData({
              colors,
              state: STATE_SUCCEED
            })
          }
        });
      }
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  WraptouchStart(e){
    this.setData({
      clientX:e.touches[0].clientX,
      clientY:e.touches[0].clientY  
    })
    console.log("[start]:", e.touches[0].clientX, e.touches[0].clientY)
  },
  WraptouchMove(e){

    this.setData({
      clientX:e.touches[0].clientX,
      clientY:e.touches[0].clientY  
    })
    console.log("[MOVE]:", e.touches[0].clientX, e.touches[0].clientY)

  },
  WraptouchEnd(e){
    console.log("[END]:", e)
    // this.setData({
    //   clientX:e.touches[0].clientX,
    //   clientY:e.touches[0].clientY  
    // })
  },
  onLoad: function() {
    this.colorThief = new ColorThief('imageHandler');
    wx.getSystemInfo({
      success: ({
        screenWidth
      }) => {
        this.screenWidth = screenWidth;
      }
    })
  },
  save: function() {
    saveBlendent({colors:this.data.colors});
  },
  edit: function() {
    console.log('edit')
    let blendent = {
      colors: this.data.colors
    };
    wx.navigateTo({
      url: '../edit/edit?blendent='+JSON.stringify(blendent),
    })
  }
})