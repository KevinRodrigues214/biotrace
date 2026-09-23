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
// INTERAÇÃO COM OS MÚSCULOS
// =====================================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let hoveredMuscle = null;
let selectedMuscle = null;

const interactiveMuscles = [
  'muscle_chest',
  'muscle_abs'
];

const muscleInteractionData = {};
// =====================================================
// CORES DOS STATUS
// =====================================================

const STATUS_COLORS = {

  recovered: 0x00ff66,
  medium: 0xffa500,
  high: 0xff2222,
  injured: 0xaa00ff

};

const CHEST_EXERCISES = new Set([
  'Bench Press',
  'Incline Dumbbell Press'
]);

const ABS_EXERCISES = new Set([
  'Plank',
  'Hanging Leg Raise',
  'Cable Crunch',
  'Russian Twist',
  'Ab Wheel Rollout'
]);

function getWorkoutMuscleGroup(workout) {
  const name = String(workout?.name || '').trim();

  if (CHEST_EXERCISES.has(name)) {
    return 'muscle_chest';
  }

  if (ABS_EXERCISES.has(name)) {
    return 'muscle_abs';
  }

  return null;
}

function getWorkoutTimestamp(dateKey, workoutTime) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || '') || !/^\d{2}:\d{2}$/.test(workoutTime || '')) {
    return null;
  }

  const timestamp = new Date(`${dateKey}T${workoutTime}:00`).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getLatestMuscleWorkouts() {
  const saved = window.UserStorage?.readUserData('workout_session_data', {});
  const latest = {};

  (saved?.temporaryWorkoutStore || []).forEach(([dateKey, workouts]) => {
    if (!Array.isArray(workouts)) {
      return;
    }

    workouts.forEach((workout) => {
      if (workout?.checked !== true) {
        return;
      }

      const muscleName = getWorkoutMuscleGroup(workout);
      const timestamp = getWorkoutTimestamp(dateKey, workout?.workoutTime);

      if (
        muscleName &&
        timestamp !== null &&
        (!latest[muscleName] || timestamp > latest[muscleName])
      ) {
        latest[muscleName] = timestamp;
      }
    });
  });

  return latest;
}

function getRecoveryStatus(timestamp, now = Date.now()) {
  const elapsedHours = Math.max(0, now - timestamp) / (1000 * 60 * 60);

  if (elapsedHours >= 48) {
    return 'recovered';
  }

  if (elapsedHours >= 24) {
    return 'medium';
  }

  return 'high';
}

function applySavedWorkoutStatuses() {
  Object.entries(getLatestMuscleWorkouts()).forEach(([muscleName, timestamp]) => {
    setMuscleStatus(muscleName, getRecoveryStatus(timestamp));
  });
}

function updateMuscleMetrics(muscleName = selectedMuscle?.name || null) {
  const recoveryBar = document.getElementById('recoveryBar');
  const recoveryValue = document.getElementById('recoveryValue');
  const fatigueBar = document.getElementById('fatigueBar');
  const fatigueValue = document.getElementById('fatigueValue');
  const selectedMuscleLabel = document.getElementById('selectedMuscleLabel');
  const recoveryTimeValue = document.getElementById('recoveryTimeValue');

  if (!recoveryBar || !recoveryValue || !fatigueBar || !fatigueValue) {
    return;
  }

  const latestWorkout = muscleName
    ? getLatestMuscleWorkouts()[muscleName]
    : null;
  const elapsedHours = latestWorkout
    ? Math.max(0, Date.now() - latestWorkout) / (1000 * 60 * 60)
    : 48;
  const recovery = Math.min(100, (elapsedHours / 48) * 100);
  const fatigue = 100 - recovery;
  const remainingHours = Math.max(0, 48 - elapsedHours);

  recoveryBar.style.width = `${recovery}%`;
  recoveryValue.textContent = `${Math.round(recovery)}%`;
  fatigueBar.style.width = `${fatigue}%`;
  fatigueValue.textContent = `${Math.round(fatigue)}%`;

  if (selectedMuscleLabel) {
    selectedMuscleLabel.textContent = muscleName
      ? muscleName.replace('muscle_', '').replace('_', ' ').toUpperCase()
      : 'Select a muscle';
  }

  if (recoveryTimeValue) {
    recoveryTimeValue.textContent = remainingHours > 0
      ? `${Math.ceil(remainingHours)}h left`
      : 'Ready';
  }
}

