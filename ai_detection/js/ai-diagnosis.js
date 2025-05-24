document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const startDiagnosis = document.getElementById('startDiagnosis');
    const resultSection = document.getElementById('resultSection');
    const previewImage = document.getElementById('previewImage');
    const resultContent = document.getElementById('resultContent');

    // 检查登录状态
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'welcome.html';
    }

    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        if (document.getElementById('uploadPlaceholder').style.display !== 'none') {
            document.getElementById('imageInput').click();
        }
    });

    // 处理拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('previewImg').src = e.target.result;
                document.getElementById('uploadPlaceholder').style.display = 'none';
                document.getElementById('imagePreview').style.display = 'flex';
            }
            reader.readAsDataURL(file);
        }
    });

    // 处理文件选择
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // 处理文件
    async function handleFile(file) {
        if (!file) {
            showError('请选择图片');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        showLoading();

        fetch('http://localhost:5001/predict', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status === 401 ? '请先登录' : '预测失败');
        try {
            // 1. 首先调用预测接口
            const predictResponse = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!predictResponse.ok) {
                throw new Error(predictResponse.status === 401 ? '请先登录' : '预测失败');
            }

            const predictData = await predictResponse.json();

            if (predictData.error) {
                showError(predictData.error);
                return;
            }

            // 2. 获取图片的base64数据
            const base64Image = await getBase64FromFile(file);

            // 3. 准备要保存的数据
            const resultData = {
                left_eye: {
                    image: base64Image,
                    results: predictData.predictions
                },
                right_eye: {
                    image: null,
                    results: {}
                },
                description: generateDescription(predictData.predictions)
            };

            // 4. 保存到数据库
            const saveResponse = await fetch('http://localhost:5001/save_detection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(resultData)
            });

            if (!saveResponse.ok) {
                throw new Error('保存结果失败');
            }

            const saveData = await saveResponse.json();
            if (saveData.success) {
                showSuccess('检测结果已保存');
                // 5. 显示结果
                displayResults(predictData.predictions);
            } else {
                throw new Error(saveData.error || '保存失败');
            }

        } catch (error) {
            hideLoading();
            showError(error.message);
            if (error.message === '请先登录') {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        } finally {
            hideLoading();
        }
    }

    // 将File对象转换为Base64字符串
    function getBase64FromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 开始诊断
    startDiagnosis.addEventListener('click', async () => {
        startDiagnosis.disabled = true;
        resultSection.style.display = 'flex';
        
        // 这里添加实际的AI诊断API调用
        try {
            // 模拟API调用
            await simulateDiagnosis();
        } catch (error) {
            console.error('诊断失败:', error);
            alert('诊断失败，请重试');
        } finally {
            startDiagnosis.disabled = false;
        }
    });
});

// 模拟诊断过程
async function simulateDiagnosis() {
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = '<p>正在分析图像...</p>';
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    resultContent.innerHTML = `
        <div class="diagnosis-detail">
            <h4>检测到的可能问题：</h4>
            <ul>
                <li>视网膜状态：正常</li>
                <li>眼压指标：偏高</li>
                <li>晶状体：轻微混浊</li>
            </ul>
            <h4>建议：</h4>
            <p>1. 建议及时到医院进行详细检查</p>
            <p>2. 注意控制用眼时间</p>
            <p>3. 保持良好的作息习惯</p>
        </div>
    `;
}

// 重置诊断
function resetDiagnosis() {
    document.getElementById('imageInput').value = '';
    document.getElementById('previewImg').src = '';
    document.getElementById('uploadPlaceholder').style.display = 'flex';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
}

// 保存结果
function saveResult() {
    const resultContent = document.getElementById('resultContent').innerHTML;
    const blob = new Blob([resultContent], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '诊断结果.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 显示预览图
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('imagePreview').style.display = 'flex';
            // 显示按钮
            document.getElementById('previewActions').style.display = 'flex';
        }
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    document.getElementById('previewImg').src = '';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
}

