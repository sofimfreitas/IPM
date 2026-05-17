<template>
    <div class="app-wrapper">
        <Header />
        <Sidebar />
        <div class="main-container">

            <aside class="sidebar" id="sidebar" :class="{ 'hidden': isSidebarHidden }">

                <div class="filter-group">
                    <div class="filter-row">
                        <span class="filter-label">País (Base):</span>
                        <button class="filter-button filter-button--disabled" disabled>
                            {{ location1.country || 'Não selecionado' }}
                        </button>
                    </div>
                    <div class="filter-row">
                        <span class="filter-label">Cidade (Base):</span>
                        <button class="filter-button filter-button--disabled" disabled>
                            {{ location1.city || 'Não selecionado' }}
                        </button>
                    </div>
                </div>

                <hr class="section-divider">

                <div class="filter-group">
                    <div class="filter-row">
                        <span class="filter-label">País (Comparar):</span>
                        <div class="dropdown-wrapper-2">
                            <input
                                class="filter-button searchbar-2"
                                type="text"
                                :value="location2.country"
                                @click.stop="toggleCountries2"
                                placeholder="Clique para selecionar"
                                readonly
                            />
                            <div v-if="showCountries2" class="dropdown-list-2">
                                <div
                                    v-for="pais in listaPaises2"
                                    :key="pais"
                                    class="dropdown-item-2"
                                    @click.stop="selecionarPais2(pais)"
                                >
                                    {{ pais }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="filter-row">
                        <span class="filter-label">Cidade (Comparar):</span>
                        <div class="dropdown-wrapper-2">
                            <input
                                class="filter-button searchbar-2"
                                type="text"
                                :value="location2.city"
                                @click.stop="toggleCities2"
                                :placeholder="location2.country ? 'Clique para selecionar' : 'Selecione primeiro o país'"
                                :disabled="!location2.country"
                                readonly
                            />
                            <div v-if="showCities2" class="dropdown-list-2">
                                <div
                                    v-for="cidade in listaCidades2"
                                    :key="cidade"
                                    class="dropdown-item-2"
                                    @click.stop="selecionarCidade2(cidade)"
                                >
                                    {{ cidade }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="section-title">Indique dados a comparar:</h2>

                <div class="metrics-list">
                    <div class="metric-item" 
                         v-for="(metric, index) in metrics" 
                         :key="index"
                         @click="toggleMetric(index)">
                        
                        <div class="metric-checkbox" :class="{ 'checked': metric.selected }"></div>
                        <span class="metric-label">{{ metric.label }}</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-primary" @click="selectAll">Selecionar Tudo</button>
                    <button class="btn btn-secondary" @click="compare">Comparar</button>
                </div>
            </aside>

            <button class="sidebar-toggle" @click="toggleSidebar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline v-if="!isSidebarHidden" points="15 18 9 12 15 6"></polyline>
                    <polyline v-else points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            <main class="content-area" :class="{ 'sidebar-collapsed': isSidebarHidden }">
              <SelectedFilters class="filters-bar" />
              <div v-if="!comparisonMetrics.length" class="empty-state">
                <h3>Selecione cidades e métricas e clique em "Comparar"</h3>
              </div>

              <div v-else id="charts-grid">
                <section
                  v-for="metric in comparisonMetrics"
                  :key="metric.title"
                  class="graph-bloco"
                >
                  <h2>{{ metric.title }}</h2>

                  <!-- Gráfico NORMAL (barras simples, lado a lado) -->
                  <div v-if="!metric.type || metric.type !== 'property-types'" class="chart-wrapper">
                    <Bar
                      :data="{
                        labels: [metric.city1Label, metric.city2Label],
                        datasets: [{
                          label: metric.unit || metric.title,
                          data: [metric.city1Value, metric.city2Value],
                          backgroundColor: ['#125788', '#399FEA'],
                          borderColor: '#003366',
                          borderWidth: 1
                        }]
                      }"
                      :options="{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                          legend: { display: false }
                        },
                        scales: {
                          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                          x: { grid: { display: false } }
                        }
                      }"
                    />
                  </div>

                  <!-- Gráfico para tipos de propriedade -->
                  <div v-else class="chart-wrapper">
                    <Bar
                      :data="{
                        labels: metric.labels,  // ['Casa/apto completo', 'Quarto privado', ...]
                        datasets: [
                          {
                            label: metric.city1Label,
                            data: metric.city1Values,  // [40, 30, 20, 10]
                            backgroundColor: '#125788',
                            borderColor: '#003366',
                            borderWidth: 1
                          },
                          {
                            label: metric.city2Label,
                            data: metric.city2Values,  // [35, 25, 25, 15]
                            backgroundColor: '#399FEA',
                            borderColor: '#003366',
                            borderWidth: 1
                          }
                        ]
                      }"
                      :options="{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'top',
                            labels: { font: { size: 13 } }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: '%' },
                            grid: { color: 'rgba(0,0,0,0.1)' }
                          },
                          x: { grid: { display: false } }
                        }
                      }"
                    />
                  </div>
                </section>
              </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue'; 