function calculateDailyTargets() {
  const profile = window.UserStorage?.readUserData('profile_data', {});
  const nutrition = window.UserStorage?.readUserData('nutrition_session_data', {});
  const age = Number(profile?.profileAge);
  const height = Number(profile?.profileHeight);
  const weight = Number(profile?.profileWeight);
  const goal = nutrition?.selectedBodyGoal;

  if (!age || !height || !weight || !goal) {
    return null;
  }

  const gender = profile?.profileGender;
  const genderConstant = gender === 'male'
    ? 5
    : gender === 'female'
      ? -161
      : -78;
  const basalMetabolicRate = (10 * weight) + (6.25 * height) - (5 * age) + genderConstant;
  const sedentaryMaintenance = basalMetabolicRate * 1.2;
  const goalMultiplier = goal === 'loss' ? 0.8 : goal === 'gain' ? 1.1 : 1;
  const calories = Math.max(1200, Math.round(sedentaryMaintenance * goalMultiplier));
  const proteinPerKg = goal === 'loss' || goal === 'gain' ? 2 : 1.6;
  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - (protein * 4) - (fat * 9)) / 4));

  return { goal, calories, protein, carbs, fat };
}

function updateGoalMetrics() {
  const targets = calculateDailyTargets();
  const goalLabels = {
    loss: 'Weight Loss',
    maintenance: 'Maintenance',
    gain: 'Weight Gain'
  };
  const caloriesValue = document.getElementById('goalCaloriesValue');
  const proteinValue = document.getElementById('goalProteinValue');
  const carbsValue = document.getElementById('goalCarbsValue');
  const fatValue = document.getElementById('goalFatValue');
  const title = document.getElementById('goalMetricTitle');
  const status = document.getElementById('goalMetricStatus');
  const message = document.getElementById('goalMetricMessage');

  if (!caloriesValue || !proteinValue || !carbsValue || !fatValue) {
    return;
  }

  if (!targets) {
    caloriesValue.textContent = '-- kcal';
    proteinValue.textContent = '-- g';
    carbsValue.textContent = '-- g';
    fatValue.textContent = '-- g';
    if (title) title.textContent = 'Daily Target';
    if (status) status.textContent = 'SETUP';
    if (message) message.textContent = 'Complete your Profile and choose a goal in Nutrition.';
    return;
  }

  caloriesValue.textContent = `${targets.calories} kcal`;
  proteinValue.textContent = `${targets.protein} g`;
  carbsValue.textContent = `${targets.carbs} g`;
  fatValue.textContent = `${targets.fat} g`;
  if (title) title.textContent = goalLabels[targets.goal];
  if (status) status.textContent = 'DAILY';
  if (message) message.textContent = 'Estimated without exercise intensity.';
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getGoalChartData() {
  const nutrition = window.UserStorage?.readUserData('nutrition_session_data', {});
  const mealsByDate = new Map(nutrition?.meals || []);
  const days = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const dateKey = getLocalDateKey(date);
    const meals = Array.isArray(mealsByDate.get(dateKey))
      ? mealsByDate.get(dateKey)
      : [];
    const consumed = meals.reduce((total, meal) => total + Number(meal?.calories || 0), 0);

    days.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      consumed: Number.isFinite(consumed) ? consumed : 0
    });
  }

  return days;
}

function renderGoalChart() {
  const chart = document.getElementById('goalLineChart');
  const summary = document.getElementById('goalChartSummary');

  if (!chart || !summary) {
    return;
  }

  const targets = calculateDailyTargets();
  const days = getGoalChartData();

  if (!targets) {
    chart.innerHTML = '<text x="360" y="150" text-anchor="middle" class="chart-axis-label">Complete your Profile and choose a goal first.</text>';
    summary.textContent = 'The chart needs your body data and a selected goal.';
    return;
  }

  const width = 720;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 42, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const highestValue = Math.max(targets.calories, ...days.map((day) => day.consumed), 1);
  const maxValue = Math.ceil((highestValue * 1.15) / 250) * 250;
  const x = (index) => padding.left + (plotWidth * index) / (days.length - 1);
  const y = (value) => padding.top + plotHeight - (value / maxValue) * plotHeight;
  const targetY = y(targets.calories);
  const consumedPath = days
    .map((day, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(1)} ${y(day.consumed).toFixed(1)}`)
    .join(' ');
  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const value = Math.round(maxValue * ratio);
      const lineY = y(value);
      return `<line class="chart-grid" x1="${padding.left}" y1="${lineY}" x2="${width - padding.right}" y2="${lineY}" /><text class="chart-axis-label" x="${padding.left - 10}" y="${lineY + 4}" text-anchor="end">${value}</text>`;
    })
    .join('');
  const dayLabels = days
    .map((day, index) => `<text class="chart-day-label" x="${x(index)}" y="${height - 13}" text-anchor="middle">${day.label}</text>`)
    .join('');
  const dots = days
    .map((day, index) => `<circle class="chart-consumed-dot" cx="${x(index)}" cy="${y(day.consumed)}" r="4"><title>${day.label}: ${day.consumed} kcal</title></circle>`)
    .join('');

  chart.innerHTML = `${gridLines}<line class="chart-target-line" x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" /><path class="chart-consumed-line" d="${consumedPath}" />${dots}${dayLabels}`;
  summary.textContent = `${targets.goal === 'loss' ? 'Weight loss' : targets.goal === 'gain' ? 'Weight gain' : 'Maintenance'} · target ${targets.calories} kcal/day · exercise intensity excluded`;
}

function setupGoalChart() {
  const modal = document.getElementById('goalChartModal');
  const openButton = document.getElementById('openGoalChartButton');

  if (!modal || !openButton) {
    return;
  }

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('goal-chart-open');
  };

  openButton.addEventListener('click', () => {
    renderGoalChart();
    modal.hidden = false;
    document.body.classList.add('goal-chart-open');
  });

  modal.querySelectorAll('[data-close-goal-chart]').forEach((element) => {
    element.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      close();
    }
  });
}