async function startDiagnosis() {
    const fileInput = document.getElementById('imageInput');
    if (!fileInput.files.length) {
        showError('请先选择图片');
        return;
    }

    const file = fileInput.files[0];
    showLoading();

    try {
        console.log('Starting diagnosis process...'); // 调试信息

        // 1. 获取图片的base64数据
        const base64Image = await getBase64FromFile(file);
        console.log('Image converted to base64'); // 调试信息

        // 2. 调用预测接口
        const formData = new FormData();
        formData.append('file', file);

        console.log('Sending prediction request...'); // 调试信息
        const predictResponse = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            body: formData,
            credentials: 'include'  // 重要：包含凭证
        });

        console.log('Prediction response status:', predictResponse.status); // 调试信息

        if (!predictResponse.ok) {
            if (predictResponse.status === 401) {
                throw new Error('请先登录');
            }
            throw new Error('预测失败');
        }

        const predictData = await predictResponse.json();
        console.log('Prediction results:', predictData); // 调试信息

        if (predictData.error) {
            throw new Error(predictData.error);
        }

        // 3. 准备保存到数据库的数据
        const resultData = {
            left_eye: {
                image: base64Image,
                results: predictData.predictions
            },
            right_eye: {
                image: null,
                results: {}
            },
            description: generateDescription(predictData.predictions)
        };

        console.log('Prepared data for saving:', {
            ...resultData,
            left_eye: {
                ...resultData.left_eye,
                image: 'base64_image_data_omitted' // 省略base64数据的输出
            }
        }); // 调试信息

        // 4. 保存到数据库
        console.log('Sending save request...'); // 调试信息
        const saveResponse = await fetch('http://localhost:5001/save_detection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',  // 重要：包含凭证
            body: JSON.stringify(resultData)
        });

        console.log('Save response status:', saveResponse.status); // 调试信息

        if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            console.error('Save error response:', errorData); // 调试信息
            throw new Error(errorData.error || '保存结果失败');
        }

        const saveData = await saveResponse.json();
        console.log('Save response data:', saveData); // 调试信息

        if (saveData.success) {
            showSuccess('检测结果已保存');
            // 5. 显示结果
            displayResults(predictData.predictions);
            // 6. 跳转到病例历史页面
            setTimeout(() => {
                window.location.href = 'case-history.html';
            }, 2000);
        } else {
            throw new Error(saveData.error || '保存失败');
        }

    } catch (error) {
        console.error('Error details:', error); // 调试信息
        showError(error.message);
        if (error.message === '请先登录') {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    } finally {
        hideLoading();
    }
}

// 添加显示/隐藏加载状态的函数
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在分析...';
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// 添加错误提示函数
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function displayResults(predictions) {
    const resultSection = document.getElementById('resultSection');
    const leftProbabilitiesContainer = document.getElementById('leftEyeProbabilities');

    // 清空之前的结果
    leftProbabilitiesContainer.innerHTML = '';

    // 设置图片源
    const leftEyeImg = document.getElementById('leftEyeResult');
    const uploadedImage = document.getElementById('previewImg');
    if (uploadedImage) {
        leftEyeImg.src = uploadedImage.src;
    }

    // 处理预测结果
    const sortedPredictions = Object.entries(predictions)
        .sort(([, a], [, b]) => b - a);

    const diseaseNames = {
        'N': '正常',
        'D': '糖尿病型眼病',
        'G': '青光眼',
        'C': '白内障',
        'A': '年龄相关性黄斑变性',
        'H': '高血压型眼病',
        'M': '近视',
        'O': '其他疾病'
    };

    sortedPredictions.forEach(([disease, probability]) => {
        const probabilityBar = document.createElement('div');
        probabilityBar.className = 'probability-bar';
        const percentage = (probability * 100).toFixed(2);
        const barColor = getBarColor(probability);

        probabilityBar.innerHTML = `
            <div class="disease-name">${diseaseNames[disease] || disease}</div>
            <div class="probability-track">
                <div class="probability-fill" style="width: ${percentage}%; background-color: ${barColor}"></div>
            </div>
            <div class="probability-value" style="color: ${barColor}">${percentage}%</div>
        `;
        leftProbabilitiesContainer.appendChild(probabilityBar);
    });

    resultSection.style.display = 'block';
    document.getElementById('previewActions').style.display = 'none';
}

function generateDescription(predictions) {
    const highestPrediction = Object.entries(predictions)
        .sort(([, a], [, b]) => b - a)[0];

    const diseaseNames = {
        'N': '正常',
        'D': '糖尿病型眼病',
        'G': '青光眼',
        'C': '白内障',
        'A': '年龄相关性黄斑变性',
        'H': '高血压型眼病',
        'M': '近视',
        'O': '其他疾病'
    };

    return `检测结果概要：\n主要发现：${diseaseNames[highestPrediction[0]] || highestPrediction[0]} ${(highestPrediction[1] * 100).toFixed(2)}%`;
}

function getBarColor(probability) {
    if (probability >= 0.5) {
        return '#ff4d4f'; // 高风险 - 红色
    } else if (probability >= 0.3) {
        return '#faad14'; // 中等风险 - 黄色
    } else {
        return '#52c41a'; // 低风险 - 绿色
    }
}