<script setup>
import { onMounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useLocationsStore } from '@/stores/locations'
import { useStatisticsStore } from '@/stores/statistics'
import { useFilterStore } from '@/stores/filtros'

const route = useRoute()
const locationsStore = useLocationsStore()
const statisticsStore = useStatisticsStore()
const filterStore = useFilterStore()

const inicializarDadosPeloURL = async () => {
  const q = route.query;

  if (q.country && q.city) {
    locationsStore.country = q.country;
    locationsStore.city = q.city;

    const f = filterStore.selecionados;
    
    if (q.tipos) f.tipos = q.tipos.split(',');
    if (q.pMin) f.precoMin = Number(q.pMin);
    if (q.pMax) f.precoMax = Number(q.pMax);
    if (q.dIn) f.dataInicio = q.dIn;
    if (q.dFim) f.dataFim = q.dFim;
    if (q.nEx) f.noitesExatas = Number(q.nEx);
    if (q.nMin) f.noitesMin = Number(q.nMin);
    if (q.nMax) f.noitesMax = Number(q.nMax);
    if (q.eMin) f.estrelasMin = Number(q.eMin);
    if (q.eMax) f.estrelasMax = Number(q.eMax);

    await statisticsStore.fetchStatistics(f, locationsStore);
  }
}

onMounted(() => {
  inicializarDadosPeloURL()
})

watch(
  () => route.query,
  () => inicializarDadosPeloURL(),
  { deep: true }
)
</script>

<template>
  <RouterView />
</template>

<style>
</style>