import * as THREE from 'three';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';
import {ParametricGeometries} from 'three/examples/jsm/geometries/ParametricGeometries';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import {gsap} from 'gsap';
import * as CustomEase from 'gsap/CustomEase';
import {createNoise3D} from 'simplex-noise';
import { randFloat } from 'three/src/math/mathutils';

gsap.registerPlugin(CustomEase);

let renderer,
scene,
sizes,
aspectRatio,
camera,
raycaster,
pointer,
aLight,
defaultColor,
radius,
vertexNormals,
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
blobScale = 0.3;

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

    // controls = new OrbitControls(camera, renderer.domElement);

    // PLANE
    // const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 1, 1);
    // const planeMaterial = new THREE.MeshStandardMaterial();
    // planeMaterial.setValues({color: 0xffffff});
    // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.position.set(0, 0, -150);
    // scene.add(plane);
    
    // LIGHT

    // const pLight1 = new THREE.PointLight(0x8844dd, .6);
    // const pLight2 = new THREE.PointLight(0xeeff00, 1.2);
    // const pLight3 = new THREE.PointLight(0x0099ee, .7);
    const pLight4 = new THREE.PointLight(0xffffff, .4);
    // pLight1.position.set(-70, -55, 30);
    // pLight2.position.set(90, 60, 45);
    // pLight3.position.set(-50, 35, -55);
    pLight4.position.set(0, 0, -120);
    // scene.add(pLight1);
    // scene.add(pLight2);
    // scene.add(pLight3);
    scene.add(pLight4);

    const dLightR = new THREE.DirectionalLight(0xffffff, 0.5);
    dLightR.position.set(10, 5, 0);
    scene.add(dLightR);
    const dLightL = new THREE.DirectionalLight(0xffffff, 0.3);
    dLightL.position.set(-10, 0, 0);
    scene.add(dLightL);
    const dLightTop = new THREE.DirectionalLight(0xffffff, 0.5);
    dLightTop.position.set(0, 10, 0);
    scene.add(dLightTop);
    const dLightBot = new THREE.DirectionalLight(0xffffff, 0.6);
    // dLightBot.position.set(0, -5, 10);
    // scene.add(dLightBot);
    // const dLight5 = new THREE.DirectionalLight(0xffffff, 0.5);
    // dLight5.position.set(0, -10, 0);
    // scene.add(dLight5);
    // const dLight6 = new THREE.DirectionalLight(0xffffff, 0.6);
    // dLight6.position.set(0, 0, -10);
    // scene.add(dLight6);

    const hLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
    scene.add(hLight);

    // GEOMETRY
    const detalization = 15;

    // MATERIAL
    defaultColor = 0xaaaaaa;

    // SHADER
    // const shader = new THREE.ShaderMaterial({
    //     uniforms: {

    //     },
    //     vertexShader:   document.getElementById('mesh-vertex-shader').textContentm,
    //     fragmentShader: document.getElementById('mesh-fragment-shader').textContent
    // });

    // MESH
    radius = 3;
    vertexNormals = true;
    const loader = new THREE.TextureLoader();
    const texture = loader.load("/src/texture.jpg");
    texture.anisotropy = 16;
    scale = {
        x: 1.4,
        y: 1,
        z: 1.4
    }

    rows = 1;
    cols = 1;
    meshes = Array(rows);
    for (let i = 0; i < rows; i++) {
        meshes[i] = Array(cols);
        for (let j = 0; j < cols; j++)
        {
            let geometry2 = new THREE.IcosahedronGeometry(radius, detalization); 
            let material = new THREE.MeshPhongMaterial({ wireframe: false, map: texture });
            material.setValues({color: defaultColor});
            meshes[i][j] = new THREE.Mesh(geometry2, material);
            meshes[i][j].position.set(j*30-30*cols/2-(i%2*15), i*30-30*rows/2, -2);
            meshes[i][j].material.transparent = true;
            meshes[i][j].material.opacity = 1;
            scene.add(meshes[i][j]);
        }
    }
    if (rows === 1 && cols === 1) {
        meshes[0][0].position.set(0, 0, -2);
        meshes[0][0].scale.x = scale.x;
        meshes[0][0].scale.y = scale.y;
        meshes[0][0].scale.z = scale.z;

        gsap.fromTo(meshes[0][0].scale, {x: scale.x, y: scale.y, z: scale.z}, {x: scale.x * 1.3, y: scale.y * 0.8, z: scale.z * 1.3, duration: 5, ease: 'expo.inOut'});
        let tlScale = gsap.timeline({repeat: -1, repeatDelay: 0});
        tlScale.startTime(5);
        tlScale.to(meshes[0][0].scale, {x: scale.x * 0.7, y: scale.y * 1.4, z: scale.z * 0.7, duration: 5, ease: 'expo.inOut'})
        // .to(meshes[0][0].scale, {x: scale.x * 1.1, y: scale.y * 1.3, z: scale.z * 0.9, duration: 2, ease: 'expo.in'})
        .to(meshes[0][0].scale, {x: scale.x * 1.3, y: scale.y * 0.8, z: scale.z * 1.3, duration: 5, ease: 'expo.inOut'});
    }
    // meshes[0].material.setValues({opacity: 0});
    // meshes[0].material.transparent = true;
    // meshes[0].material.opacity = 1;

    // meshes[0].position.set(0, 0, -1);
    // meshes[1].position.set(4, 0, 0);
    // meshes[2].position.set(0, -2, 0);
    // meshes[3].position.set(0, 2, 0);

    // scene.add(meshes[0]);
    // scene.add(meshes[1]);
    // scene.add(meshes[2]);
    // scene.add(meshes[3]);

    // ANIMATION

    // let tl = gsap.timeline({repeat: -1, repeatDelay: 1});
    
    // for (let i = 0; i < meshes.length; i++)
    //     for (let j = 0; j < meshes[i].length; j++) {
    //         tl.fromTo(meshes[i][j].material, {opacity: 1}, {duration: 1, ease: 'sine.in', opacity: 0}, 0)
    //         .to(meshes[i][j].material, {duration: 1, ease: 'sine.in', opacity: 1}, '>');

    //         // gsap.to(meshes[i][j].material, {wireframe: true, duration: 0, ease: 'steps (1)'}, 0);
    //         let tlFrame1 = gsap.timeline({repeat: -1, repeatDelay: 3});
    //         tlFrame1.startTime(1);
    //         tlFrame1.to(meshes[i][j].material, {wireframe: false, duration: 3, ease: 'steps (1)'})
    //         .to(meshes[i][j].material, {wireframe: true, duration: 0, ease: 'steps (1)'});
    //         let tlFrame2 = gsap.timeline({repeat: -1, repeatDelay: 3});
    //         tlFrame2.startTime(4);
    //         tlFrame2.fromTo(meshes[i][j].material, {wireframe: true}, {wireframe: false, duration: 0, ease: 'steps (1)'})
    //         .to(meshes[i][j].material, {wireframe: true, duration: 3, ease: 'steps (1)'});
    
    //     }

    // let tl2 = gsap.timeline({repeat: -1});
    // tl2.fromTo(dLightTop.color, {r: 1, g: 0.5, b: 0}, {r: 0.5, g: 1, b: 0.2, duration: 1, ease: 'linear'})
    // .to(dLightTop.color, {r: 0.2, g: 0.5, b: 1, duration: 1, ease: 'linear'})
    // .to(dLightTop.color, {r: 1, g: 0.5, b: 0, duration: 1, ease: 'linear'});
    // let tl3 = gsap.timeline({repeat: -1});
    // tl3.fromTo(dLightL.color, {r: 0.2, g: 0.5, b: 1}, {r: 1, g: 0.5, b: 0, duration: 1, ease: 'linear'})
    // .to(dLightL.color, {r: 0.5, g: 1, b: 0.2, duration: 1, ease: 'linear'})
    // .to(dLightL.color, {r: 0.2, g: 0.5, b: 1, duration: 1, ease: 'linear'});
    // let tl4 = gsap.timeline({repeat: -1});
    // tl4.fromTo(dLightBot.color, {r: 0.5, g: 1, b: 0.2}, {r: 0.2, g: 0.5, b: 1, duration: 1, ease: 'linear'})
    // .to(dLightBot.color, {r: 1, g: 0.5, b: 0, duration: 1, ease: 'linear'})
    // .to(dLightBot.color, {r: 0.5, g: 1, b: 0.2, duration: 1, ease: 'linear'});
    // let tl5 = gsap.timeline({repeat: -1});
    // tl5.fromTo(dLightR.color, {r: 0.6, g: 0.7, b: 0.3}, {r: 0.3, g: 0.9, b: 0.1, duration: 1})
    // .to(dLightR.color, {r: 0, g: 0.4, b: 0.8, duration: 1, ease: 'linear'})
    // .to(dLightR.color, {r: 0.6, g: 0.7, b: 0.3, duration: 1, ease: 'linear'});

    
    // REFRESH & ANIMATE
    clock = new THREE.Clock();

    velocities = {
        x: Array.from(Array(1), () => randFloat(-0.5, 0.5)),
        y: Array.from(Array(1), () => randFloat(-0.5, 0.5)),
        z: Array.from(Array(1), () => randFloat(-0.5, 0.5))
    }

    intersectedObjects = Array.from(meshes.flat(), mesh => false);
}

