<template>
    <div class="app-wrapper">
        <Header />
        <Sidebar />
        <div class="main-container">

            <aside class="sidebar" id="sidebar" :class="{ 'hidden': isSidebarHidden }">

                <div class="sidebar-header">
                    Parâmetros para a criação de gráficos
                </div>

                <hr class="section-divider">

                <div class="filter-row relative-container">
                    <span class="filter-label" style="width: auto; margin-right: 10px;">Tipo de gráfico:</span>

                    <div class="dropdown-wrapper">
                        <button class="filter-button" :class="{ 'active': showGraphTypeMenu || graphType }"
                            @click="toggleGraphTypeMenu">
                            {{ graphType || "Escolher" }}
                            <span style="font-size: 10px; margin-left: 5px;">▼</span>
                        </button>

                        <div v-if="showGraphTypeMenu" class="dropdown-menu">
                            <div v-for="option in graphOptions" :key="option" class="dropdown-item"
                                :class="{ 'selected': graphType === option }" @click="selectGraphTypeOption(option)">
                                {{ option }}
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="section-divider">

                <!-- LINHAS -->
                <div v-if="graphType === 'Linhas'" class="specific-options">
                    <h3 class="section-title">Configuração de Linhas</h3>

                    <div class="filter-group">
                        <span class="filter-label">Variável (X):</span>
                        <div class="dropdown-wrapper">
                            <button class="filter-button" @click="toggleXMenu">
                                {{ variableX || "Selecionar" }}
                                <span style="font-size: 10px; margin-left: 5px;">▼</span>
                            </button>
                            <div v-if="showXMenu" class="dropdown-menu">
                                <div class="dropdown-item" v-for="opt in xOptions" :key="opt" @click="selectVariableX(opt)">
                                    {{ opt }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="filter-group">
                        <span class="filter-label">Variável (Y):</span>
                        <div class="dropdown-wrapper">
                            <button class="filter-button" @click="toggleYMenu">
                                {{ variableY || "Selecionar" }}
                                <span style="font-size: 10px; margin-left: 5px;">▼</span>
                            </button>
                            <div v-if="showYMenu" class="dropdown-menu">
                                <div class="dropdown-item" v-for="opt in yOptions" :key="opt" @click="selectVariableY(opt)">
                                    {{ opt }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BARRAS -->
                <div v-if="graphType === 'Barras'" class="specific-options">
                    <h3 class="section-title">Configuração de Barras</h3>

                    <div class="filter-group">
                        <span class="filter-label">Variável (X):</span>
                        <div class="dropdown-wrapper">
                            <button class="filter-button" @click="toggleXMenu">
                                {{ variableX || "Selecionar" }}
                                <span style="font-size: 10px; margin-left: 5px;">▼</span>
                            </button>
                            <div v-if="showXMenu" class="dropdown-menu">
                                <div class="dropdown-item" v-for="opt in xOptions" :key="opt" @click="selectVariableX(opt)">
                                    {{ opt }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="filter-group">
                        <span class="filter-label">Variável (Y):</span>
                        <div class="dropdown-wrapper">
                            <button class="filter-button" @click="toggleYMenu">
                                {{ variableY || "Selecionar" }}
                                <span style="font-size: 10px; margin-left: 5px;">▼</span>
                            </button>
                            <div v-if="showYMenu" class="dropdown-menu">
                                <div class="dropdown-item" v-for="opt in yOptions" :key="opt" @click="selectVariableY(opt)">
                                    {{ opt }}
                                </div>
                            </div> 
                        </div>
                    </div>
                </div>

                <!-- CIRCULAR -->
                <div v-if="graphType === 'Circular'" class="specific-options">
                    <h3 class="section-title">Configuração Circular</h3>

                    <div class="filter-group">
                        <span class="filter-label">Variável a avaliar:</span>
                        <div class="dropdown-wrapper">
                            <button class="filter-button" @click="togglePieMenu">
                                {{ pieSelection || "Selecionar" }}
                                <span style="font-size: 10px; margin-left: 5px;">▼</span>
                            </button>

                            <div v-if="showPieMenu" class="dropdown-menu">
                                <div class="dropdown-item"
                                    :class="{ 'selected': pieSelection === 'Tipo de Propriedade' }"
                                    @click="selectPieOption('Tipo de Propriedade')">
                                    Tipo de Propriedade
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-clean" @click="cleanSelections">Limpar Seleções</button>
                    <button class="btn btn-primary" @click="generateGraph">Gerar Gráfico</button>
                    <button v-if="graphLoaded" class="btn btn-share" @click="exportToPDF">
                        Exportar PDF
                    </button>
                </div>
            </aside>

            <button class="sidebar-toggle" @click="toggleSidebar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <polyline v-if="!isSidebarHidden" points="15 18 9 12 15 6"></polyline>
                    <polyline v-else points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            <main class="content-area">
                <div id="charts-grid">
                    <SelectedFilters class="selected-filters" />

                    <!-- Sem gráfico carregado -->
                    <section v-if="!graphLoaded" class="graph-bloco">
                        <h2>Criação de Gráficos</h2>
                        <div class="chart-wrapper placeholder">
                            <span>
                                Configure as opções na barra lateral e clique em
                                <strong> "Gerar Gráfico"</strong>
                            </span>
                        </div>
                    </section>

                    <!-- Gráfico Barras -->
                    <section v-if="graphLoaded && graphType === 'Barras'" class="graph-bloco" id="chart-to-export">
                        <h2>{{ variableY ? `${variableY} por ${variableX}` : 'Gráfico de Barras' }}</h2>
                        <div class="chart-wrapper">
                            <Bar :data="(chartDynamicData || chartListingsData)" :options="defaultOptions"
                                :key="'bar-' + JSON.stringify(chartDynamicData ? chartDynamicData : statsStore.statsPorAno)" />
                        </div>
                    </section>

                    <!-- Gráfico Circular -->
                    <section v-if="graphLoaded && graphType === 'Circular' && pieSelection === 'Tipo de Propriedade'"
                        class="graph-bloco" id="chart-to-export">
                        <h2>Gráfico indicador da quantidade de cada tipo de propriedade</h2>
                        <div class="chart-wrapper">
                            <Doughnut :data="chartPropertyTypesData" :options="doughnutOptions"
                                :key="'pie-' + statsStore.percentCompleto" />
                        </div>
                    </section>

                    <!-- Gráfico Linhas -->
                    <section v-if="graphLoaded && graphType === 'Linhas'" class="graph-bloco" id="chart-to-export">
                        <h2>{{ variableY ? `${variableY} por ${variableX}` : 'Gráfico temporal do preço médio por noite' }}</h2>
                        <div class="chart-wrapper">
                            <Line :data="(chartDynamicData || chartPriceLineData)" :options="defaultOptions"
                                :key="'line-' + JSON.stringify(chartDynamicData ? chartDynamicData : statsStore.precosPorAno)" />
                        </div>
                    </section>
                </div>
            </main>

        </div>
    </div>
</template>

<script setup>
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ref, computed, watch } from 'vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import SelectedFilters from '@/components/selectedFilters.vue'

import { useLocationsStore } from '@/stores/locations'
import { useStatisticsStore } from '@/stores/statistics'
import { useFilterStore } from '@/stores/filtros'

import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const locationsStore = useLocationsStore()
const statsStore = useStatisticsStore()
const filterStore = useFilterStore()

const isSidebarHidden = ref(false)
const graphLoaded = ref(false)

const graphType = ref(null)
const showGraphTypeMenu = ref(false)
const graphOptions = ['Linhas', 'Barras', 'Circular']

const variableX = ref(null)
const variableY = ref(null)
const showXMenu = ref(false)
const showYMenu = ref(false)

// Adicionei 'Mês' às opções do eixo X
const xOptions = ['Ano', 'Mês', 'Nome Host', 'Tipo']
const yOptions = ['Nº de listagens', 'Preço médio', 'Receita total']

const pieSelection = ref(null)
const showPieMenu = ref(false)

// Auxiliar para ordenar meses corretamente
const mesesOrdenados = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getXKey(item, xVar) {
    if (!item.data_inicial) return 'N/A';

    const [ano, mes] = item.data_inicial.split('-');

    if (xVar === 'Ano') return ano;

    if (xVar === 'Mês') {
        const mesIndex = parseInt(mes) - 1;
        const nomeMes = mesesOrdenados[mesIndex] || 'N/A';
        return `${nomeMes} ${ano}`;
    }

    if (xVar === 'Nome Host') return item.nome_host || 'N/A';
    if (xVar === 'Tipo') return item.tipo || 'N/A';

    return 'N/A';
}

function buildSeries(xVar, yVar, rawData) {
    const buckets = {}
    rawData.forEach(item => {
        const key = getXKey(item, xVar)
        if (!buckets[key]) buckets[key] = []
        buckets[key].push(item)
    })

    // Ordenação especial: se for Mês, usa o array estático. Se for Ano, usa numérico.
    let labels = Object.keys(buckets);

    if (xVar === 'Mês') {
        labels.sort((a, b) => {
            const [mesA, anoA] = a.split(' ');
            const [mesB, anoB] = b.split(' ');

            if (anoA !== anoB) return anoA - anoB;
            return mesesOrdenados.indexOf(mesA) - mesesOrdenados.indexOf(mesB);
        });
    } else {
        labels.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }

    const values = labels.map(label => {
        const group = buckets[label]
        if (yVar === 'Nº de listagens') return group.length
        if (yVar === 'Preço médio') {
            const avg = group.reduce((s, i) => s + (Number(i.preco) || 0), 0) / group.length
            return Number(avg.toFixed(2))
        }
        if (yVar === 'Receita total') {
            return group.reduce((s, i) => s + ((Number(i.preco) || 0) * (Number(i.duracao) || 0)), 0)
        }
        return 0
    })

    return { labels, values }
}

const chartDynamicData = computed(() => {
    if (!variableX.value || !variableY.value) return null
    const raw = statsStore.filteredRawData || []
    if (!raw.length) return { labels: [], datasets: [] }
    
    const { labels, values } = buildSeries(variableX.value, variableY.value, raw)
    
    return {
        labels,
        datasets: [{
            label: `${variableY.value} por ${variableX.value}`,
            data: values,
            borderColor: '#003366',
            backgroundColor: graphType.value === 'Linhas' ? 'rgba(0,51,102,0.1)' : '#125788',
            fill: graphType.value === 'Linhas',
            tension: 0.3,
            borderRadius: graphType.value === 'Barras' ? 5 : 0
        }]
    }
})

// Gráficos fixos/fallbacks
const chartListingsData = computed(() => chartDynamicData.value || { labels: [], datasets: [] })
const chartPriceLineData = computed(() => chartDynamicData.value || { labels: [], datasets: [] })

const chartPropertyTypesData = computed(() => ({
    labels: ['Casa completa', 'Quarto privado', 'Quarto partilhado', 'Hotel'],
    datasets: [{
        data: [
            statsStore.percentCompleto || 0,
            statsStore.percentQuartoPrivado || 0,
            statsStore.percentQuartoPartilhado || 0,
            statsStore.percentQuartoHotel || 0
        ],
        backgroundColor: ['#003366', '#399FEA', '#79B4E9', '#B9D0FA'],
        borderColor: '#ffffff',
        borderWidth: 2
    }]
}))

const defaultOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top'
        },
        tooltip: {
            enabled: true
        }
    },
    scales: {
        x: {
            title: {
                display: true,
                text: variableX.value || '',
                color: '#003366',
                font: {
                    size: 14,
                    weight: 'bold'
                }
            }
        },
        y: {
            title: {
                display: true,
                text: variableY.value || '',
                color: '#003366',
                font: {
                    size: 14,
                    weight: 'bold'
                }
            },
            beginAtZero: true
        }
    }
}))

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
}

