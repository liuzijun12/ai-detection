$(function(){
	map();
    leidatu();
    wuran();
    huaxing();
	zhexian();
    newsScroll();
});

// 地图函数
function map() {
		var myChart = echarts.init(document.getElementById('map'));
	
	// 添加医院坐标数据 - 放在provinceData之前
	const hospitalData = [
		{ name: '北京同仁医院', value: [116.417, 39.921], city: '北京', rank: '三级甲等', specialty: '眼科全科、干眼病', patients: '年门诊量超过200万' },
		{ name: '中山大学中山眼科中心', value: [113.264, 23.129], city: '广州', rank: '三级甲等', specialty: '白内障、干眼病', patients: '年手术量超过10万' },
		{ name: '复旦大学眼耳鼻喉科医院', value: [121.473, 31.230], city: '上海', rank: '三级甲等', specialty: '眼底病、干眼病', patients: '年门诊量超过180万' },
		{ name: '温州医科大学附属眼视光医院', value: [120.699, 28.001], city: '温州', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年手术量超过8万' },
		{ name: '四川大学华西医院眼科', value: [104.065, 30.659], city: '成都', rank: '三级甲等', specialty: '干眼病、青光眼', patients: '年门诊量超过150万' },
		{ name: '天津市眼科医院', value: [117.200, 39.084], city: '天津', rank: '三级甲等', specialty: '青光眼、干眼病', patients: '年门诊量超过100万' },
		{ name: '武汉大学人民医院眼科', value: [114.316, 30.581], city: '武汉', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年门诊量超过90万' },
		{ name: '郑州大学第一附属医院眼科', value: [113.624, 34.746], city: '郑州', rank: '三级甲等', specialty: '干眼病、青光眼', patients: '年门诊量超过80万' },
		{ name: '南京医科大学第一附属医院眼科', value: [118.796, 32.059], city: '南京', rank: '三级甲等', specialty: '干眼病、白内障', patients: '年门诊量超过85万' },
		{ name: '哈尔滨医科大学第一附属医院眼科', value: [126.535, 45.803], city: '哈尔滨', rank: '三级甲等', specialty: '干眼病、青光眼', patients: '年门诊量超过70万' }
	];

	// 整合所有省份的医疗资源数据
	const provinceData = {
		'北京': { 
			total: 150,
			hospitals: ['北京同仁医院', '北京协和医院', '北京大学人民医院'],
			level: 5  // 最高级
		},
		'上海': { 
			total: 130,
			hospitals: ['上海第一人民医院', '复旦大学眼耳鼻喉科医院', '上海交通大学医学院附属新华医院'],
			level: 5
		},
		'广东': { 
			total: 120,
			hospitals: ['中山大学中山眼科中心', '广州爱尔眼科医院', '深圳市眼科医院'],
			level: 4
		},
		'浙江': { 
			total: 95,
			hospitals: ['浙江大学医学院附属第二医院', '温州医科大学附属眼视光医院', '杭州市第一人民医院'],
			level: 4
		},
		'江苏': { 
			total: 115,
			hospitals: ['南京医科大学第一附属医院', '苏州大学附属第一医院眼科中心'],
			level: 4
		},
		'四川': { 
			total: 110,
			hospitals: ['四川大学华西医院', '成都市第一人民医院'],
			level: 4
		},
		'湖北': { 
			total: 105,
			hospitals: ['武汉大学人民医院', '武汉爱尔眼科医院'],
			level: 4
		},
		'陕西': { 
			total: 95,
			hospitals: ['西安市第一医院', '陕西省眼科医院'],
			level: 3
		},
		'山东': { 
			total: 90,
			hospitals: ['山东省眼科医院', '青岛眼科医院'],
			level: 3
		},
		'河南': { 
			total: 85,
			hospitals: ['河南省立眼科医院', '郑州大学第一附属医院'],
			level: 3
		},
		'辽宁': { 
			total: 80,
			hospitals: ['沈阳爱尔眼科医院', '中国医科大学附属第一医院'],
			level: 3
		},
		'重庆': { 
			total: 75,
			hospitals: ['重庆医科大学附属第一医院', '陆军军医大学西南医院'],
			level: 3
		},
		'福建': {
			total: 70,
			hospitals: ['厦门大学附属厦门眼科中心', '福建医科大学附属第一医院'],
			level: 3
		},
		'湖南': {
			total: 68,
			hospitals: ['中南大学湘雅医院', '湖南省人民医院'],
			level: 3
		},
		'天津': {
			total: 65,
			hospitals: ['天津医科大学眼科医院', '天津市眼科医院'],
			level: 3
		},
		'安徽': {
			total: 60,
			hospitals: ['安徽医科大学第一附属医院', '合肥市第一人民医院'],
			level: 2
		},
		'江西': {
			total: 55,
			hospitals: ['南昌大学第一附属医院', '江西省人民医院'],
			level: 2
		},
		'黑龙江': {
			total: 52,
			hospitals: ['哈尔滨医科大学附属第一医院', '黑龙江省眼科医院'],
			level: 2
		},
		'云南': {
			total: 50,
			hospitals: ['昆明医科大学第一附属医院', '云南省第一人民医院'],
			level: 2
		},
		'河北': {
			total: 48,
			hospitals: ['河北医科大学第一医院', '石家庄市第一医院'],
			level: 2
		},
		'山西': {
			total: 45,
			hospitals: ['山西医科大学第一医院', '太原市眼科医院'],
			level: 2
		},
		'广西': {
			total: 42,
			hospitals: ['广西医科大学第一附属医院', '南宁市第一人民医院'],
			level: 2
		},
		'吉林': {
			total: 40,
			hospitals: ['吉林大学第一医院', '长春市人民医院'],
			level: 2
		},
		'内蒙古': {
			total: 35,
			hospitals: ['内蒙古医科大学附属医院', '呼和浩特市第一医院'],
			level: 1
		},
		'贵州': {
			total: 32,
			hospitals: ['贵州医科大学附属医院', '贵阳市第一人民医院'],
			level: 1
		},
		'新疆': {
			total: 30,
			hospitals: ['新疆医科大学第一附属医院', '乌鲁木齐市人民医院'],
			level: 1
		},
		'甘肃': {
			total: 28,
			hospitals: ['兰州大学第一医院', '甘肃省人民医院'],
			level: 1
		},
		'海南': {
			total: 25,
			hospitals: ['海南医学院附属医院', '海口市人民医院'],
			level: 1
		},
		'宁夏': {
			total: 20,
			hospitals: ['宁夏医科大学总医院', '银川市第一人民医院'],
			level: 1
		},
		'青海': {
			total: 18,
			hospitals: ['青海大学附属医院', '青海省人民医院'],
			level: 1
		},
		'西藏': {
			total: 15,
			hospitals: ['西藏自治区人民医院', '拉萨市人民医院'],
			level: 1
		},
		'台湾': {
			total: 85,  // 医疗资源总数
			hospitals: ['台北荣民总医院', '台大医院', '高雄长庚纪念医院'],
			level: 3,   // 医疗资源等级
		            itemStyle: {
		                normal: {
					areaColor: '#91cc75'  // 对应level 3的颜色
				}
			}
		}
	};

	var option = {
		backgroundColor: 'transparent',
		title: {
			text: '全国眼科医疗资源分布',
			left: 'center',
			textStyle: {
				color: '#fff'
			}
		},
		tooltip: {
			trigger: 'item',
			showDelay: 0,
			hideDelay: 0,
			enterable: true,
			confine: true,
			show: true,  // 确保tooltip显示
			alwaysShowContent: false,
			triggerOn: 'mousemove',
			position: function (point, params, dom, rect, size) {
				// 处理提示框位置
				let [x, y] = point;
				const viewWidth = size.viewSize[0];
				const viewHeight = size.viewSize[1];
				const contentWidth = size.contentSize[0];
				const contentHeight = size.contentSize[1];
				
				// 右边界处理
				if (x + contentWidth + 20 > viewWidth) {
					x = x - contentWidth - 20;
				} else {
					x = x + 20;
				}
				
				// 底部边界处理
				if (y + contentHeight + 20 > viewHeight) {
					y = y - contentHeight - 10;
				} else {
					y = y + 10;
				}
				
				return [x, y];
			},
			formatter: function(params) {
				if (params.seriesType === 'map') {
					const data = provinceData[params.name];
					if (data) {
						return `
							<div style="padding: 10px">
								<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #fff">
									${params.name}
								</div>
								<div style="color: #bad0e2; font-size: 14px; line-height: 1.5">
									<div>眼科医院总数：${data.total}家</div>
									<div>代表性医院：${data.hospitals.join('、')}</div>
									<div>医疗资源等级：${data.level}级</div>
								</div>
							</div>
						`;
					}
				} else if (params.seriesType === 'scatter') {
					const hospital = params.data;
					return `
						<div style="padding: 10px">
							<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #fff">
								${hospital.name}
							</div>
							<div style="color: #bad0e2; font-size: 14px; line-height: 1.5">
								<div>所在城市：${hospital.city}</div>
								<div>医院等级：${hospital.rank}</div>
								<div>特色专科：${hospital.specialty}</div>
								<div>就诊情况：${hospital.patients}</div>
							</div>
						</div>
					`;
				}
			},
			backgroundColor: 'rgba(12,26,63,0.9)',
			borderColor: 'rgba(77,208,225,0.3)',
			borderWidth: 1,
			padding: 0,
			textStyle: {
				color: '#fff',
				fontSize: 14
			},
			extraCssText: 'box-shadow: 0 4px 20px rgba(0,194,255,0.2); border-radius: 4px;'
		},
		visualMap: {
			min: 0,
			max: 150,
			left: 'left',
			top: 'bottom',
			text: ['医疗资源丰富', '医疗资源较少'],
			calculable: true,
			inRange: {
				color: ['#50a3ba', '#eac736', '#d94e5d']
			},
			textStyle: {
				color: '#fff'
			},
			selectedMode: 'multiple',
			showLabel: true,
			itemWidth: 20,
			itemHeight: 140,
			borderWidth: 1,
			borderColor: '#153269',
			backgroundColor: 'rgba(20, 28, 66, 0.6)',
			padding: 10,
			pieces: [
				{min: 120, label: '医疗资源极其丰富'},  // 5级
				{min: 90, max: 120, label: '医疗资源非常丰富'},  // 4级
				{min: 60, max: 90, label: '医疗资源较为丰富'},   // 3级
				{min: 30, max: 60, label: '医疗资源一般'},      // 2级
				{max: 30, label: '医疗资源相对较少'}           // 1级
			]
		},
		series: [{
			name: '医疗资源',
			type: 'map',
			map: 'china',
			zoom: 1.2,
			center: [104.5, 36.5],
			roam: false,
			selectedMode: 'single',
		            label: {
		                    show: true,
		                        color: '#fff',
				fontSize: 10
			},
			itemStyle: {
				normal: {
					areaColor: '#0c1a3f',
					borderColor: '#1d3d5e',
					borderWidth: 1
				},
				emphasis: {
					areaColor: null,  // 保持原有颜色
					borderColor: '#fff',  // 白色边框
					borderWidth: 2,       // 加粗边框
					shadowBlur: 10,       // 轻微阴影
					shadowColor: 'rgba(255, 255, 255, 0.5)'
				}
			},
			data: Object.keys(provinceData).map(province => ({
				name: province,
				value: provinceData[province].total,
		            itemStyle: {
		                normal: {
						areaColor: provinceData[province].level === 5 ? '#d94e5d' :
								 provinceData[province].level === 4 ? '#eac736' :
								 provinceData[province].level === 3 ? '#91cc75' :
								 provinceData[province].level === 2 ? '#73c0de' : '#50a3ba'
					}
				}
			}))
		},
		{
			name: '重点医院',
			type: 'scatter',
			coordinateSystem: 'geo',
		            symbol: 'circle',
			symbolSize: 8,
		            label: {
		                show: true,
				position: 'right',
				formatter: '{b}',
				fontSize: 10,
		                color: '#fff',
				distance: 5,
				backgroundColor: 'rgba(0,0,0,0.3)',
				padding: [2, 4]
			},
			itemStyle: {
				color: '#00ffff',
				borderColor: '#fff',
		                borderWidth: 1,
				shadowBlur: 5,
				shadowColor: 'rgba(0, 255, 255, 0.3)'
			},
			emphasis: {
				scale: 1.5,
				label: {
					show: true,
					fontSize: 12,
					fontWeight: 'bold'
				},
				itemStyle: {
					color: '#00ffff',
					borderColor: '#fff',
					borderWidth: 2,
					shadowBlur: 10,
					shadowColor: 'rgba(0, 255, 255, 0.5)'
				}
			},
			zlevel: 2,
			z: 10,
			data: hospitalData,
			tooltip: {
				formatter: function(params) {
					return `
						<div style="padding: 8px">
							<h4 style="margin: 0 0 8px">${params.data.name}</h4>
							<p>所在城市：${params.data.city}</p>
							<p>医院等级：${params.data.rank}</p>
							<p>特色专科：${params.data.specialty}</p>
							<p>就诊情况：${params.data.patients}</p>
						</div>
					`;
				}
			}
		}]
	};

	// 添加点击事件
	myChart.on('click', 'series.scatter', function(params) {
		// 可以在这里添加点击医院后的交互，比如跳转到详情页
		console.log('点击了医院：', params.data.name);
	});

	myChart.setOption(option);
	
	// 添加visualMap的hover事件
	myChart.on('mousemove', 'visualMap', function(params) {
		const value = params.value;
		const provinces = Object.keys(provinceData).filter(province => {
			const total = provinceData[province].total;
			return total >= value && total <= value + 30;
		});
		
		myChart.dispatchAction({
			type: 'highlight',
			seriesIndex: 0,
			dataIndex: provinces.map(province => 
				Object.keys(provinceData).indexOf(province)
			)
		});
	});

	myChart.on('globalout', function() {
		myChart.dispatchAction({
			type: 'downplay',
			seriesIndex: 0
		});
	});

	window.addEventListener("resize", function() {
		myChart.resize();
	});
}

// 雷达图函数
function leidatu() {
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

function wuran() {
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

function zhexian() {
	var myChart = echarts.init(document.getElementById('zhexian'));
	option = {
		// 折线图配置
	};
	myChart.setOption(option);
	window.addEventListener("resize", function() {
		myChart.resize();
	});
}

// 添加新闻轮播函数
function newsScroll() {
    const newsData = [
        {
            title: "AI 深度学习模型在青光眼早期诊断中的应用研究",
            journal: "Nature Medicine",
            date: "2024-03-18",
            url: "https://www.nature.com/articles/s41591-024-02737-w",
            detail: "研究发现新的AI模型可提前2-3年预测青光眼的发展"
        },
        {
            title: "新型生物材料在角膜修复中的突破性进展",
            journal: "Science",
            date: "2024-03-15",
            url: "https://www.science.org/doi/10.1126/science.adg9130",
            detail: "可降解生物材料在角膜修复中展现出良好效果"
        },
        {
            title: "基于干细胞技术的视网膜再生研究新进展",
            journal: "Cell",
            date: "2024-03-14",
            url: "https://www.cell.com/cell/fulltext/S0092-8674(24)00133-4",
            detail: "干细胞治疗有望治愈视网膜退化性疾病"
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

    let currentNewsIndex = 0;
    const newsContainer = document.querySelector('.news-container');
    
    function updateNewsDisplay() {
        let html = '';
        // 显示当前可见的4条新闻
        for(let i = 0; i < 4; i++) {
            const index = (currentNewsIndex + i) % newsData.length;
            const news = newsData[index];
            html += `
                <div class="news-item" onclick="window.open('${news.url}', '_blank')">
                    <div class="news-title">${news.title}</div>
                    <div class="news-info">
                        <span class="news-journal">${news.journal}</span>
                        <span class="news-date">${news.date}</span>
                    </div>
                </div>
            `;
        }
        newsContainer.innerHTML = html;
    }

    // 自动轮播函数
    function autoScroll() {
        currentNewsIndex = (currentNewsIndex + 1) % newsData.length;
        updateNewsDisplay();
    }

    // 初始显示
    updateNewsDisplay();
    
    // 设置定时器，每5秒滚动一次
    let scrollTimer = setInterval(autoScroll, 5000);

    // 鼠标悬停时暂停轮播
    newsContainer.addEventListener('mouseenter', () => {
        clearInterval(scrollTimer);
    });

    // 鼠标离开时恢复轮播
    newsContainer.addEventListener('mouseleave', () => {
        scrollTimer = setInterval(autoScroll, 5000);
	});
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
