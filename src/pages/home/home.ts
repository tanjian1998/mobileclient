import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the HomePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var AMap;
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild('map_container') map_container: ElementRef;
  map: any;//地图对象
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  ionViewDidEnter() {
    this.map = new AMap.Map(this.map_container.nativeElement, {
      view: new AMap.View2D({//创建地图二维视口
        zoom: 10, //设置地图缩放级别
        rotateEnable: true,
        center: [116.397428, 39.90923],//地图中心点
        showBuildingBlock: true
      })
    });
    this.getGeolocation();
    this.setMarkers();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }
  getGeolocation() {//定位当前位置
    this.map.plugin('AMap.Geolocation', () => {
      let geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,//是否使用高精度定位，默认:true
        timeout: 10000,          //超过10秒后停止定位，默认：无穷大
        buttonOffset: new AMap.Pixel(10, 30),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
        zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
        buttonPosition: 'LB'
      });
      this.map.addControl(geolocation);
      geolocation.getCurrentPosition();
      AMap.event.addListener(geolocation, 'complete', (data) => {
        console.log(data);
      });//返回定位信息
      AMap.event.addListener(geolocation, 'error', (data) => {
        console.log(data);
      });      //返回定位出错信息
    });
    //地图中添加地图操作ToolBar插件
    this.map.plugin(["AMap.ToolBar"], () => {
      let toolBar = new AMap.ToolBar(); //设置定位位标记为自定义标记
      this.map.addControl(toolBar);
    });
  }
  setMarkers(data?) {//设置人员点标记
    let markers = [{
      icon: 'assets/img/map/personicon.png',
      position: [113.895196, 21.563245]
    }, {
      icon: 'assets/img/map/personicon.png',
      position: [113.895296, 22.563845]
    }, {
      icon: 'assets/img/map/personicon.png',
      position: [113.895396, 23.563145]
    }];
    let infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
    // 添加一些分布不均的点到地图上,地图上添加三个点标记，作为参照
    markers.forEach( (marker)=> {
     let mark= new AMap.Marker({
        map: this.map,
        icon: new AMap.Icon({            
            size: new AMap.Size(30, 50),  //图标大小
            image: marker.icon,
            imageOffset: new AMap.Pixel(0, 0)
        }) ,
        position: [marker.position[0], marker.position[1]],
        offset: new AMap.Pixel(-12, -36)
      });
        mark.content = '我是第' +'个Marker';
        mark.on('click', (e)=>{
            infoWindow.setContent(mark.content);
            infoWindow.open(this.map, mark.getPosition());
        });
        mark.emit('click', {target: marker});
    });
  }
  goPeslist(){
   this.navCtrl.push('PeslistPage');
  }
}