// Funções de UI
const toggleSidebar = () => isSidebarHidden.value = !isSidebarHidden.value

function cleanSelections() {
    graphType.value = null; pieSelection.value = null;
    variableX.value = null; variableY.value = null;
    graphLoaded.value = false; showGraphTypeMenu.value = false;
    showPieMenu.value = false; showXMenu.value = false; showYMenu.value = false;
}

function toggleGraphTypeMenu() {
    showGraphTypeMenu.value = !showGraphTypeMenu.value
    showPieMenu.value = false; showXMenu.value = false; showYMenu.value = false;
}

function selectGraphTypeOption(option) {
    graphType.value = option; showGraphTypeMenu.value = false;
    variableX.value = null; variableY.value = null; graphLoaded.value = false;
}

function toggleXMenu() { showXMenu.value = !showXMenu.value; showYMenu.value = false }
function selectVariableX(val) { variableX.value = val; showXMenu.value = false }
function toggleYMenu() { showYMenu.value = !showYMenu.value; showXMenu.value = false }
function selectVariableY(val) { variableY.value = val; showYMenu.value = false }
function togglePieMenu() { showPieMenu.value = !showPieMenu.value }
function selectPieOption(option) { pieSelection.value = option; showPieMenu.value = false }

// Watchers
const atualizarDados = async () => {
    if (graphLoaded.value) {
        await statsStore.fetchStatistics(filterStore.selecionados, locationsStore)
    }
}
watch(() => filterStore.selecionados, atualizarDados, { deep: true })
watch([() => locationsStore.country, () => locationsStore.city], atualizarDados)

