import { Component, ViewChild } from '@angular/core';
import Chart from 'chart.js';
import { NavController, IonicPage, NavParams } from 'ionic-angular';
import { NativeService } from "../../../../providers/NativeService";
import { Utils } from "../../../../providers/Utils";
import { HttpService } from "../../../../providers/http.service";
@IonicPage()
@Component({
  selector: 'page-charts',
  templateUrl: 'charts.html'
})
export class ChartsPage {
  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild('pieCanvas1') pieCanvas1;
  @ViewChild('pieCanvas2') pieCanvas2;
  @ViewChild('pieCanvas3') pieCanvas3;
  @ViewChild('pieCanvas4') pieCanvas4;
  @ViewChild('barCanvas6') barCanvas6;
  @ViewChild('pieCanvas6') pieCanvas6;
  @ViewChild('barCanvas7') barCanvas7;
  @ViewChild('pieCanvas7') pieCanvas7;
  lineChart: any;
  resultData: any;
  parmObj: any;
  pageTitle: any;
  tongjiname: any;
  constructor(public navParams: NavParams, public navCtrl: NavController, private native: NativeService, private httpService: HttpService) {
    this.resultData = navParams.get('resultData');
    this.parmObj = navParams.get('parmObj');
    console.log(this.resultData,this.parmObj)
  }
  ionViewDidLoad() {
    if (this.resultData) {
      if (this.parmObj.getRadioType == 1) {
        this.lineChart = this.getMsgChart(this.resultData);
        this.pageTitle = '消息统计';
        this.tongjiname = '消息统计';
      } else if (this.parmObj.getRadioType == 2) {
        this.lineChart = this.getMsgChart(this.resultData);
        this.pageTitle = '案件统计';
        this.tongjiname = '案件统计';
      } else if (this.parmObj.getRadioType == 3) {
        this.pageTitle = '人员统计（部门）';
        this.getPieChart(this.resultData);
      } else if (this.parmObj.getRadioType == 4) {
        this.pageTitle = '考勤统计';
        this.tongjiname = '考勤统计';
        this.lineChart = this.getMsgChart(this.resultData);
      } else if (this.parmObj.getRadioType == 6) {
        this.pageTitle = '区域人员统计';
        this.tongjiname = '区域人员统计';
        this.getbarChart6();
      }else if (this.parmObj.getRadioType == 8) {
        this.pageTitle = '区域设施统计';
        this.tongjiname = '区域设施统计';
        this.getbarChart8();
      }
      else if (this.parmObj.getRadioType == 7) {
        this.pageTitle = '考勤统计（部门）';
        this.tongjiname = '考勤统计（部门）';
        this.getMsgChart(this.resultData);
      }
      else if (this.parmObj.getRadioType == 5) {
        this.pageTitle = '案件统计（部门）';
        this.tongjiname = '人员设施统计';
        this.getbarChart5(this.resultData);
      }
    }
  }
  //案件统计（部门）统计
  getbarChart5(list) {
    //获取案件类型
    var _label = [];
    var _data = [];
    this.parmObj.typelist.forEach(item => {
      if (item.status == 0) {
        _data.push({ id: item._id, num: 0, name: item.name })
      }
    });
    var _jx2 = 0;
    var _jx3 = 0;
    var _jx4 = 0;
    list.forEach(item => {
      if (item.is_unaudited > 0) {
        _jx3++;
      } else if (item.is_unfilled > 0) {
        _jx2++;
      }
      if (item.is_unaudited == 0 && item.is_unfilled == 0) {
        _jx4++;
      }
    });
    var _num = [];
    var _color = [];
    _data.forEach(a => {
      list.forEach(item => {
        if (a.id == item.type_id) {
          a.num++;
        }
      });
      _num.push(a.num);
      _color.push(this.getColor());
      _label.push(a.name + "(" + a.num + ")");
    });
    let data1 = {
      labels: _label,
      datasets: [
        {
          data: _num,
          backgroundColor: _color,
          hoverBackgroundColor: _color
        }]
    };
    let data2 = {
      labels: ["待填写(" + _jx2 + ")", "待审核(" + _jx3 + ")", "已完成(" + _jx4 + ")"],
      datasets: [
        {
          data: [_jx2, _jx3, _jx4],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#25ba93"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#25ba93"]
        }]
    };
    this.getChart(this.pieCanvas1.nativeElement, "pie", data2);
    this.getChart(this.pieCanvas2.nativeElement, "pie", data1);
  }
  //统计
  getMsgChart(list) {
    var _text = 0;
    var _img = 0;
    var _video = 0;
    var _audio = 0;
    list.forEach(item => {
      if (this.parmObj.getRadioType == 1) {
        _text += item.imText;
        _img += item.imImg;
        _video += item.imVideo;
        _audio += item.imAudio;
      } else if (this.parmObj.getRadioType == 2) {
        _text += item.eventNew;
        _img += item.eventSave;
        _video += item.eventUp;
        _audio += item.eventVerify;
      } else if (this.parmObj.getRadioType == 4 || this.parmObj.getRadioType == 7) {
        _text += item.workLate;
        _img += item.workLeave;
        _video += item.wrokAbsence;
        _audio += item.workSuccess;
      }

    });
    let data1 = {
      labels: ["文本(" + _text + ")", "图片(" + _img + ")", "视频(" + _video + ")", "语音(" + _audio + ")"],
      datasets: [
        {
          data: [_text, _img, _video, _audio],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#25ba93"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#25ba93"]
        }]
    };
    if (this.parmObj.getRadioType == 2) {
      data1.labels = ["上报案件(" + _text + ")", "保存案件(" + _img + ")", "提交审核(" + _video + ")", "审核案件(" + _audio + ")"];
    } else if (this.parmObj.getRadioType == 4 || this.parmObj.getRadioType == 7) {
      data1.labels = ["迟到次数(" + _text + ")", "早退次数(" + _img + ")", "缺勤次数(" + _video + ")", "正常次数(" + _audio + ")"];
    }
    this.getChart(this.lineCanvas.nativeElement, "pie", data1);
  }
  updateData() {
    // After instantiating your chart, its data is accessible and can be changed anytime with the function update().
    // // It takes care of everything and even redraws the animations :D
    // this.pieChart.data.datasets[0].data = [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000];
    // this.pieChart.update();
  }
  getChart(context, chartType, data, options?) {
    return new Chart(context, {
      type: chartType,
      data: data,
      options: options
    });
  }
  getColor() {
    return '#' + Math.floor(Math.random() * 0xffffff).toString(16);
  }
  getLineChart() {
    var data = {
      labels: [],
      datasets: []
    };
    let Parent = (label) => {
      let color1 = this.getColor();
      let color2 = this.getColor();
      let color3 = this.getColor();
      let data = {
        fill: false,
        lineTension: 0.1,
        backgroundColor: color3,
        borderWidth: 1,
        borderColor: color1,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: color1,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color1,
        pointHoverBorderColor: color2,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        label: label,
        data: [],
        spanGaps: false,
      }
      return data;
    }
    let broadcastTypeCount = Parent('广播'),
      mesaageTypeCount = Parent('工作'),
      shiftTypeCount = Parent('换班'),
      takeoffApprove = Parent('放假'),
      takeoffTypeCount = Parent('请假'),
      textCount = Parent('文本'),
      videoCount = Parent('视频'),
      voiceCount = Parent('音频'),
      imageCount = Parent('图片');
    this.resultData.forEach((obj) => {
      let x;
      if (this.parmObj.timespan == 'day') {
        x = Utils.dateFormat(new Date(obj._id), 'MM/dd');
      } else if (this.parmObj.timespan == 'week') {
        x = obj._id + '周';
      } else if (this.parmObj.timespan == 'month') {
        x = obj._id + '月';
      }

      data.labels.push(x);
      broadcastTypeCount.data.push(obj.broadcastTypeCount);
      mesaageTypeCount.data.push(obj.mesaageTypeCount);
      shiftTypeCount.data.push(obj.shiftTypeCount);
      takeoffApprove.data.push(obj.takeoffApprove);
      takeoffTypeCount.data.push(obj.takeoffTypeCount);
      textCount.data.push(obj.textCount);
      videoCount.data.push(obj.videoCount);
      imageCount.data.push(obj.imageCount);
      voiceCount.data.push(obj.voiceCount);
    });
    data.datasets.push(broadcastTypeCount);
    data.datasets.push(mesaageTypeCount);
    data.datasets.push(shiftTypeCount);
    data.datasets.push(takeoffApprove);
    data.datasets.push(takeoffTypeCount);
    data.datasets.push(textCount);
    data.datasets.push(videoCount);
    data.datasets.push(imageCount);
    data.datasets.push(voiceCount);
    return this.getChart(this.lineCanvas.nativeElement, "line", data);
  }
  getLineChart2() {
    var data = {
      labels: [],
      datasets: []
    };
    let Parent = (label) => {
      let color1 = this.getColor();
      let color2 = this.getColor();
      let color3 = this.getColor();
      let data = {
        fill: false,
        lineTension: 0.1,
        backgroundColor: color3,
        borderWidth: 1,
        borderColor: color1,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: color1,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color1,
        pointHoverBorderColor: color2,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        label: label,
        data: [],
        spanGaps: false,
      }
      return data;
    }
    let mileageCount = Parent('里程(km)'),
      speedCount = Parent('速度(km/h)');
    this.resultData.forEach((obj) => {
      let x;
      if (this.parmObj.timetype == 'day') {
        x = Utils.dateFormat(new Date(obj._id), 'MM/dd');
      } else if (this.parmObj.timetype == 'week') {
        x = obj._id + '周';
      } else if (this.parmObj.timetype == 'month') {
        x = obj._id + '月';
      }
      data.labels.push(x);
      let lcs = obj.pathlength / 1000;
      mileageCount.data.push(lcs);
      speedCount.data.push(obj.averageSpeed);
    });
    data.datasets.push(mileageCount);
    data.datasets.push(speedCount);
    return this.getChart(this.lineCanvas.nativeElement, "line", data);
  }
  getPieChart(res) {//饼图
    console.log(res)
    let data1 = {
      labels: ["男", "女", "未录入"],
      datasets: [
        {
          data: [res.malecount, res.femalecount, res.unknownSexCount],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
        }]
    };
    let data2 = {
      labels: ["18~35岁", "35~50岁", "50~60岁"],
      datasets: [
        {
          data: [res.youngcount, res.middlecount, res.oldcount],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
        }]
    };
    let data3 = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: []
        }]
    };
    console.log(data1)
    this.getChart(this.pieCanvas1.nativeElement, "pie", data1);
    this.getChart(this.pieCanvas2.nativeElement, "pie", data2);

    for (let idx in res.roles) {
      data3.labels.push(res.roles[idx].role_name);
      data3.datasets[0].data.push(res.roles[idx].num);
      let colors = this.getColor();
      data3.datasets[0].backgroundColor.push(colors);
      data3.datasets[0].hoverBackgroundColor.push(colors);
    }
    this.getChart(this.pieCanvas3.nativeElement, "pie", data3);
    //  昨日部门人员考勤统计
    let data4 = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: []
        }]
    };
    const requestInfo = {
      url: 'department/month_dance',
      start_time: 0,
      department_id: this.native.UserSession._id,
      end_time: 0
    }
    //获取昨日起始时间戳
    // const date = new Date()
    // date.setDate(date.getDate() - 1)
    // date.setHours(0)
    // date.setMinutes(0)
    // requestInfo.start_time = Math.floor(date.getTime() / 1000)
    // date.setHours(23)
    // date.setMinutes(59)
    // requestInfo.end_time = Math.floor(date.getTime() / 1000)
    // this.httpService.post(requestInfo.url, requestInfo).subscribe(data => {
    //   let res = data.json();
    //   const arr = {}
    //   if (res.code !== 200) {
    //     this.native.showToast(res.info);
    //   } else {
    //     if (res.info.leave) { // 循环请假对象
    //       res.info.leave.forEach(element => {
    //         if (element.approval_state === 1) {
    //           if (arr['请假']) {
    //             arr['请假'] += 1
    //           } else {
    //             arr['请假'] = 1
    //           }
    //         }
    //       })
    //     }
    //     const typeArr = ['无记录', '正常', '迟到', '早退', '缺勤', '调派']
    //     if (res.info.work) {
    //       res.info.work.forEach(element => {
    //         const text = typeArr[element.work_state]
    //         const idx = new Date(element.r_start_time * 1000).getDate() || 0
    //         if (arr[text]) {
    //           arr[text] += 1
    //         } else {
    //           arr[text] = 1
    //         }
    //       })
    //     }
    //     for (const key in arr) {
    //       data4.labels.push(key);
    //       data4.datasets[0].data.push(arr[key]);
    //       let colors = this.getColor();
    //       data4.datasets[0].backgroundColor.push(colors);
    //       data4.datasets[0].hoverBackgroundColor.push(colors);
    //     }
    //     //this.getChart(this.pieCanvas4.nativeElement, "pie", data4);
    //   }
    // }, err => { this.native.showToast('获取考勤统计信息失败'); });
  }
  getbarChart6(res?) {
    var randomScalingFactor = function () { return Math.floor(Math.random() * 150); }
    console.log(this.resultData)
    let data1 = {
      labels: this.resultData.biao1.class,
      datasets: [{
        label: this.resultData.biao1.aa[0],
        backgroundColor: this.getColor(),
        data: this.resultData.biao1.a1
      }, {
        label: this.resultData.biao1.aa[1],
        backgroundColor: this.getColor(),
        data: this.resultData.biao1.a2
      }, {
        label: this.resultData.biao1.aa[2],
        backgroundColor: this.getColor(),
        data: this.resultData.biao1.a3
      }, {
        label: this.resultData.biao1.aa[3],
        backgroundColor: this.getColor(),
        data: this.resultData.biao1.a4
      }]
    }
    this.getChart(this.barCanvas6.nativeElement, "bar", data1, {
      tooltips: {
        mode: 'index',
        intersect: false
      },
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    });
    this.httpService.post('statistics/mongoarea').subscribe(data => {
      console.log('获取所在区域的统计')
      var res = data.json();
      if (res.code == 200) {
        var datavalue2 = { name: [], data: [], color: [] };
        res.info.list[1].forEach(element => {
          datavalue2.name.push(element.name)
          datavalue2.data.push(element.lenth)
          datavalue2.color.push(this.getColor())
        });
        var xldata = function (xl) {
          var arr = [];
          xl.forEach(element => {
            arr.push(element.lenth)
          });
          return arr;
        }
        //饼图
        let data2 = {
          labels: datavalue2.name,
          datasets: [
            {
              data: datavalue2.data,
              backgroundColor: datavalue2.color,
              hoverBackgroundColor: datavalue2.color
            }]
        };
        this.getChart(this.pieCanvas6.nativeElement, "pie", data2);
      }
    })
  }
  getbarChart8(res?) {
    var randomScalingFactor = function () { return Math.floor(Math.random() * 150); }
    console.log(this.resultData)
    let data2 = {
      labels: this.resultData.biao2.class,
      datasets: [{
        label: this.resultData.biao2.aa[0],
        backgroundColor: this.getColor(),
        data: this.resultData.biao2.a1
      }, {
        label: this.resultData.biao2.aa[1],
        backgroundColor: this.getColor(),
        data: this.resultData.biao2.a2
      }, {
        label: this.resultData.biao2.aa[2],
        backgroundColor: this.getColor(),
        data: this.resultData.biao2.a3
      }, {
        label: this.resultData.biao2.aa[3],
        backgroundColor: this.getColor(),
        data: this.resultData.biao2.a4
      }]
    }
    this.getChart(this.barCanvas7.nativeElement, "bar", data2, {
      tooltips: {
        mode: 'index',
        intersect: false
      },
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    });
    this.httpService.post('statistics/mongoarea').subscribe(data => {
      console.log('获取所在区域的统计')
      var res = data.json();
      if (res.code == 200) {
        var datavalue1 = { name: [], data: [], color: [] };
        res.info.list[0].forEach(element => {
          datavalue1.name.push(element.name)
          datavalue1.data.push(element.lenth)
          datavalue1.color.push(this.getColor())
        });
        var xldata = function (xl) {
          var arr = [];
          xl.forEach(element => {
            arr.push(element.lenth)
          });
          return arr;
        }
         //饼图
        let data1 = {
          labels: datavalue1.name,
          datasets: [{
              data: datavalue1.data,
              backgroundColor: datavalue1.color,
              hoverBackgroundColor: datavalue1.color
            }]
        };
        this.getChart(this.pieCanvas7.nativeElement, "pie", data1);

      }
    })
  }
}


