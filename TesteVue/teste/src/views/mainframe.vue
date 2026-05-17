<template>
    <Sidebar /> 
    <div id="app">
        <Header class="dashboard-header"></Header>
        <SelectedFilters class="filters-bar" />
        <main id="dashboard-content">
            
            <section class="mapa-bloco">
                <h2>Mapa</h2>
                <Map />
            </section>
            <section class="tophosts-bloco">
                <h2>Anfitriões mais populares</h2>
                <div class="tabela-container">
                    <table v-if="statsStore.topHosts && statsStore.topHosts.length > 0">
                        <thead>
                            <tr>
                                <th>Anfitrião</th>
                                <th>Listagens</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(host, index) in statsStore.topHosts" :key="index">
                                <td>{{ host.nome }}</td>
                                <td>{{ host.total }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else class="sem-dados">Sem dados disponíveis</p>
                </div>
            </section>
            <section class="casos-bloco">
                <h2>Casos emblemáticos</h2>
                <ul v-if="casosEmblematicos.length > 0" class="casos-lista">
                    <li v-for="(caso, i) in casosEmblematicos" :key="i">
                        {{ caso }}
                    </li>
                </ul>
                <p v-else class="sem-dados">Nenhum caso emblemático identificado para os filtros atuais.</p>
            </section>

            <MetricCard 
                titulo="Número de hosts" 
                blocoClass="nrhosts-bloco"
                :valor="statsStore.nrhosts"
            />
            <MetricCard 
                titulo="Duração média das estadias" 
                blocoClass="duracao-bloco"
                :valor="statsStore.duracaobloco"
            />
            <MetricCard 
                titulo="Ganho médio total por host" 
                blocoClass="ganhomed-bloco"
                :valor="statsStore.ganhomedio"
            />
            <MetricCard 
                titulo="Número médio de listagens por host" 
                blocoClass="nr-list-bloco"
                :valor="statsStore.nrListagensHost"
            />
            <MetricCard 
                titulo="Semana com mais estadias" 
                blocoClass="semana-bloco"
                :valor="statsStore.dataPicoSemana"
            />
            <MetricCard 
                titulo="Percentagem de estadias de duração curta" 
                blocoClass="duracao-curta-bloco"
                :valor="statsStore.percentagemCurta"
            />
        </main>
    </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import Map from '@/components/Map.vue';
import MetricCard from '@/components/metricCard.vue';
import { useLocationsStore } from '@/stores/locations';
import { useStatisticsStore } from '@/stores/statistics';
import { useFilterStore } from '@/stores/filtros';
import SelectedFilters from '@/components/selectedFilters.vue';

const filterStore = useFilterStore();
const locationsStore = useLocationsStore();
const statsStore = useStatisticsStore();

const atualizarDados = () => {
    statsStore.fetchStatistics(filterStore.selecionados, locationsStore);
};

watch(() => filterStore.selecionados, () => {
    atualizarDados();
}, { deep: true });

watch([() => locationsStore.country, () => locationsStore.city], () => {
    atualizarDados();
});

onMounted(() => {
    atualizarDados();
});

function parseNumber(str) {
  if (!str || typeof str !== 'string') return 0
  const n = Number(str.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
function parseCurrency(str) {
  if (!str || typeof str !== 'string') return 0
  const n = Number(str.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
function parsePercent(str) {
  if (!str || typeof str !== 'string') return 0
  const n = Number(str.replace('%', '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const casosEmblematicos = computed(() => {
  const lista = []

  if (!statsStore.filteredRawData || statsStore.filteredRawData.length === 0) {
    return ['Poucos dados disponíveis para esta cidade com os filtros atuais, mas o mercado parece ter alguma atividade.']
  }

  const ganhoMedio = parseCurrency(statsStore.ganhomedio)      
  const duracaoMedia = parseNumber(statsStore.duracaobloco)
  const percCurta = parsePercent(statsStore.percentagemCurta)   

  const pctCompleto = statsStore.percentCompleto || 0
  const pctPrivado = statsStore.percentQuartoPrivado || 0
  const pctPartilhado = statsStore.percentQuartoPartilhado || 0
  const pctHotel = statsStore.percentQuartoHotel || 0

  // 1) Ganho médio por host "alto" para este dataset 
  if (ganhoMedio >= 650) {
    lista.push(
      `Ganho médio por host relativamente elevado para este conjunto de dados: cerca de ${ganhoMedio.toFixed(0)}€ por anfitrião.`
    )
  } else if (ganhoMedio > 0) {
    lista.push(
      `Ganho médio por host moderado: aproximadamente ${ganhoMedio.toFixed(0)}€ por anfitrião.`
    )
  }

  // 2) Mercado focado em estadias curtas
  if (duracaoMedia > 0 && duracaoMedia <= 4 && percCurta >= 40) {
    lista.push(
      `Mercado com forte presença de estadias curtas: duração média de ${duracaoMedia.toFixed(1)} noites e ${percCurta.toFixed(0)}% de estadias de curta duração.`
    )
  } else if (duracaoMedia > 0) {
    lista.push(
      `Duração média das estadias estável, em torno de ${duracaoMedia.toFixed(1)} noites.`
    )
  }

  // 3) Tipo de propriedade dominante
  const tipos = [
    { nome: 'casas/apartamentos completos', valor: pctCompleto },
    { nome: 'quartos privados', valor: pctPrivado },
    { nome: 'quartos partilhados', valor: pctPartilhado },
    { nome: 'quartos de hotel', valor: pctHotel }
  ]

  const dominante = tipos.reduce((max, t) => (t.valor > max.valor ? t : max), { nome: '', valor: 0 })

  if (dominante.valor >= 30) {
    lista.push(
      `Tendência marcada para ${dominante.nome}: representam cerca de ${dominante.valor.toFixed(0)}% das listagens.`
    )
  } else if (dominante.valor > 0) {
    lista.push(
      `Distribuição relativamente equilibrada entre tipos de propriedade, com ligeira concentração em ${dominante.nome}.`
    )
  }

  // 4) Caso extra: diversidade de hosts
  const nrHosts = parseNumber(statsStore.nrhosts)
  if (nrHosts >= 8) {
    lista.push(`Elevada diversidade de anfitriões: pelo menos ${nrHosts.toFixed(0)} hosts ativos nesta seleção.`)
  } else if (nrHosts > 0) {
    lista.push(`Número reduzido de anfitriões, o que pode indicar um mercado mais concentrado.`)
  }

  // Fallback: garantir que nunca devolve lista vazia
  if (lista.length === 0) {
    lista.push('Mercado aparentemente estável, sem anomalias fortes detetadas, mas com padrões interessantes de procura.')
  }

  return lista
})

console.log('DEBUG CASOS', {
  ganhomedio: statsStore.ganhomedio,
  parsedGanho: parseCurrency(statsStore.ganhomedio),
  duracaobloco: statsStore.duracaobloco,
  parsedDuracao: parseNumber(statsStore.duracaobloco),
  percentagemCurta: statsStore.percentagemCurta,
  parsedCurta: parsePercent(statsStore.percentagemCurta),
  pctCompleto: statsStore.percentCompleto,
  pctPrivado: statsStore.percentQuartoPrivado,
  pctPartilhado: statsStore.percentQuartoPartilhado,
  pctHotel: statsStore.percentQuartoHotel,
})
</script>

<style scoped>
.dashboard-header {
    grid-area: header;
    top: 0;
    z-index: 50; 
}

h2 {
    font-size: 16px;
    font-family: 'Sansation', sans-serif;
}

#app {
    display: grid;
    grid-template-areas:
        "header  header header"
        ".       filters-bar ."
        ".       main    .";
    grid-template-rows: 80px 80px 700px;
    grid-template-columns: 20px 1fr 60px;
    gap: 20px;
}

.filters-bar {
    grid-area: filters-bar;
    align-self: center;
}

#dashboard-content {
    grid-area: main;
    display: grid;
    gap: 15px;
    height: 800px;
    grid-template-areas:
        "casos  tophosts  mapa mapa"
        "casos  tophosts mapa  mapa"
        "casos tophosts mapa  mapa"
        "casos  tophosts  ganhoMed semana-bloco"
        "duracao-bloco nr-list-bloco nrhosts-bloco duracao-curta-bloco";
    grid-template-rows: 300px 0.8fr 0.8fr 0.8fr 0.8fr;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    padding-bottom: 60px;
}

#dashboard-content > section {
    background-color: rgb(185, 208, 250);
    border: 1px solid blue;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
}


.mapa-bloco          { grid-area: mapa; }
.tophosts-bloco      { grid-area: tophosts; }
.casos-bloco         { grid-area: casos; }
.nrhosts-bloco       { grid-area: nrhosts-bloco; }
.duracao-bloco       { grid-area: duracao-bloco; }
.ganhomed-bloco      { grid-area: ganhoMed; }
.semana-bloco        { grid-area: semana-bloco; }      
.duracao-curta-bloco { grid-area: duracao-curta-bloco; } 
.nr-list-bloco       { grid-area: nr-list-bloco; }

@media (max-width:1000px) {

    #app {
        height: auto;
        padding-bottom: 50px;
        grid-template-columns: 20px 1fr 1fr 60px;

        grid-template-rows: 80px 80px 370px 450px 120px 120px 120px;

        grid-template-areas:
            "header header header header"
            ". filtros-bar filtros-bar ."
            ".      mapa mapa      ."
            ".      casos tophosts ."
            ".      ganhoMed duracao ."
            ".      nrhosts-bloco nr-list-bloco ."
            ".      duracao-curta-bloco semana-bloco .";
    }

    #dashboard-content {
        display: contents;
        grid-template-areas: unset;
        grid-template-columns: unset;
        grid-template-rows: unset;
    }

    .mapa-bloco {
        grid-area: mapa;
        grid-column: 2 / 4;
    }

    .casos-bloco {
        grid-area: casos;
    }

    .tophosts-bloco {
        grid-area: tophosts;
    }

    .ganhomed-bloco {
        grid-area: ganhoMed;
    }

    .duracao-bloco {
        grid-area: duracao;
    }

    .nrhosts-bloco {
        grid-area: nrhosts-bloco;
    }

    .nr-list-bloco {          /* Antes: .mednoites-bloco */
        grid-area: nr-list-bloco;
    }

    .duracao-curta-bloco {    /* Antes: .taxaocup-bloco */
        grid-area: duracao-curta-bloco;
    }

    .semana-bloco {           /* Antes: .durmed-bloco */
        grid-area: semana-bloco;
    }

    .filters-bar {
        grid-area: filtros-bar;
    }

    #dashboard-content section .valor {
        font-size: 28px;
    }
}

