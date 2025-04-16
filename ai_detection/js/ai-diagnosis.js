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
    function handleFile(file) {
        if (!file) {
            showError('请选择图片');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        showLoading();

        fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status === 401 ? '请先登录' : '预测失败');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            if (data.error) {
                showError(data.error);
            } else {
                displayResults(data.predictions);
                document.getElementById('previewActions').style.display = 'none';
                document.getElementById('resultSection').style.display = 'block';
            }
        })
        .catch(error => {
            hideLoading();
            showError(error.message);
            if (error.message === '请先登录') {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
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

function startDiagnosis() {
    const fileInput = document.getElementById('imageInput');
    if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
    } else {
        showError('请先选择图片');
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