function tick() {
    const delta = clock.getDelta();
    
    // meshes.forEach((mesh, i) => {
        // mesh.rotation.x += velocities.x[i] * delta;
        // mesh.rotation.y = velocities.y[i] * delta;
        // mesh.rotation.z = velocities.z[i] * delta;

            // mesh.material.opacity = 0.7;
    // });
    // console.log(currentScale);

    for (let i = 0; i < meshes.length; i++)
        for (let j = 0; j < meshes[i].length; j++) {
            meshes[i][j].rotation.x += delta * 0.3;
            meshes[i][j].rotation.y += velocities.y[0] * delta;
            // meshes[i][j].rotation.z += delta * -0.3;
        
            const position = meshes[i][j].geometry.attributes.position;
            const v = new THREE.Vector3();
            for ( let k = 0; k < position.count; k++ ) {
                v.fromBufferAttribute( position, k );
                // v.applyMatrix4( mesh.matrixWorld );
                let time = Date.now();
                v.normalize();
                let distance = meshes[0][0].geometry.parameters.radius + noise(
                    v.x + time * 0.0005,
                    v.y + time * 0.0005,
                    v.z + time * 0.0005) * blobScale;
                v.multiplyScalar(distance);
                position.setXYZ(k, v.x, v.y, v.z);
            }
            
            meshes[i][j].geometry.verticesNeedUpdate = true;
            meshes[i][j].geometry.attributes.position.needsUpdate = true;
            meshes[i][j].geometry.normalsNeedUpdate = true;
            if (vertexNormals)
                meshes[i][j].geometry.computeVertexNormals();
            // meshes[i][j].geometry.computeBoundingSphere();
            // meshes[0].geometry.computeVertexNormals();
        }
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(meshes.flat());

    for (let i = 0; i < meshes.length; i++)
        for (let j = 0; j < meshes[i].length; j++) {
            if (!(intersects.map((obj) => obj.object === meshes[i][j])).includes(true)) {
                if (intersectedObjects[i*rows+j]) {
                    console.log(intersects);
                    console.log(meshes[i][j]);
                    console.log(intersects.includes(meshes[i][j]));
                    // meshes[0].geometry.scale(1/1.2, 1/1.2, 1/1.2);
                    // const scale_ = meshes.flat()[i*rows+j].scale;
                    const params = meshes.flat()[i*rows+j].geometry.parameters;
                    // gsap.to(scale_, {duration: 0.3, x: scale_.x/1.2, y: scale_.y/1.2, z: scale_.z/1.2});
                    gsap.to(params, {duration: 0.3, radius: radius});
                    intersectedObjects[i*rows+j] = false;
                }
                meshes[i][j].material.color.set(defaultColor);
                // aLight.intensity = 0;
            }
        }
        
    for (let k = 0; k < intersects.length; k++) {
        intersects[k].object.material.color.set(0x00ff00);
        intersects[k].object.material.opacity = 1;
        // aLight.intensity = 0.3;
        // intersects[i].object.material.opacity.set(0);
        // if (!intersectedObjects[i*rows+j]) {
        let index = meshes.flat().findIndex((obj) => {return obj === intersects[k].object});
        if (!intersectedObjects[index]) {
            // console.log(intersectedObjects[index]);
        // console.log(intersects[k]);
        // console.log(meshes.flat());
        // console.log(meshes.flat().find((obj) => {return obj === intersects[k].object}))
            // intersects[k].object.geometry.scale(1.2, 1.2, 1.2);
            // const scale_ = intersects[k].object.scale;
            // gsap.to(scale_, {duration: 0.3, x: scale_.x*1.2, y: scale_.y*1.2, z: scale_.z*1.2});
            const params = intersects[k].object.geometry.parameters;
            gsap.to(params, {duration: 0.3, radius: radius * 1.2});
            // console.log(intersects[k].object.scale);
            // intersects[k].object.scale.x = 2;
            intersectedObjects[index] = true;
            // console.log(intersects[i].object);
            // console.log(intersectedObjects[i]);
        }
    }

    // controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
    // console.log(sizes.width);
}
// console.log(meshes);

init();
// console.log(meshes.flat());
renderer.render(scene, camera);
window.requestAnimationFrame(tick);
tick();