@media (min-width: 1001px)and (max-width: 1400px) {

    #app {
        height: auto;
        padding-bottom: 50px;
        grid-template-columns: 20px 1fr 1fr 1fr 60px;
        grid-template-rows: 80px 80px 200px 200px 200px 200px 200px 200px;

        grid-template-areas:
            "header header header header header"
            ". filtros-bar filtros-bar filtros-bar ."
            ".      mapa     mapa    duracao      ."
            ".      mapa     mapa    nr-list-bloco ."    /* Alterado medNoites */
            ".      mapa     mapa    semana-bloco ."     /* Alterado durMed */
            ".      casos   tophosts   nrhosts-bloco    ."
            ".      casos   tophosts   ganhoMed   ."
            ".      casos   tophosts   duracao-curta-bloco ."; /* Alterado taxaOcup */
    }

    #dashboard-content {
        display: contents;
        grid-template-areas: unset;
        grid-template-columns: unset;
        grid-template-rows: unset;
    }

    .filters-bar {
        grid-area: filtros-bar;
    }

    .mapa-bloco {
        grid-area: mapa;
    }

    .casos-bloco {
        grid-area: casos;
    }

    .ganhomed-bloco {
        grid-area: ganhoMed;
    }

    .duracao-bloco {
        grid-area: duracao;
    }

    .nrhosts-bloco {
        grid-area: nrhosts-bloco;
    }

    .tophosts-bloco {
        grid-area: tophosts;
    }

    .nr-list-bloco {
        grid-area: nr-list-bloco;
    }

    .semana-bloco {
        grid-area: semana-bloco;
    }

    .duracao-curta-bloco {
        grid-area: duracao-curta-bloco;
    }

    #dashboard-content section .valor {
        font-size: 28px;
    }
}
.tophosts-bloco {
    display: flex;
    flex-direction: column;
    height: 100%; 
    box-sizing: border-box;
    padding: 15px 40px 0px 40px; 
    overflow: hidden;
}

.tabela-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-top: 15px;
}

table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

thead th {
    font-family: 'Sansation', sans-serif;
    font-size: 14px;
    color: #003366;
    padding-bottom: 10px;
}

th, td {
    border-bottom: 1px solid #003366;
    padding: 5px 0;
}

th:first-child, td:first-child {
    text-align: left;
    border-right: 1px solid #003366;
    padding-left: 5px;
    width: 50%;
}

th:last-child, td:last-child {
    text-align: center;
    width: 50%; 
}

td {
    font-family: 'Sansation', sans-serif;
    font-weight: bold;
    color: #1a1a1a;
}

tr:last-child td {
    border-bottom: none;
}

@media (max-width: 1400px) {
    th, td {
        font-size: 13px;
    }
}

@media (min-width: 1401px) {
    th, td {
        font-size: 15px;
    }
}

.casos-lista {
  margin-top: 10px;
  text-align: left;
  padding-left: 18px;
  font-family: 'Sansation', sans-serif;
  font-size: 18px;
  color:#003366;
}

.casos-lista li {
  margin-bottom: 6px;
}

.sem-dados {
  margin-top: 10px;
  font-size: 14px;
  font-family: 'Sansation', sans-serif;
}
</style>