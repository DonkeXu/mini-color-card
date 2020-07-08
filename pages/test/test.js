// pages/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: null, // 裁剪图片地址
    visible: false, // 是否显示
    size: { //裁剪尺寸
      width: 400,
      height: 300
    },
    cropSizePercent: 0.9, //裁剪框显示比例
    borderColor: '#0ac864', //裁剪框边框颜色
    result: '', //裁剪结果地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  updateComponnet: function () {
    this.setData({
      visible: true,
      borderColor: "#0ac864",
      cropSizePercent: 0.7,
      size: {
        width: 300,
        height: 300
      }
    })
  },
  cropCallback(e){
    console.log("[cropCallback]:", e)
    this.setData({
      newImg: e.detail.resultSrc,
      visible:false
    })
  },
  closeCallback(e){
    this.setData({
      visible:false
    })
  },
  chooseCropImage: function () {
    let self = this;
    wx.chooseImage({
      success(res) {
        self.setData({
          visible: true,
          src: res.tempFilePaths[0],
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})