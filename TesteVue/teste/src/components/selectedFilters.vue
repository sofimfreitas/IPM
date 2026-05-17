<template>
  <div class="filtros-container" v-if="filtrosAtivos.length">
    <div class="filtros-wrapper">
      <span class="label-filtros">Filtros selecionados:</span>

      <div class="lista-filtros">
        <span
          v-for="(filtro, i) in filtrosAtivos"
          :key="i"
          class="tag-filtro"
        >
          {{ filtro }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFilterStore } from '@/stores/filtros'
import { useLocationsStore } from '@/stores/locations'

const filterStore = useFilterStore()
const locationsStore = useLocationsStore()

const filtrosAtivos = computed(() => {
  const f = filterStore.selecionados
  const lista = []

  // LOCALIZAÇÃO
  if (locationsStore.country) lista.push(`País: ${locationsStore.country}`)
  if (locationsStore.city) lista.push(`Cidade: ${locationsStore.city}`)

  // TIPOS
  f.tipos.forEach(t => {
    if (t === 'completo') lista.push('Casa/apartamento completo')
    if (t === 'quarto_privado') lista.push('Quarto privado')
    if (t === 'quarto_partilhado') lista.push('Quarto partilhado')
    if (t === 'quarto_hotel') lista.push('Quarto de hotel')
  })

  if (f.dataInicio) lista.push(`Desde ${f.dataInicio}`)
  if (f.dataFim) lista.push(`Até ${f.dataFim}`)

  if (f.precoMin) lista.push(`Preço mín. €${f.precoMin}`)
  if (f.precoMax) lista.push(`Preço máx. €${f.precoMax}`)

  if (f.noitesExatas) lista.push(`${f.noitesExatas} noites`)
  if (f.noitesMin) lista.push(`Min ${f.noitesMin} noites`)
  if (f.noitesMax) lista.push(`Max ${f.noitesMax} noites`)

  if (f.estrelasMin) lista.push(`⭐ ${f.estrelasMin}+`)
  if (f.estrelasMax) lista.push(`⭐ até ${f.estrelasMax}`)

  return lista
})
</script>

<style scoped>
.filtros-container {
  padding: 10px 16px;
  width: 100%;
}

.filtros-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.label-filtros {
  font-weight: bold;
  color: #D3E7FC;
  font-size: 20px;
}

.lista-filtros {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.tag-filtro {
  background-color: #D3E7FC;
  color: #003366;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
}
</style>
