﻿import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { HttpService } from "../../providers/http.service";
import { NativeService } from "../../providers/NativeService";
import { ChatService } from "../../providers/chat-service";
/**
 * Generated class for the ChatPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-chat',
    templateUrl: 'chat.html',
})
export class ChatPage {
    ChatUserPage: any = 'ChatUserPage';
    public deptlist = new Array();
    public noreadmsglist = [];
    constructor(public navCtrl: NavController, public navParams: NavParams, private httpService: HttpService, public native: NativeService, public chatser: ChatService, public events: Events) {
        //获取当前登录用户的部门结构人员
        this.native.showLoading();
        try {
            if (this.native.UserSession.departments && this.native.UserSession.departments.length > 0) {
                this.loaduser(this.native.UserSession.departments);
            }
        } catch (e) {
            this.native.hideLoading();
            this.deptlist = [];
            alert("加载出错:" + e);
        }

    }
    loaduser(dept) {

        let requestInfo = {
            url: "department/getAllpersonsByDepartIdOneStep",
            _id: dept[0].department,
            hideloading: true
        }
        this.httpService.post(requestInfo.url, requestInfo).subscribe(
            data => {
                this.deptlist.push(data.json());
                dept.splice(0, 1);
                if (dept.length > 0) {
                    this.loaduser(dept);
                } else {
                    this.updatelsmsg(false);
                    this.native.hideLoading();
                }
            },
            err => console.error(err)
        );
    }
    //获取历史消息对象
    getnoreadnum(user, one) {
        var m = {
            count: 0,
            text: ''
        };
        user.msg = m;
        if (!one) {
            this.chatser.getMsgList(this.native.UserSession._id, user.person._id).then(res => {
                if (!res) {
                    res = [];
                }
                var msgList = res;
                var mx = {
                    count: 0,
                    text: ''
                };
                if (msgList.length > 0) {
                    var msgmodel = msgList[msgList.length - 1];
                    switch (msgmodel.msgtype) {
                        case 0:
                            mx.text = msgmodel.message;
                            break;
                        case 1:
                            mx.text = "语音";
                            break;
                        case 2:
                            mx.text = "图片";
                            break;
                        case 3:
                            mx.text = "视频";
                            break;
                    }
                    mx.count = msgmodel.isread;
                    user.msg = mx;
                }

            });
        }

    }
    xhFun(callback) {
        for (var a = 0; a < this.deptlist.length; a++) {
            for (var b = 0; b < this.deptlist[a].persons.length; b++) {
                if (callback(this.deptlist[a].persons[b], this)) {
                    break;
                }
            }
        }
    }
    updatelsmsg(one) {
        this.xhFun(function (user, _self) {
            _self.getnoreadnum(user, one);
            return false;
        });
    }

    //未读消息处理添加 
    updateUserMsg(msg) {
        this.xhFun(function (user) {
            if (user.person._id == msg.sender) {
                if (user.msg) {
                    user.msg = {
                        count: user.msg.count + 1,
                        text: msg.text
                    }
                } else {
                    user.msg = {
                        count: 1,
                        text: msg.text
                    }
                }
                return true;
            }
            return false;
        })
    }
    //未读标记删除
    delusermsg(touserid) {
        this.xhFun(function (user, _self) {
            if (user.person._id == touserid) {
                _self.events.publish('tab:delnum', user.msg.count);
                user.msg.count = 0

                return true;
            }
            return false;
        })
    }
    ionViewDidEnter() {
        this.events.subscribe('chatlist:received', (msg) => {
            console.log(msg);
            this.updateUserMsg(msg);
        });
        this.events.subscribe('chatlist:del', (touserid) => {
            this.delusermsg(touserid);
        });
    }
    ionViewDidLoad() {
        //console.log(this.deptlist);
    }
    go(type, phone) {
        location.href = type == 0 ? "sms:" : "tel:" + phone;
    }

}