import { useLocationsStore } from '@/stores/locations';
import { useFilterStore } from '@/stores/filtros';
import SelectedFilters from '@/components/selectedFilters.vue';
import { computeComparison } from '@/stores/compare';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const locationsStore = useLocationsStore();
const filterStore = useFilterStore();

const isSidebarHidden = ref(false);

const location1 = reactive({
  country: locationsStore.country || '',
  city: locationsStore.city || ''
});

const location2 = reactive({
  country: '',
  city: ''
});

const dbData = ref({});
const showCountries2 = ref(false);
const showCities2 = ref(false);

onMounted(async () => {
  const response = await fetch('http://localhost:3000/countries');
  dbData.value = await response.json();
});

const listaPaises2 = computed(() => Object.keys(dbData.value || {}));
const listaCidades2 = computed(() => {
  return location2.country && dbData.value[location2.country]
    ? Object.keys(dbData.value[location2.country])
    : [];
});

const toggleCountries2 = () => {
  showCountries2.value = !showCountries2.value;
  showCities2.value = false;
};

const toggleCities2 = () => {
  if (!location2.country) return;
  showCities2.value = !showCities2.value;
  showCountries2.value = false;
};

const selecionarPais2 = (pais) => {
  location2.country = pais;
  location2.city = '';
  showCountries2.value = false;
};

const selecionarCidade2 = (cidade) => {
  location2.city = cidade;
  showCities2.value = false;
};

const metrics = ref([
  { label: 'Número de listagens total', selected: false },
  { label: 'Nr de hosts', selected: false },
  { label: 'Ganho médio', selected: false },
  { label: 'Nr de listagens médio por host', selected: false },
  { label: 'Duração média das estadias', selected: false },
  { label: 'Estadias de curta duração', selected: false },
  { label: 'Preço médio por noite', selected: false },
  { label: 'Proporções de tipo de propriedade', selected: false },
]);

const toggleMetric = (i) => {
  metrics.value[i].selected = !metrics.value[i].selected;
};

const selectAll = () => {
  const allSelected = metrics.value.every(m => m.selected);
  metrics.value.forEach(m => (m.selected = !allSelected));
};

// --------- COMPARISON + CHART DATA ---------
const chartData = ref(null);

// turn object into array for v-for
const comparisonMetrics = computed(() => {
  if (!chartData.value) return [];
  return Object.values(chartData.value);
});

const compare = async () => {
  if (!location1.city || !location2.city) {
    alert('Selecione ambas as cidades para comparar.');
    return;
  }

  const selectedLabels = metrics.value
    .filter(m => m.selected)
    .map(m => m.label)

  if (!selectedLabels.length) {
    alert('Selecione pelo menos uma métrica.');
    return;
  }

  try {
    const filters = filterStore.selecionados ?? {};
    chartData.value = await computeComparison({
      location1,
      location2,
      metricsLabels: selectedLabels,
      filters
    });
  } catch (e) {
    console.error(e);
    alert('Erro ao calcular comparação.');
  }
};

watch([() => locationsStore.country, () => locationsStore.city], ([newCountry, newCity]) => {
    location1.country = newCountry || '';
    location1.city = newCity || '';
}, { immediate: true });

watch(() => filterStore.selecionados, () => {
    if (chartData.value) {
        compare();
    }
}, { deep: true });

watch(() => location2.city, () => {
    if (chartData.value && location2.city) {
        compare();
    }
});

const toggleSidebar = () => {
  isSidebarHidden.value = !isSidebarHidden.value;
};
</script>
<style scoped>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.app-wrapper {
    --navy-dark: #003366;
    --blue-light: rgb(185, 208, 250);
    --white: #FFFFFF;
    --text-dark: #1E3A5F;
    --border-color: #5A7AA0;
    --sidebar-width: 460px; 
    --header-height: 100px;
}

.main-container {
  display: flex;
  align-items: flex-start;
  padding-top: var(--header-height);
  position: relative;
  overflow-x: hidden;
  height: 100vh;
}

/* --- SIDEBAR --- */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--blue-light);
  color: var(--text-dark);
  padding: 20px 24px;

  position: fixed;
  left: 0;
  top: var(--header-height);
  bottom: 0;

  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: 90;
  display: flex;
  flex-direction: column;
}

