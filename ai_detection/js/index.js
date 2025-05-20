$(function() {
	// 直接初始化所有功能
	initMap();
	initLeidatu();
	initWuran();
	initZhexian();
	initNewsScroll();
	
	// 用户头像交互
	$('.avatar').click(function(e) {
		e.stopPropagation();
		$('.dropdown-menu').fadeToggle(200);
	});
	
	// 点击其他地方关闭下拉菜单
	$(document).click(function() {
		$('.dropdown-menu').fadeOut(200);
	});
	
	// 防止点击下拉菜单时关闭
	$('.dropdown-menu').click(function(e) {
		e.stopPropagation();
	});
});

// 地图配置和数据
const mapConfig = {
	// 省份眼科医院数据
	provinceHospitalData: {
		'北京': { 
			count: 169, 
			level: 3, 
			color: '#91cc75', 
			aliases: ['北京市'],
			keyHospitals: [
				{ name: '北京同仁医院', rank: '三级甲等', specialty: '眼科全科、干眼病', patients: '年门诊量超过200万' },
				{ name: '北京协和医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过150万' }
			]
		},
		'天津': { 
			count: 85, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['天津市'],
			keyHospitals: [
				{ name: '天津市眼科医院', rank: '三级甲等', specialty: '青光眼、干眼病', patients: '年门诊量超过100万' },
				{ name: '天津医科大学眼科中心', rank: '三级甲等', specialty: '白内障、视网膜病变', patients: '年手术量超过5万' }
			]
		},
		'河北': { 
			count: 48, 
			level: 1, 
			color: '#3ba272', 
			aliases: ['河北省'],
			keyHospitals: [
				{ name: '河北省眼科医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过80万' },
				{ name: '石家庄市第一医院', rank: '三级甲等', specialty: '眼外伤、视网膜病变', patients: '年门诊量超过60万' }
			]
		},
		'山西': { 
			count: 319, 
			level: 4, 
			color: '#eac736', 
			aliases: ['山西省'],
			keyHospitals: [
				{ name: '山西省眼科医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过70万' },
				{ name: '太原市中心医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过50万' }
			]
		},
		'内蒙古': { 
			count: 112, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['内蒙古自治区'],
			keyHospitals: [
				{ name: '内蒙古医科大学附属医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过60万' },
				{ name: '呼和浩特市第一医院', rank: '三级甲等', specialty: '眼外伤、干眼病', patients: '年门诊量超过40万' }
			]
		},
		'辽宁': { 
			count: 398, 
			level: 4, 
			color: '#eac736', 
			aliases: ['辽宁省'],
			keyHospitals: [
				{ name: '沈阳市第四人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过90万' },
				{ name: '中国医科大学附属第一医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过80万' }
			]
		},
		'吉林': { 
			count: 298, 
			level: 4, 
			color: '#eac736', 
			aliases: ['吉林省'],
			keyHospitals: [
				{ name: '吉林省人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过70万' },
				{ name: '长春市第一医院', rank: '三级甲等', specialty: '眼外伤、干眼病', patients: '年门诊量超过50万' }
			]
		},
		'黑龙江': { 
			count: 95, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['黑龙江省'],
			keyHospitals: [
				{ name: '哈尔滨医科大学附属第一医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过70万' },
				{ name: '黑龙江省医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过60万' }
			]
		},
		'上海': { 
			count: 80, 
			level: 1, 
			color: '#3ba272', 
			aliases: ['上海市'],
			keyHospitals: [
				{ name: '复旦大学眼耳鼻喉科医院', rank: '三级甲等', specialty: '眼底病、干眼病', patients: '年门诊量超过180万' },
				{ name: '上海市第一人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过120万' }
			]
		},
		'江苏': { 
			count: 421, 
			level: 4, 
			color: '#eac736', 
			aliases: ['江苏省'],
			keyHospitals: [
				{ name: '南京医科大学第一附属医院', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年门诊量超过85万' },
				{ name: '苏州大学附属第一医院', rank: '三级甲等', specialty: '青光眼、眼外伤', patients: '年门诊量超过70万' }
			]
		},
		'浙江': { 
			count: 235, 
			level: 3, 
			color: '#91cc75', 
			aliases: ['浙江省'],
			keyHospitals: [
				{ name: '温州医科大学附属眼视光医院', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年手术量超过8万' },
				{ name: '浙江大学医学院附属第二医院', rank: '三级甲等', specialty: '青光眼、视网膜病变', patients: '年门诊量超过100万' }
			]
		},
		'安徽': { 
			count: 437, 
			level: 5, 
			color: '#d94e5d', 
			aliases: ['安徽省'],
			keyHospitals: [
				{ name: '安徽医科大学第一附属医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过90万' },
				{ name: '合肥市第一人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过70万' }
			]
		},
		'福建': { 
			count: 234, 
			level: 3, 
			color: '#91cc75', 
			aliases: ['福建省'],
			keyHospitals: [
				{ name: '福建医科大学附属第一医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过80万' },
				{ name: '厦门眼科中心', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过60万' }
			]
		},
		'江西': { 
			count: 137, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['江西省'],
			keyHospitals: [
				{ name: '南昌大学第一附属医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过70万' },
				{ name: '江西省人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过60万' }
			]
		},
		'山东': { 
			count: 911, 
			level: 5, 
			color: '#d94e5d', 
			aliases: ['山东省'],
			keyHospitals: [
				{ name: '山东省眼科医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过100万' },
				{ name: '青岛眼科医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过80万' }
			]
		},
		'河南': { 
			count: 805, 
			level: 5, 
			color: '#d94e5d', 
			aliases: ['河南省'],
			keyHospitals: [
				{ name: '河南省立眼科医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过90万' },
				{ name: '郑州大学第一附属医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过80万' }
			]
		},
		'湖北': { 
			count: 295, 
			level: 4, 
			color: '#eac736', 
			aliases: ['湖北省'],
			keyHospitals: [
				{ name: '武汉大学人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过90万' },
				{ name: '湖北省人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过70万' }
			]
		},
		'湖南': { 
			count: 340, 
			level: 4, 
			color: '#eac736', 
			aliases: ['湖南省'],
			keyHospitals: [
				{ name: '湖南省人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过80万' },
				{ name: '中南大学湘雅医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过70万' }
			]
		},
		'广东': { 
			count: 437, 
			level: 5, 
			color: '#d94e5d', 
			aliases: ['广东省'],
			keyHospitals: [
				{ name: '中山大学中山眼科中心', rank: '三级甲等', specialty: '白内障、干眼病', patients: '年手术量超过10万' },
				{ name: '广东省人民医院', rank: '三级甲等', specialty: '青光眼、视网膜病变', patients: '年门诊量超过150万' }
			]
		},
		'广西': { 
			count: 126, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['广西壮族自治区'],
			keyHospitals: [
				{ name: '广西壮族自治区人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过70万' },
				{ name: '南宁市第一人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过50万' }
			]
		},
		'海南': { 
			count: 69, 
			level: 1, 
			color: '#3ba272', 
			aliases: ['海南省'],
			keyHospitals: [
				{ name: '海南省眼科医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过40万' },
				{ name: '海南医学院附属医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过30万' }
			]
		},
		'重庆': { 
			count: 139, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['重庆市'],
			keyHospitals: [
				{ name: '重庆医科大学附属第一医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过80万' },
				{ name: '重庆市第一人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过60万' }
			]
		},
		'四川': { 
			count: 319, 
			level: 4, 
			color: '#eac736', 
			aliases: ['四川省'],
			keyHospitals: [
				{ name: '四川大学华西医院', rank: '三级甲等', specialty: '干眼病、青光眼', patients: '年门诊量超过150万' },
				{ name: '成都市第一人民医院', rank: '三级甲等', specialty: '白内障、视网膜病变', patients: '年门诊量超过80万' }
			]
		},
		'贵州': { 
			count: 107, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['贵州省'],
			keyHospitals: [
				{ name: '贵州省人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过60万' },
				{ name: '贵阳医学院附属医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过50万' }
			]
		},
		'云南': { 
			count: 153, 
			level: 3, 
			color: '#91cc75', 
			aliases: ['云南省'],
			keyHospitals: [
				{ name: '昆明医科大学第一附属医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过70万' },
				{ name: '云南省第一人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过60万' }
			]
		},
		'西藏': { 
			count: 15, 
			level: 1, 
			color: '#3ba272', 
			aliases: ['西藏自治区'],
			keyHospitals: [
				{ name: '西藏自治区人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过20万' },
				{ name: '拉萨市人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过15万' }
			]
		},
		'陕西': { 
			count: 277, 
			level: 3, 
			color: '#91cc75', 
			aliases: ['陕西省'],
			keyHospitals: [
				{ name: '西安市第一医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过80万' },
				{ name: '陕西省人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过70万' }
			]
		},
		'甘肃': { 
			count: 42, 
			level: 1, 
			color: '#3ba272', 
			aliases: ['甘肃省'],
			keyHospitals: [
				{ name: '兰州大学第一医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过50万' },
				{ name: '甘肃省人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过40万' }
			]
		},
		'青海': { 
			count: 9, 
			level: 1, 
			color: '#3ba272', 
			aliases: ['青海省'],
			keyHospitals: [
				{ name: '青海大学附属医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过30万' },
				{ name: '青海省人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过25万' }
			]
		},
		'宁夏': { 
			count: 23, 
			level: 1, 
			color: '#3ba272', 
			aliases: ['宁夏回族自治区'],
			keyHospitals: [
				{ name: '宁夏医科大学总医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过40万' },
				{ name: '宁夏回族自治区人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过30万' }
			]
		},
		'新疆': { 
			count: 102, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['新疆维吾尔自治区'],
			keyHospitals: [
				{ name: '新疆维吾尔自治区人民医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过60万' },
				{ name: '乌鲁木齐市第一人民医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过50万' }
			]
		},
		'台湾': { 
			count: 85, 
			level: 2, 
			color: '#73c0de', 
			aliases: ['台湾省'],
			keyHospitals: [
				{ name: '台北荣民总医院', rank: '三级甲等', specialty: '白内障、青光眼', patients: '年门诊量超过70万' },
				{ name: '林口长庚纪念医院', rank: '三级甲等', specialty: '视网膜病变、干眼病', patients: '年门诊量超过60万' }
			]
		}
	},

	// 医院数据
	hospitalData: [
		{ name: '北京同仁医院', position: [116.417, 39.921], city: '北京', rank: '三级甲等', specialty: '眼科全科、干眼病', patients: '年门诊量超过200万' },
		{ name: '中山大学中山眼科中心', position: [113.264, 23.129], city: '广州', rank: '三级甲等', specialty: '白内障、干眼病', patients: '年手术量超过10万' },
		{ name: '复旦大学眼耳鼻喉科医院', position: [121.473, 31.230], city: '上海', rank: '三级甲等', specialty: '眼底病、干眼病', patients: '年门诊量超过180万' },
		{ name: '温州医科大学附属眼视光医院', position: [120.699, 28.001], city: '温州', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年手术量超过8万' },
		{ name: '四川大学华西医院眼科', position: [104.065, 30.659], city: '成都', rank: '三级甲等', specialty: '干眼病、青光眼', patients: '年门诊量超过150万' },
		{ name: '天津市眼科医院', position: [117.200, 39.084], city: '天津', rank: '三级甲等', specialty: '青光眼、干眼病', patients: '年门诊量超过100万' },
		{ name: '武汉大学人民医院眼科', position: [114.316, 30.581], city: '武汉', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年门诊量超过90万' },
		{ name: '郑州大学第一附属医院眼科', position: [113.624, 34.746], city: '郑州', rank: '三级甲等', specialty: '干眼病、青光眼', patients: '年门诊量超过80万' },
		{ name: '南京医科大学第一附属医院眼科', position: [118.796, 32.059], city: '南京', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年门诊量超过85万' },
		{ name: '哈尔滨医科大学第一附属医院眼科', position: [126.535, 45.803], city: '哈尔滨', rank: '三级甲等', specialty: '干眼病、青光眼', patients: '年门诊量超过70万' }
	],

	// 颜色配置
	colors: {
		5: '#d94e5d',    // 最高级医疗资源 - 红色
		4: '#eac736',    // 较高级医疗资源 - 黄色
		3: '#91cc75',    // 中等医疗资源 - 绿色
		2: '#73c0de',    // 较低级医疗资源 - 浅蓝色
		1: '#3ba272',    // 最低级医疗资源 - 青色
		default: 'rgba(240, 248, 255, 0.3)'  // 无数据 - 接近白色
	}
};

// 初始化地图
function initMap() {
	// 创建地图实例
	const map = new AMap.Map('map', {
		zoom: 4.5,
		center: [104.5, 36.5],
		mapStyle: 'amap://styles/dark',
		viewMode: '2D',
		pitch: 0,
		features: ['bg', 'building', 'point'],
		showBuildingBlock: false,
		showLabel: false,
		showIndoorMap: false,
		defaultCursor: 'pointer',
		backgroundColor: '#0d325f'
	});

	// 等待地图加载完成
	map.on('complete', function() {
		renderMapLayers(map);
	});
}

// 渲染地图图层
function renderMapLayers(map) {
	
	// 加载行政区划插件
	AMap.plugin(['AMap.DistrictSearch', 'AMap.DistrictLayer'], function() {
		// 创建省级图层
		const provinceLayer = new AMap.DistrictLayer.Province({
			zIndex: 12,
			depth: 0,
			styles: {
				'fill': function(properties) {
					const fullName = properties.NAME_CHN;
					let matchedProvince = null;
					for (const [province, data] of Object.entries(mapConfig.provinceHospitalData)) {
						if (fullName === province || data.aliases.includes(fullName)) {
							matchedProvince = data;
							break;
						}
					}
					return matchedProvince ? matchedProvince.color : mapConfig.colors.default;
				},
				'province-stroke': '#ffffff',
				'city-stroke': 'transparent',
				'province-stroke-width': 1,
				'city-stroke-width': 0
			}
		});

		// 将图层添加到地图
		provinceLayer.setMap(map);

		// 创建信息窗体
		const infoWindow = new AMap.InfoWindow({
			isCustom: true,
			autoMove: true,
			offset: new AMap.Pixel(0, -30)
		});

		// 省份中心点坐标
		const provinceCenters = {
			'北京': [116.405285, 39.904989],
			'天津': [117.190182, 39.125596],
			'河北': [114.502461, 38.045474],
			'山西': [112.549248, 37.857014],
			'内蒙古': [111.670801, 40.818311],
			'辽宁': [123.429096, 41.796767],
			'吉林': [125.3245, 43.886841],
			'黑龙江': [126.642464, 45.756967],
			'上海': [121.472644, 31.231706],
			'江苏': [118.767413, 32.041544],
			'浙江': [120.153576, 30.287459],
			'安徽': [117.283042, 31.86119],
			'福建': [119.306239, 26.075302],
			'江西': [115.892151, 28.676493],
			'山东': [117.000923, 36.675807],
			'河南': [113.665412, 34.757975],
			'湖北': [114.298572, 30.584355],
			'湖南': [112.982279, 28.19409],
			'广东': [113.280637, 23.125178],
			'广西': [108.320004, 22.82402],
			'海南': [110.33119, 20.031971],
			'重庆': [106.504962, 29.533155],
			'四川': [104.065735, 30.659462],
			'贵州': [106.713478, 26.578343],
			'云南': [102.712251, 25.040609],
			'西藏': [91.132212, 29.660361],
			'陕西': [108.948024, 34.263161],
			'甘肃': [103.823557, 36.058039],
			'青海': [101.778916, 36.623178],
			'宁夏': [106.278179, 38.46637],
			'新疆': [87.617733, 43.792818],
			'台湾': [121.509062, 25.044332]
		};

		// 为每个省份添加标签和交互
		Object.entries(mapConfig.provinceHospitalData).forEach(([province, data]) => {
			const center = provinceCenters[province];
			if (center) {
				// 创建文本标签
				const label = new AMap.Text({
					text: province,
					position: center,
					style: {
						'background-color': 'transparent',
						'border': 'none',
						'color': '#ffffff',
						'font-size': '14px',
						'font-weight': 'bold',
						'text-shadow': '2px 2px 4px rgba(0,0,0,0.8)',
						'padding': '6px 10px',
						'text-align': 'center',
						'cursor': 'pointer'
					},
					zIndex: 120
				});

				// 添加鼠标事件
				label.on('mouseover', function(e) {
					// 创建详细信息内容
					const content = createProvinceDetailContent(province, data);
					infoWindow.setContent(content);
					infoWindow.open(map, e.target.getPosition());
				});

				label.on('mouseout', function() {
					infoWindow.close();
				});

				label.setMap(map);
			}
		});

		// 搜索中国行政区划
		const districtSearch = new AMap.DistrictSearch({
			level: 'province',
			subdistrict: 1,
			extensions: 'all'
		});

		districtSearch.search('中国', function(status, result) {
			if (status === 'complete') {
				const country = result.districtList[0];
				renderCountryBoundary(map, country);
				renderHospitals(map);
				map.setFitView();
			}
		});

		// 添加缩放控件
		map.addControl(new AMap.ToolBar({
			position: 'rb'
		}));

		// 添加图例
		addMapLegend();
	});
}

// 创建省份详细信息内容
function createProvinceDetailContent(provinceName, data) {
	const levelDescriptions = {
		5: '医疗资源最丰富',
		4: '医疗资源较丰富',
		3: '医疗资源中等',
		2: '医疗资源较少',
		1: '医疗资源待提升'
	};

	return `
		<div class="info-window" style="
			padding: 15px;
			border-radius: 8px;
			background: rgba(255,255,255,0.95);
			box-shadow: 0 2px 10px rgba(0,0,0,0.2);
			width: 400px;
			font-family: Arial, sans-serif;
		">
			<h3 style="
				margin: 0 0 10px;
				color: ${mapConfig.colors[data.level]};
				font-size: 18px;
				border-bottom: 2px solid ${mapConfig.colors[data.level]};
				padding-bottom: 8px;
			">${provinceName}医疗资源概况</h3>
			
			<div style="
				margin: 10px 0;
				padding: 10px;
				background: rgba(0,194,255,0.1);
				border-radius: 6px;
				display: flex;
				justify-content: space-between;
			">
				<p style="margin: 0; color: #333; font-size: 14px;">
					<span style="color: ${mapConfig.colors[data.level]};">◉</span>
					医疗资源等级：${data.level}级
				</p>
				<p style="margin: 0; color: #333; font-size: 14px;">
					<span style="color: ${mapConfig.colors[data.level]};">◉</span>
					眼科医院：${data.count}家
				</p>
			</div>

			<div style="margin-top: 10px;">
				<h4 style="
					margin: 8px 0;
					color: #333;
					font-size: 15px;
					border-bottom: 1px solid ${mapConfig.colors[data.level]}40;
					padding-bottom: 5px;
				">重点医院</h4>
				<div style="
					display: grid;
					grid-template-columns: 1fr;
					gap: 10px;
				">
				${data.keyHospitals.map((hospital, index) => `
					<div style="
						padding: 10px;
						background: rgba(0,194,255,0.05);
						border-radius: 6px;
						border-left: 3px solid ${mapConfig.colors[data.level]};
					">
						<div style="
							font-weight: bold;
							color: #333;
							font-size: 14px;
							margin-bottom: 5px;
						">${index + 1}. ${hospital.name}</div>
						<div style="
							color: #666;
							line-height: 1.4;
							font-size: 13px;
							display: grid;
							grid-template-columns: repeat(2, 1fr);
							gap: 5px;
						">
							<div>
								<span style="color: ${mapConfig.colors[data.level]};">◉</span>
								${hospital.rank}
							</div>
							<div>
								<span style="color: ${mapConfig.colors[data.level]};">◉</span>
								${hospital.patients}
							</div>
							<div style="grid-column: 1 / -1;">
								<span style="color: ${mapConfig.colors[data.level]};">◉</span>
								特色：${hospital.specialty}
							</div>
						</div>
					</div>
				`).join('')}
				</div>
			</div>
		</div>
	`;
}

// 调整省份标签位置的辅助函数
function adjustLabelPosition(center, provinceName) {
	const adjustments = {
		'北京': [0.2, 0],
		'天津': [0.2, -0.2],
		'上海': [0.3, 0],
		'重庆': [-0.2, 0],
		'香港': [0.1, -0.1],
		'澳门': [0, -0.1],
		'海南': [0, 0.2],
		'台湾': [0.2, 0]
	};

	if (adjustments[provinceName]) {
		return [
			center[0] + adjustments[provinceName][0],
			center[1] + adjustments[provinceName][1]
		];
	}
	return center;
}

// 添加地图图例
function addMapLegend() {
	if (document.querySelector('.map-legend')) return;

	const legend = document.createElement('div');
	legend.className = 'map-legend';
	legend.innerHTML = `
		<h4 style="margin: 0 0 10px 0; color: #fff; font-size: 14px;">医疗资源等级</h4>
		<div style="display: flex; align-items: center; margin: 5px 0;">
			<div style="width: 20px; height: 20px; background: #d94e5d; margin-right: 8px;"></div>
			<span style="color: #fff; font-size: 12px;">5级 (最高)</span>
		</div>
		<div style="display: flex; align-items: center; margin: 5px 0;">
			<div style="width: 20px; height: 20px; background: #eac736; margin-right: 8px;"></div>
			<span style="color: #fff; font-size: 12px;">4级</span>
		</div>
		<div style="display: flex; align-items: center; margin: 5px 0;">
			<div style="width: 20px; height: 20px; background: #91cc75; margin-right: 8px;"></div>
			<span style="color: #fff; font-size: 12px;">3级</span>
		</div>
		<div style="display: flex; align-items: center; margin: 5px 0;">
			<div style="width: 20px; height: 20px; background: #73c0de; margin-right: 8px;"></div>
			<span style="color: #fff; font-size: 12px;">2级</span>
		</div>
		<div style="display: flex; align-items: center; margin: 5px 0;">
			<div style="width: 20px; height: 20px; background: #3ba272; margin-right: 8px;"></div>
			<span style="color: #fff; font-size: 12px;">1级 (最低)</span>
		</div>
	`;
	document.querySelector('.map-container').appendChild(legend);
}

// 渲染全国边界
function renderCountryBoundary(map, country) {
	if (country && country.boundaries) {
		country.boundaries.forEach(function(boundary) {
			const path = boundary.map(point => new AMap.LngLat(point[0], point[1]));
			new AMap.Polyline({
				path: path,
				strokeWeight: 1,
				strokeColor: '#ffffff',
				strokeStyle: 'solid',
				strokeOpacity: 0.8,
				zIndex: 11
			}).setMap(map);
		});
	}

	// 添加国家标签
	new AMap.Text({
		text: '中华人民共和国',
		position: [104.5, 36.5],
		style: {
			'background-color': 'transparent',
			'border': 'none',
			'color': '#fff',
			'font-size': '20px',
			'font-weight': 'bold',
			'padding': '2px 5px',
			'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)'
		},
		zIndex: 120
	}).setMap(map);
}

// 渲染省份
function renderProvinces(map, country) {
	if (!country.districtList) return;

	country.districtList.forEach(function(province) {
		if (!province.boundaries) return;

		province.boundaries.forEach(function(boundary) {
			const path = boundary.map(point => new AMap.LngLat(point[0], point[1]));
			const provinceData = mapConfig.provinceHospitalData[province.name] || { count: 0, level: 1 };
			
			// 创建省份多边形
			const polygon = new AMap.Polygon({
				path: path,
				strokeWeight: 1,
				strokeColor: '#fff',
				fillColor: mapConfig.colors[provinceData.level] || mapConfig.colors.default,
				fillOpacity: 1,
				zIndex: 10,
				bubble: true
			});

			// 添加鼠标事件
			addProvinceEvents(map, polygon, province, provinceData);
			polygon.setMap(map);
		});

		// 添加省份标签
		addProvinceLabels(map, province);
	});
}

// 添加省份事件处理
function addProvinceEvents(map, polygon, province, provinceData) {
	polygon.on('mouseover', function() {
		polygon.setOptions({
			strokeColor: '#4dd0e1',
			strokeWeight: 2,
			fillColor: '#4dd0e1',
			fillOpacity: 0.3
		});

		const infoWindow = new AMap.InfoWindow({
			content: createProvinceInfoContent(province.name, provinceData),
			offset: new AMap.Pixel(0, -30)
		});
		infoWindow.open(map, province.center);
	});

	polygon.on('mouseout', function() {
		polygon.setOptions({
			strokeColor: '#fff',
			strokeWeight: 1,
			fillColor: mapConfig.colors[provinceData.level] || mapConfig.colors.default,
			fillOpacity: 1
		});
		map.clearInfoWindow();
	});
}

// 添加省份标签
function addProvinceLabels(map, province) {
	if (!province.center) return;

	// 添加省份名称
	new AMap.Text({
		text: province.name,
		position: adjustLabelPosition(province.center, province.name),
		style: {
			'background-color': 'transparent',
			'border': 'none',
			'color': '#ffffff',
			'font-size': '14px',
			'font-weight': 'bold',
			'padding': '6px 10px',
			'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)',
			'user-select': 'none',
			'pointer-events': 'none',
			'text-align': 'center',
			'white-space': 'nowrap'
		},
		zIndex: 120
	}).setMap(map);

	// 获取省份数据
	const provinceData = mapConfig.provinceHospitalData[province.name];
	if (provinceData) {
	// 添加医院数量标签
		new AMap.Text({
			text: `${provinceData.count}家`,
			position: [
				province.center[0],
				province.center[1] - 0.5  // 略微向下偏移
			],
			style: {
				'background-color': 'rgba(0,194,255,0.2)',
				'border': '1px solid rgba(0,194,255,0.4)',
				'border-radius': '10px',
				'color': '#4dd0e1',
				'font-size': '12px',
				'font-weight': 'normal',
				'padding': '2px 8px',
				'text-shadow': '1px 1px 2px rgba(0,0,0,0.3)',
				'user-select': 'none',
				'pointer-events': 'none',
				'text-align': 'center',
				'white-space': 'nowrap'
			},
			zIndex: 119
		}).setMap(map);

		// 添加等级标识
		new AMap.Text({
			text: `Level ${provinceData.level}`,
			position: [
				province.center[0],
				province.center[1] + 0.5  // 略微向上偏移
			],
			style: {
				'background-color': mapConfig.colors[provinceData.level],
				'border-radius': '8px',
				'color': '#ffffff',
				'font-size': '11px',
				'font-weight': 'bold',
				'padding': '1px 6px',
				'text-shadow': '1px 1px 2px rgba(0,0,0,0.3)',
				'user-select': 'none',
				'pointer-events': 'none',
				'text-align': 'center',
				'white-space': 'nowrap',
				'opacity': '0.9'
			},
			zIndex: 118
		}).setMap(map);
	}

	// 添加主要城市标签（仅添加省会城市）
	if (province.districtList) {
		const capitalCity = province.districtList.find(city => 
			city.name.includes('市') && (
				city.name === province.name + '市' ||  // 直辖市
				city.name === province.districtList[0].name  // 通常省会城市排第一
			)
		);
		
		if (capitalCity && capitalCity.center) {
				new AMap.Text({
				text: capitalCity.name.replace(/(市|地区|自治州)$/, ''),
				position: capitalCity.center,
					style: {
						'background-color': 'transparent',
						'border': 'none',
						'color': '#bad0e2',
						'font-size': '12px',
						'padding': '2px 5px',
					'text-shadow': '1px 1px 2px rgba(0,0,0,0.5)',
					'user-select': 'none',
					'pointer-events': 'none',
					'font-style': 'italic'
					},
				zIndex: 117
				}).setMap(map);
			}
	}
}

// 渲染医院标记
function renderHospitals(map) {
	mapConfig.hospitalData.forEach(hospital => {
		const marker = new AMap.Marker({
			position: hospital.position,
			icon: new AMap.Icon({
				size: new AMap.Size(25, 25),
				image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
				imageSize: new AMap.Size(25, 25)
			}),
			title: hospital.name,
			zIndex: 13
		});

		const infoWindow = new AMap.InfoWindow({
			isCustom: true,
			content: createHospitalInfoContent(hospital),
			offset: new AMap.Pixel(16, -45)
		});

		marker.on('click', () => {
			infoWindow.open(map, marker.getPosition());
		});

		marker.setMap(map);
	});
}

// 创建省份信息窗体内容
function createProvinceInfoContent(provinceName, data) {
	const levelColors = {
		5: '#d94e5d',
		4: '#eac736',
		3: '#91cc75',
		2: '#73c0de',
		1: '#3ba272'
	};
	
	const levelDescriptions = {
		5: '医疗资源最丰富',
		4: '医疗资源较丰富',
		3: '医疗资源中等',
		2: '医疗资源较少',
		1: '医疗资源待提升'
	};

	return `
		<div class="info-window" style="
			padding: 15px;
			border-radius: 8px;
			background: rgba(255,255,255,0.95);
			box-shadow: 0 2px 10px rgba(0,0,0,0.2);
			min-width: 250px;
			font-family: Arial, sans-serif;
		">
			<h3 style="
				margin: 0 0 10px;
				color: ${levelColors[data.level]};
				font-size: 16px;
				border-bottom: 2px solid ${levelColors[data.level]};
				padding-bottom: 8px;
			">${provinceName}</h3>
			<div style="
				display: flex;
				align-items: center;
				margin-bottom: 8px;
			">
				<span style="
					background: ${levelColors[data.level]};
					color: white;
					padding: 2px 8px;
					border-radius: 12px;
					font-size: 12px;
					margin-right: 8px;
				">Level ${data.level}</span>
				<span style="
					color: #666;
					font-size: 12px;
				">${levelDescriptions[data.level]}</span>
			</div>
			<p style="
				margin: 8px 0;
				color: #333;
				font-size: 14px;
			">
				<i class="fas fa-hospital" style="margin-right: 8px; color: ${levelColors[data.level]};"></i>
				眼科医院总数：<strong>${data.count}</strong> 家
			</p>
			<div style="
				margin-top: 12px;
				padding-top: 8px;
				border-top: 1px dashed #ddd;
				font-size: 12px;
				color: #666;
			">
				<i class="fas fa-info-circle" style="margin-right: 5px;"></i>
				点击查看更多医院详情
			</div>
		</div>
	`;
}

// 创建医院信息窗体内容
function createHospitalInfoContent(hospital) {
	return `
		<div class="info-window" style="padding: 15px; border-radius: 8px; color: #333; min-width: 200px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
			<h3 style="margin: 0 0 10px; color: #0F56B3;">${hospital.name}</h3>
			<p style="margin: 5px 0;">所在城市：${hospital.city}</p>
			<p style="margin: 5px 0;">医院等级：${hospital.rank}</p>
			<p style="margin: 5px 0;">特色专科：${hospital.specialty}</p>
			<p style="margin: 5px 0;">就诊情况：${hospital.patients}</p>
		</div>
	`;
}

// 初始化雷达图
function initLeidatu() {
	var myChart = echarts.init(document.getElementById('leida'));
	
	const diseaseData = [
		{ name: '近视', value: 700, displayValue: '7亿', population: '青少年（6-22岁）', trend: '逐年增加' },
		{ name: '白内障', value: 280, displayValue: '2.8亿', population: '老年人（60岁以上）', trend: '稳定增长' },
		{ name: '干眼症', value: 80, displayValue: '8000万', population: '办公人群（20-45岁）', trend: '快速增长' },
		{ name: '老花眼', value: 390, displayValue: '3.9亿', population: '中老年人（40岁以上）', trend: '稳定' },
		{ name: '青光眼', value: 79.6, displayValue: '7960万', population: '中老年人（45岁以上）', trend: '缓慢增长' },
		{ name: '结膜炎', value: 17.5, displayValue: '1750万', population: '全年龄段', trend: '波动增长' },
		{ name: '黄斑变性', value: 4, displayValue: '400万', population: '老年人（65岁以上）', trend: '逐年增加' },
		{ name: '糖尿病视网膜病变', value: 19.5, displayValue: '1950万', population: '中老年人（40岁以上）', trend: '快速增长' }
	];

	option = {
		radar: {
			indicator: diseaseData.map(d => ({
				text: `${d.name}\n(${d.displayValue})`,
				max: 700
			})),
			center: ['50%', '52%'],
			radius: '58%',
			startAngle: 90,
			splitNumber: 7,
			shape: 'circle',
			name: {
				formatter: function(value) {
					return value.replace(/\n/, '\n');
				},
				textStyle: {
					fontSize: 12,
					color: '#5b81cb',
					padding: [3, 5]
				}
			},
			axisLine: {
				lineStyle: {
					color: '#153269',
					width: 1
				}
			},
			splitLine: {
				lineStyle: {
					color: '#113865',
					width: 1
				}
			},
			splitArea: {
				show: true,
				areaStyle: {
					color: ['rgba(20,28,66,0.3)', 'rgba(20,28,66,0.2)']
				}
			}
		},
		series: [{
			type: 'radar',
			data: [{
				value: diseaseData.map(d => d.value),
				name: '患病人数',
				symbolSize: 8,
				symbol: 'circle',
				itemStyle: {
					normal: {
						color: '#00c2ff',
						borderColor: '#fff',
						borderWidth: 2,
						lineStyle: {
							color: '#00c2ff',
							width: 2
						},
						areaStyle: {
							color: 'rgba(0, 194, 255, 0.3)'
						}
					},
					emphasis: {
						color: '#fff',
						borderColor: '#00c2ff',
						borderWidth: 2,
						scale: true
					}
				}
			}]
		}]
	};

	myChart.setOption(option);
	window.addEventListener("resize", function() {
		myChart.resize();
	});
}

// 初始化污染图
function initWuran() {
	var myChart = echarts.init(document.getElementById('wuran'));
	
	// 定义简洁的年龄段数据
	const detailData = {
		'<18岁': {
			'近视': { value: 35, detail: '学习压力大，电子产品使用频繁，建议增加户外活动' },
			'白内障': { value: 0, detail: '极少发生，如有症状需及时就医' },
			'黄斑变性': { value: 0, detail: '罕见，注意防护强光' },
			'青光眼': { value: 2, detail: '以先天性为主，建议新生儿筛查' },
			'干眼症': { value: 15, detail: '与用眼习惯相关，注意用眼卫生' }
		},
		'18-40岁': {
			'近视': { value: 75, detail: '高发人群，建议采取防护措施' },
			'白内障': { value: 5, detail: '需注意防护紫外线，避免眼部外伤' },
			'黄斑变性': { value: 5, detail: '保持健康生活方式，避免吸烟' },
			'青光眼': { value: 5, detail: '定期检查眼压，尤其有家族史者' },
			'干眼症': { value: 25, detail: '注意工作环境，建议适时休息' }
		},
		'40-60岁': {
			'近视': { value: 45, detail: '可能并发老视，建议及时配镜' },
			'白内障': { value: 15, detail: '发病率上升，建议定期体检' },
			'黄斑变性': { value: 10, detail: '控制血压，补充营养' },
			'青光眼': { value: 15, detail: '高发期，需定期专业检查' },
			'干眼症': { value: 30, detail: '多种因素影响，建议保持眼部湿润' }
		},
		'60-80岁': {
			'近视': { value: 25, detail: '视力问题复杂，需定期调整' },
			'白内障': { value: 45, detail: '高发期，可考虑手术治疗' },
			'黄斑变性': { value: 20, detail: '及时发现视物变形需就医' },
			'青光眼': { value: 15, detail: '需遵医嘱用药，定期复查' },
			'干眼症': { value: 35, detail: '症状加重，需综合治疗' }
		},
		'>80岁': {
			'近视': { value: 15, detail: '需防跌倒，及时调整用眼方案' },
			'白内障': { value: 70, detail: '极高发，需评估手术时机' },
			'黄斑变性': { value: 35, detail: '重要致盲原因，需长期随访' },
			'青光眼': { value: 25, detail: '需家人协助监督用药和复查' },
			'干眼症': { value: 40, detail: '需考虑整体用药情况' }
		}
	};

	option = {
		title: {
			text: '不同年龄段眼部疾病患病率统计',
			textStyle: {
				color: '#fff',
				fontSize: 14
			},
			left: 'center'
		},
		tooltip: {
			trigger: 'item',
			axisPointer: {
				type: 'shadow'
			},
			position: function (point, params, dom, rect, size) {
				// 获取提示框的宽度和高度
				const tooltipWidth = size.contentSize[0];
				const tooltipHeight = size.contentSize[1];
				// 获取视图的宽度和高度
				const viewWidth = size.viewSize[0];
				const viewHeight = size.viewSize[1];
				
				// 默认位置（鼠标位置）
				let x = point[0];
				let y = point[1];

				// 检查是否会超出左边界
				if (x < tooltipWidth) {
					// 如果会超出左边界，显示在右侧
					x = point[0] + 20;
				}
				
				// 检查是否会超出右边界
				if (x + tooltipWidth > viewWidth) {
					// 如果会超出右边界，显示在左侧
					x = point[0] - tooltipWidth - 20;
				}

				// 检查是否会超出底部
				if (y + tooltipHeight > viewHeight) {
					// 如果会超出底部，向上偏移
					y = point[1] - tooltipHeight - 20;
				}

				// 确保不会超出顶部
				if (y < 0) {
					y = 20;
				}

				return [x, y];
			},
			formatter: function(param) {
				const age = param.name;
				const disease = param.seriesName;
				const detail = detailData[age][disease];
				
				return `
					<div style="padding: 3px;">
						<b>${age} - ${disease}</b><br/>
						<div style="margin: 5px 0;">
							<div style="margin-left: 10px;">
								患病率：${detail.value}%<br/>
								特点：${detail.detail}
							</div>
						</div>
					</div>
				`;
			},
			backgroundColor: 'rgba(12,26,63,0.8)',
			borderColor: 'rgba(0, 194, 255, 0.2)',
			borderWidth: 1,
			padding: [10, 15],
			textStyle: {
				color: '#fff',
				fontSize: 12
			}
		},
		legend: {
			data: ['近视', '白内障', '黄斑变性', '青光眼', '干眼症'],
			textStyle: {
				color: '#fff'
			},
			top: 25
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '80px',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: ['<18岁', '18-40岁', '40-60岁', '60-80岁', '>80岁'],
			axisLabel: {
				color: '#fff'
			},
			axisLine: {
				lineStyle: {
					color: '#153269'
				}
			}
		},
		yAxis: {
			type: 'value',
			name: '患病率 (%)',
			max: 80,
			axisLabel: {
				color: '#fff',
				formatter: '{value}%'
			},
			axisLine: {
				lineStyle: {
					color: '#153269'
				}
			},
			splitLine: {
				lineStyle: {
					color: '#113865'
				}
			}
		},
		series: [
			{
				name: '近视',
				type: 'bar',
				data: [35, 75, 45, 25, 15],
				itemStyle: {
					color: '#00c2ff'
				}
			},
			{
				name: '白内障',
				type: 'bar',
				data: [0, 5, 15, 45, 70],
				itemStyle: {
					color: '#ffcf00'
				}
			},
			{
				name: '黄斑变性',
				type: 'bar',
				data: [0, 5, 10, 20, 35],
				itemStyle: {
					color: '#ff6e76'
				}
			},
			{
				name: '青光眼',
				type: 'bar',
				data: [2, 5, 15, 15, 25],
				itemStyle: {
					color: '#4cd384'
				}
			},
			{
				name: '干眼症',
				type: 'bar',
				data: [15, 25, 30, 35, 40],
				itemStyle: {
					color: '#9d96f5'
				}
			}
		]
	};

	myChart.setOption(option);
	window.addEventListener("resize", function() {
		myChart.resize();
	});
}

// 初始化折线图
function initZhexian() {
	var myChart = echarts.init(document.getElementById('zhexian'));
	option = {
		// 折线图配置
	};
	myChart.setOption(option);
	window.addEventListener("resize", function() {
		myChart.resize();
	});
}

// 初始化新闻滚动
function initNewsScroll() {
	const newsData = [
		{
			title: "AI 深度学习模型在青光眼早期诊断中的应用研究",
			journal: "Nature Medicine",
			date: "2024-03-18",
			url: "https://www.nature.com/articles/s41591-024-02737-w",
			detail: "研究发现新的AI模型可提前2-3年预测青光眼的发展",
			tag: "AI诊断"
		},
		{
			title: "新型生物材料在角膜修复中的突破性进展",
			journal: "Science",
			date: "2024-03-15",
			url: "https://www.science.org/doi/10.1126/science.adg9130",
			detail: "可降解生物材料在角膜修复中展现出良好效果",
			tag: "治疗进展"
		},
		{
			title: "基于干细胞技术的视网膜再生研究新进展",
			journal: "Cell",
			date: "2024-03-14",
			url: "https://www.cell.com/cell/fulltext/S0092-8674(24)00133-4",
			detail: "干细胞治疗有望治愈视网膜退化性疾病",
			tag: "前沿研究"
		},
		{
			title: "新发现：微生物组失衡与干眼症发病机制的关联",
			journal: "Science Advances",
			date: "2024-03-12",
			url: "https://www.science.org/doi/10.1126/sciadv.adm9996",
			detail: "眼表微生物组在干眼症发病中的关键作用"
		},
		{
			title: "新型抗VEGF药物在AMD治疗中的临床试验结果",
			journal: "NEJM",
			date: "2024-03-07",
			url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2400374",
			detail: "长效抗VEGF药物显著改善治疗效果"
		},
		{
			title: "人工智能辅助白内障手术精准度研究",
			journal: "Ophthalmology",
			date: "2024-03-05",
			url: "https://www.aaojournal.org/article/S0161-6420(24)00123-X/fulltext",
			detail: "AI辅助系统提高手术精确度达30%"
		},
		{
			title: "环境污染与儿童近视发病率相关性研究",
			journal: "JAMA Ophthalmology",
			date: "2024-03-02",
			url: "https://jamanetwork.com/journals/jamaophthalmology/article-abstract/2814772",
			detail: "空气污染可能增加儿童近视风险"
		},
		{
			title: "基因治疗在遗传性视网膜疾病中的应用进展",
			journal: "Nature Genetics",
			date: "2024-02-28",
			url: "https://www.nature.com/articles/s41588-024-01589-x",
			detail: "新型基因编辑技术在视网膜疾病治疗中取得突破"
		},
		{
			title: "干眼症与认知功能障碍的关联研究",
			journal: "Lancet",
			date: "2024-02-25",
			url: "https://www.thelancet.com/journals/laneur/article/PIIS1474-4422(24)00048-X/fulltext",
			detail: "研究发现干眼症可能增加认知障碍风险"
		},
		{
			title: "新型光敏感视网膜植入物临床试验结果",
			journal: "Nature Biotechnology",
			date: "2024-02-22",
			url: "https://www.nature.com/articles/s41587-024-01972-3",
			detail: "光敏感植入物为盲症患者带来新希望"
		},
		{
			title: "眼部微生物组与免疫系统相互作用研究",
			journal: "Immunity",
			date: "2024-02-20",
			url: "https://www.cell.com/immunity/fulltext/S1074-7613(24)00052-8",
			detail: "揭示眼部微生物组在免疫防御中的作用"
		},
		{
			title: "3D打印角膜支架治疗角膜损伤的新方法",
			journal: "Advanced Materials",
			date: "2024-02-18",
			url: "https://onlinelibrary.wiley.com/doi/10.1002/adma.202309455",
			detail: "3D打印技术在角膜修复中的创新应用"
		}
	];

	const newsContainer = document.querySelector('.news-container');
	const newsListContainer = document.createElement('div');
	newsListContainer.className = 'news-list';
	
	// 创建控制按钮
	const controlsHtml = `
		<div class="news-controls">
			<button class="news-control prev" title="上一页">
				<i class="fas fa-chevron-up"></i>
			</button>
			<button class="news-control next" title="下一页">
				<i class="fas fa-chevron-down"></i>
			</button>
			<button class="news-control pause" title="暂停/播放">
				<i class="fas fa-pause"></i>
			</button>
		</div>
	`;

	// 初始化新闻列表容器
	newsContainer.innerHTML = '';
	newsContainer.appendChild(newsListContainer);
	newsContainer.insertAdjacentHTML('beforeend', controlsHtml);

	let currentIndex = 0;
	let isAnimating = false;
	let autoScrollInterval;
	let isPaused = false;

	// 创建新闻元素
	function createNewsElement(news) {
		return `
			<div class="news-item" style="opacity: 0; transform: translateY(20px);">
				<div class="news-tag ${news.tag ? news.tag.toLowerCase().replace(/\s+/g, '-') : ''}">${news.tag || ''}</div>
				<div class="news-content">
					<div class="news-title">${news.title}</div>
					<div class="news-info">
						<span class="news-journal">${news.journal}</span>
						<span class="news-date">${news.date}</span>
					</div>
					<div class="news-detail">${news.detail}</div>
				</div>
			</div>
		`;
	}

	// 更新新闻显示
	function updateNews(direction = 'down') {
		if (isAnimating) return;
		isAnimating = true;

		const oldItems = newsListContainer.querySelectorAll('.news-item');
		const itemHeight = oldItems[0]?.offsetHeight || 0;
		const translateY = direction === 'down' ? -itemHeight : itemHeight;

		// 移除旧项目的动画
		oldItems.forEach(item => {
			item.style.transition = 'all 0.5s ease';
			item.style.opacity = '0';
			item.style.transform = `translateY(${translateY}px)`;
		});

		// 准备新的新闻项目
		setTimeout(() => {
			newsListContainer.innerHTML = '';
			for (let i = 0; i < 4; i++) {
				const index = (currentIndex + i) % newsData.length;
				const newsItem = createNewsElement(newsData[index]);
				newsListContainer.insertAdjacentHTML('beforeend', newsItem);
			}

			// 添加新项目的动画
			const newItems = newsListContainer.querySelectorAll('.news-item');
			newItems.forEach((item, index) => {
				setTimeout(() => {
					item.style.transition = 'all 0.5s ease';
					item.style.opacity = '1';
					item.style.transform = 'translateY(0)';
				}, index * 100);
			});

			isAnimating = false;
		}, 500);
	}

	// 自动滚动功能
	function startAutoScroll() {
		if (autoScrollInterval) clearInterval(autoScrollInterval);
		autoScrollInterval = setInterval(() => {
			if (!isPaused) {
				currentIndex = (currentIndex + 1) % newsData.length;
				updateNews('down');
			}
		}, 5000);
	}

	// 停止自动滚动
	function stopAutoScroll() {
		if (autoScrollInterval) {
			clearInterval(autoScrollInterval);
			autoScrollInterval = null;
		}
	}

	// 事件监听器
	newsContainer.querySelector('.prev').addEventListener('click', () => {
		currentIndex = (currentIndex - 1 + newsData.length) % newsData.length;
		updateNews('up');
	});

	newsContainer.querySelector('.next').addEventListener('click', () => {
		currentIndex = (currentIndex + 1) % newsData.length;
		updateNews('down');
	});

	newsContainer.querySelector('.pause').addEventListener('click', (e) => {
		isPaused = !isPaused;
		const icon = e.currentTarget.querySelector('i');
		icon.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
	});

	// 鼠标悬停控制
	newsContainer.addEventListener('mouseenter', () => {
		isPaused = true;
		const pauseButton = newsContainer.querySelector('.pause i');
		pauseButton.className = 'fas fa-play';
	});

	newsContainer.addEventListener('mouseleave', () => {
		isPaused = false;
		const pauseButton = newsContainer.querySelector('.pause i');
		pauseButton.className = 'fas fa-pause';
	});

	// 点击新闻打开链接
	newsListContainer.addEventListener('click', (e) => {
		const newsItem = e.target.closest('.news-item');
		if (newsItem) {
			const index = Array.from(newsListContainer.children).indexOf(newsItem);
			const news = newsData[(currentIndex + index) % newsData.length];
			if (news.url) {
				window.open(news.url, '_blank');
			}
		}
	});

	// 初始显示新闻
	updateNews();
	startAutoScroll();
}

// 添加用户相关功能
function showMedicalRecords() {
	// 从 sessionStorage 获取病例数据
	const records = JSON.parse(sessionStorage.getItem('medicalRecords') || '[]');
	
	const modalHtml = `
		<div class="modal" id="recordsModal">
			<div class="modal-content">
				<div class="modal-header">
					<h2 class="modal-title">我的病例记录</h2>
					<span class="close-btn" onclick="closeModal('recordsModal')">&times;</span>
				</div>
				<div class="records-list">
					${records.map(record => `
						<div class="record-item">
							<div class="record-header">
								<span class="record-date">${record.date}</span>
								<span class="record-type">${record.type}</span>
							</div>
							<div class="record-content">
								<p>诊断结果：${record.diagnosis}</p>
								<p>建议：${record.recommendation}</p>
							</div>
							<div class="record-footer">
								<button onclick="downloadRecord('${record.id}')">
									<i class="fas fa-download"></i> 下载报告
								</button>
								<button onclick="deleteRecord('${record.id}')">
									<i class="fas fa-trash"></i> 删除记录
								</button>
							</div>
						</div>
					`).join('') || '<p class="no-records">暂无病例记录</p>'}
				</div>
			</div>
		</div>
	`;
	
	document.body.insertAdjacentHTML('beforeend', modalHtml);
	document.getElementById('recordsModal').style.display = 'block';
}

function showCheckHistory() {
	// 从 sessionStorage 获取检查记录
	const history = JSON.parse(sessionStorage.getItem('checkHistory') || '[]');
	
	const modalHtml = `
		<div class="modal" id="historyModal">
			<div class="modal-content">
				<div class="modal-header">
					<h2 class="modal-title">检查记录</h2>
					<span class="close-btn" onclick="closeModal('historyModal')">&times;</span>
				</div>
				<div class="history-list">
					${history.map(item => `
						<div class="history-item">
							<div class="history-info">
								<span class="check-date">${item.date}</span>
								<span class="check-type">${item.type}</span>
							</div>
							<div class="check-result">
								<img src="${item.image}" alt="检查图片">
								<div class="result-text">
									<p>检查结果：${item.result}</p>
									<p>AI置信度：${item.confidence}%</p>
								</div>
							</div>
						</div>
					`).join('') || '<p class="no-history">暂无检查记录</p>'}
				</div>
			</div>
		</div>
	`;
	
	document.body.insertAdjacentHTML('beforeend', modalHtml);
	document.getElementById('historyModal').style.display = 'block';
}

function closeModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.style.display = 'none';
	modal.remove();
}

// 在登录成功后添加模拟数据
function addDemoData() {
	// 添加病例记录
	const medicalRecords = [
		{
			id: '1',
			date: '2024-03-20',
			type: '眼科检查',
			diagnosis: '轻度近视',
			recommendation: '建议适当调整用眼习惯，每天户外活动2小时'
		},
		{
			id: '2',
			date: '2024-03-15',
			type: 'AI辅助诊断',
			diagnosis: '疑似早期青光眼',
			recommendation: '建议到医院进行详细检查'
		}
	];
	
	// 添加检查记录
	const checkHistory = [
		{
			date: '2024-03-20',
			type: '视力检查',
			image: 'path/to/image1.jpg',
			result: '左眼5.0，右眼5.1',
			confidence: 98
		},
		{
			date: '2024-03-15',
			type: '眼底检查',
			image: 'path/to/image2.jpg',
			result: '视网膜状态正常',
			confidence: 95
		}
	];
	
	sessionStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
	sessionStorage.setItem('checkHistory', JSON.stringify(checkHistory));
}
