import { ref, reactive, set, toRefs, watch, nextTick, h } from 'vue'
import { Message, Notification } from 'element-ui'
export function updateApi(){
    let notification = null
    let InterfaceRequestParams = JSON.parse(localStorage.getItem('InterfaceRequestParams')) ?? {requestParamsList:[]}
    let currentTime = localStorage.getItem('InterfaceRequestParamsApiUpdateTime') ?? new Date('1998-05-05 08:00:00')

      function notUpdateApi() {
        InterfaceRequestParams.apiUpdateTime = config.apiUpdateTime
        localStorage.setItem('InterfaceRequestParams', JSON.stringify(InterfaceRequestParams))
        localStorage.setItem('InterfaceRequestParamsApiUpdateTime', config.apiUpdateTime)
        notification?.close()
      }
      function updateApi() {
        config.requestParamsList.forEach(data=>{
            let findIndex = InterfaceRequestParams.requestParamsList.findIndex(item=>{
              return item.requestName === data.requestName
            })
            if(findIndex!== -1) {
                InterfaceRequestParams.requestParamsList.splice(findIndex, 1, data)
            }else{
                InterfaceRequestParams.requestParamsList.unshift(data)
            }
        })
        localStorage.setItem('InterfaceRequestParams', JSON.stringify(InterfaceRequestParams))
        localStorage.setItem('InterfaceRequestParamsApiUpdateTime', config.apiUpdateTime)
        notification?.close()
        location.reload()
      }
      if(moment(config.apiUpdateTime).isAfter(moment(currentTime))&&config.requestParamsList.length) {
        notification = Notification({
            title: '当前API案例有更新内容, 是否更新',
            type: 'info',
            showClose: false,
            duration:0,
            message: h('div', [
              h(
                'el-button',
                {
                  on: {
                    click: updateApi
                  },
                  props: { type: 'success' }
                },
                '更新'
              ),
              h(
                'el-button',
                {
                  on: {
                    click: notUpdateApi
                  },
                  style:{
                    float:"right"
                  }
                },
                'X'
              ),
            ])
        });
        Notification.success({
          title: 'SU2.1.0已支持sun.monitor前端监控',
          type: 'info',
          showClose: true,
          duration:0,
          offset:100,
          message:''})
      }

      
}