.sidebar.hidden {
  transform: translateX(calc(-1 * var(--sidebar-width)));
}

/* --- TOGGLE BUTTON --- */
.sidebar-toggle {
  position: fixed;
  left: var(--sidebar-width);
  top: calc(var(--header-height) + 20px);
  width: 40px;
  height: 60px;
  background-color: var(--blue-light);
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  z-index: 95;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.sidebar.hidden + .sidebar-toggle {
  left: 0;
}

/* --- ÁREA DOS GRÁFICOS --- */
.content-area {
  flex: 1;
  min-height: 100vh;
  padding-top: 120px;
  padding-bottom: 40px;
  padding-right: 40px;
  padding-left: 40px;
  box-sizing: border-box;

  /* deixa espaço para a sidebar fixa */
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

/* quando a sidebar é escondida, o conteúdo expande para a esquerda */
.content-area.sidebar-collapsed {
  margin-left: 40px; /* apenas o padding esquerdo */
}

/* --- ESTILOS INTERNOS --- */
.filter-group { margin-bottom: 10px; }

.filter-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    margin-bottom: 12px;
}

.filter-label {
    flex-shrink: 0;
    width: 160px;
    text-align: center;
    font-weight: 600;
    font-family: 'Sansation', sans-serif;
}

.filter-button {
    background-color: var(--white);
    border: 2px solid var(--border-color);
    border-radius: 25px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 15px;
    color: var(--text-dark);
    cursor: pointer;
    flex: 1;
    min-width: 180px; 
    text-align: center;
    transition: all 0.2s;
}

.filter-button:hover, .filter-button.active {
    background-color: var(--navy-dark);
    color: var(--white);
}

.filter-button--disabled {
    background-color: var(--white);
    border: 2px solid var(--border-color);
    border-radius: 25px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 15px;
    color: var(--text-dark);
    cursor: not-allowed;
    flex: 1;
    min-width: 120px; 
    text-align: center;
    transition: all 0.2s;
    opacity: 0.9;
    cursor: default;
}

hr.section-divider {
    border : 1px solid #003366;
    margin-bottom: 16px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 10px 0 20px 0;
    padding-left: 15px;
    border-left: 4px solid var(--navy-dark);
}

.metrics-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.metric-item {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.85); 
    padding: 14px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
}

.metric-item:hover {
    background-color: var(--white);
    transform: translateX(5px);
}

.metric-checkbox {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--border-color);
    background-color: var(--white);
    margin-right: 15px;
    position: relative;
    flex-shrink: 0;
}

.metric-checkbox.checked {
    background-color: var(--navy-dark);
    border-color: var(--navy-dark);
}

.metric-checkbox.checked::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 8px; height: 8px;
    background-color: var(--white);
    border-radius: 50%;
}

.metric-label {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-dark);
    line-height: 1.2;
}

.action-buttons{
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid rgba(30, 58, 95, 0.2);
    display: flex;
    gap: 15px;
}

.btn {
    flex: 1;
    padding: 12px;
    border-radius: 25px;
    border: 2px solid var(--border-color);
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    background-color: transparent;
    color: var(--text-dark);
    transition: all 0.2s;
}

.btn:hover {
    background-color: var(--white);
    transform: translateY(-2px);
}

/* main area to the right of the sidebar */
.content-area {
  flex: 1;
  min-height: 100vh;
  padding-top: 120px;
  padding-bottom: 40px;
  padding-right: 40px;
  padding-left: 40px;
  box-sizing: border-box;
}

/* grelha de gráficos que se ajusta à largura disponível */
#charts-grid {
  width: 100%;
  max-width: 1300px;        /* controla o “comprimento” do retângulo */
  margin: 0 auto;          /* centra dentro da content-area */
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* cada card do gráfico */
.graph-bloco {
  background-color: #d3e7fc;
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* altura do gráfico (podes ajustar) */
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 360px;
}

/* optional: center “empty state” as well */
.empty-state {
  margin: 0 auto;
  max-width: 600px;
  text-align: center;
  color: #fff;
}

/* dropdowns for location2, visually similar to paginaInicial */
.dropdown-wrapper-2 {
  position: relative;
  flex: 1;
  max-width: 240px;
}

.searchbar-2 {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color, #ccc);
  background-color: #f2f5ff;
  font-size: 15px;
  cursor: pointer;
  min-width: 140px;
}

.searchbar-2:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.dropdown-list-2 {
  position: absolute;
  top: 44px;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 10px;
  border: 1px solid #ccc;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item-2 {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.dropdown-item-2:hover {
  background-color: #d1e1ff;
}

.graph-bloco h2 {
  text-align: center;
  color: #003366;
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 16px;
}

.filters-bar {
  margin-top: -100px;
}
</style>