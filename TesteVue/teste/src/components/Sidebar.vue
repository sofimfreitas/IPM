<template>
  <nav id="nav">
    <ul>
      <li>
        <div class="item" @click="mostrarFiltros = true">
          <img class="icon" src="/icons/filter-svgrepo-com.svg" alt="Filter">
          <span class="label">Filtros</span>
        </div>
      </li>

      <li>
        <RouterLink to="/mainframe" class="item">
          <img class="icon" src="/icons/house-window-svgrepo-com.svg" alt="main">
          <span class="label">Página Principal</span>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/graficos_dash" class="item">
          <img class="icon" src="/icons/graph2.svg" alt="GraphsDash">
          <span class="label">Gráficos Dashboard</span>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/criacao_graficos" class="item">
          <img class="icon" src="/icons/graph-up-svgrepo-com.svg" alt="Graphs">
          <span class="label">Criar gráficos</span>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/compare" class="item">
          <img class="icon" src="/icons/compare-svgrepo-com.svg" alt="Compare">
          <span class="label">Comparar dados</span>
        </RouterLink>
      </li>

      <li>
        <button class="item item-alerta" @click="mostrarAlertas = true">
          <div class="icon-wrapper">
            <img class="icon" src="/icons/alert-svgrepo-com.svg" alt="Alert">
            <span v-if="alertCount > 0" class="badge-icon">{{ alertCount }}</span>
          </div>
          <span class="labelalerta">Alertas!</span>
        </button>
      </li>

      <li>
        <div class="item" @click="copiarLink">
          <img class="icon" src="/icons/share-svgrepo-com.svg" alt="Share">
          <span class="label">{{ textoPartilhar }}</span>
        </div>
      </li>

      <li @click="handleExport" style="cursor: pointer;">
        <div class="item" :class="{ 'disabled-item': statisticsStore.filteredRawData.length === 0 }">
          <img class="icon" src="/icons/export-content-svgrepo-com.svg" alt="Export">
          <span class="label">Exportar dados</span>
        </div>
      </li>
    </ul>
  </nav>

  <Teleport to="body">
    <Filtros :visible="mostrarFiltros" @fechar="mostrarFiltros = false" />
    <AlertasModal :visible="mostrarAlertas" @fechar="mostrarAlertas = false" @update-count="atualizarAlertCount" />
  </Teleport>

</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocationsStore } from '@/stores/locations'
import Filtros from './filter.vue'
import AlertasModal from '@/views/alertas.vue'
import { useFilterStore } from '@/stores/filtros'
import { useStatisticsStore } from '@/stores/statistics';
const filterStore = useFilterStore()
const mostrarFiltros = ref(false)
const mostrarAlertas = ref(false)
const locationsStore = useLocationsStore()
const textoPartilhar = ref('Partilhar página')
const statisticsStore = useStatisticsStore()
const alertCount = ref(0)

const copiarLink = async () => {
  try {
    const urlBase = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    if (locationsStore.country) params.append('country', locationsStore.country);
    if (locationsStore.city) params.append('city', locationsStore.city);

    const f = filterStore.selecionados;

    if (f.tipos.length > 0) params.append('tipos', f.tipos.join(','));
    if (f.precoMin !== null) params.append('pMin', f.precoMin);
    if (f.precoMax !== null) params.append('pMax', f.precoMax);
    if (f.dataInicio) params.append('dIn', f.dataInicio);
    if (f.dataFim) params.append('dFim', f.dataFim);
    if (f.noitesExatas !== null) params.append('nEx', f.noitesExatas);
    if (f.noitesMin !== null) params.append('nMin', f.noitesMin);
    if (f.noitesMax !== null) params.append('nMax', f.noitesMax);
    if (f.estrelasMin > 0) params.append('eMin', f.estrelasMin);
    if (f.estrelasMax > 0) params.append('eMax', f.estrelasMax);

    const urlFinal = params.toString() ? `${urlBase}?${params.toString()}` : urlBase;

    await navigator.clipboard.writeText(urlFinal);
    textoPartilhar.value = 'Link com filtros copiado!';
    setTimeout(() => { textoPartilhar.value = 'Partilhar página' }, 2000);
  } catch (err) {
    console.error('Erro ao copiar:', err);
  }
}

const handleExport = () => {
  statisticsStore.exportToJSON()
}



function atualizarAlertCount(novoValor) {
  alertCount.value = novoValor
}
</script>

<style scoped>
#nav {
  position: fixed;
  top: 81px;
  right: 0;
  width: 65px;
  background: #ffffff;
  border-right: 1px solid #e2e2e2;
  border-radius: 10px;
  transition: width 0.25s;
  z-index: 100;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

#nav:hover {
  width: 240px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

li {
  position: relative;
}

.disabled-item {
  opacity: 0.5;
  filter: grayscale(1);
  pointer-events: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 55px;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none; 
  color: #333;
}

.item:hover {
  background: #ececec;
}

.icon {
  width: 28px;
  height: 28px;
  filter: grayscale(20%);
}

.label {
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.25s, transform 0.25s;
  font-size: 16px;
  color: #333;
}

#nav:hover .label {
  opacity: 1;
  transform: translateX(0);
}

/* Botão de alertas */
.item-alerta {
  border: none;
  background: #d12323;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;  
  text-decoration: none;
}


.item-alerta:hover {
  background: #d12323 !important; 
}

.icon-wrapper {
  position: relative;
  display: inline-block;
}

.badge-icon {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 999px;
  background-color: #ffcc00;
  color: #003366;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #d12323;
}

.labelalerta {
  font-family: 'Sansation', sans-serif;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.25s, transform 0.25s;
}

#nav:hover .labelalerta {
  opacity: 1;
  transform: translateX(0);
}

.router-link-active,
.router-link-active .item {
  background: #ececec;
  color: #00336e;
  text-decoration: none;
}

.router-link-active:hover {
  background: #e2e2e2;
}

a {
  text-decoration: none;
}
</style>