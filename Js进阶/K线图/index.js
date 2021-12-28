// javascript
const canvas = document.getElementById('canvas');
canvas.style.background = '#e8e8e8'

// 最高价、最低价、开盘价、收盘价
const data = [
  { date: '09-01', heightPrice: 1000, lowPrice: 500, openingPrice: 800, closingPice: 900 },
  { date: '09-02', heightPrice: 1000, lowPrice: 625, openingPrice: 800, closingPice: 700 },
  { date: '09-03', heightPrice: 1000, lowPrice: 750, openingPrice: 800, closingPice: 900 },
  { date: '09-04', heightPrice: 905, lowPrice: 625, openingPrice: 701, closingPice: 903 },
  { date: '09-05', heightPrice: 1000, lowPrice: 550, openingPrice: 807, closingPice: 709 },
  { date: '09-06', heightPrice: 1000, lowPrice: 800, openingPrice: 807, closingPice: 909 },
  { date: '09-07', heightPrice: 1000, lowPrice: 600, openingPrice: 807, closingPice: 909 },
  { date: '09-08', heightPrice: 1000, lowPrice: 600, openingPrice: 900, closingPice: 908 },
  { date: '09-09', heightPrice: 904, lowPrice: 600, openingPrice: 701, closingPice: 803 },
  { date: '09-10', heightPrice: 1000, lowPrice: 600, openingPrice: 807, closingPice: 909 },
]

if (canvas.getContext) {
  ctx = canvas.getContext('2d');
  const config = {
    yAxisSplitNumber: 6,
  }
  renderKLineChart(data, config, true)
}

/**
 * 绘制k线图
 * @param {array} data 数据源
 * @param {object} config k线图配置项
 * @param {boolean} showTips 是否展示辅助线
 */