async function generateGraph() {
    if (!locationsStore.country || !locationsStore.city) {
        alert('Por favor, selecione primeiro a localização na página anterior.'); return;
    }
    if (!graphType.value) {
        alert('Por favor selecione um Tipo de Gráfico.'); return;
    }
    if (graphType.value === 'Circular') {
        if (!pieSelection.value) { alert('Por favor selecione a variável a avaliar.'); return }
    } else {
        if (!variableX.value || !variableY.value) { alert('Por favor selecione as Variáveis X e Y.'); return }
    }

    await statsStore.fetchStatistics(filterStore.selecionados, locationsStore)
    if (!(statsStore.filteredRawData || []).length) {
        alert('Não existem dados para as seleções feitas.'); return;
    }
    graphLoaded.value = true
    isSidebarHidden.value = true
}

async function exportToPDF() {
    const element = document.getElementById('chart-to-export');
    if (!element) return;
    try {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#B9D0FA" });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.setFontSize(18);
        pdf.setTextColor(0, 51, 102);
        pdf.text(`Relatório: ${graphType.value} - ${locationsStore.city}`, 10, 15);
        pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth - 20, pdfHeight);
        pdf.save(`grafico_${locationsStore.city}_${graphType.value}.pdf`);
    } catch (error) {
        console.error("Erro ao exportar PDF:", error);
    }
}
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.btn-share {
    background-color: #399FEA; /* Um azul mais claro para destacar */
    color: white;
    border: none;
}

