/**
 * 地图地点数组
 */
var locArr = [{
        position: [121.478475,31.168554],
        title: 'JingYao',
        id: 0
    },{
        position: [121.477068,31.168082],
        title: 'Burger King',
        id: 1
    }

];

/**
 * 地图对象，全局变量
 */
let mapObj;
/**
 * 地图加载函数
 */
function initMap(center) {
    // console.log(locArr)
    cent = center || [121.478475,31.168554];
    fetch('http://8.136.117.89:3000/points')
    .then(response => response.json())
    .then(data => {
        console.log('Points:', data);
        locArr = [];
        for (let i = 0; i < data.length; i++) {
            let point = {
                position: data[i].position,
                title: data[i].title,
                id: data[i].id,
                comments: data[i].comments
                }
            // console.log(point)
            locArr.push(point)
        };
        // console.log(locArr)
        mapObj = new LocalMap(locArr, cent);
    })
    .catch(error => console.error('Error:', error));
}

/**
 * ViewModel
 * 
 * @class ViewModel
 */
class ViewModel {
    /**
     * 构造函数
     */
    constructor() {
        // 是否展示地点列表
        this.isShowLocList = ko.observable(false);
        // 输入的筛选文字
        this.filterString = ko.observable('');
        // 地点数组
        this.locList = ko.observableArray(locArr);
    }

    /**
     * 展开/回收地点列表
     */
    toggleLocList() {
        this.locList(locArr)
        mapObj.updateMarkers(locArr);
        this.isShowLocList(!this.isShowLocList());
    }

    /**
     * 过滤地点列表函数
     * @param {Object} vm 数据模型viewmodel
     * @param {Object} ev 事件 
     */
    onFilter(vm, ev) {
        ev.preventDefault();
        let queryString = this.filterString();
        let filterList = locArr.filter((item) => (item.title.indexOf(queryString) !== -1));
        this.locList(filterList);
        mapObj.infoWindow.close();
        mapObj.updateMarkers(filterList);
    }

    /**
     * 地点项的click事件回调
     * @param {Object} location 地点数组项
     */
    onLocClick(location) {
        mapObj.onSelected(location.id);
    }
}

ko.applyBindings(new ViewModel(), document.body);