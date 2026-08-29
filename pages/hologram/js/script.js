import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';


// =====================================================
// CONTAINER
// =====================================================

const container =
  document.getElementById('hologram-viewer');


// =====================================================
// VARIÁVEIS
// =====================================================

let model = null;

let hologramEntryStarted = false;

let hologramEntryTime = 0;

const muscleMaterials = {};


// =====================================================
// CORES DOS STATUS
// =====================================================

const STATUS_COLORS = {

  recovered: 0x00ff66,
  medium: 0xffa500,
  high: 0xff2222,
  injured: 0xaa00ff

};


// =====================================================
// MATERIAL HOLOGRÁFICO
// =====================================================

function createHologramMaterial() {

  return new THREE.ShaderMaterial({

    transparent: true,

    depthWrite: false,

    side: THREE.FrontSide,

    uniforms: {

      hologramColor: {

        value:
          new THREE.Color(0x00aaff)

      },

      opacity: {

        value: 0.18

      }

    },

    vertexShader: `

      varying float vFresnel;

      void main() {

        vec3 worldNormal =
          normalize(
            mat3(modelMatrix) * normal
          );

        vec3 worldPosition =
          (modelMatrix * vec4(position, 1.0)).xyz;

        vec3 viewDirection =
          normalize(
            cameraPosition - worldPosition
          );

        vFresnel =
          pow(
            1.0 -
            abs(
              dot(
                worldNormal,
                viewDirection
              )
            ),
            3.0
          );

        gl_Position =
          projectionMatrix *
          viewMatrix *
          vec4(
            worldPosition,
            1.0
          );

      }

    `,

    fragmentShader: `

      uniform vec3 hologramColor;

      uniform float opacity;

      varying float vFresnel;

      void main() {

        vec3 finalColor =
          hologramColor *
          (
            0.4 +
            vFresnel * 0.7
          );

        float finalOpacity =
          opacity *
          (
            0.5 +
            vFresnel
          );

        gl_FragColor =
          vec4(
            finalColor,
            finalOpacity
          );

      }

    `

  });

}


// =====================================================
// MATERIAL DOS MÚSCULOS
// =====================================================

function createMuscleHologramMaterial(color) {

  return new THREE.ShaderMaterial({

    transparent: true,

    depthWrite: false,

    depthTest: false,

    side: THREE.DoubleSide,

    uniforms: {

      muscleColor: {

        value:
          new THREE.Color(color)

      },

      opacity: {

        value: 0.65

      }

    },

    vertexShader: `

      varying float vFresnel;

      void main() {

        vec3 worldNormal =
          normalize(
            mat3(modelMatrix) * normal
          );

        vec3 worldPosition =
          (modelMatrix * vec4(position, 1.0)).xyz;

        vec3 viewDirection =
          normalize(
            cameraPosition - worldPosition
          );

        vFresnel =
          pow(
            1.0 -
            abs(
              dot(
                worldNormal,
                viewDirection
              )
            ),
            2.0
          );

        gl_Position =
          projectionMatrix *
          viewMatrix *
          vec4(
            worldPosition,
            1.0
          );

      }

    `,

    fragmentShader: `

      uniform vec3 muscleColor;

      uniform float opacity;

      varying float vFresnel;

      void main() {

        vec3 finalColor =
          muscleColor *
          (
            0.75 +
            vFresnel * 0.8
          );

        float finalOpacity =
          opacity +
          vFresnel * 0.12;

        gl_FragColor =
          vec4(
            finalColor,
            finalOpacity
          );

      }

    `

  });

}


// =====================================================
// STATUS DOS MÚSCULOS
// =====================================================

function setMuscleStatus(
  muscleName,
  status
) {

  if (!model) return;


  const color =
    STATUS_COLORS[status];


  if (color === undefined) {

    console.error(
      'Status inválido:',
      status
    );

    return;

  }


  const muscle =
    model.getObjectByName(
      muscleName
    );


  if (
    !muscle ||
    !muscle.isMesh
  ) {

    console.warn(
      `Músculo ${muscleName} não encontrado`
    );

    return;

  }


  // ===================================================
  // CRIAR MATERIAL APENAS UMA VEZ
  // ===================================================

  if (
    !muscleMaterials[muscleName]
  ) {

    muscleMaterials[muscleName] =
      createMuscleHologramMaterial(
        color
      );

    muscle.material =
      muscleMaterials[muscleName];

  }


  // ===================================================
  // DEFINIR COR ALVO
  // ===================================================

  muscleMaterials[muscleName]
    .userData = {

      targetColor:
        new THREE.Color(color)

    };

}


// =====================================================
// WIREFRAME
// =====================================================

