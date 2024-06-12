/**
 * LocalMap类，使用高德地图api
 * 第三方API：百度百科查询api
 */
class LocalMap {
    
    /**
     * 构造函数
     * @param {Array} markerList marker数据列表 
     */
    constructor(markerList, center) {
        // map实例
        this.mapObj = new AMap.Map('map', {
            viewMode: '2D', // 默认使用 2D 模式，如果希望使用带有俯仰角的 3D 模式，请设置 viewMode: '3D'
            center: center,
            zoom: 18.6,
            showLabel: true
        }
    );

        // 添加定位控件
        // AMap.plugin('AMap.Geolocation', () => {
        //     var geolocation = new AMap.Geolocation({
        //         enableHighAccuracy: true,//是否使用高精度定位，默认:true
        //         timeout: 10000,          //超过10秒后停止定位，默认：5s
        //         position:'RB',    //定位按钮的停靠位置
        //         offset: [10, 20], //定位按钮与设置的停靠位置的偏移量，默认：[10, 20]
        //         zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
        //     });
        //     this.mapObj.addControl(geolocation);
        //     geolocation.getCurrentPosition((status, result) => {
        //         if (status === 'complete') {
        //             console.log('定位成功');
        //         } else {
        //             console.log('定位失败');
        //         }
        //     });
        // });

        // 信息窗体
        this.infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -20) });
        this.infoWindow.on('close', this.onInfoWindowClose.bind(this));
        // Marker数组
        this.markers = [];
        for (let i = 0; i < markerList.length; i++) {
            let marker = new AMap.Marker({
                position: markerList[i].position,
                title: markerList[i].title,
                map: this.mapObj,
                offset: new AMap.Pixel(-9.5, -31),
                icon: new AMap.Icon({
                    image: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                }) 
            });
            console.log(marker._opts.title)
            
            marker.on('click', this.onMarkerClick.bind(this));
            this.markers.push(marker);
            console.log(this.markers)
        }
        this.addButton = document.getElementById('addMarkerBtn');
        document.getElementById('addMarkerBtn').addEventListener('click', this.addMarker.bind(this));
        document.getElementById('confirmButton').addEventListener('click', this.confirmAdd.bind(this));
        this.confirmButton = document.createElement('button');
        this.confirmButton.addEventListener('click', this.confirmAdd.bind(this));
        
        console.log("ok")

        // 获取弹窗和保存按钮
        this.popup = document.getElementById('popup');
        this.saveInfoBtn = document.getElementById('saveInfoBtn');
        this.Infopopup = document.getElementById('Infopopup');
        this.submitComment = document.getElementById('submitComment');
        // 保存信息按钮点击事件处理函数
        saveInfoBtn.addEventListener('click', this.saveInfo.bind(this));
        this.submitComment.addEventListener('click', this.uploadComments.bind(this))
        //获取filter按钮
        this.filter = document.getElementById("filterList");
    }
    /** 
     * close popup Function
     * @param {object} ev
     * 
    */
    hidePopup(ev) {
        if (!this.popup.contains(ev.target) && ev.target != this.confirmButton && (this.popup.style.display !== "none")) {
            this.popup.style.display = "none";
            document.getElementById('overlay').style.display = "none";
        }
        if (!this.popup.contains(ev.target) && ev.target != this.filter && (this.Infopopup.style.display !== "none")) {
            this.Infopopup.style.display = "none";
            console.log(this.Infopopup)
            document.getElementById('overlay').style.display = "none";
        }
    }

    /**
     * Update Comments
     * @param {object} ev
     */
    uploadComments(ev) {
        let commentCon = document.getElementById('commentUpload').value
        let temp = {}
        if (commentCon !== ''){
            temp = {
                "comment": commentCon,
                "pointId": this.selectedMarkerID
            }
            fetch("http://8.136.117.89:3000/submitcomment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(temp)
            })
            .then(response => {
                // 处理服务器响应
                console.log("Points saved successfully!");
            })
            .catch(error => console.error(error));
            console.log(this.selectedMarkerID)
            this.hidePopup(this)
        }
    }

    /** 
     * SaveInfo Function
     * @param {object} ev
     * 
    */
    saveInfo(ev) {
        this.markers.push(this.tempmarker)
        this.markers[this.markers.length - 1].setDraggable(false); // 禁止拖拽
        console.log(this.markers[this.markers.length - 1]._opts.title)
        console.log("yes")

        locArr.push({
            position: this.markers[this.markers.length - 1].getPosition(),
            title: this.markers[this.markers.length - 1]._opts.title,
            id: this.markers.length - 1,
            comments: []
        });

        let markerInfo = document.getElementById('markerInfo').value;
        console.log('保存信息：', markerInfo);
        locArr[locArr.length - 1].title = markerInfo;
        this.markers[this.markers.length - 1]._opts.title = markerInfo;
        // 隐藏弹窗
        document.getElementById('overlay').style.display = "none";
        popup.style.display = 'none';

        console.log(JSON.stringify([locArr[locArr.length - 1]]))
        let temp = [];
        temp.push(locArr[locArr.length - 1]);
        
        fetch("http://8.136.117.89:3000/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(temp)
        })
        .then(response => {
            // 处理服务器响应
            console.log("Points saved successfully!");
            temp = this.tempmarker.getPosition();
            initMap(temp)
        })
        .catch(error => console.error(error));
        // this.updateMarkers(locArr)
        confirmButton.style.display = 'none';
        this.addButton.style.display = 'block';

    }

    /**
     * 添加标记点的方法
     */
    addMarker() {
        this.addButton.style.display = 'none';
        console.log(this.confirmButton)
        confirmButton.style.display = 'block';
        this.tempmarker = new AMap.Marker({
            title: 'testtitle',
            position: this.mapObj.getCenter(),
            map: this.mapObj,
            offset: new AMap.Pixel(-9.5, -31),
            icon: new AMap.Icon({
                image: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png"
            }),
            draggable: true // 允许拖拽
        });
        this.tempmarker.on('click', (ev) => this.onMarkerClick(ev));
    }
    
    /**
     * Confirm
     * @param {Object} ev
     */
    confirmAdd(ev) {
        document.getElementById('overlay').addEventListener('click', this.hidePopup.bind(this));
        this.updateMarkers(locArr)
        // 显示弹窗
        popup.style.display = 'block';
        overlay.style.display = 'block';
    }


    /**
     * Marker的Click事件回调函数
     * @param {Object} ev 事件
     */
    onMarkerClick(ev) {
        let id = this.markers.indexOf(ev.target);
        this.onSelected(id);
    }

    /**
     * @param {Object} ev 事件
     */
    showInfoWindow(ev) {
        this.infoWindow.setContent(ev.target._opts.title);
        this.infoWindow.open(this.mapObj, ev.target.getPosition());        
    }

    /**
     * 根据选中地点项的id值设置Marker动画
     * @param {Object} ev 事件
     * @param {number} id 地点数组项的id值
     */
    onSelected(id, ev) {
        this.selectedMarkerID = id

        this.infoWindow.setContent(locArr[id].title);
        this.infoWindow.open(this.mapObj, locArr[id].position); 
        
        document.getElementById('overlay').removeEventListener('click', this.hidePopup.bind(this));
        this.mapObj.setCenter(this.markers[id].getPosition(), false, );
        
        // 获取 "Infopopup" 元素
        const infopopup = document.getElementById('Infopopup');
        const descriptionDiv = document.getElementById('description');

        // 修改名字和描述
        infopopup.querySelector('h2:nth-child(1)').textContent = locArr[id].title;
        fetch(`http://8.136.117.89:3000/fetchcomments?pointId=${id}`)
        .then(response => response.json())
        .then(data => {
            locArr[id].comments = data;
        })
        .then(data => {
            console.log(locArr[id].comments)
            displayComments()
        })
        .catch(error => console.error('Error:', error));        

        function displayComments(){
            const commentList = document.getElementById('commentList');
            commentList.innerHTML = ''; // 清空现有评论
            locArr[id].comments.forEach(comment => {
                const li = document.createElement('li');
                li.textContent = comment;
                commentList.appendChild(li);
                console.log(comment)
            });
        }
        // document.addEventListener('DOMContentLoaded', displayComments);
        
        document.getElementById("guideButtonByGaoDe").addEventListener("click", function() {
            window.location.href = `https://uri.amap.com/marker?position=${locArr[id].position[0]},${locArr[id].position[1]}&name=${locArr[id].title}&src=NYUSHmap&coordinate=gaode&callnative=1`;
        });
        // document.getElementById("guideButtonByApple").addEventListener("click", function() {
        //     window.location.href = `http://maps.apple.com/?daddr=${locArr[id].position[0]},${locArr[id].position[1]}`;
        // });
        Infopopup.style.display = 'block';
        overlay.style.display = 'block';
        document.getElementById('overlay').addEventListener('click', this.hidePopup.bind(this));
    }

    /**
     * 信息窗体关闭时的回调函数
     */
    onInfoWindowClose() {
    }

    /**
     * 根据地点列表的变化更新地图的Marker
     * @param {Array} newList 过滤后的地点列表
     */
    updateMarkers(newList) {
        this.markers.map((item, index) => {
            let res = newList.every((loc) => (loc.id !== index));
            if (res) {
                item.hide();
            } else {
                item.show();
            }
        });
    }
}