.btn-share:hover {
    background-color: #125788;
    transform: scale(1.03);
}

.app-wrapper {
    --navy-dark: #003366;
    --blue-light: rgb(185, 208, 250);
    --white: #FFFFFF;
    --text-dark: #1E3A5F;
    --border-color: #5A7AA0;
    --sidebar-width: 400px;
    --header-height: 100px;
}

.main-container {
    display: flex;
    padding-top: var(--header-height);
    position: relative;
    overflow-x: hidden;
    min-height: 100vh;
}

.sidebar {
    width: var(--sidebar-width);
    background-color: var(--blue-light);
    color: var(--text-dark);
    padding: 30px 25px;
    position: fixed;
    left: 0;
    top: 80px;
    bottom: 0;
    overflow-y: auto;
    transition: transform 0.3s ease;
    z-index: 90;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--navy-dark);
}

.sidebar.hidden {
    transform: translateX(calc(-1 * var(--sidebar-width)));
}

.sidebar-header {
    color: var(--navy-dark);
    text-align: center;
    font-weight: bold;
    font-size: 30px;
    margin-bottom: 20px;
}

.location-display {
    background-color: rgba(255, 255, 255, 0.4);
    padding: 15px;
    border-radius: 12px;
    border: 1px solid var(--navy-dark);
    margin-bottom: 20px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.info-label {
    font-weight: 800;
    color: var(--navy-dark);
}

.info-value {
    font-weight: 600;
    color: var(--text-dark);
}

.dropdown-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    margin-top: 5px;
    background-color: white;
    border: 2px solid var(--navy-dark);
    border-radius: 12px;
    z-index: 100;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    max-height: 200px;
    overflow-y: auto;
}