function addHologramWireframe(object) {

  if (
    !object ||
    !object.isMesh
  ) {

    return;

  }


  const wireframeMaterial =
    new THREE.MeshBasicMaterial({

      color: 0x00aaff,

      wireframe: true,

      transparent: true,

      opacity: 0.10,

      depthWrite: false,

      depthTest: false

    });


  const wireframe =
    new THREE.Mesh(

      object.geometry,

      wireframeMaterial

    );


  wireframe.scale.set(

    1.002,
    1.002,
    1.002

  );


  object.add(
    wireframe
  );

}


// =====================================================
// CENA
// =====================================================

const scene =
  new THREE.Scene();

scene.background = null;


// =====================================================
// CÂMERA
// =====================================================

const camera =
  new THREE.PerspectiveCamera(

    45,

    container.clientWidth /
    container.clientHeight,

    0.1,

    100

  );


camera.position.set(

  0,
  1.5,
  6

);


// =====================================================
// RENDERER
// =====================================================

const renderer =
  new THREE.WebGLRenderer({

    antialias: false,

    alpha: true,

    powerPreference:
      'high-performance'

  });


renderer.setPixelRatio(1);


renderer.setSize(

  container.clientWidth,

  container.clientHeight

);


renderer.setClearColor(

  0x000000,
  0

);


container.appendChild(
  renderer.domElement
);


// =====================================================
// ILUMINAÇÃO
// =====================================================

const ambientLight =
  new THREE.AmbientLight(

    0xffffff,
    2

  );


scene.add(
  ambientLight
);


const directionalLight =
  new THREE.DirectionalLight(

    0xffffff,
    3

  );


directionalLight.position.set(

  2,
  4,
  5

);


scene.add(
  directionalLight
);


// =====================================================
// PEDESTAL
// =====================================================

const pedestalGeometry =
  new THREE.CylinderGeometry(

    1.2,
    1.2,
    0.25,
    32

  );


const pedestalMaterial =
  new THREE.MeshStandardMaterial({

    color: 0x111820,

    metalness: 0.8,

    roughness: 0.25

  });


const pedestal =
  new THREE.Mesh(

    pedestalGeometry,
    pedestalMaterial

  );


// Posição horizontal
pedestal.position.x = 0;

pedestal.position.z = -2;


// Posição inicial
pedestal.position.y =
  -1.5;


// Guardar posição
pedestal.userData.startY =
  -1.5;

pedestal.userData.endY =
  -0.65;


scene.add(
  pedestal
);


// =====================================================
// ANEL DE ENERGIA
// =====================================================

const ringGeometry =
  new THREE.RingGeometry(

    0.85,
    1.05,
    32

  );


const ringMaterial =
  new THREE.MeshBasicMaterial({

    color: 0x00aaff,

    transparent: true,

    opacity: 0.9,

    side: THREE.DoubleSide

  });


const energyRing =
  new THREE.Mesh(

    ringGeometry,
    ringMaterial

  );


energyRing.rotation.x =
  -Math.PI / 2;


// Posição inicial relativa ao pedestal
energyRing.position.x = 0;

energyRing.position.z = -2;

energyRing.position.y =
  -1.365;


scene.add(
  energyRing
);


// =====================================================
// HALO DO ANEL
// =====================================================

const haloGeometry =
  new THREE.RingGeometry(

    0.75,
    1.15,
    32

  );


const haloMaterial =
  new THREE.MeshBasicMaterial({

    color: 0x00aaff,

    transparent: true,

    opacity: 0.12,

    side: THREE.DoubleSide

  });


const energyHalo =
  new THREE.Mesh(

    haloGeometry,
    haloMaterial

  );


energyHalo.rotation.x =
  -Math.PI / 2;


energyHalo.position.x = 0;

energyHalo.position.z = -2;

energyHalo.position.y =
  -1.375;


scene.add(
  energyHalo
);


// =====================================================
// LOADER
// =====================================================

const loader =
  new GLTFLoader();


// =====================================================
// CARREGAR MODELO
// =====================================================

loader.load(

  '../../../assets/3d/HumanHologram.glb',

  (gltf) => {

    model =
      gltf.scene;


    scene.add(
      model
    );


    // =================================================
    // POSIÇÃO DO HOLOGRAMA
    // =================================================

    model.position.x = 0;

    model.position.z = 0;


    // Posição inicial
    model.position.y =
      -1.8;


    model.userData.startY =
      -1.8;

    model.userData.endY =
      0;


    model.scale.set(

      1,
      1,
      1

    );


    // =================================================
    // PREPARAR MATERIAIS
    // =================================================

    model.traverse(

      (object) => {

        if (
          !object.isMesh
        ) {

          return;

        }


        object.material =
          object.material.clone();

      }

    );


    // =================================================
    // CORPO HOLOGRÁFICO
    // =================================================

    const body =
      model.getObjectByName(
        'MaleBASE'
      );


    if (
      body &&
      body.isMesh
    ) {

      body.material =
        createHologramMaterial();


      addHologramWireframe(
        body
      );

    }


    // =================================================
    // STATUS DOS MÚSCULOS
    // =================================================

    setMuscleStatus(

      'muscle_chest',
      'medium'

    );


    setMuscleStatus(

      'muscle_abs',
      'recovered'

    );

  },


  undefined,


  (error) => {

    console.error(

      'Erro ao carregar o modelo:',
      error

    );

  }

);


