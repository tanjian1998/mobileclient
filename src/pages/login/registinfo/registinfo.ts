﻿import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { NativeService } from "../../../providers/NativeService";
import { LoginService } from '../login-service';
import { HttpService } from "../../../providers/http.service";
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
/**
 * Generated class for the RegistinfoPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-registinfo',
    templateUrl: 'registinfo.html',
})
export class RegistinfoPage {
    resgistFlg = true;
    title: string = "注册信息";
    constructor(private sim: Sim, private alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public device: Device, private native: NativeService, private loginser: LoginService, private httpService: HttpService, private platform: Platform) {
        if (navParams.get('perInfo')) {//如果是注册
            this.native.UserSession == null;
            this.userInfo = Object.assign(this.userInfo, navParams.get('perInfo'));
            this.setphoneNumber();
            this.httpService.post('department/list', { hideloading: true }).subscribe(data => {
                try {
                    if (data.json().code == 200) {
                        this.departList = data.json().info;
                    }
                } catch (error) {
                    this.native.showToast('获取部门信息失败');
                }
            }, err => { this.native.showToast('获取部门信息失败'); });
        }
        if (navParams.get('type') == 'update') {//判断是否修改信息
            this.resgistFlg = false;
            this.title = "修改个人信息";
            this.native.myStorage.get('UserSession').then((val) => {//获取用户信息
                if (val) {
                    this.userInfo = val;
                    this.getjobList();

                }
            });
            for (var i = 0; i < this.userInfo.department_roles.length; i++) {
                this.departList.push({ _id: this.userInfo.department_roles[i].department_id, name: this.userInfo.department_roles[i].deptname });
            }
        }

    }
    setphoneNumber() {//设置手机号码
        this.sim.getSimInfo().then(
            (info) => {
                this.userInfo.mobile = info.phoneNumber;
                this.userStatus();
            },
            (err) => console.log('Unable to get sim info: ', err)
        );
    }
    ionViewWillEnter() {
    }
    rolename = "";
    userInfo = {
        _id: "",
        name: "",
        sex: "",
        nation: "",
        birthday: "",
        residence: "",
        idNum: "",
        mobile: "",
        pwd: "",
        mobileUUid: "",
        department_id: "",
        coverSmall: "",
        department_roles: []
    };
    departList = [];
    jobList = [];
    getjobList() {
        //职称由管理员设置 这里只显示用户职位  注册时 用户只需选中一个主部门即可
        if (!this.resgistFlg) {
            for (var i = 0; i < this.userInfo.department_roles.length; i++) {
                var dept = this.userInfo.department_roles[i];
                if (dept.department_id == this.userInfo.department_id) {
                    this.rolename = dept.rolename;
                    break;
                }
            }
        }
    }
    doresigt() {
        if (!this.userInfo.name) {
            this.native.showToast('必须填写姓名~');
            return false;
        }
        if (!this.userInfo.idNum) {
            this.native.showToast('必须填写身份证号码~');
            return false;
        }
        if (!this.userInfo.department_id) {
            this.native.showToast('必须选择单位~');
            return false;
        }
        if (!this.userInfo.mobile) {
            this.native.showToast('必须填写手机号~');
            return false;
        }
        // if (this.jobList.length && !this.userInfo.role._id) {
        //     this.native.showToast('必须选择职称~');
        //     return false;
        // }
        if (this.resgistFlg && !this.userInfo.pwd) {
            this.native.showToast('必须填写密码~');
            return false;
        }
        if (this.resgistFlg && this.userInfo.pwd.length < 6) {
            this.native.showToast('密码不能少于6位哦~');
            return false;
        }
        if (this.resgistFlg) {
            this.userInfo.mobileUUid = this.device.uuid;
            //this.userInfo.departments[0] = this.departments;
            this.loginser.registered(this.userInfo).subscribe(data => {
                this.native.alert('注册成功，请等待管理员的审核!');
            }, err => {
                this.native.showToast('平台繁忙，请稍后再试');
            });
        } else {
            this.showSetPwd();
        }
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad RegistinfoPage');
    }
    goLogin() {//重新识别
        this.navCtrl.pop();
    }
    showSetPwd(flg: boolean = true) {//审核密码
        let alert = this.alertCtrl.create({
            title: '验证',
            enableBackdropDismiss: flg,
            inputs: [
                {
                    name: 'password',
                    placeholder: '请输入该帐号密码',
                    type: 'password'
                }
            ],
            buttons: [
                {
                    text: '确定',
                    handler: data => {
                        if (data.password) {
                            this.checkPwd(data.password).then((res) => {

                                let navTransition = alert.dismiss();
                                navTransition.then(() => {
                                    this.updateInfo();
                                });
                            }, err => {
                                this.native.showToast(err);
                            });
                        } else {
                            this.native.showToast('请输入密码');
                            // invalid login
                        }
                        return false;
                    }
                }
            ]
        });
        alert.present();
    }
    checkPwd(password) {
        return new Promise((resolve, reject) => {
            this.httpService.post('people/pass', {
                _id: this.native.UserSession._id,
                pwd: password
            }).subscribe(data => {
                try {
                    let res = data.json();
                    if (res.code == 200) {
                        resolve(res.info);
                    } else {
                        reject('密码错误');
                    }
                } catch (error) {
                    reject(error);
                }
            }, err => {
                reject(err);
            });
        });
    }
    updateInfo() {//修改信息
        this.httpService.post(this.native.UserSession == null ? 'people/update_uuid' : 'people/update', this.userInfo).subscribe(data => {
            try {
                let res = data.json();
                if (res.code == 200) {
                    this.genInfo();
                    if (this.navParams.get('type') == 'update') {
                        this.native.showToast('信息修改成功~');
                    } else {//注册修改信息跳到tab页
                        this.navCtrl.pop();
                    }
                } else {
                    this.native.showToast(res.error);
                }
            } catch (error) {
                this.native.showToast(error);
            }
        }, err => {
            this.native.showToast(err);
        });
    }
    genInfo() {//更新用户信息
        let myuuid = this.device.uuid;
        if (!myuuid) {
            myuuid = 'c7f89e97f9194631';
        }
        this.loginser.getUserByUUid(myuuid).subscribe(data => {
            this.native.UserSession = data;
            this.native.myStorage.set('UserSession', data);
        }, err => {
        });
    }
    telPhone() {
        this.native.confirm('您的帐号信息正在审核中，是否联系管理员?', () => {
            location.href = "tel:23123213";
            this.telPhone();
        }, () => {
            this.platform.exitApp();
            return false;

        }, '提示', '退出', '拨打');
    }
    userStatus() {//判断
        let requert = {
            url: 'people/check',
            mobile: this.userInfo.mobile
        }
        this.httpService.post(requert.url, requert).subscribe(data => {
            try {
                let res = data.json();
                this.resgistFlg = false;
                if (res.code === 403) {//新注册
                    this.resgistFlg = true;
                } else if (res.success === 200) {
                    var user = res.info;
                    if (user.status == 2) {
                        this.telPhone();
                    } else if (user.status == 1) {
                        this.native.alert('该用户已离职');
                    } else {
                        this.userInfo = Object.assign(this.userInfo, user);
                        let myuuid = this.device.uuid;
                        if (!myuuid) {
                            myuuid = '6f24df8da22b4c35';
                        }
                        this.userInfo.mobileUUid = myuuid;
                        this.native.alert("帐号已存在，请验证密码重新绑定本手机", () => {
                            this.showSetPwd(false);
                        });
                    }
                }
            } catch (error) {
                this.native.showToast(error);
            }
        }, err => {
            this.native.showToast(err);
        });
    }
}
