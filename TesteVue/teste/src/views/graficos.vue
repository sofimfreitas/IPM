<template>
    <Sidebar /> 
    <Header></Header>
    <main id="app">
        <div id="charts-grid">
            <SelectedFilters class="filters-bar" />
            <section class="graph-bloco" id="chart-listings">
                <div class="graph-header">
                    <h2>Gráfico temporal de número de listagens</h2>
                    <button class="btn-export" @click="exportPDF('chart-listings', 'Número de Listagens')">
                        PDF ⬇
                    </button>
                </div>
                <div class="chart-wrapper">
                    <Bar 
                        :data="chartListingsData" 
                        :options="listingsOptions" 
                        :key="'bar-' + JSON.stringify(statsStore.statsPorAno)"
                    />
                </div>
            </section>
            
            <section class="graph-bloco" id="chart-property">
                <div class="graph-header">
                    <h2>Gráfico indicador da quantidade de cada tipo de propriedade</h2>
                    <button class="btn-export" @click="exportPDF('chart-property', 'Tipo de Propriedade')">
                        PDF ⬇
                    </button>
                </div>
                <div class="chart-wrapper">
                    <Doughnut 
                        v-if="statsStore.nrhosts !== 'N/A'"
                        :data="chartPropertyTypesData" 
                        :options="doughnutOptions" 
                        :key="'pie-' + statsStore.percentCompleto + statsStore.percentQuartoPrivado"
                    />
                </div>
            </section>
            
            <section class="graph-bloco" id="chart-prices">
                <div class="graph-header">
                    <h2>Gráfico temporal do preço médio por noite</h2>
                    <button class="btn-export" @click="exportPDF('chart-prices', 'Preço Médio por Noite')">
                        PDF ⬇
                    </button>
                </div>
                <div class="chart-wrapper">
                    <Line 
                        :data="chartPricesData" 
                        :options="pricesOptions" 
                        :key="'line-' + JSON.stringify(statsStore.precosPorAno)"
                    />
                </div>
            </section>
        </div>
    </main>
</template>

<script setup>
    import { jsPDF } from "jspdf";
    import html2canvas from "html2canvas";
    import { computed, watch, onMounted } from 'vue';
    import { useStatisticsStore } from '@/stores/statistics';
    import { useLocationsStore } from '@/stores/locations';
    import { useFilterStore } from '@/stores/filtros';
    import Header from '@/components/Header.vue';
    import Sidebar from '@/components/Sidebar.vue';
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
        Legend
    } from 'chart.js'
    import SelectedFilters from '@/components/selectedFilters.vue';

    const statsStore = useStatisticsStore();
    const locationsStore = useLocationsStore();
    const filterStore = useFilterStore();

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Title,
        Tooltip,
        Legend
    )

    const atualizarDados = () => {
        statsStore.fetchStatistics(filterStore.selecionados, locationsStore);
    };

    watch(() => filterStore.selecionados, atualizarDados, { deep: true });
    watch([() => locationsStore.country, () => locationsStore.city], atualizarDados);

    onMounted(() => {
        atualizarDados();
    });

    const chartListingsData = computed(() => {
        const anos = Object.keys(statsStore.statsPorAno).sort();
        const valores = anos.map(ano => statsStore.statsPorAno[ano]);

        return {
            labels: anos,
            datasets: [{
                label: 'Número de listagens',
                data: valores,
                backgroundColor: [
                    '#125788', '#185B8E', '#2373B7', '#399FEA',  
                    '#79B4E9', '#98C8EE', '#4893B8', 
                ],
                borderColor: 'rgb(0, 51, 102)',
                borderWidth: 1
            }]
        };
    });

    const chartPropertyTypesData = computed(() => ({
        labels: ['Casa/apartamento completo', 'Quarto privado', 'Quarto partilhado', 'Quarto de hotel'],
        datasets: [{
            data: [
                statsStore.percentCompleto,
                statsStore.percentQuartoPrivado,
                statsStore.percentQuartoPartilhado,
                statsStore.percentQuartoHotel
            ],
            backgroundColor: [
                'rgba(30, 60, 114, 0.9)',
                'rgba(65, 160, 240, 0.9)',
                'rgba(100, 150, 200, 0.9)',
                'rgba(150, 170, 220, 0.9)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    }));

    const chartPricesData = computed(() => {
        const anos = Object.keys(statsStore.precosPorAno).sort();
        const valores = anos.map(ano => statsStore.precosPorAno[ano]);

        return {
            labels: anos,
            datasets: [{
                label: 'Preço médio por noite (€)',
                data: valores,
                borderColor: 'rgba(65, 160, 240, 0.9)',
                backgroundColor: 'rgba(65, 160, 240, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgba(65, 160, 240, 0.9)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        };
    });

    const listingsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Número de listagens', color: '#003366', font: { size: 20, weight: 'bold' } },
            },
            x: { title: { display: true, text: 'Ano', color: '#003366', font: { size: 20, weight: 'bold' } } },
        },
    }

    const pricesOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => ` Preço Médio: ${context.parsed.y}€`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: { display: true, text: 'Preço médio por noite (€)', color: '#003366', font: { size: 20, weight: 'bold' } },
            },
            x: { title: { display: true, text: 'Ano', color: '#003366', font: { size: 18, weight: 'bold' } } },
        },
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { padding: 15, font: { size: 20 } } },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.parsed}%`
                }
            }
        },
    }

// funcao de partilha de grafico

const exportPDF = async (elementId, title) => {
    const element = document.getElementById(elementId);
    
    const button = element.querySelector('.btn-export');
    button.style.visibility = 'hidden';

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#B9D0FA'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.setFontSize(16);
        pdf.setTextColor(0, 51, 102);
        pdf.text(`${title} - ${locationsStore.city}`, 15, 15);
        
        pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);
        pdf.save(`${title.replace(/\s+/g, '_')}_${locationsStore.city}.pdf`);
        
    } catch (error) {
        console.error("Erro ao exportar:", error);
    } finally {
        button.style.visibility = 'visible';
    }
};
</script>

<style scoped>
main#app {
    padding-top: 100px;
    padding-left: 60px;
    padding-right: 100px;
    padding-bottom: 20px;
}

#charts-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.graph-bloco {
    background-color: rgb(185, 208, 250);
    padding-bottom: 20px;
    border-radius: 10px;
    border: 1px solid blue;
    height: 500px;
    display: flex;
    flex-direction: column;
}

.graph-bloco h2 {
    margin: 10px 0 15px 0;
    color: #003366;
    font-size: 30px;
    text-align: center;
}

.chart-wrapper {
    flex: 1;
    position: relative;
    width: 100%;
}

.graph-header {
    display: flex;
    justify-content: center; 
    align-items: center;
    position: relative; 
    padding: 10px 20px;
}

.graph-header h2 {
    margin: 0 ;
    flex: 1;
}

.btn-export {
    position: absolute;
    right: 20px;
    background-color: #003366;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.btn-export:hover {
    background-color: #399FEA;
}

.graph-bloco {
    overflow: hidden;
}
</style>