function renderKLineChart (
  data = [],
  {
    // y轴分段数量
    yAxisSplitNumber = 4,
    // 坐标轴与容器间的边距
    padding = {
      left: 50,
      right: 50,
      top: 30,
      bottom: 30
    },
    // 三角形高度
    triangleH = 10,
    // 刻度线宽度
    tickWidth = 5,
    // 蜡烛宽度
    candleW = 10,
    // 曲线类型
    curveType = 'lowPrice',
  },
  showTips = false
) {

  // 已知条件
  // 容器宽度
  const width = ctx.canvas.width
  // 容器高度
  const height = ctx.canvas.height
  // x轴元素数量
  const xAxisItemLength = data.length

  // 可知条件
  // y轴横坐标
  const yAxisPointX = padding.left
  // y轴纵坐标
  const yAxisPointY = height - padding.bottom
  // y轴顶点纵坐标
  const yAxisVertexY = padding.top
  // y轴高度
  const yAxisHeight = height - (padding.top + padding.bottom)
  // y轴刻度间距
  const yAxisTickSpace = yAxisHeight / yAxisSplitNumber
  // x轴顶点横坐标
  const xAxisVertexX = width - yAxisPointX
  // x轴宽度
  const xAxisWidth = width - yAxisPointX - padding.right
  // x轴刻度间距
  const xAxisTickSpace = xAxisWidth/ xAxisItemLength
   // 最高价最大的值
  const maxPrice = Math.max(...data.map(x => x.heightPrice))
  // 价格与y轴高度的比率
  const yAxisPriceRate = maxPrice / yAxisHeight
  // 纵坐标集合
  const dataYAxisPoint = data.map(it => {
    const newIt = {}
    for (key in it) {
      newIt[key] =  tranPriceToOrdinate(it[key])
    }
    return newIt
  })

  const seriesData = data.map(it => it.date)

  // TODO Y轴刻度和纵坐标优化
  // const minPrice = Math.min(...data.map(x => x.lowPrice))
  // const splitBase = (maxPrice - minPrice) / yAxisSplitNumber
  // const yAxisTickText = i => (minPrice + splitBase * i).toFixed(2)
  // 不知道哪里计算错误
  // const tranPriceToOrdinate = price => yAxisPointY - price / yAxisPriceRate + (price - minPrice) / yAxisPriceRate

  if (showTips) {
    renderTipCanvas()
  }

  // 绘制Y轴
  ctx.beginPath()
  ctx.moveTo(yAxisPointX, yAxisPointY)
  ctx.lineTo(yAxisPointX, yAxisVertexY)
  ctx.closePath();
  ctx.stroke()

  // 绘制x轴
  ctx.beginPath()
  ctx.moveTo(yAxisPointX, yAxisPointY)
  ctx.lineTo(xAxisVertexX, yAxisPointY)
  ctx.closePath();
  ctx.stroke()

  // 绘制y轴三角形
  ctx.beginPath()
  ctx.moveTo(yAxisPointX, yAxisVertexY)
  ctx.lineTo(yAxisPointX - triangleH/2, yAxisVertexY + triangleH)
  ctx.lineTo(yAxisPointX + triangleH/2, yAxisVertexY + triangleH)
  ctx.fill()

  // 绘制x轴三角形
  ctx.beginPath()
  ctx.moveTo(xAxisVertexX, yAxisPointY)
  ctx.lineTo(xAxisVertexX - triangleH, yAxisPointY - triangleH/2)
  ctx.lineTo(xAxisVertexX - triangleH, yAxisPointY + triangleH/2)
  ctx.fill()

  // 绘制y轴刻度
  for (let i = 0; i < yAxisSplitNumber; i++) {
    let sx = yAxisPointX
        sy = yAxisPointY - yAxisTickSpace * i
        ex = yAxisPointX + tickWidth
        ey = yAxisPointY - yAxisTickSpace * i

    renderText(ctx, sx - 10, sy, yAxisTickText(i), 'right', '#FF0000')
    renderLine(sx, sy, ex, ey)
  }

  // 绘制x轴刻度
  for (let i = 0; i < xAxisItemLength; i++) {
    const xAxisTickX = xAxisTickPointX(i)
    renderText(ctx, xAxisTickX, yAxisPointY + tickWidth + 10, seriesData[i], 'center', '#FF0000')
    renderLine(xAxisTickX, yAxisPointY, xAxisTickX, yAxisPointY + tickWidth)
  }

  // 绘制一串蜡烛
  renderCandles(dataYAxisPoint, candleW)

  // 绘制贝塞尔曲线
  renderBezierCurve(getControlPointInfo(curveType))


  // x轴刻度横坐标
  function xAxisTickPointX (i) {
    return yAxisPointX + i * xAxisTickSpace
  }

  // 实际价格转为纵坐标
  function tranPriceToOrdinate (price) {
    return yAxisPointY - price / yAxisPriceRate
  }

  // Y轴刻度文字
  function yAxisTickText (i) {
    return (yAxisTickSpace * i * yAxisPriceRate).toFixed(2)
  }

  /**
   * 绘制一串蜡烛
   * @param {array} dataYAxisPoint 数据源
   * @param {number} candleW 蜡烛宽度
   */
  function renderCandles (dataYAxisPoint, candleW) {
    const halfCandleW = candleW / 2

    for (let i = 0, candleLength = dataYAxisPoint.length; i < candleLength; i++) {
      const { heightPrice, lowPrice, openingPrice, closingPice } = dataYAxisPoint[i]
      let
        abscissa = xAxisTickPointX(i),
        topPointY = heightPrice,
        bottomPointY = lowPrice,
        secondPointY,
        thirdPointY,
        candleColor

      if (closingPice < openingPrice) {
        // 涨
        candleColor = 'red'
        secondPointY = closingPice
        thirdPointY = openingPrice
      } else {
        candleColor = 'green'
        secondPointY = openingPrice
        thirdPointY = closingPice
      }

      // 绘制蜡烛上影线
      ctx.beginPath()
      ctx.moveTo(abscissa, topPointY)
      ctx.lineTo(abscissa, secondPointY)
      ctx.closePath();
      ctx.stroke()

      // 绘制蜡烛下影线
      ctx.beginPath()
      ctx.moveTo(abscissa, bottomPointY)
      ctx.lineTo(abscissa, thirdPointY)
      ctx.closePath();
      ctx.stroke()

      // 绘制蜡烛实体（绘制矩形）
      ctx.beginPath()
      ctx.moveTo(abscissa - halfCandleW, secondPointY)
      ctx.rect(abscissa - halfCandleW, secondPointY, candleW, thirdPointY - secondPointY)
      ctx.fillStyle = candleColor
      ctx.fill();

      // TODO 因为没有绘制单个蜡烛的场景，所以没必要封装（偏应用），以一串蜡烛为颗粒这样使用更为方便
      // 如果我们做的是类似图表库项目，就可以考虑封装为一个工具函数，在多个地方使用，提高复用率
      // renderCandle(abscissa, topPointY, bottomPointY, secondPointY, thirdPointY, candleW, candleColor)
    }
  }

   /**
   * 获取当前点以及前后控制点坐集合
   * @param {string} curveType 曲线类型 { heightPrice, lowPrice, openingPrice, closingPice }
   * @returns [array] 当前点以及前后控制点坐集合
   */
  function getControlPointInfo (curveType) {
    let controlPoint = []

    for (let i = 0; i < xAxisItemLength; i++) {
      const pricePointX = xAxisTickPointX(i)
      const pricePointY = dataYAxisPoint[i][curveType]
      let prevNode = {}
      let nextNode = {}

      // 边界处理：在首尾加入虚拟点，不全第一个元素没有前控制点，末尾元素没有后控制点的情况
      if (i === 0) {
        prevNode = { heightPrice: tranPriceToOrdinate(100), lowPrice: tranPriceToOrdinate(60), openingPrice: tranPriceToOrdinate(70), closingPice: tranPriceToOrdinate(99) }
        nextNode = dataYAxisPoint[i + 1]
      } else if (i === xAxisItemLength - 1) {
        prevNode = dataYAxisPoint[i - 1]
        nextNode = { heightPrice: tranPriceToOrdinate(101), lowPrice: tranPriceToOrdinate(20), openingPrice: tranPriceToOrdinate(72), closingPice: tranPriceToOrdinate(89) }
      } else {
        prevNode = dataYAxisPoint[i - 1]
        nextNode = dataYAxisPoint[i + 1]
      }

      // 前后点构成的三角形
      // b: 三角形的高
      const triangleHeight = Math.abs(nextNode.lowPrice - prevNode.lowPrice)
      // a: 三角形底边
      const triangleBottomLine = xAxisTickSpace * 2
      // c: 三角形斜边 = (高的平方+底边的平方)的平方根
      const triangleHypotenuse = Math.sqrt(Math.pow(triangleHeight, 2) +  Math.pow(triangleBottomLine, 2))

      // 前后控制点为斜边的三角形
      // C: 控制点三角形斜边长度(自定义)
      const controlPointW = xAxisTickSpace * 0.5
      // A: 控制点三角形底边
      const controlPointBottomLine = controlPointW * triangleBottomLine / triangleHypotenuse
      // B: 控制点三角形的高
      const controlPointHeight = controlPointW * triangleHeight / triangleHypotenuse

      // 前一个控制点纵坐标
      let prevControlY = undefined
      // 后一个控制点纵坐标
      let nextControlY = undefined

      // 相对于canvas的坐标，如果前个控制点纵坐标小于下个控制点的纵坐标（相当于视觉上的左高右低）
      if (prevNode[curveType] < nextNode[curveType]) {
        // 左高右低
        prevControlY = pricePointY - controlPointHeight / 2
        nextControlY = pricePointY + controlPointHeight / 2
      } else {
        prevControlY = pricePointY + controlPointHeight / 2
        nextControlY = pricePointY - controlPointHeight / 2
      }

      controlPoint.push({
        curX: pricePointX,
        curY: pricePointY,
        prevControlX: pricePointX - controlPointBottomLine / 2,
        prevControlY,
        nextControlX: pricePointX + controlPointBottomLine / 2,
        nextControlY
       })
    }

    return controlPoint
  }

   /**
   * 绘制贝塞尔曲线
   * @param {array} controlPoint 控制点集合:  [{ curX: lowPricePointX, curY: lowPricePointY, prevControlX, prevControlY, nextControlX, nextControlY } ...]
   */
  function renderBezierCurve (controlPoint) {
    ctx.beginPath();
    for (let i = 0; i < controlPoint.length; i++) {
      const {
        curX,
        curY,
        prevControlX,
        prevControlY,
      } = controlPoint[i]

      if (i > 0 && i < controlPoint.length) {
        const prevNode = controlPoint[i - 1]
        ctx.bezierCurveTo(prevNode.nextControlX, prevNode.nextControlY, prevControlX, prevControlY, curX, curY);
      } else if ( i === 0) {
        ctx.moveTo(curX, curY);
      }
    }
    ctx.stroke();
  }

  /**
   * 绘制线条
   * @param {sx} sx 开始坐标点横坐标
   * @param {sy} sy 开始坐标点纵坐标
   * @param {ex} ex 结束坐标点横坐标
   * @param {ey} ey 结束坐标点纵坐标
   */
  function renderLine (sx, sy, ex, ey) {
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(ex, ey)
    ctx.closePath();
    ctx.stroke()
  }

  /**
   * 轴线文字
   * @param {object} context canvas上下文
   * @param {number} x 横坐标
   * @param {number} y 纵坐标
   * @param {string} text 文本
   * @param {string} align 文本对齐方式
   * @param {string} color 文本颜色
   */
  // TODO 把参数放在对象下传入是不是更方便？
  function renderText (context = ctx, x, y, text, align = 'left', color = '#FFF') {
    // context.fillStyle = "#FF0000";  // 文字颜色
    context.fillStyle = color;  // 文字颜色
    context.textBaseline = "middle";
    context.textAlign = align;

    context.font = "10px Arial";  // 高为10px的字体
    context.fillText(text, x, y)  // 描绘实体文字
  }

  /**
   * 绘制辅助线画布
   */
  function renderTipCanvas () {
    const tipCanvas = document.getElementById('subCanvas');
    if (!tipCanvas.getContext) return
    const ctx = tipCanvas.getContext('2d');

    // 容器宽度
    const width = ctx.canvas.width
    // 容器高度
    const height = ctx.canvas.height
    // 提示框元素
    let promptBoxEl = null
    // 提示框元素宽度
    let promptBoxElWidth = 100
    // 提示框内的日期元素
    let tipDateEl = null
    // 提示框内的最高价元素
    let heightPriceEl = null
    // 提示框内的最低价元素
    let lowPriceEl = null
    // x轴y轴上的提示框宽、高
    const xyAxisTipBoxWidth = padding.left
    const xyAxisTipBoxHeight = 20

    // 监听鼠标进入事件并清除画布
    tipCanvas.addEventListener('mouseenter', function (e) {
      promptBoxEl = document.getElementById('tipInfo')
    }, false)

    // 监听鼠标移动事件并绘制辅助线
    tipCanvas.addEventListener('mousemove', function (e) {
      const { offsetX, offsetY } = e
      // 清除画布
      ctx.clearRect(0, 0, width, height)

      if (!isContentArea(e)) return

      // 绘制水平辅助线
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(yAxisPointX, offsetY);
      ctx.lineTo(width - padding.right - xAxisWidth / xAxisItemLength, offsetY);
      ctx.stroke();

      // 绘制垂直辅助线
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(offsetX, padding.top);
      ctx.lineTo(offsetX, yAxisPointY);
      ctx.stroke();

      // 绘制y轴tip文字背景框
      ctx.beginPath();
      ctx.rect(0, offsetY - xyAxisTipBoxHeight / 2, xyAxisTipBoxWidth, xyAxisTipBoxHeight);
      ctx.fillStyle = '#999'
      ctx.fill();

      // 绘制y轴tip文字
      const yAxisValue = ((yAxisHeight + padding.top - offsetY) / yAxisHeight * maxPrice).toFixed(2)
      renderText(ctx, yAxisPointX - 30, offsetY, yAxisValue, 'left', '#fff')


      // 绘制x轴tip文字背景框
      ctx.beginPath();
      ctx.rect(offsetX - xyAxisTipBoxWidth / 2, yAxisPointY, xyAxisTipBoxWidth, xyAxisTipBoxHeight);
      ctx.fillStyle = '#999'
      ctx.fill();

      // 绘制x轴tip文字
      const xTipIndex = Math.round((offsetX - yAxisPointX) / xAxisWidth* xAxisItemLength)
      renderText(ctx, offsetX, yAxisPointY + xyAxisTipBoxHeight / 2, seriesData[xTipIndex] || '', 'center', '#fff')

      // 设置提示框元素的样式和内容
      const { date, heightPrice, lowPrice } = data[xTipIndex]
      // 如果有子元素，说明已经插入，避免重复获取元素
      if (tipDateEl) {
        tipDateEl.innerText = date
        heightPriceEl.innerText = `最高价：${heightPrice}`
        lowPriceEl.innerText = `最低价：${lowPrice}`
        if (xTipIndex > xAxisItemLength / 2) {
          promptBoxEl.style.left = padding.left + xAxisWidth - promptBoxElWidth + 'px'
        } else {
          promptBoxEl.style.width = promptBoxElWidth + 'px'
          promptBoxEl.style.left = padding.left + 'px'
        }
      } else {
        promptBoxEl.style.display = 'block'
        tipDateEl = document.getElementById('tipDate')
        heightPriceEl = document.getElementById('heightPrice')
        lowPriceEl = document.getElementById('lowPrice')
      }
    }, false)

    // 监听鼠标离开事件并清除画布
    tipCanvas.addEventListener('mouseleave', function (e) {
      if (!isContentArea(e)) return
      console.log('清除');

      promptBoxEl.style.display = 'none'
      ctx.clearRect(0, 0, width, height)
      // 释放内存
      promptBoxEl = null
      tipDateEl = null
      heightPriceEl = null
      lowPriceEl = null
    }, false)

    // k线图内容区域
    function isContentArea (e) {
      const { offsetX, offsetY } = e

      return  offsetX > yAxisPointX &&
              offsetX < width - padding.right - xAxisWidth / xAxisItemLength &&
              offsetY > padding.top &&
              offsetY < yAxisPointY
    }

  }
}





// TODO 怎样定义内部
// 如果一个函数或者组件内部的某段逻辑出现了好几次，我们可以将它封装成函数，执行函数时不需要通过参数传入，可以利用闭包的特性在封装函数内部直接访问外部变量。