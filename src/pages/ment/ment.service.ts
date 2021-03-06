﻿import { Injectable } from '@angular/core';
import { HttpService } from "../../providers/http.service";
import { ChatService } from "../../providers/chat-service";
import { NativeService } from "../../providers/NativeService";
@Injectable()
export class MentService {
    //当前位置  
    location = {
        text: "正在获取定位",//物理地址
        name: "正在获取定位",//简称
        loc: [0, 0]//经纬度
    };
    //当前部门id
    dept = null;
    constructor(public httpService: HttpService, public chatser: ChatService, public native: NativeService) {
        this.dept = this.native.UserSession.department;
        this.native.myStorage.get('mentPostion').then((val) => {//获取用户当前位置
            if (val) {
                this.location = val;
            }
        });
    }

    //获取所有已定义的事件类型
    getAllAbstracttype() {
        return this.httpService.post("event_type/list", {
            dept_id: this.native.UserSession.department_sub
        });
    }
    //添加事件
    addEvent(subdata) {
        return this.httpService.post("event/add", subdata);
    }
    //获取案件指定步骤
    getcasestep(id, _step_id) {
        return this.httpService.post("event/get_event_step", {
            event_id: id,
            step_id: _step_id,
            hideloading: true
        });
    }
    //获取当前步骤
    getcurrentstep(id) {
        return this.httpService.post("event/get_step", {
            event_id: id
        });
    }
    //保存参数
    sendeventargument(data) {
        return this.httpService.post("event/update_step", data);
    }
    //审核
    sendstepgo(model) {
        return this.httpService.post("event/access_step", model);
    }
    //获取事件对象
    EcevtModel(id) {
        return this.httpService.post("event/get", { _id: id });
    }
}