// =====================================================
// EASING
// =====================================================

function easeOutCubic(t) {

  return 1 -
    Math.pow(

      1 - t,
      3

    );

}


function easeOutBack(t) {

  const c1 =
    1.70158;

  const c3 =
    c1 + 1;


  return (

    1 +
    c3 *
    Math.pow(
      t - 1,
      3
    ) +
    c1 *
    Math.pow(
      t - 1,
      2
    )

  );

}


// =====================================================
// ANIMAÇÃO
// =====================================================

function animate(time) {

  requestAnimationFrame(
    animate
  );


  // ===================================================
  // ENTRADA DO CONJUNTO
  // ===================================================

  if (
    model &&
    !hologramEntryStarted
  ) {

    hologramEntryStarted = true;

    hologramEntryTime =
      time;

  }


  if (
    model &&
    hologramEntryStarted
  ) {

    const elapsed =
      time -
      hologramEntryTime;


    // =================================================
    // PEDESTAL
    // =================================================

    const pedestalStartY =
      -1.5;

    const pedestalEndY =
      -0.65;

    const pedestalDuration =
      700;


    const pedestalProgress =
      Math.min(

        elapsed /
        pedestalDuration,

        1

      );


    const pedestalEase =
      easeOutCubic(
        pedestalProgress
      );


    const currentPedestalY =
      THREE.MathUtils.lerp(

        pedestalStartY,

        pedestalEndY,

        pedestalEase

      );


    pedestal.position.y =
      currentPedestalY;


    // =================================================
    // ANEL
    // =================================================

    // Distância fixa do anel
    // em relação ao pedestal

    const ringOffset =
      0.135;


    energyRing.position.y =
      currentPedestalY +
      ringOffset;


    // =================================================
    // HALO
    // =================================================

    const haloOffset =
      0.125;


    energyHalo.position.y =
      currentPedestalY +
      haloOffset;


    // =================================================
    // HOLOGRAMA
    // =================================================

    const hologramStartY =
      -1.8;

    const hologramEndY =
      0;


    const hologramDelay =
      220;


    const hologramDuration =
      850;


    const hologramProgress =
      Math.min(

        Math.max(

          (
            elapsed -
            hologramDelay
          ) /
          hologramDuration,

          0

        ),

        1

      );


    if (
      hologramProgress > 0
    ) {

      const hologramEase =
        easeOutBack(
          hologramProgress
        );


      model.position.y =
        THREE.MathUtils.lerp(

          hologramStartY,

          hologramEndY,

          hologramEase

        );

    }

  }


  // ===================================================
  // MODELO
  // ===================================================

  if (model) {

    model.rotation.y +=
      0.002;


    const body =
      model.getObjectByName(
        'MaleBASE'
      );


    // =================================================
    // PULSO DO HOLOGRAMA
    // =================================================

    if (

      body &&
      body.material &&
      body.material.uniforms

    ) {

      const elapsed =
        hologramEntryStarted
          ? time -
            hologramEntryTime
          : 0;


      // Começa o pulso depois
      // que o holograma aparece

      const pulseIntensity =
        Math.min(

          Math.max(

            (
              elapsed -
              300
            ) /
            500,

            0

          ),

          1

        );


      const pulse =
        Math.sin(
          time * 0.002
        ) *
        0.08 *
        pulseIntensity;


      body.material
        .uniforms
        .opacity
        .value =

          0.18 *
          (
            1 +
            pulse
          );

    }

  }


  // ===================================================
  // ROTAÇÃO DO ANEL
  // ===================================================

  energyRing.rotation.z +=
    0.003;


  // ===================================================
  // PULSO DO HALO
  // ===================================================

  const haloPulse =
    1 +
    Math.sin(
      time * 0.003
    ) *
    0.08;


  energyHalo.scale.set(

    haloPulse,
    haloPulse,
    haloPulse

  );


  // ===================================================
  // TRANSIÇÃO DOS MÚSCULOS
  // ===================================================

  Object.values(
    muscleMaterials
  ).forEach(

    (material) => {

      if (
        !material.userData?.targetColor
      ) {

        return;

      }


      material.uniforms
        .muscleColor
        .value
        .lerp(

          material.userData.targetColor,

          0.05

        );

    }

  );


  // ===================================================
  // RENDER
  // ===================================================

  renderer.render(

    scene,
    camera

  );

}


// =====================================================
// INICIAR
// =====================================================

animate();


// =====================================================
// RESPONSIVIDADE
// =====================================================

window.addEventListener(

  'resize',

  () => {

    const width =
      container.clientWidth;

    const height =
      container.clientHeight;


    camera.aspect =
      width /
      height;


    camera.updateProjectionMatrix();


    renderer.setSize(

      width,
      height

    );

  }

);