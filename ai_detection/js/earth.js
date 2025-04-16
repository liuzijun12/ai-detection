// 创建3D旋转地球
function initEarth() {
    const canvas = document.getElementById('earthCanvas');
    if (!canvas) return;

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);

        // 创建简单的地球材质（不使用复杂纹理）
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4dd0e1,
            emissive: 0x112244,
            specular: 0x333333,
            shininess: 25,
            opacity: 0.8,
            transparent: true
        });

        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        // 添加大气层效果
        const atmosphereGeometry = new THREE.SphereGeometry(5.2, 32, 32);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4dd0e1,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // 添加环境光和平行光
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        camera.position.z = 12;

        // 添加星空背景
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.03,
            transparent: true,
            opacity: 0.6
        });

        const starVertices = [];
        for(let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = -Math.random() * 1500;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        let animationId;
        // 动画循环
        function animate() {
            animationId = requestAnimationFrame(animate);
            earth.rotation.y += 0.001;
            atmosphere.rotation.y += 0.001;
            stars.rotation.y += 0.0002;
            renderer.render(scene, camera);
        }

        // 响应窗口大小变化
        function onWindowResize() {
            if (!canvas.parentElement) return;
            const width = canvas.parentElement.clientWidth;
            const height = canvas.parentElement.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        }

        window.addEventListener('resize', onWindowResize);
        
        // 清理函数
        function cleanup() {
            window.removeEventListener('resize', onWindowResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
        }

        // 开始动画
        onWindowResize();
        animate();

        // 返回清理函数
        return cleanup;
    } catch (error) {
        console.error('Error initializing Earth:', error);
        return () => {};
    }
}

// 确保只初始化一次
let earthCleanup = null;
function initEarthOnce() {
    if (earthCleanup) {
        earthCleanup();
    }
    earthCleanup = initEarth();
}

// 页面加载完成后初始化地球
document.addEventListener('DOMContentLoaded', initEarthOnce); 