.dropdown-item {
    padding: 10px 15px;
    cursor: pointer;
    font-weight: 600;
    text-align: center;
    transition: 0.2s;
}

.dropdown-item:hover {
    background-color: var(--blue-light);
}

.dropdown-item.selected {
    background-color: var(--navy-dark);
    color: white;
}

.filter-button {
    background-color: var(--white);
    border: 2px solid var(--navy-dark);
    border-radius: 15px;
    padding: 10px 15px;
    font-weight: 600;
    font-size: 15px;
    color: var(--text-dark);
    cursor: pointer;
    flex: 1;
    text-align: center;
    transition: all 0.3s ease;
}

.filter-button:hover,
.filter-button.active {
    background-color: var(--navy-dark);
    color: var(--white);
}

.sidebar-toggle {
    position: fixed;
    left: var(--sidebar-width);
    top: calc(80px + 20px);
    width: 40px;
    height: 60px;
    background-color: var(--blue-light);
    border: 1px solid var(--navy-dark);
    border-left: none;
    border-radius: 0 8px 8px 0;
    cursor: pointer;
    z-index: 95;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: left 0.3s ease;
}

.sidebar.hidden+.sidebar-toggle {
    left: 0;
}

.filter-group {
    margin-bottom: 15px;
}

.filter-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.filter-label {
    font-weight: 700;
    font-size: 16px;
    color: var(--text-dark);
    margin-bottom: 8px;
    display: block;
}

.section-divider {
    border: none;
    border-top: 1px solid var(--navy-dark);
    margin: 20px 0;
    opacity: 0.3;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 10px;
    border-left: 4px solid var(--navy-dark);
    padding-left: 10px;
}

.btn {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s;
    margin-top: 10px;
}

.btn-primary {
    background-color: var(--navy-dark);
    color: var(--white);
    border: none;
}

.btn-clean {
    border: 3px solid #003366;
    color: var(--navy-dark);
    background-color: var(--white);
}

.btn-clean:hover,
.btn-primary:hover {
    transform: scale(1.03);
}

.content-area {
    flex: 1;
    margin-left: var(--sidebar-width);
    transition: margin-left 0.3s ease;
    background-color: var(--navy-dark);
    padding: 40px;
    min-height: calc(100vh - var(--header-height));
}

.sidebar.hidden~.content-area {
    margin-left: 0;
}

.grafico-placeholder {
    background-color: var(--blue-light);
    color: var(--navy-dark);
    border-radius: 20px;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.selected-filters {
    border-bottom: 2px solid #D3E7FC;
    margin-bottom: 20px;
    border-radius: 0px;
}

#charts-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.graph-bloco {
    background-color: rgb(185, 208, 250);
    color: #003366;
    border-radius: 10px;
    border: 1px solid #003366;
    height: 500px;
    display: flex;
    flex-direction: column;
}

.graph-bloco h2 {
    margin: 10px 0 15px 0;
    color: #003366;
    font-size: 24px;
    text-align: center;
}

.chart-wrapper {
    flex: 1;
    position: relative;
    width: 100%;
    padding: 20px;
}

.chart-wrapper.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #003366;
}
</style>