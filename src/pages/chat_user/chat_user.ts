﻿import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, TextInput, Events, LoadingController, ViewController } from 'ionic-angular';
import { ChatService, ChatMessage } from "../../providers/chat-service";
import { Storage } from '@ionic/storage';
import { Utils } from "../../providers/Utils";
import { NativeService } from "../../providers/NativeService";
import { HttpService } from "../../providers/http.service";
/**
 * Generated class for the ChatPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-chat_user',
    templateUrl: 'chat_user.html',
})
export class ChatUserPage {
    @ViewChild(Content) content: Content;
    @ViewChild('chat_input') messageInput: TextInput;
    msgList: ChatMessage[] = [];
    userId: string;
    userName: string;
    userImgUrl: string;
    toUserId: string;
    toUserName: string;
    toUserImg: string;
    editorMsg: string = '';
    pageindex = 1;
    pagenum = 10;
    showindex = 0;
    isdiyopen: boolean = false;
    isvoice: boolean = false;
    showft = true;
    voicestate: number = 0;
    isqun = false;
    sendUserList = [];
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public chatService: ChatService,
        public storage: Storage,
        public events: Events,
        private loadingCtrl: LoadingController,
        public native: NativeService,
        public httpser: HttpService,
        public viewCtrl: ViewController,
        public ref: ChangeDetectorRef) {
        if (navParams.get("qunfa")) {
            this.isqun = true;
            this.sendUserList = navParams.get("senduser");
            this.toUserName = "群发消息（" + this.sendUserList.length + "人）";
        }
        if (!this.isqun) {
            this.toUserId = navParams.data._id;
            this.toUserName = navParams.data.name;
            this.toUserImg = "assets/img/test_logo.png";
            this.chatService.getUserInfo()
                .then((res) => {
                    this.userId = res.userId;
                    this.userName = res.userName;
                    this.userImgUrl = res.userImgUrl;
                });
        }
    }
    dismiss() {
        this.viewCtrl.dismiss();
    }
    ionViewDidLoad() {

    }
    ionViewWillLeave() {
        if (!this.isqun) {
            this.showft = false;
            //离开页面 标记所有消息已读 暂时不考虑几万条消息之类的性能问题 后续优化
            for (var i = 0; i < this.msgList.length; i++) {
                this.msgList[i].isread = 0;
            }
            this.chatService.saveMsgList(this.userId, this.toUserId, this.msgList);
            //清除标记
            this.events.publish('chatlist:del', this.toUserId);
            // unsubscribe
            this.events.unsubscribe('chat:received');
        }
    }
    toriqi(time) {
        return Utils.dateFormatTime(time, 'YYYY/MM/DD HH:mm:ss');
    }
    ionViewDidEnter() {
        if (!this.isqun) {
            // 获取缓存消息
            this.getMsg()
                .then(() => {
                    this.scrollToBottom()
                });
            // 接受推送消息
            this.events.subscribe('chat:received', (msg) => {
                this.pushNewMsg(msg);
            });
        }
    }

    _focus() {
        this.content.resize();
        this.scrollToBottom()
    }
    media_chat: any = null;
    oldtime: number;
    oldurl: string;
    showtip(index) {
        if (index == 1) {
            this.oldtime = Date.now();
            console.log(this.oldtime)
            var src = this.oldtime.toString() + ".wav";
            this.oldurl = src;
            this.media_chat = this.chatService.media.create(src);
            this.media_chat.startRecord();
            this.voicestate = 1;
        } else {
            this.voicestate = 0;
            if (this.media_chat) {
                this.media_chat.stopRecord();
                if (Date.now() >= this.oldtime + 1000) {
                    //转64base 上传
                    this.native.tobase64(this.oldurl, "").then(database64 => {
                        this.httpser.fileupload({ file64: database64, type: 1 }).then((name) => {
                            if (name) {
                                if (this.isqun) {
                                    this.qunfamsg(1, name);
                                } else {
                                    this.sendMsg(1, name);
                                }
                            }
                        })
                    }).catch(err => {
                        console.log(err)
                    })
                } else {
                    this.native.showToast("说话时间太短");
                }
                //上传并发布
            }
        }
    }
    loading = null;
    //发送小视频
    openvoide() {
        this.chatService.media_c.captureVideo({ duration: 30, quality: 3 }).then((file) => {
            let filevideo = file[0];
            var path = "file://" + filevideo.fullPath.substring(7, filevideo.fullPath.lastIndexOf("/"));
            this.loading = this.loadingCtrl.create({
                content: ""
            })
            this.loading.present();
            this.native.tobase64(filevideo.name, path).then(database64 => {
                this.httpser.fileupload({ file64: database64, type: 2, hideloading: true }).then((name) => {
                    this.loading.dismiss();
                    if (name) {
                        if (this.isqun) {
                            this.qunfamsg(3, name);
                        } else {
                            this.sendMsg(3, name);
                        }
                    }
                })
            }).catch(err => {
                console.log(err)
            })
        });
    }
    changvoice() {
        if (!this.isvoice && this.isdiyopen) {
            this.showpanl();
        }
        this.isvoice = !this.isvoice;
    }
    showpanl() {
        this.isdiyopen = !this.isdiyopen;
        if (!this.isdiyopen) {
            this.messageInput.setFocus();
        }
        this.content.resize();
        this.scrollToBottom();
    }

    /**
    * @name getMsg
    * @returns {Promise<ChatMessage[]>}
    */
    getMsg() {
        //获取缓存消息
        return this.chatService
            .getMsgList(this.userId, this.toUserId)
            .then(res => {
                if (!res) {
                    res = [];
                }
                this.msgList = res;
                this.changeindex();
            })
            .catch(err => {
                console.log(err)
            })
    }
    //拍摄
    paishe() {
        this.native.getPictureByCamera().then((imageBase64) => {
            //拍摄成功 ， 上传图片
            this.httpser.fileupload({ file64: imageBase64, type: 0 }).then((name) => {
                if (name) {
                    if (this.isqun) {
                        this.qunfamsg(2, name);
                    } else {
                        this.sendMsg(2, name);
                    }
                }
            })
        });
    }
    //相片
    xiangpian() {
        this.native.getPictureByPhotoLibrary().then((imageBase64) => {
            // 上传图片
            this.httpser.fileupload({ file64: imageBase64, type: 0 }).then((name) => {
                if (name) {
                    if (this.isqun) {
                        this.qunfamsg(2, name);
                    } else {
                        this.sendMsg(2, name);
                    }
                }
            })
        });
    }
    //播放语音
    playaudio(url) {
        this.chatService.playvoice(this.native.appServer.file + url);
    }
    //更新显示索引
    changeindex() {
        this.showindex = this.msgList.length - this.pageindex * this.pagenum > 0 ? this.msgList.length - this.pageindex * this.pagenum : 0;
    }
    doRefresh(refresher) {
        window.setTimeout(() => {
            this.pageindex++;
            this.changeindex();
            refresher.complete();
        }, 500);
    }
    txtSend() {
        if (!this.editorMsg.trim()) return;
        if (this.isqun) {
            this.qunfamsg(0, this.editorMsg.trim());
        } else {
            this.sendMsg(0, this.editorMsg.trim());
        }
        if (!this.isdiyopen) {
            this.messageInput.setFocus();
        }
    }
    savequnmsg(UserList,msgtype, message, text) {
        var senduser = UserList[0];
        const id = Date.now().toString();
        let newMsg: ChatMessage = {
            messageId: id,
            msgtype: msgtype,
            userId: this.native.UserSession._id,
            toUserId: senduser._id,
            time: Date.now(),
            message: message,
            status: 'success',
            isread: 0
        };
        var msgList_Cache = [];
        this.chatService.getMsgList(this.native.UserSession._id, senduser._id)
            .then(res => {
                if (!res) {
                    res = [];
                }
                msgList_Cache = res;
                msgList_Cache.push(newMsg);
                this.chatService.add_logmessage({
                    _id: senduser._id,
                    name: senduser.name,
                    message: text,
                    count: 0
                });
                this.chatService.saveMsgList(this.native.UserSession._id, senduser._id, msgList_Cache);
                UserList.splice(0, 1);
                if (UserList.length > 0) {
                    this.savequnmsg(UserList,msgtype, message, text);
                }
            });
    }
    //群发
    qunfamsg(msgtype, message) {
        var receiverInfo = [];
        var messageObj = {
            text: "",
            video: "",
            voice: "",
            image: ""
        };
        var text = message;
        switch (msgtype) {
            case 0:
                messageObj.text = message;
                break;
            case 1:
                messageObj.voice = message;
                text = "语音";
                break;
            case 2:
                messageObj.image = message;
                text = "图片";
                break;
            case 3:
                messageObj.video = message;
                text = "视频";
                break;
        }
        for (var i = 0; i < this.sendUserList.length; i++) {
            receiverInfo.push(this.sendUserList[i]._id);
        }
        this.chatService.qunsendMsg(receiverInfo, messageObj);
        this.savequnmsg(this.sendUserList.concat(), msgtype, message, text);
        this.events.publish('chatlist:sx', text);
        this.native.showToast("发送成功");
        this.editorMsg = '';
    }
    /**
    * @name sendMsg
    */
    sendMsg(msgtype, message) {
        // Mock message
        const id = Date.now().toString();
        let newMsg: ChatMessage = {
            messageId: id,
            msgtype: msgtype,
            userId: this.userId,
            toUserId: this.toUserId,
            time: Date.now(),
            message: message,
            status: 'pending',
            isread: 0
        };
        this.pushNewMsg(newMsg);
        this.editorMsg = '';
        this.chatService.sendMsg(newMsg, this.toUserName)
            .then(() => {
                let index = this.getMsgIndexById(id);
                if (index !== -1) {
                    this.msgList[index].status = 'success';
                    this.chatService.saveMsgList(this.userId, this.toUserId, this.msgList);
                }
            })
    }

    /**
     * @name pushNewMsg
     * @param msg
     */
    pushNewMsg(msg: ChatMessage) {
        // 判断是否为当前窗口用户 否则不让处理
        if ((msg.userId === this.userId && msg.toUserId === this.toUserId) || (msg.toUserId === this.userId && msg.userId === this.toUserId)) {
            this.msgList.push(msg);
        }
        this.scrollToBottom();
    }

    getMsgIndexById(id: string) {
        return this.msgList.findIndex(e => e.messageId === id)
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.content.scrollToBottom) {
                this.content.scrollToBottom();
            }
        }, 400)
    }
}
