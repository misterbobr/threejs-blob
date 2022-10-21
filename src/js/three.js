import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import {gsap} from 'gsap';
import {createNoise3D} from 'simplex-noise';
import { randFloat } from 'three/src/math/mathutils';
import { Vector2 } from 'three';


let renderer,
scene,
sizes,
aspectRatio,
camera,
raycaster,
pointer,
defaultColor,
radius,
vertexNormals = false,
rows,
cols,
meshes,
controls,
intersectedObjects,
scale,
container = document.getElementById("canvas_container"),
noise = new createNoise3D(),
velocities,
clock,
blobScale = {scale: 0.3};

function init() {
    scene = new THREE.Scene();

    // RESIZE EVENT
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    }

    window.addEventListener('resize', () =>
    {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // RAYCASTER
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    pointer.x = 0;
    pointer.y = 0;
    window.addEventListener('pointermove', (event) =>
    {
        pointer.x = (event.clientX / sizes.width) * 2 - 1;
        pointer.y = - (event.clientY / sizes.height) * 2 + 1;
        meshes[0][0].position.set(0 - pointer.x * 1.5, 0 - pointer.y * 2, -2 + pointer.x * 1.5);
    });

    // RENERER
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setClearColor(0xcccccc, 1);
    document.body.appendChild(renderer.domElement);

    // CAMERA
    aspectRatio = sizes.width / sizes.height;
    camera = new THREE.PerspectiveCamera( 
        45, aspectRatio, 0.1, 1000 );
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    
    // LIGHT

    const dLightR = new THREE.PointLight(0xffffff, 1);
    dLightR.position.set(15, 6, 0);
    scene.add(dLightR);
    const dLightBack = new THREE.PointLight(0xffffff, 1.5);
    dLightBack.position.set(10, 15, -20);
    scene.add(dLightBack);
    const dLightTop = new THREE.PointLight(0xffffff, 1.2);
    dLightTop.position.set(-10, 10, -5);
    scene.add(dLightTop);
    // const dLightBot = new THREE.DirectionalLight(0xffffff, 0.6);
    // dLightBot.position.set(0, -5, 10);
    // scene.add(dLightBot);
    // const dLight5 = new THREE.DirectionalLight(0xffffff, 0.5);
    // dLight5.position.set(0, -10, 0);
    // scene.add(dLight5);
    // const dLight6 = new THREE.DirectionalLight(0xffffff, 0.6);
    // dLight6.position.set(0, 0, -10);
    // scene.add(dLight6);

    // const hLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    // scene.add(hLight);

    // SHADER
    // const shaderMaterial = new THREE.ShaderMaterial({
    //     uniforms: {
    //         // . . .
    //     },
    //     vertexShader:   document.getElementById('vertex-shader').textContent,
    //     fragmentShader: document.getElementById('fragment-shader').textContent
    // });

    // GEOMETRY
    const detalization = 180;

    // MATERIAL
    defaultColor = 0x404040;

    // MESH
    radius = 3;
    // vertexNormals = true;
    const loader = new THREE.TextureLoader();
    const texture = loader.load("/src/coal-texture.jpg");
    const normal = loader.load("/src/NormalMap.png");
    const displacement = loader.load("/src/DisplacementMap.png");
    const ao = loader.load("/src/AmbientOcclusionMap.png");
    const specular = loader.load("/src/SpecularMap.png");
    texture.anisotropy = 16;
    scale = {
        x: 1.4,
        y: 1,
        z: 1.4,
    }

    rows = 1;
    cols = 1;
    meshes = Array(rows);
    for (let i = 0; i < rows; i++) {
        meshes[i] = Array(cols);
        for (let j = 0; j < cols; j++)
        {
            let geometry2 = new THREE.SphereGeometry(radius, detalization, detalization); 
            // let material = new THREE.MeshPhongMaterial({
            //     wireframe: false,
            //     // map: texture,
            //     color: defaultColor,
            //     emissive: 0x000000,
            //     specular: 0x202020,
            //     shininess: 50
            // });
            let material = new THREE.MeshPhysicalMaterial({
                color: defaultColor,
                bumpMap: texture,
                bumpScale: 0.0,
                clearcoatMap: texture,
                clearcoatNormalMap: normal,
                clearcoatNormalScale: new Vector2(0.1, 0.3),
                displacementMap: displacement,
                displacementScale: 0,
                roughness: 0.8,
                metalness: 1,
                reflectivity: 1,
                clearcoat: 0.7,
                clearcoatRoughness: 0.5,
                flatShading: 1
            });
            // let material = new THREE.MeshStandardMaterial({
            //     color: defaultColor,
            //     bumpMap: texture,
            //     bumpScale: 0.01,
            //     // normalMap: normal,
            //     displacementMap: displacement,
            //     displacementScale: 1,
            //     aoMap: ao,
            //     aoMapIntensity: 0,
            //     roughness: 0.4,
            //     metalness: 0.7,
            //     flatShading: 0
            // });
            meshes[i][j] = new THREE.Mesh(geometry2, material);
            meshes[i][j].position.set(j*30-30*cols/2-(i%2*15), i*30-30*rows/2, -2);
            // meshes[i][j].material.setValues({transparent: true, opacity: 1});
            // meshes[i][j].material.opacity = 1;
            scene.add(meshes[i][j]);
        }
    }
    if (rows === 1 && cols === 1) {
        meshes[0][0].position.set(0, 0, -2);
        meshes[0][0].scale.x = scale.x;
        meshes[0][0].scale.y = scale.y;
        meshes[0][0].scale.z = scale.z;

            gsap.fromTo(meshes[0][0].scale, {x: scale.x, y: scale.y, z: scale.z}, {x: scale.x * 1.3, y: scale.y * 1, z: scale.z * 1.3, duration: 5, ease: 'expo.inOut'});
            let tlScale = gsap.timeline({repeat: -1, repeatDelay: 0});
            tlScale.startTime(5);
            tlScale.to(meshes[0][0].scale, {x: scale.x * 0.8, y: scale.y * 1.4, z: scale.z * 0.8, duration: 5, ease: 'expo.inOut'})
            .to(meshes[0][0].scale, {x: scale.x * 1.3, y: scale.y * 1, z: scale.z * 1.3, duration: 5, ease: 'expo.inOut'});
    }



    // REFRESH & ANIMATE
    clock = new THREE.Clock();

    velocities = {
        x: Array.from(Array(1), () => randFloat(-0.5, 0.5)),
        y: Array.from(Array(1), () => randFloat(-0.5, 0.5)),
        z: Array.from(Array(1), () => randFloat(-0.5, 0.5))
    }
    
    intersectedObjects = Array.from(meshes.flat(), mesh => false);

    const duration = 3;
    const multiplier = 1.6;
    let blobScaleTl = gsap.timeline({repeat: -1, repeatDelay: 0});
    blobScaleTl.startTime(duration);
    gsap.fromTo(blobScale, {scale: blobScale.scale}, {scale: blobScale.scale * multiplier, duration: duration, ease: 'sine.inOut'});
    blobScaleTl.to(blobScale, {scale: blobScale.scale / multiplier**2, duration: duration, ease: 'sine.inOut'})
    .to(blobScale, {scale: blobScale.scale * multiplier, duration: duration, ease: 'sine.inOut'});
}

function tick() {
    const delta = clock.getDelta();

    for (let i = 0; i < meshes.length; i++)
        for (let j = 0; j < meshes[i].length; j++) {
            meshes[i][j].rotation.x += delta * 0.3;
            meshes[i][j].rotation.y += velocities.y[0] * delta;
            // meshes[i][j].rotation.z += delta * -0.3;
        
            const position = meshes[i][j].geometry.attributes.position;
            const v = new THREE.Vector3();
            for ( let k = 0; k < position.count; k++ ) {
                v.fromBufferAttribute( position, k );
                let time = Date.now();
                v.normalize();
                let distance = meshes[0][0].geometry.parameters.radius + noise(
                    v.x + time * 0.0005,
                    v.y + time * 0.0005,
                    v.z + time * 0.0005) * blobScale.scale;
                v.multiplyScalar(distance);
                position.setXYZ(k, v.x, v.y, v.z);
            }
            
            meshes[i][j].geometry.verticesNeedUpdate = true;
            meshes[i][j].geometry.attributes.position.needsUpdate = true;
            meshes[i][j].geometry.normalsNeedUpdate = true;
            if (vertexNormals)
                meshes[i][j].geometry.computeVertexNormals();
        }
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(meshes.flat());

    for (let i = 0; i < meshes.length; i++)
        for (let j = 0; j < meshes[i].length; j++) {
            if (!(intersects.map((obj) => obj.object === meshes[i][j])).includes(true)) {
                if (intersectedObjects[i*rows+j]) {
                    // console.log(intersects);
                    // console.log(meshes[i][j]);
                    // console.log(intersects.includes(meshes[i][j]));
                    const params = meshes.flat()[i*rows+j].geometry.parameters;
                    gsap.to(params, {duration: 0.3, radius: radius});
                    intersectedObjects[i*rows+j] = false;
                }
                meshes[i][j].material.color.set(defaultColor);
            }
        }
        
    for (let k = 0; k < intersects.length; k++) {
        intersects[k].object.material.color.set(0x00ff00);
        intersects[k].object.material.opacity = 1;
        let index = meshes.flat().findIndex((obj) => {return obj === intersects[k].object});
        if (!intersectedObjects[index]) {
            const params = intersects[k].object.geometry.parameters;
            gsap.to(params, {duration: 0.3, radius: radius * 1.2});
            intersectedObjects[index] = true;
        }
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

init();
renderer.render(scene, camera);
window.requestAnimationFrame(tick);
tick();