setupGoalChart();

updateGoalMetrics();
setInterval(() => {
  updateMuscleMetrics();
  updateGoalMetrics();
}, 1000);


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
// MUSCLE INTERACTION
// =====================================================

function setupMuscleInteraction() {

  interactiveMuscles.forEach((muscleName) => {

    const muscle = model?.getObjectByName(muscleName);

    if (!muscle || !muscle.isMesh) {
      console.warn(
        `Músculo interativo não encontrado: ${muscleName}`
      );
      return;
    }

    muscleInteractionData[muscleName] = {

      originalPosition: muscle.position.clone(),

      originalScale: muscle.scale.clone(),

      targetScale: muscle.scale.clone(),

      targetPosition: muscle.position.clone(),

      hover: false,

      selected: false

    };

  });

}


function getMuscleUnderMouse() {

  if (!model) return null;

  raycaster.setFromCamera(mouse, camera);

  const muscles = interactiveMuscles
    .map(name => model.getObjectByName(name))
    .filter(Boolean);

  const intersections =
    raycaster.intersectObjects(muscles, true);

  if (intersections.length === 0) {
    return null;
  }

  let object = intersections[0].object;

  while (
    object &&
    !interactiveMuscles.includes(object.name)
  ) {
    object = object.parent;
  }

  return object || null;

}


function setHoveredMuscle(muscle) {

  if (hoveredMuscle === muscle) {
    return;
  }

  hoveredMuscle = muscle;

  if (muscle) {

    container.style.cursor = 'pointer';

  } else {

    container.style.cursor = 'default';

  }

}


function selectMuscle(muscle) {

  if (!muscle) {
    deselectMuscle();
    return;
  }

  // Se clicar no mesmo músculo, desmarca
  if (selectedMuscle === muscle) {
    deselectMuscle();
    return;
  }

  // Resetar seleção anterior
  if (selectedMuscle) {

    const previousData =
      muscleInteractionData[selectedMuscle.name];

    if (previousData) {

      previousData.selected = false;

      previousData.targetScale =
        previousData.originalScale.clone();

      previousData.targetPosition =
        previousData.originalPosition.clone();

    }

  }

  selectedMuscle = muscle;

  const data =
    muscleInteractionData[muscle.name];

  if (!data) return;

  data.selected = true;

  // Aumenta um pouco o músculo
  data.targetScale =
    data.originalScale.clone().multiplyScalar(1.20);

  // Traz o músculo em direção à câmera
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  data.targetPosition =
    data.originalPosition.clone().add(
      direction.clone().multiplyScalar(-0.15)
    );

  updateMuscleMetrics(muscle.name);

}


function deselectMuscle() {

  if (!selectedMuscle) {
    return;
  }

  const data =
    muscleInteractionData[selectedMuscle.name];

  if (data) {

    data.selected = false;

    data.targetScale =
      data.originalScale.clone();

    data.targetPosition =
      data.originalPosition.clone();

  }

  selectedMuscle = null;
  updateMuscleMetrics();

}


function updateMuscleInteraction() {

  Object.entries(muscleInteractionData)
    .forEach(([muscleName, data]) => {

      const muscle =
        model?.getObjectByName(muscleName);

      if (!muscle) return;

      muscle.scale.lerp(
        data.targetScale,
        0.12
      );

      muscle.position.lerp(
        data.targetPosition,
        0.12
      );

    });

}
container.addEventListener('mousemove', (event) => {

  const rect =
    renderer.domElement.getBoundingClientRect();

  mouse.x =
    ((event.clientX - rect.left) / rect.width) * 2 - 1;

  mouse.y =
    -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const muscle =
    getMuscleUnderMouse();

  setHoveredMuscle(muscle);

});
container.addEventListener('click', () => {

  const muscle =
    getMuscleUnderMouse();

  if (muscle) {

    selectMuscle(muscle);

  } else {

    deselectMuscle();

  }

});
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
      'recovered'
    );

    setMuscleStatus(
      'muscle_abs',
      'recovered'
    );

    applySavedWorkoutStatuses();
    setupMuscleInteraction();
  printMuscleConsole()
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
  updateMuscleInteraction();
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


